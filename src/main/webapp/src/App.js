import './App.css';
import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function App() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'adminAirline'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

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
  const [airlineForm, setAirlineForm] = useState({
    name: '',
    country: ''
  });

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupForm,
          dob: signupForm.dob || null
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(typeof data === 'string' ? data : 'Signup failed');
        return;
      }
      setUser(data);
      setMessage('Signup successful. You can now log in.');
      setMode('login');
    } catch (err) {
      setMessage('Network error during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(typeof data === 'string' ? data : 'Login failed');
        return;
      }
      setUser(data);
      setMessage('Login successful');
    } catch (err) {
      setMessage('Network error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <span className="navbar-brand fw-semibold">Safeflight</span>
          <div className="ms-auto btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('signup')}
            >
              Signup
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        {message && (
          <div className="alert alert-info" role="alert">
            {message}
          </div>
        )}

        {user && (
          <div className="alert alert-secondary py-2 mb-3">
            Logged in as <strong>{user.email}</strong> ({user.role})
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-6">
            {mode === 'login' && (
              <form className="card shadow-sm" onSubmit={handleLogin}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Login</h5>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={loginForm.email}
                      onChange={handleChange(setLoginForm)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={loginForm.password}
                      onChange={handleChange(setLoginForm)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form className="card shadow-sm" onSubmit={handleSignup}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Signup</h5>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">First name</label>
                      <input
                        type="text"
                        name="fname"
                        className="form-control"
                        value={signupForm.fname}
                        onChange={handleChange(setSignupForm)}
                        required
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Last name</label>
                      <input
                        type="text"
                        name="lname"
                        className="form-control"
                        value={signupForm.lname}
                        onChange={handleChange(setSignupForm)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={signupForm.email}
                      onChange={handleChange(setSignupForm)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={signupForm.password}
                      onChange={handleChange(setSignupForm)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={signupForm.phone}
                      onChange={handleChange(setSignupForm)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date of birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={signupForm.dob}
                      onChange={handleChange(setSignupForm)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      value={signupForm.country}
                      onChange={handleChange(setSignupForm)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Signing up...' : 'Signup'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
