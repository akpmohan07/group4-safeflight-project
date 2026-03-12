import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom no-print">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            Safeflight
          </Link>
          <div className="ms-auto d-flex align-items-center gap-3">
            {user && (
              <>
                <Link className="nav-link text-muted text-decoration-none small" to="/profile" title="Profile">
                  {user.email} ({user.role})
                </Link>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container py-4">{children}</main>
    </div>
  );
}

export default Layout;

