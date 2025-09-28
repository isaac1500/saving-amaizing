import React from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import '../styles/error.css';

const GlobalErrorHandler = () => {
  const { error, clearError } = useErrorHandler();

  if (!error) return null;

  return (
    <div className="global-error">
      <button className="close-btn" onClick={clearError}>×</button>
      <p className="error-message">{error}</p>
    </div>
  );
};

export default GlobalErrorHandler;