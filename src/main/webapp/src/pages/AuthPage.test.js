import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthPage from './AuthPage';

describe('AuthPage', () => {
  const setInputValue = (name, value) => {
    const input = document.querySelector(`input[name="${name}"]`);
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value } });
  };

  const submitVisibleForm = () => {
    const form = document.querySelector('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form);
  };

  const modeToggleButton = (name) =>
    screen
      .getAllByRole('button', { name: new RegExp(`^${name}$`) })
      .find((btn) => btn.getAttribute('type') === 'button');

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    render(<AuthPage onLoginSuccess={jest.fn()} />);

    expect(modeToggleButton('Login')).toHaveClass('btn-primary');
    expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument();
  });

  test('renders signup form when signup tab is selected', () => {
    render(<AuthPage onLoginSuccess={jest.fn()} />);

    fireEvent.click(modeToggleButton('Signup'));

    expect(modeToggleButton('Signup')).toHaveClass('btn-primary');
    expect(document.querySelector('input[name="fname"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="lname"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument();
  });

  test('login required fields are invalid when empty', () => {
    render(<AuthPage onLoginSuccess={jest.fn()} />);

    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(emailInput.checkValidity()).toBe(false);
    expect(passwordInput.checkValidity()).toBe(false);
  });

  test('signup required fields are invalid when empty', () => {
    render(<AuthPage onLoginSuccess={jest.fn()} />);
    fireEvent.click(modeToggleButton('Signup'));

    const firstNameInput = document.querySelector('input[name="fname"]');
    const lastNameInput = document.querySelector('input[name="lname"]');
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');

    expect(firstNameInput).toBeRequired();
    expect(lastNameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(firstNameInput.checkValidity()).toBe(false);
    expect(lastNameInput.checkValidity()).toBe(false);
    expect(emailInput.checkValidity()).toBe(false);
    expect(passwordInput.checkValidity()).toBe(false);
  });

  test('shows HTML validation error state for invalid email format', () => {
    render(<AuthPage onLoginSuccess={jest.fn()} />);

    setInputValue('email', 'invalid-email');
    setInputValue('password', 'secret');

    const emailInput = document.querySelector('input[name="email"]');
    expect(emailInput.checkValidity()).toBe(false);
    expect(emailInput.validationMessage).not.toBe('');
  });

  test('logs in successfully and calls onLoginSuccess', async () => {
    const onLoginSuccess = jest.fn();
    const user = { id: 7, email: 'john@example.com', role: 'USER' };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => user
    });

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    setInputValue('email', 'john@example.com');
    setInputValue('password', 'secret');
    submitVisibleForm();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'secret' })
    });

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(user));
    expect(screen.getByRole('alert')).toHaveTextContent('Login successful');
  });

  test('shows login error when backend rejects credentials', async () => {
    const onLoginSuccess = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => 'Invalid credentials'
    });

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    setInputValue('email', 'wrong@example.com');
    setInputValue('password', 'bad-pass');
    submitVisibleForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  test('signs up successfully and switches back to login mode', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 11 })
    });

    render(<AuthPage onLoginSuccess={jest.fn()} />);

    fireEvent.click(modeToggleButton('Signup'));
    setInputValue('fname', 'Jane');
    setInputValue('lname', 'Doe');
    setInputValue('email', 'jane@example.com');
    setInputValue('password', 'secret');
    setInputValue('phone', '1234567890');
    setInputValue('country', 'USA');
    submitVisibleForm();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fname: 'Jane',
        lname: 'Doe',
        email: 'jane@example.com',
        password: 'secret',
        phone: '1234567890',
        dob: null,
        country: 'USA'
      })
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Signup successful. You can now log in.');
    expect(modeToggleButton('Login')).toHaveClass('btn-primary');
  });

  test('shows signup error and stays on signup mode on failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => 'Email is already registered'
    });

    render(<AuthPage onLoginSuccess={jest.fn()} />);

    fireEvent.click(modeToggleButton('Signup'));
    setInputValue('fname', 'Jane');
    setInputValue('lname', 'Doe');
    setInputValue('email', 'jane@example.com');
    setInputValue('password', 'secret');
    submitVisibleForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
    expect(modeToggleButton('Signup')).toHaveClass('btn-primary');
  });
});
