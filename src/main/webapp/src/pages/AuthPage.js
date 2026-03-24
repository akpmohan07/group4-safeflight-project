import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const signupUser = async (payload) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      dob: payload.dob || null
    })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : 'Signup failed');
  }
};

const loginUser = async (credentials) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : 'Login failed');
  }
  return data;
};

function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const user = await loginUser(loginForm);
      setMessage('Login successful');
      onLoginSuccess(user);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await signupUser(signupForm);
      setMessage('Signup successful. You can now log in.');
      setMode('login');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}
      <div className="row justify-content-center">
        <div className="col-md-6">
        <div className="btn-group mb-3" role="group">
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

          {mode === 'login' && (
            <LoginForm
              values={loginForm}
              onChange={handleChange(setLoginForm)}
              onSubmit={handleLoginSubmit}
              loading={loading}
            />
          )}

          {mode === 'signup' && (
            <SignupForm
              values={signupForm}
              onChange={handleChange(setSignupForm)}
              onSubmit={handleSignupSubmit}
              loading={loading}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default AuthPage;

