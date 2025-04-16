// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, hasPermission, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    // Only show error if not coming from logout
    if (!location.state?.isLogout) {
      toast.error('Please sign in to access this page');
    }
    return <Navigate to="/login" state={{ from: location.pathname, isLogout: location.state?.isLogout }} replace />;
  }

  // Check if user has required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;