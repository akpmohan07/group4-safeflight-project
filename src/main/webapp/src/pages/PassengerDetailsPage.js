import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

function PassengerDetailsPage() {
  const { scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedSeats = (location.state && location.state.selectedSeats) || [];
  const seatPricingSummary = location.state?.seatPricingSummary || null;
  const seatTotal = seatPricingSummary?.totalAmount || 0;
  const BAG_PRICE = 10;
  const formatCurrency = (n) => (n != null && !Number.isNaN(n))
    ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passengersBySeat, setPassengersBySeat] = useState(
    location.state?.passengersBySeat || {}
  );

  useEffect(() => {
    if (!selectedSeats.length) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/flights/${encodeURIComponent(scheduleId)}/seatmap`);
        if (!res.ok) {
          throw new Error('Failed to load flight details');
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error loading flight details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [scheduleId, selectedSeats]);

  const handlePassengerChange = (seatId, field, value) => {
    setPassengersBySeat((prev) => ({
      ...prev,
      [seatId]: {
        ...(prev[seatId] || {
          fname: '',
          lname: '',
          dob: '',
          phone: '',
          email: '',
          passport: '',
          baggageQuantity: '0'
        }),
        [field]: value
      }
    }));
  };

  const canContinue =
    selectedSeats.length > 0 &&
    selectedSeats.every((seatId) => {
      const p = passengersBySeat[seatId];
      return (
        p &&
        p.fname &&
        p.fname.trim() &&
        p.lname &&
        p.lname.trim() &&
        p.dob &&
        p.dob.trim() &&
        p.phone &&
        p.phone.trim() &&
        p.email &&
        p.email.trim() &&
        p.passport &&
        p.passport.trim()
      );
    });

  const handleNext = () => {
    if (!canContinue) return;
    const baggageTotal = selectedSeats.reduce((sum, seatNo) => {
      const p = passengersBySeat[seatNo];
      const qty =
        p && p.baggageQuantity !== undefined && p.baggageQuantity !== ''
          ? Number(p.baggageQuantity)
          : 0;
      return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
    }, 0) * BAG_PRICE;
    const grandTotal = seatTotal + baggageTotal;
    const payload = {
      scheduleId: Number(scheduleId),
      seats: selectedSeats.map((seatNo) => {
        const p = passengersBySeat[seatNo];
        const baggageQuantity =
          p.baggageQuantity !== undefined && p.baggageQuantity !== ''
            ? Number(p.baggageQuantity)
            : 0;
        return {
          seatNo,
          fname: p.fname,
          lname: p.lname,
          dob: p.dob,
          phone: p.phone,
          email: p.email,
          passport: p.passport,
          baggageQuantity
        };
      })
    };
    const flightSummary = data
      ? {
          flightCode: data.flightCode,
          fromAirport: data.fromAirport,
          toAirport: data.toAirport,
          airlineName: data.airlineName,
          travelDate: data.travelDate,
          travelTime: data.travelTime,
          seats: selectedSeats.slice()
        }
      : null;
    navigate('/payment', {
      state: {
        bookingPayload: payload,
        flightSummary,
        totalAmount: Number.isFinite(grandTotal) && grandTotal > 0 ? grandTotal : undefined,
        seatTotal: Number.isFinite(seatTotal) && seatTotal > 0 ? seatTotal : undefined,
        baggageTotal: Number.isFinite(baggageTotal) && baggageTotal > 0 ? baggageTotal : 0,
        bagPrice: BAG_PRICE,
        passengersBySeat
      }
    });
  };

  if (!selectedSeats.length) {
    return (
      <div className="alert alert-warning">
        No seats selected. <Link to="/">Go back to search</Link>
      </div>
    );
  }

  if (loading) {
    return <div>Loading flight details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Passenger details</h5>
            {data && (
              <div className="small text-muted">
                {data.flightCode} &middot; {data.fromAirport} → {data.toAirport}
              </div>
            )}
          </div>
          <Link to={`/flights/${scheduleId}`} className="btn btn-outline-secondary btn-sm">
            ← Back to seat map
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            {selectedSeats.map((seatId) => {
              const passenger =
                passengersBySeat[seatId] || {
                  fname: '',
                  lname: '',
                  dob: '',
                  phone: '',
                  email: '',
                  passport: '',
                  baggageQuantity: '0'
                };
              return (
                <div className="row g-3 mb-3" key={seatId}>
                  <div className="col-md-2 d-flex align-items-start">
                    <span className="badge bg-light text-dark border w-100 text-center">
                      {seatId}
                    </span>
                  </div>
                  <div className="col-md-10">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={passenger.fname}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'fname', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={passenger.lname}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'lname', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date of birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={passenger.dob}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'dob', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={passenger.phone}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'phone', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={passenger.email}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'email', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Passport</label>
                        <input
                          type="text"
                          className="form-control"
                          value={passenger.passport}
                          onChange={(e) =>
                            handlePassengerChange(seatId, 'passport', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Baggage (kg)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={passenger.baggageQuantity}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              handlePassengerChange(seatId, 'baggageQuantity', '');
                              return;
                            }
                            const num = Number(raw);
                            const safe = !Number.isFinite(num) || num < 0 ? '0' : String(num);
                            handlePassengerChange(seatId, 'baggageQuantity', safe);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedSeats.length > 0 && (
              <div className="mt-3 py-2 px-2 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Seat fare</span>
                  <span className="fw-semibold">{formatCurrency(seatTotal)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small text-muted">
                  <span>Baggage (${BAG_PRICE} per kg)</span>
                  <span>
                    {formatCurrency(
                      selectedSeats.reduce((sum, seatNo) => {
                        const p = passengersBySeat[seatNo];
                        const qty =
                          p && p.baggageQuantity !== undefined && p.baggageQuantity !== ''
                            ? Number(p.baggageQuantity)
                            : 0;
                        return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0) * BAG_PRICE;
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                  <span className="fw-semibold">Total amount</span>
                  <span className="fw-bold text-primary">
                    {formatCurrency(
                      seatTotal +
                        selectedSeats.reduce((sum, seatNo) => {
                          const p = passengersBySeat[seatNo];
                          const qty =
                            p && p.baggageQuantity !== undefined && p.baggageQuantity !== ''
                              ? Number(p.baggageQuantity)
                              : 0;
                          return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
                        }, 0) * BAG_PRICE
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canContinue}
                onClick={handleNext}
              >
                Proceed to payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerDetailsPage;

