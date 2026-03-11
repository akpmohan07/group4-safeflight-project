import './App.css';
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import SeatMapPage from './pages/SeatMapPage';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BookingDetailPage from './pages/BookingDetailPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <SearchPage />
            ) : (
              <AuthPage
                onLoginSuccess={(loggedInUser) => {
                  setUser(loggedInUser);
                  navigate('/');
                }}
              />
            )
          }
        />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/flights/:scheduleId" element={<SeatMapPage />} />
        <Route path="/passengers/:scheduleId" element={<PassengerDetailsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
