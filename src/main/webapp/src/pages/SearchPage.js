import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/destinations')
      .then((res) => res.json())
      .then(setDestinations)
      .catch(() => setDestinations([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromId || !toId || !date) return;

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(
        `/api/flights/search?fromId=${encodeURIComponent(fromId)}&toId=${encodeURIComponent(toId)}&date=${encodeURIComponent(date)}`
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning">
        Please <Link to="/">log in</Link> to search flights.
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <h5 className="mb-3">Search one-way flights</h5>
        <form className="card shadow-sm mb-4" onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">From</label>
                <select
                  className="form-select"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  required
                >
                  <option value="">Select origin</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.city} ({d.airport})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">To</label>
                <select
                  className="form-select"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  required
                >
                  <option value="">Select destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.city} ({d.airport})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-5"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search flights'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {results !== null && (
          <>
            {results.length === 0 ? (
              <div className="alert alert-info">No flights available for this route and date.</div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">Results</h6>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Airline</th>
                          <th>Flight</th>
                          <th>Time</th>
                          <th>From</th>
                          <th>To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => (
                          <tr
                            key={r.scheduleId}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/flights/${r.scheduleId}`)}
                          >
                            <td>{r.airlineName}</td>
                            <td>{r.flightCode}</td>
                            <td>{r.travelTime}</td>
                            <td>{r.fromAirport}</td>
                            <td>{r.toAirport}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
