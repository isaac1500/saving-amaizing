import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, options = {}) => {
    const { 
      showInUI = process.env.NODE_ENV === 'production', // Only show in UI in production by default
      logToConsole = true,
      autoClose = true,
      autoCloseDelay = 5000 
    } = options;

    // Always log to console for debugging
    if (logToConsole) {
      console.error('Application error:', error);
    }
    
    // In development, you might want errors to only go to console
    // unless explicitly told to show in UI
    if (!showInUI) {
      return;
    }

    // Format error message for display
    let errorMessage = 'An unexpected error occurred';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.details) {
      errorMessage = Array.isArray(error.response.data.details) 
        ? error.response.data.details.join(', ')
        : error.response.data.details;
    }

    setError(errorMessage);
    
    // Auto-clear error after specified delay
    if (autoClose) {
      setTimeout(() => {
        setError(null);
      }, autoCloseDelay);
    }
  }, []);

  // Handle errors that should only log to console (development mode)
  const logError = useCallback((error) => {
    console.error('Application error (console only):', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    logError, // New method for console-only logging
    clearError
  };
};

// Alternative hook for development - only logs to console
export const useConsoleErrorHandler = () => {
  const logError = useCallback((error) => {
    console.error('Application error:', error);
    
    // You can also add more detailed logging here
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }, []);

  return { logError };
};