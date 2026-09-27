import React from 'react';
import '../styles/components.css';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;