import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberRegistration from './pages/admin/MemberRegistration';
import MembersPage from './pages/admin/MembersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import MemberDashboard from './pages/member/MemberDashboard';
import TransactionsHistory from './pages/member/TransactionsHistory';

// ProtectedRoute component definition
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  
  return children;
};

// HomeRedirect component definition
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (user) {
    return user.role === 'admin' 
      ? <Navigate to="/admin" /> 
      : <Navigate to="/member" />;
  }
  
  return <Navigate to="/login" />;
};

// Main AppRoutes component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/member-registration" element={
        <ProtectedRoute requiredRole="admin">
          <MemberRegistration />
        </ProtectedRoute>
      } />
      <Route path="/admin/members" element={
        <ProtectedRoute requiredRole="admin">
          <MembersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/transactions" element={
        <ProtectedRoute requiredRole="admin">
          <TransactionsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="admin">
          <ReportsPage />
        </ProtectedRoute>
      } />
      
      {/* Member Routes */}
      <Route path="/member" element={
        <ProtectedRoute requiredRole="member">
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/member/transactions" element={
        <ProtectedRoute requiredRole="member">
          <TransactionsHistory />
        </ProtectedRoute>
      } />
      
      {/* Default redirect based on role */}
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  );
};

export default AppRoutes;