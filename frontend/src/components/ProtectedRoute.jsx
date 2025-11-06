// Protected Route Component with Role-Based Access
// Path: frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser, isAuthorized } from '../utils/authUtils';

/**
 * Protected Route Component
 * Checks if user is authenticated and has proper role
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getStoredUser();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles.length > 0 && !isAuthorized(user, allowedRoles)) {
    // Redirect to their own dashboard
    const roleDashboards = {
      user: '/dashboard/user',
      doctor: '/dashboard/doctor',
      admin: '/dashboard/admin',
    };

    return <Navigate to={roleDashboards[user.role.toLowerCase()] || '/login'} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
