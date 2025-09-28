import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ Changed import
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, error, setError } = useAuth(); // ✅ Removed fallback, now using AuthContext
  const navigate = useNavigate();

  // Admin credentials
  const ADMIN_CREDENTIALS = {
    email: "byabajunguhenry@gmail.com",
    password: "@123456"
  };

  // If user is already logged in, redirect them based on role
  useEffect(() => {
    if (user) {
      const targetPath = user.role === 'admin' ? '/admin' : '/member';
      // Only navigate if we're not already on the correct path
      if (window.location.pathname !== targetPath) {
        navigate(targetPath);
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // ✅ This will now work with AuthContext

    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill admin credentials function
  const fillAdminCredentials = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setError(''); // ✅ Clear errors when filling credentials
  };

  // Clear form function
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError(''); // ✅ This will now work
  };

  // If user is already logged in, show a loading message
  if (user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Redirecting to your dashboard...</h2>
            <p>Please wait while we load your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Savings Group Login</h2>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || (!email.trim() || !password.trim())}
            className="login-button"
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-divider">
          <span>Testing Credentials</span>
        </div>

        <div className="admin-credentials">
          <div className="credentials-info">
            <h3>🔑 Admin Login Details</h3>
            <div className="credential-item">
              <strong>Email:</strong> 
              <code>{ADMIN_CREDENTIALS.email}</code>
            </div>
            <div className="credential-item">
              <strong>Password:</strong> 
              <code>{ADMIN_CREDENTIALS.password}</code>
            </div>
          </div>
          
          <div className="credential-actions">
            <button 
              type="button" 
              onClick={fillAdminCredentials}
              className="fill-button"
              disabled={isLoading}
            >
              📝 Quick Fill Admin
            </button>
            <button 
              type="button" 
              onClick={clearForm}
              className="clear-button"
              disabled={isLoading}
            >
              🗑️ Clear Form
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            <strong>Note:</strong> Members will receive their login credentials from the admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;