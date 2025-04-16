// src/routes/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// This is a protected route component that requires specific permission to access
const AdminRoute = ({ children, requiredPermission = 'admin.managePermissions' }) => {
  const { user, loading, hasPermission } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Check if user has the required permission
  if (!user || !hasPermission(requiredPermission)) {
    toast.error(`Access denied: You need ${requiredPermission} permission`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;