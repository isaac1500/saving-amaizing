import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from './components/Sidebar';
import InstallPrompt from './components/InstallPrompt';
import Login from './pages/auth/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import MembersPage from './pages/admin/MembersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import MemberDashboard from './pages/member/MemberDashboard';
import TransactionsHistory from './pages/member/TransactionsHistory';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import './styles/pages.css';

// Loading screen
const LoadingScreen = () => (
  <div
    className="d-flex flex-column align-items-center justify-content-center vh-100"
    style={{ background: 'linear-gradient(135deg,#1a1b3a,#2d1b4e)' }}
  >
    <div
      className="spinner-border mb-3"
      style={{ color: '#8b5cf6', width: 48, height: 48 }}
      role="status"
    />
    <p style={{ color: '#c7d2fe', fontSize: '.95rem' }}>Checking authentication…</p>
  </div>
);

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }

  return children;
};

// Public Route (for unauthenticated users only)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }

  return children;
};

// App Layout — Navbar slides in sync with sidebar
const AppLayout = () => {
  const { user } = useAuth();
  const { collapsed } = useSidebar();

  const sidebarOffset = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <>
      {/* Navbar — slides in sync with sidebar */}
      <div
        className="navbar-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarOffset,
          right: 0,
          zIndex: 1000,
          transition: 'left .3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <Navbar />
      </div>

      <Sidebar />

      <main
        style={{
          marginLeft: sidebarOffset,
          minHeight: '100vh',
          paddingTop: 64,
          background: 'linear-gradient(135deg,#faf8ff 0%,#f3f4f6 50%,#e0e7ff 100%)',
          transition: 'margin-left .3s cubic-bezier(.4,0,.2,1)',
        }}
        className="px-3 px-md-4 py-3"
      >
        <style>{`
          @media (max-width: 767.98px) {
            main { margin-left: 0 !important; }
            .navbar-wrapper { left: 0 !important; }
          }
        `}</style>

        <Routes>
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/members" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MembersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/transactions" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TransactionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />

          {/* Member Routes */}
          <Route 
            path="/member" 
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/member/transactions" 
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <TransactionsHistory />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect based on user role */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={user?.role === 'admin' ? '/admin' : '/member'} 
                replace 
              />
            } 
          />
        </Routes>
      </main>
    </>
  );
};

// Root App
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              {/* Public Routes - accessible without authentication */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes - require authentication */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <InstallPrompt />
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;