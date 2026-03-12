import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfilePage({ user }) {
  const { refreshMe } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    fname: '',
    lname: '',
    phone: '',
    dob: '',
    country: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const syncFormFromUser = () => {
    if (!user) return;
    setProfileForm({
      fname: user.fname || '',
      lname: user.lname || '',
      phone: user.phone || '',
      dob: user.dob ? String(user.dob).slice(0, 10) : '',
      country: user.country || ''
    });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setBookings([]);
      setError('');
      return;
    }
    syncFormFromUser();
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
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Update failed');
      }
      await refreshMe();
      setProfileMessage('Profile updated successfully.');
      setEditingProfile(false);
    } catch (e) {
      setProfileMessage(e.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(false);
    setProfileMessage(null);
    syncFormFromUser();
  };

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
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-2">
                    <label className="form-label small text-muted">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={user.email || ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">First name</label>
                    <input
                      name="fname"
                      type="text"
                      className="form-control form-control-sm"
                      value={editingProfile ? profileForm.fname : (user.fname || '')}
                      onChange={handleProfileChange}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Last name</label>
                    <input
                      name="lname"
                      type="text"
                      className="form-control form-control-sm"
                      value={editingProfile ? profileForm.lname : (user.lname || '')}
                      onChange={handleProfileChange}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      className="form-control form-control-sm"
                      value={editingProfile ? profileForm.phone : (user.phone || '')}
                      onChange={handleProfileChange}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Date of birth</label>
                    <input
                      name="dob"
                      type="date"
                      className="form-control form-control-sm"
                      value={editingProfile ? profileForm.dob : (user.dob ? String(user.dob).slice(0, 10) : '')}
                      onChange={handleProfileChange}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Country</label>
                    <input
                      name="country"
                      type="text"
                      className="form-control form-control-sm"
                      value={editingProfile ? profileForm.country : (user.country || '')}
                      onChange={handleProfileChange}
                      disabled={!editingProfile}
                    />
                  </div>
                  {profileMessage && (
                    <div className={`small mb-2 ${profileMessage.startsWith('Profile updated') ? 'text-success' : 'text-danger'}`}>
                      {profileMessage}
                    </div>
                  )}
                  {editingProfile ? (
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={profileSaving}>
                        {profileSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCancelEdit} disabled={profileSaving}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        syncFormFromUser();
                        setEditingProfile(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </form>
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
                          <th>Payment</th>
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
                            <td>
                              {b.paymentStatus ? (
                                <span className={`badge ${b.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-secondary'}`}>
                                  {b.paymentStatus === 'SUCCESS' ? 'Paid' : b.paymentStatus}
                                </span>
                              ) : '—'}
                            </td>
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

