import React from 'react';

function SignupForm({ values, onChange, onSubmit, loading }) {
  return (
    <form className="card shadow-sm" onSubmit={onSubmit}>
      <div className="card-body">
        <h5 className="card-title mb-3">Signup</h5>
        <div className="row">
          <div className="mb-3 col-md-6">
            <label className="form-label">First name</label>
            <input
              type="text"
              name="fname"
              className="form-control"
              value={values.fname}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label">Last name</label>
            <input
              type="text"
              name="lname"
              className="form-control"
              value={values.lname}
              onChange={onChange}
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
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={values.phone}
            onChange={onChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date of birth</label>
          <input
            type="date"
            name="dob"
            className="form-control"
            value={values.dob}
            onChange={onChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Country</label>
          <input
            type="text"
            name="country"
            className="form-control"
            value={values.country}
            onChange={onChange}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Signing up...' : 'Signup'}
        </button>
      </div>
    </form>
  );
}

export default SignupForm;

