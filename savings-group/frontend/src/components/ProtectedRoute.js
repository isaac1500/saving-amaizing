// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>; // Or use your LoadingSpinner component
  }

  // If user not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a role is specified and user does not have it, redirect to appropriate dashboard
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
  }

  // Otherwise render children (protected component)
  return children;
};

export default ProtectedRoute;