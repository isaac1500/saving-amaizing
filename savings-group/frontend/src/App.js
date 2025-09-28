import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberRegistration from './pages/admin/MemberRegistration';
import MembersPage from './pages/admin/MembersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import MemberDashboard from './pages/member/MemberDashboard';
import TransactionsHistory from './pages/member/TransactionsHistory';
import './styles/index.css';
// import './styles/components.css';
import './styles/pages.css';
// import './styles/responsive.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    ); // Better loading UI
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/register" element={<ProtectedRoute allowedRoles={['admin']}><MemberRegistration /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute allowedRoles={['admin']}><MembersPage /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><TransactionsPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><MemberDashboard /></ProtectedRoute>} />
            <Route path="/member/transactions" element={<ProtectedRoute allowedRoles={['member']}><TransactionsHistory /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/member'} replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;