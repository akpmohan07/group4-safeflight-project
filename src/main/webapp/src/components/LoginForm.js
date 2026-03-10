import React from 'react';

function LoginForm({ values, onChange, onSubmit, loading }) {
  return (
    <form className="card shadow-sm" onSubmit={onSubmit}>
      <div className="card-body">
        <h5 className="card-title mb-3">Login</h5>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={values.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={values.password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;

