import React from 'react';
import './FormInput.css';

const FormInput = ({ 
  label, 
  name,
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  disabled = false,
  options, // for select inputs
  className = ""
}) => {
  // Handle change event properly
  const handleChange = (e) => {
    if (onChange) {
      onChange(e); // Pass the entire event object
    }
  };

  return (
    <div className={`form-input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-input-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          className={`form-input form-select ${error ? 'error' : ''}`}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        >
          {options && options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={`form-input form-textarea ${error ? 'error' : ''}`}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={`form-input ${error ? 'error' : ''}`}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          // Add additional props for specific input types
          {...(type === 'number' && { min: 0, step: 'any' })}
          {...(type === 'date' && { max: new Date().toISOString().split('T')[0] })}
        />
      )}
      
      {error && <span className="form-input-error">{error}</span>}
    </div>
  );
};

export default FormInput;