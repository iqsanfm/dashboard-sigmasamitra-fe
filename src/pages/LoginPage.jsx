import React, { useState } from 'react';
import { decodeJwt } from '../utils/auth';

const LoginPage = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loginError, setLoginError] = useState(null); // State for error message

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null); // Clear previous errors
    setEmailError(null); // Clear email errors
    setPasswordError(null); // Clear password errors

    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Invalid email format.');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!isValid) {
      return; // Stop submission if validation fails
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const loginEndpoint = `${API_BASE_URL}/auth/login`;

    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        const decodedToken = decodeJwt(data.token);
        if (decodedToken) {
          const jwtInfo = {
            token: data.token,
            staff_id: decodedToken.staff_id,
            role: decodedToken.role,
            is_admin: decodedToken.is_admin,
          };

          localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('jwtInfo', JSON.stringify(jwtInfo));
            console.log('LoginPage: Token and info stored in localStorage.');

          onLoginSuccess(jwtInfo);
        } else {
          console.error('Failed to decode JWT.');
          setLoginError('An unexpected error occurred. Please try again.');
        }

      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || 'Invalid credentials. Please try again.');
        console.error('Login failed:', errorData);
      }
    } catch (error) {
      setLoginError('Network error. Please check your connection and try again.');
      console.error('Network error or unexpected issue:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-900">Dashboard Sigma Samitra</h1>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-700">Login</h2>
        <form onSubmit={handleSubmit}>
          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {loginError}</span>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`shadow appearance-none border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600 focus:ring-2 focus:ring-blue-200 placeholder-gray-400`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="text-red-500 text-xs italic mt-1">{emailError}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`shadow appearance-none border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600 focus:ring-2 focus:ring-blue-200 placeholder-gray-400 pr-10`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 focus:outline-none top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.622a8.967 8.967 0 01.998-.756A48.322 48.322 0 0112 3c2.32 0 4.65.656 6.892 1.916c.32.15.63.31.93.48l.001.001c.88.49 1.45 1.24 1.45 2.11v.001c0 .87-.57 1.62-1.45 2.11l-.001.001c-.3.17-.61.33-.93.48A48.322 48.322 0 0112 21c-2.32 0-4.65-.656-6.892-1.916c-.32-.15-.63-.31-.93-.48l-.001-.001c-.88-.49-1.45-1.24-1.45-2.11v-.001c0-.87.57-1.62 1.45-2.11l.001-.001c.3-.17.61-.33.93-.48A48.322 48.322 0 0112 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-end mb-6">
              <a href="#" className="inline-block align-baseline font-bold text-base text-blue-500 hover:text-blue-800">
                Forgot Password?
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;