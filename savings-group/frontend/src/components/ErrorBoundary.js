import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Always log error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In development, also throw the error to show in console/dev tools
    if (process.env.NODE_ENV === 'development') {
      // Rethrow after a brief delay so the error still appears in console
      setTimeout(() => {
        throw error;
      }, 0);
    }
  }

  render() {
    // In development, don't show error UI for network/async errors
    // Let them appear in console instead
    if (process.env.NODE_ENV === 'development') {
      // Only show error boundary UI for actual React rendering errors
      // Network errors and async errors should be handled elsewhere
      if (this.state.hasError && this.isRenderingError()) {
        return (
          <div className="error-boundary">
            <div className="error-content">
              <h2>Component Error</h2>
              <p>A React component failed to render.</p>
              
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
              
              <button 
                className="btn btn-primary"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Try Again
              </button>
            </div>
          </div>
        );
      }
      
      // In development, don't catch errors - let them flow to console
      return this.props.children;
    }

    // In production, show user-friendly error for any error
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  // Helper method to distinguish rendering errors from network/async errors
  isRenderingError() {
    const error = this.state.error;
    if (!error) return false;
    
    // Network errors usually have these characteristics
    const isNetworkError = 
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.name === 'TypeError' && error.message?.includes('localhost');
    
    return !isNetworkError;
  }
}

export default ErrorBoundary;