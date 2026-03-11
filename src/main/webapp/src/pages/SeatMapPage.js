import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function SeatMapPage() {
  const { scheduleId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/flights/${encodeURIComponent(scheduleId)}/seatmap`);
        if (!res.ok) {
          throw new Error('Failed to load seat map');
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) 
          setError(e.message || 'Error loading seat map');
      } finally {
        if (!cancelled) 
          setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [scheduleId]);

  const parsed = useMemo(() => {
    if (!data) return null;
    try {
      return JSON.parse(data.seatMapping);
    } catch {
      return null;
    }
  }, [data]);

  const bookedSeatSet = useMemo(() => {
    if (!data || !Array.isArray(data.bookedSeats)) return new Set();
    return new Set(data.bookedSeats);
  }, [data]);

  if (loading) {
    return <div>Loading seat map...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data || !parsed) {
    return <div className="alert alert-warning">Seat map is not available.</div>;
  }

  const { aircraftConfig, seatPricing } = parsed;
  const { structure } = aircraftConfig || {};
  const rows = structure?.rows || 0;
  const alignment = structure?.alignment || [];

  const rowSections = [];
  let currentRow = 1;
  alignment.forEach((section) => {
    for (let i = 0; i < section.row_count; i++) {
      rowSections[currentRow] = section;
      currentRow++;
    }
  });

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {data.flightCode} &mdash; {data.flightName}
          </h5>
          <span className="text-muted small">
            {data.airlineName} &middot; {data.fromAirport} → {data.toAirport}
          </span>
        </div>

        <div className="mb-3">
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            ← Back to search
          </Link>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            {rows === 0 ? (
              <div className="alert alert-warning mb-0">No seat structure defined.</div>
            ) : (
              <div className="seatmap">
                {[...Array(rows)].map((_, idx) => {
                  const rowNumber = idx + 1;
                  const section = rowSections[rowNumber];
                  if (!section) return null;
                  const blocks = section.seat_layout || [];
                  let colIdx = 0;

                  const showBarrier = rowNumber === 1 || rowSections[rowNumber - 1] !== section;

                  return (
                    <React.Fragment key={rowNumber}>
                      {showBarrier && (
                        <div className="d-flex align-items-center mt-3 mb-2">
                          <div className="flex-grow-1 border-top" />
                          <div className="px-2 small text-muted text-uppercase">
                            {section.type}
                          </div>
                          <div className="flex-grow-1 border-top" />
                        </div>
                      )}
                      <div
                        className="d-flex align-items-center mb-1"
                        style={{ gap: '8px' }}
                      >
                        <div className="text-muted small" style={{ width: 32 }}>
                          {rowNumber}
                        </div>
                        {blocks.map((blockSize, blockIndex) => {
                          const seats = [];
                          for (let i = 0; i < blockSize; i++) {
                            const label = String.fromCharCode('A'.charCodeAt(0) + colIdx);
                            const seatId = `${rowNumber}${label}`;
                            const isBooked = bookedSeatSet.has(seatId);
                            const isSelected = selectedSeats.includes(seatId);

                            let className = 'border text-center small';
                            let background = 'bg-light';
                            let color = '';
                            let opacity = 1;
                            let cursor = 'pointer';

                            if (isBooked) {
                              background = 'bg-secondary';
                              color = 'text-white';
                              opacity = 0.6;
                              cursor = 'not-allowed';
                            } else if (isSelected) {
                              background = 'bg-primary';
                              color = 'text-white';
                            }

                            seats.push(
                              <div
                                key={seatId}
                                className={`${className} ${background} ${color}`}
                                style={{
                                  width: 28,
                                  height: 28,
                                  lineHeight: '26px',
                                  borderRadius: 4,
                                  opacity,
                                  cursor
                                }}
                                onClick={
                                  isBooked ? undefined : () => toggleSeat(seatId)
                                }
                              >
                                {label}
                              </div>
                            );
                            colIdx++;
                          }
                          return (
                            <div
                              key={`${rowNumber}-block-${blockIndex}`}
                              className="d-flex"
                              style={{
                                gap: '4px',
                                marginRight: blockIndex < blocks.length - 1 ? 16 : 0
                              }}
                            >
                              {seats}
                            </div>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {seatPricing && (
          <div className="mt-3 small">
            <strong>Pricing (example):</strong>{' '}
            {Object.entries(seatPricing).map(([k, v]) => (
              <span key={k} className="me-3">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatMapPage;

