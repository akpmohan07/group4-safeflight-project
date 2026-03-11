import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state && state.booking;

  const [card, setCard] = useState({
    type: 'VISA',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [status, setStatus] = useState(null);

  if (!booking) {
    return (
      <div className="alert alert-warning">
        No booking information. <Link to="/">Go back to search</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = () => {
    // Mock payment: no backend call; redirect to confirmation
    setStatus('success');
    navigate('/confirmation', { state: { booking }, replace: true });
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
              <strong>Booking #{booking.bookingId}</strong>
            </div>
            <div className="small text-muted mb-1">
              {booking.flightCode} &middot; {booking.fromAirport} → {booking.toAirport}
            </div>
            <div className="small text-muted">
              Seats: {booking.seats && booking.seats.join(', ')}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Card type</label>
              <select
                name="type"
                className="form-select"
                value={card.type}
                onChange={handleChange}
              >
                <option value="VISA">VISA</option>
                <option value="MASTERCARD">MasterCard</option>
                <option value="AMEX">AMEX</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Card number</label>
              <input
                name="number"
                type="text"
                className="form-control"
                value={card.number}
                onChange={handleChange}
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
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">CVV</label>
                <input
                  name="cvv"
                  type="password"
                  className="form-control"
                  value={card.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button className="btn btn-success" type="button" onClick={handlePay}>
              Pay now (mock)
            </button>

            {status === 'success' && (
              <div className="alert alert-success mt-3 mb-0">
                Payment successful (mock). Your booking is confirmed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

