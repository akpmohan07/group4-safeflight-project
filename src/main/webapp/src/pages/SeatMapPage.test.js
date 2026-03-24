import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SeatMapPage from './SeatMapPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ scheduleId: '1' })
}));

describe('SeatMapPage', () => {
  const mockSeatMapData = {
    scheduleId: 1,
    flightCode: 'SF101',
    flightName: 'Safe Air Chennai - Delhi',
    airlineName: 'Safe Air',
    fromAirport: 'MAA',
    toAirport: 'DEL',
    travelDate: '2026-06-01',
    travelTime: '08:30:00',
    seatMapping: JSON.stringify({
      aircraftConfig: {
        structure: {
          rows: 4,
          columns: 6,
          alignment: [
            { type: 'Business Class', seat_layout: [2, 2], row_count: 2 },
            { type: 'Economy Class', seat_layout: [3, 3], row_count: 2 }
          ]
        }
      },
      seatPricing: {
        'Business Class': 1500,
        'Economy Class': 300
      }
    }),
    bookedSeats: ['1A', '2B']
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading seat map...')).toBeInTheDocument();
  });

  test('displays seat map with flight information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/flights/1/seatmap'));

    expect(await screen.findByText(/SF101/)).toBeInTheDocument();
    expect(screen.getAllByText(/Safe Air/)[0]).toBeInTheDocument();
    expect(screen.getByText(/MAA → DEL/)).toBeInTheDocument();
  });

  test('displays seat sections with labels', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const businessClassElements = await screen.findAllByText(/Business Class/i);
    expect(businessClassElements.length).toBeGreaterThan(0);
    const economyClassElements = screen.getAllByText(/Economy Class/i);
    expect(economyClassElements.length).toBeGreaterThan(0);
  });

  test('allows selecting available seats', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const seats = document.querySelectorAll('.bg-light');
    fireEvent.click(seats[0]);

    await waitFor(() => {
      const selectedSeats = document.querySelectorAll('.bg-primary');
      expect(selectedSeats.length).toBe(1);
    });
  });

  test('prevents selecting booked seats', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-secondary').length).toBeGreaterThan(0));

    const bookedSeats = document.querySelectorAll('.bg-secondary');
    expect(bookedSeats.length).toBeGreaterThan(0);

    fireEvent.click(bookedSeats[0]);

    const selectedSeats = document.querySelectorAll('.bg-primary');
    expect(selectedSeats.length).toBe(0);
  });

  test('shows selected seats summary with pricing', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const availableSeats = document.querySelectorAll('.bg-light');
    fireEvent.click(availableSeats[0]);

    expect(await screen.findByText(/Selected seats & price/)).toBeInTheDocument();
    expect(screen.getByText(/Total/)).toBeInTheDocument();
  });

  test('continue button is disabled when no seats selected', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const continueButtons = screen.getAllByRole('button', { hidden: true });
    const continueButton = continueButtons.find(btn => btn.textContent.includes('Continue'));
    expect(continueButton).toBeDisabled();
  });

  test('continue button is enabled when seats are selected', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const availableSeats = document.querySelectorAll('.bg-light');
    fireEvent.click(availableSeats[0]);

    await waitFor(() => {
      const continueButtons = screen.getAllByRole('button');
      const continueButton = continueButtons.find(btn => btn.textContent.includes('Continue'));
      expect(continueButton).not.toBeDisabled();
    });
  });

  test('navigates to passenger details with selected seats', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const availableSeats = document.querySelectorAll('.bg-light');
    fireEvent.click(availableSeats[0]);

    await waitFor(() => {
      const continueButtons = screen.getAllByRole('button');
      const continueButton = continueButtons.find(btn => btn.textContent.includes('Continue'));
      expect(continueButton).not.toBeDisabled();
      fireEvent.click(continueButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/passengers/1',
      expect.objectContaining({
        state: expect.objectContaining({
          selectedSeats: expect.any(Array)
        })
      })
    );
  });

  test('shows error message when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Network error/)).toBeInTheDocument();
  });

  test('shows warning when seat map is not available', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockSeatMapData,
        seatMapping: null
      })
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Seat map is not available/)).toBeInTheDocument();
  });

  test('allows deselecting seats', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelectorAll('.bg-light').length).toBeGreaterThan(0));

    const availableSeats = document.querySelectorAll('.bg-light');
    fireEvent.click(availableSeats[0]);

    await waitFor(() => {
      const selectedSeats = document.querySelectorAll('.bg-primary');
      expect(selectedSeats.length).toBe(1);
    });

    const selectedSeat = document.querySelectorAll('.bg-primary')[0];
    fireEvent.click(selectedSeat);

    await waitFor(() => {
      const selectedSeats = document.querySelectorAll('.bg-primary');
      expect(selectedSeats.length).toBe(0);
    });
  });

  test('displays fare by cabin when no seats selected', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeatMapData
    });

    render(
      <MemoryRouter initialEntries={['/flights/1']}>
        <SeatMapPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText(/Fare by cabin:/)).toBeInTheDocument();
    expect(screen.getByText(/Business Class:/)).toBeInTheDocument();
    expect(screen.getByText(/Economy Class:/)).toBeInTheDocument();
  });
});
