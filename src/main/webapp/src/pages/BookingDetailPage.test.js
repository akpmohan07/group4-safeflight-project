import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingDetailPage from './BookingDetailPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ bookingId: '1' })
}));

describe('BookingDetailPage', () => {
  const mockBookingData = {
    bookingId: 1,
    status: 'CONFIRMED',
    paymentStatus: 'SUCCESS',
    flightCode: 'SF101',
    airlineName: 'Safe Air',
    fromAirport: 'MAA',
    toAirport: 'DEL',
    travelDate: '2026-06-01',
    travelTime: '08:30:00',
    seats: ['1A', '1B'],
    passengers: [
      {
        fname: 'John',
        lname: 'Doe',
        seatNo: '1A',
        dob: '1990-01-01',
        email: 'john@example.com',
        phone: '1234567890',
        passport: 'P1234567'
      },
      {
        fname: 'Jane',
        lname: 'Doe',
        seatNo: '1B',
        dob: '1992-05-15',
        email: 'jane@example.com',
        phone: '0987654321',
        passport: 'P7654321'
      }
    ]
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading booking...')).toBeInTheDocument();
  });

  test('displays booking details when loaded', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/bookings/1'));

    const bookingElements = await screen.findAllByText(/Booking #1/);
    expect(bookingElements.length).toBeGreaterThan(0);
    expect(screen.getByText('SF101')).toBeInTheDocument();
    expect(screen.getByText('Safe Air')).toBeInTheDocument();
    expect(screen.getByText('MAA')).toBeInTheDocument();
    expect(screen.getByText('DEL')).toBeInTheDocument();
  });

  test('displays booking status and payment status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText(/Payment: Paid/)).toBeInTheDocument();
  });

  test('displays seat information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText('1A, 1B')).toBeInTheDocument();
  });

  test('displays passenger information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/Seat 1A/)).toBeInTheDocument();
    expect(screen.getByText(/Seat 1B/)).toBeInTheDocument();
  });

  test('shows error when booking not found', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(
      <MemoryRouter initialEntries={['/bookings/999']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Booking not found')).toBeInTheDocument();
  });

  test('shows error when access is forbidden', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('You do not have access to this booking')).toBeInTheDocument();
  });

  test('shows error when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Network error/)).toBeInTheDocument();
  });

  test('downloads ticket PDF when button clicked', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingData
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name) => {
            if (name === 'Content-Disposition') {
              return 'attachment; filename="ticket-booking-1.pdf"';
            }
            return null;
          }
        },
        blob: async () => new Blob(['PDF content'], { type: 'application/pdf' })
      });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const downloadButton = await screen.findByRole('button', { name: /Download ticket/ });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/bookings/1/ticket/pdf', {
        credentials: 'include'
      });
    });
  });

  test('formats date correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const dateElement = await screen.findByText(/Jun/);
    expect(dateElement).toBeInTheDocument();
  });

  test('formats time correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const timeElement = await screen.findByText(/8:30 AM/);
    expect(timeElement).toBeInTheDocument();
  });

  test('displays passenger passport information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText(/Passport: P1234567/)).toBeInTheDocument();
    expect(screen.getByText(/Passport: P7654321/)).toBeInTheDocument();
  });

  test('displays passenger contact information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
  });

  test('shows navigation links', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookingData
    });

    render(
      <MemoryRouter initialEntries={['/bookings/1']}>
        <BookingDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(await screen.findByText('Back to search')).toBeInTheDocument();
    expect(screen.getByText('View my bookings')).toBeInTheDocument();
  });
});
