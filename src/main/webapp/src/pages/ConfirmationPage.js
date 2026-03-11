import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const parts = String(timeStr).split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function ConfirmationPage() {
  const { state } = useLocation();
  const booking = state && state.booking;

  if (!booking) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="alert alert-warning">
            No booking information. <Link to="/">Go back to search</Link> or{' '}
            <Link to="/profile">view my bookings</Link>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-7">
        <div className="text-center mb-4">
          <div className="text-success mb-2" style={{ fontSize: '3rem' }}>✓</div>
          <h4 className="mb-1">Booking confirmed</h4>
          <p className="text-muted mb-0">Thank you. Your ticket details are below.</p>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span className="fw-bold">Booking #{booking.bookingId}</span>
            <span className="badge bg-light text-dark">{booking.status}</span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="text-muted small text-uppercase">Flight</div>
              <div className="fw-bold">{booking.flightCode}</div>
              {booking.airlineName && (
                <div className="small text-muted">{booking.airlineName}</div>
              )}
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <div className="text-muted small text-uppercase">From</div>
                <div className="fw-semibold">{booking.fromAirport || '—'}</div>
              </div>
              <div className="col-md-2 text-center align-self-center text-muted">→</div>
              <div className="col-md-5">
                <div className="text-muted small text-uppercase">To</div>
                <div className="fw-semibold">{booking.toAirport || '—'}</div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="text-muted small text-uppercase">Travel date</div>
                <div>{formatDate(booking.travelDate)}</div>
              </div>
              <div className="col-md-6">
                <div className="text-muted small text-uppercase">Departure time</div>
                <div>{formatTime(booking.travelTime)}</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-muted small text-uppercase">Seat(s)</div>
              <div className="fw-semibold">
                {booking.seats && booking.seats.length
                  ? booking.seats.join(', ')
                  : '—'}
              </div>
            </div>

            {booking.passengers && booking.passengers.length > 0 && (
              <div>
                <div className="text-muted small text-uppercase mb-2">Passengers</div>
                <div className="list-group list-group-flush">
                  {booking.passengers.map((p, i) => (
                    <div key={i} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{p.fname} {p.lname}</strong>
                          {p.seatNo && <span className="text-muted ms-2">Seat {p.seatNo}</span>}
                        </div>
                      </div>
                      <div className="small text-muted mt-1">
                        {p.dob && <span>DOB: {formatDate(p.dob)}</span>}
                        {p.email && (p.dob ? ' · ' : '') + (p.email || '')}
                        {p.phone && (p.email || p.dob ? ' · ' : '') + (p.phone || '')}
                        {p.passport && (p.phone || p.email || p.dob ? ' · ' : '') + `Passport: ${p.passport}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to="/" className="btn btn-outline-primary">
            Back to search
          </Link>
          <Link to="/profile" className="btn btn-primary">
            View my bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
