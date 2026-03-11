import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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

function BookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.status === 404) {
          if (!cancelled) setError('Booking not found');
          return;
        }
        if (res.status === 403) {
          if (!cancelled) setError('You do not have access to this booking');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load booking');
        }
        const data = await res.json();
        if (!cancelled) setBooking(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error loading booking');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [bookingId]);

  if (!bookingId) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="alert alert-warning">
            No booking ID. <Link to="/profile">View my bookings</Link>.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8 text-center py-5">Loading booking...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="alert alert-danger">
            {error || 'Booking not found'}
          </div>
          <Link to="/profile" className="btn btn-outline-secondary btn-sm">← Back to my bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-7">
        <Link to="/profile" className="btn btn-outline-secondary btn-sm mb-3">
          ← Back to my bookings
        </Link>

        <div className="mb-4">
          <h4 className="mb-1">Booking details</h4>
          <p className="text-muted mb-0 small">Booking #{booking.bookingId}</p>
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

        <div className="d-flex flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-primary">Back to search</Link>
          <Link to="/profile" className="btn btn-primary">View my bookings</Link>
        </div>
      </div>
    </div>
  );
}

export default BookingDetailPage;
