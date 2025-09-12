import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StaffsPage from './pages/StaffsPage'; // Import StaffsPage
import ClientsPage from './pages/ClientsPage'; // Import ClientsPage
import DashboardLayout from './components/DashboardLayout'; // Import DashboardLayout
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { decodeJwt } from './utils/auth';
import { NotificationProvider } from './contexts/NotificationContext';
import Toast from './components/Toast';
import MonthlyJobsPage from './pages/monthly/MonthlyJobsPage'; // Import MonthlyJobsPage
import Sp2dkJobPage from './pages/sp2dk/Sp2dkJobsPage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwtInfo, setJwtInfo] = useState(null); // Stores info from JWT (token, staff_id, role, is_admin)
  const [fullUserInfo, setFullUserInfo] = useState(null); // Stores full user info from /auth/session
  const [isLoading, setIsLoading] = useState(true); // New state for initial loading

  // Check localStorage on initial load
  useEffect(() => {
    console.log('App: Initial useEffect running.');
    const storedToken = localStorage.getItem('jwtToken');
    const storedJwtInfo = localStorage.getItem('jwtInfo');

    if (storedToken && storedJwtInfo) {
      console.log('App: Found stored token and info.');
      try {
        const parsedJwtInfo = JSON.parse(storedJwtInfo);
        // Basic validation: check if token is still valid (not expired)
        const decoded = decodeJwt(storedToken);
        console.log('App: Decoded token:', decoded);
        if (decoded && decoded.exp * 1000 > Date.now()) { // exp is in seconds, Date.now() is milliseconds
          console.log('App: Token is valid. Setting isLoggedIn and jwtInfo.');
          setIsLoggedIn(true);
          setJwtInfo(parsedJwtInfo);
        } else {
          console.log('App: Token expired or invalid. Clearing storage.');
          // Token expired or invalid, clear storage
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('jwtInfo');
        }
      } catch (e) {
        console.error("App: Error parsing stored JWT info:", e);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtInfo');
      } finally {
        console.log('App: Initial check complete. Setting isLoading to false.');
        setIsLoading(false); // Set loading to false after check
      }
    } else {
      console.log('App: No stored token found. Setting isLoading to false.');
      setIsLoading(false); // No token found, set loading to false
    }
  }, []);

  const handleLoginSuccess = (info) => {
    console.log('handleLoginSuccess called with info:', info);
    setIsLoggedIn(true);
    setJwtInfo(info);
  };

  const handleLogout = async () => {
    console.log('handleLogout called.');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtInfo.token}`,
        },
      });

      if (response.ok) {
        console.log('Logged out successfully.');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Network error during logout:', error);
    } finally {
      // Always clear local state and storage regardless of API response
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtInfo');
      setIsLoggedIn(false);
      setJwtInfo(null);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered. isLoggedIn:', isLoggedIn, 'jwtInfo:', jwtInfo);
    const fetchFullUserInfo = async () => {
      if (isLoggedIn && jwtInfo && jwtInfo.token) {
        console.log('Attempting to fetch full user info...');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        try {
          const response = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${jwtInfo.token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Full user info fetched successfully:', data.user_info);
            setFullUserInfo(data.user_info);
          } else {
            console.error('Failed to fetch full user info:', response.statusText);
            // Optionally, log out user if session info cannot be fetched
            setIsLoggedIn(false);
            setJwtInfo(null);
          }
        } catch (error) {
          console.error('Network error while fetching full user info:', error);
          setIsLoggedIn(false);
          setJwtInfo(null);
        }
      }
    };

    fetchFullUserInfo();
  }, [isLoggedIn, jwtInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">Loading application...</p>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/dashboard/*"
            element={
              isLoggedIn ? (
                fullUserInfo ? (
                  <DashboardLayout userInfo={fullUserInfo} onLogout={handleLogout} />
                ) : (
                  <div>Loading Dashboard...</div>
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Redirect root path to /dashboard if logged in, otherwise to /login */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          {/* Redirect any other unmatched routes to /dashboard if logged in, otherwise to /login */}
          <Route path="*" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Toast />
    </NotificationProvider>
  );
}

export default App;