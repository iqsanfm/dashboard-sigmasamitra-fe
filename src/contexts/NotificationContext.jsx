import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // Clear any existing timeout to prevent multiple notifications overlapping
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({ message, type });

    const id = setTimeout(() => {
      setNotification(null);
      setTimeoutId(null);
    }, duration);
    setTimeoutId(id);
  }, [timeoutId]);

  const hideNotification = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setNotification(null);
  }, [timeoutId]);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};