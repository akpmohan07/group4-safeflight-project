import './App.css';
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthPage
            onLoginSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              navigate('/profile');
            }}
          />
        }
      />
      <Route path="/profile" element={<ProfilePage user={user} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  );
}

export default App;
