import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bookingPayload = state?.bookingPayload;
  const flightSummary = state?.flightSummary;
  const totalAmount = state?.totalAmount;
  const formatCurrency = (n) => (n != null && !Number.isNaN(n))
    ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '';

  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [billing, setBilling] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [status, setStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  if (!bookingPayload || !bookingPayload.seats?.length) {
    return (
      <div className="alert alert-warning">
        No booking information. <Link to="/">Go back to search</Link>
      </div>
    );
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async () => {
    setPaymentError(null);
    setStatus('pending');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      if (!res.ok) {
        const text = await res.text();
        setPaymentError(text || 'Booking failed. The selected seats may no longer be available.');
        setStatus(null);
        return;
      }
      const bookingSummary = await res.json();
      setStatus('success');
      navigate('/confirmation', {
        state: { booking: bookingSummary, totalAmount },
        replace: true
      });
    } catch {
      setPaymentError('Something went wrong. Please try again.');
      setStatus(null);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Payment</h5>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/')}
          >
            Back to home
          </button>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <div className="mb-1">
              <strong>Order summary</strong>
            </div>
            {flightSummary && (
              <>
                <div className="small text-muted mb-1">
                  {flightSummary.flightCode} &middot; {flightSummary.fromAirport} → {flightSummary.toAirport}
                </div>
                <div className="small text-muted mb-1">
                  Seats: {bookingPayload.seats.map((s) => s.seatNo).join(', ')}
                </div>
              </>
            )}
            {totalAmount != null && totalAmount > 0 && (
              <div className="small mt-2 pt-2 border-top">
                <strong>Amount due:</strong> <span className="text-primary fw-semibold">{formatCurrency(totalAmount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Card number</label>
              <input
                name="number"
                type="text"
                className="form-control"
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={handleCardChange}
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Expiry</label>
                <input
                  name="expiry"
                  type="text"
                  className="form-control"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={handleCardChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">CVV</label>
                <input
                  name="cvv"
                  type="password"
                  className="form-control"
                  placeholder="123"
                  value={card.cvv}
                  onChange={handleCardChange}
                />
              </div>
            </div>

            <div className="mb-3 pt-2 border-top">
              <label className="form-label fw-semibold">Billing address</label>
              <div className="mb-2">
                <input
                  name="addressLine1"
                  type="text"
                  className="form-control"
                  placeholder="Address line 1"
                  value={billing.addressLine1}
                  onChange={handleBillingChange}
                />
              </div>
              <div className="mb-2">
                <input
                  name="addressLine2"
                  type="text"
                  className="form-control"
                  placeholder="Address line 2 (optional)"
                  value={billing.addressLine2}
                  onChange={handleBillingChange}
                />
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-5">
                  <input
                    name="city"
                    type="text"
                    className="form-control"
                    placeholder="City"
                    value={billing.city}
                    onChange={handleBillingChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    name="state"
                    type="text"
                    className="form-control"
                    placeholder="State / Province"
                    value={billing.state}
                    onChange={handleBillingChange}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    name="postalCode"
                    type="text"
                    className="form-control"
                    placeholder="Postal code"
                    value={billing.postalCode}
                    onChange={handleBillingChange}
                  />
                </div>
              </div>
              <div>
                <input
                  name="country"
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  value={billing.country}
                  onChange={handleBillingChange}
                />
              </div>
            </div>

            {paymentError && (
              <div className="alert alert-danger mb-3">
                {paymentError}
              </div>
            )}

            <button
              className="btn btn-success"
              type="button"
              onClick={handlePay}
              disabled={status === 'pending'}
            >
              {status === 'pending' ? 'Processing...' : 'Complete transaction'}
            </button>

            {status === 'success' && (
              <div className="alert alert-success mt-3 mb-0">
                Transaction complete. Your booking is confirmed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

