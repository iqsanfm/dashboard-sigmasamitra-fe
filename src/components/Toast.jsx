import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const Toast = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[notification.type] || 'bg-gray-500';

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${bgColor} transition-all duration-300 transform ease-out
        ${notification ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold">{notification.message}</p>
        <button onClick={hideNotification} className="ml-4 text-white opacity-75 hover:opacity-100 focus:outline-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;