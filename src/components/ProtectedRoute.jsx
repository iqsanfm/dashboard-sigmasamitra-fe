import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, userInfo }) => {
  if (!userInfo) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // User role not allowed, redirect to a general dashboard or unauthorized page
    // For now, let's redirect to user-home if not admin, or login if no role
    if (userInfo.role === 'ADMIN') {
        return <Navigate to="/dashboard/admin-home" replace />;
    } else if (userInfo.role === 'STAFF' || userInfo.role === 'KEUANGAN') {
        return <Navigate to="/dashboard/user-home" replace />;
    } else {
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;