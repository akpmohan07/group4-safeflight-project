import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import * as AuthContext from '../context/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SearchPage', () => {
  const mockUser = { id: 1, email: 'test@example.com', role: 'USER' };
  const mockDestinations = [
    { id: 1, country: 'India', city: 'Chennai', airport: 'MAA' },
    { id: 2, country: 'India', city: 'Delhi', airport: 'DEL' },
    { id: 3, country: 'India', city: 'Mumbai', airport: 'BOM' }
  ];

  const renderWithAuth = (user = mockUser) => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ user });
    return render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );
  };

  const getFromSelect = () => document.querySelectorAll('select')[0];
  const getToSelect = () => document.querySelectorAll('select')[1];
  const getDateInput = () => document.querySelector('input[type="date"]');

  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows login prompt when user is not authenticated', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    renderWithAuth(null);

    expect(screen.getByText(/Please/)).toBeInTheDocument();
    expect(screen.getByText(/log in/)).toBeInTheDocument();
  });

  test('renders search form when user is authenticated', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDestinations
    });

    renderWithAuth();

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/destinations'));

    expect(screen.getByText('Search one-way flights')).toBeInTheDocument();
    expect(getFromSelect()).toBeInTheDocument();
    expect(getToSelect()).toBeInTheDocument();
    expect(getDateInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search flights/ })).toBeInTheDocument();
  });

  test('loads destinations on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDestinations
    });

    renderWithAuth();

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/destinations'));

    const fromSelect = getFromSelect();
    expect(fromSelect).toBeInTheDocument();

    await waitFor(() => {
      const options = fromSelect.querySelectorAll('option');
      expect(options.length).toBe(4);
    });
  });

  test('form fields are required', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDestinations
    });

    renderWithAuth();

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(getFromSelect()).toBeRequired();
    expect(getToSelect()).toBeRequired();
    expect(getDateInput()).toBeRequired();
  });

  test('searches flights successfully and displays results', async () => {
    const mockFlights = [
      {
        scheduleId: 1,
        airlineName: 'Safe Air',
        flightCode: 'SF101',
        travelTime: '08:30:00',
        fromAirport: 'MAA',
        toAirport: 'DEL',
        priceFrom: 300
      },
      {
        scheduleId: 2,
        airlineName: 'Sky Connect',
        flightCode: 'SC201',
        travelTime: '14:00:00',
        fromAirport: 'MAA',
        toAirport: 'DEL',
        priceFrom: 450
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDestinations
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFlights
      });

    renderWithAuth();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(getFromSelect(), { target: { value: '1' } });
    fireEvent.change(getToSelect(), { target: { value: '2' } });
    fireEvent.change(getDateInput(), { target: { value: '2026-06-01' } });

    const submitButton = screen.getByRole('button', { name: /Search flights/ });
    fireEvent.click(submitButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenCalledWith('/api/flights/search?fromId=1&toId=2&date=2026-06-01');

    expect(await screen.findByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Safe Air')).toBeInTheDocument();
    expect(screen.getByText('SF101')).toBeInTheDocument();
    expect(screen.getByText('Sky Connect')).toBeInTheDocument();
    expect(screen.getByText('SC201')).toBeInTheDocument();
  });

  test('handles fetch error gracefully when loading destinations', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithAuth();

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/destinations'));

    const fromSelect = getFromSelect();
    const options = fromSelect.querySelectorAll('option');
    expect(options.length).toBe(1);
  });

  test('handles fetch error gracefully when searching flights', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDestinations
      })
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithAuth();

    await waitFor(() => expect(getFromSelect()).toBeInTheDocument());

    fireEvent.change(getFromSelect(), { target: { value: '1' } });
    fireEvent.change(getToSelect(), { target: { value: '2' } });
    fireEvent.change(getDateInput(), { target: { value: '2027-06-01' } });

    const submitButton = screen.getByRole('button', { name: /Search flights/ });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/No flights available/)).toBeInTheDocument();
  });
});
