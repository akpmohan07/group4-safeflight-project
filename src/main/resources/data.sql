
INSERT INTO airlines (id, name, country) VALUES
  (1, 'Safe Air', 'India'),
  (2, 'Sky Connect', 'Singapore'),
  (3, 'Global Wings', 'United Arab Emirates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO flight_model (id, model_number, model_name, manufacturer, seat_mapping) VALUES
  (1, 'A320', 'Airbus A320', 'Airbus', '{"rows": 30, "seatsPerRow": 6}'),
  (2, 'B737', 'Boeing 737', 'Boeing', '{"flightId":"AW205","aircraftConfig":{"flight_name":"boeing-777","flight_uid":"boeing_777","structure":{"rows":42,"columns":10,"alignment":[{"type":"First Class","seat_layout":[3,4,3],"row_count":4},{"type":"Business Class","seat_layout":[2,2,2],"row_count":6},{"type":"Premium Economy","seat_layout":[3,4,3],"row_count":8},{"type":"Economy Class","seat_layout":[3,4,3],"row_count":24}]}},"seatPricing":{"First Class":1200,"Business Class":800,"Premium Economy":600,"Economy Class":300}}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO flights (id, airline_id, flight_name, flight_code, flight_model_id) VALUES
  (1, 1, 'Safe Air Chennai - Delhi', 'SF101', 1),
  (2, 1, 'Safe Air Delhi - Mumbai', 'SF102', 2),
  (3, 2, 'Sky Connect Singapore - Chennai', 'SC201', 1),
  (4, 3, 'Global Wings Dubai - Bangalore', 'GW301', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO destination (id, country, city, airport) VALUES
  (1, 'India', 'Chennai', 'MAA'),
  (2, 'India', 'Delhi', 'DEL'),
  (3, 'India', 'Mumbai', 'BOM'),
  (4, 'Singapore', 'Singapore', 'SIN'),
  (5, 'United Arab Emirates', 'Dubai', 'DXB'),
  (6, 'India', 'Bangalore', 'BLR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, from_destination_id, to_destination_id) VALUES
  (1, 1, 2),   -- Chennai -> Delhi
  (2, 2, 3),   -- Delhi -> Mumbai
  (3, 4, 1),   -- Singapore -> Chennai
  (4, 5, 6)    -- Dubai -> Bangalore
ON CONFLICT (id) DO NOTHING;

INSERT INTO flight_schedule (id, flight_id, route_id, travel_date, travel_time) VALUES
  (1, 1, 1, '2025-06-01', '08:30:00'),
  (2, 1, 1, '2025-06-01', '14:00:00'),
  (3, 1, 1, '2025-06-02', '08:30:00'),
  (4, 2, 2, '2025-06-01', '10:00:00'),
  (5, 2, 2, '2025-06-02', '18:45:00'),
  (6, 3, 3, '2025-06-03', '09:15:00'),
  (7, 3, 3, '2025-06-04', '21:00:00'),
  (8, 4, 4, '2025-06-01', '02:30:00'),
  (9, 4, 4, '2025-06-02', '15:20:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, fname, lname, email, password, phone, dob, country, role) VALUES
  (1, 'Admin', 'User', 'admin@safeflight.com', 'admin123', NULL, '1990-01-01', 'India', 'ADMIN'),
  (2, 'Airline', 'Admin', 'airline.admin@safeflight.com', 'admin123', NULL, '1990-01-01', 'India', 'AIRLINE_ADMIN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO airline_user (id, airline_id, user_id) VALUES
  (1, 1, 2)
ON CONFLICT (id) DO NOTHING;
