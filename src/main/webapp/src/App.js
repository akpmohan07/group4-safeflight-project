import './App.css';
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
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
