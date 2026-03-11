import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ProfilePage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setBookings([]);
      setError('');
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/bookings/me');
        if (!res.ok) {
          throw new Error('Failed to load bookings');
        }
        const json = await res.json();
        if (!cancelled) {
          setBookings(Array.isArray(json) ? json : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error loading bookings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) {
    return <div className="alert alert-warning">You are not logged in.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <Link to="/" className="btn btn-outline-secondary btn-sm mb-3">
          ← Back
        </Link>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">User details</h5>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Name</dt>
                  <dd className="col-sm-7">
                    {user.fname} {user.lname}
                  </dd>
                  <dt className="col-sm-5">Email</dt>
                  <dd className="col-sm-7">{user.email}</dd>
                  <dt className="col-sm-5">Role</dt>
                  <dd className="col-sm-7">{user.role}</dd>
                  <dt className="col-sm-5">Phone</dt>
                  <dd className="col-sm-7">{user.phone || '-'}</dd>
                  <dt className="col-sm-5">Country</dt>
                  <dd className="col-sm-7">{user.country || '-'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">My bookings</h5>
                {loading && <div>Loading bookings...</div>}
                {error && !loading && (
                  <div className="alert alert-danger mb-0">{error}</div>
                )}
                {!loading && !error && bookings.length === 0 && (
                  <div className="text-muted small">You have no bookings yet.</div>
                )}
                {!loading && !error && bookings.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Flight</th>
                          <th>Route</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Seats</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.bookingId}>
                            <td>{b.bookingId}</td>
                            <td>{b.flightCode}</td>
                            <td>
                              {b.fromAirport} → {b.toAirport}
                            </td>
                            <td>{b.travelDate}</td>
                            <td>{b.travelTime}</td>
                            <td>{b.status}</td>
                            <td>{b.seats && b.seats.join(', ')}</td>
                            <td>
                              <Link
                                to={`/bookings/${b.bookingId}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                View booking
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

