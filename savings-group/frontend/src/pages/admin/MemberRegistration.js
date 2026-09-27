import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../hooks/useMembers';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import '../../styles/MemberRegistration.css';

const MemberRegistration = () => {
  const { user } = useAuth();
  const { createMember, loading, error, clearError } = useMembers();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    residence: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const steps = [
    {
      id: 1,
      title: "Personal Info",
      icon: "👤",
      description: "Basic member details"
    },
    {
      id: 2,
      title: "Account Setup",
      icon: "🔐",
      description: "Login credentials"
    },
    {
      id: 3,
      title: "Review",
      icon: "✓",
      description: "Confirm details"
    }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
    }
    
    if (step === 2) {
      if (!formData.username.trim()) errors.username = 'Username is required';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Clear any previous errors
      if (clearError) {
        clearError();
      }
      
      const result = await createMember({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender,
        residence: formData.residence
      });
      
      setSuccessData({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        residence: ''
      });
      
      setCurrentStep(1);
      
    } catch (err) {
      console.error('Registration error:', err);
      // Error is automatically handled by the useMembers hook
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating member account..." />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>👤 Personal Information</h2>
              <p>Enter the member's basic details</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <FormInput
                  label="Full Name *"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={formErrors.fullName}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <FormInput
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <FormInput
                  label="Gender"
                  name="gender"
                  type="select"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>
              
              <div className="form-group">
                <FormInput
                  label="Residence"
                  name="residence"
                  type="text"
                  value={formData.residence}
                  onChange={handleChange}
                  placeholder="Enter residence location"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>🔐 Account Setup</h2>
              <p>Create login credentials for the member</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <FormInput
                  label="Username *"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  error={formErrors.username}
                  placeholder="Choose a username"
                  required
                />
                <div className="input-hint">
                  Username will be used for login
                </div>
              </div>
              
              <div className="form-group">
                <FormInput
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={formErrors.password}
                  placeholder="Enter password"
                  required
                />
                <div className="input-hint">
                  Minimum 6 characters
                </div>
              </div>
              
              <div className="form-group form-group-full">
                <FormInput
                  label="Confirm Password *"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={formErrors.confirmPassword}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
            
            <div className="password-strength">
              <div className="strength-indicator">
                <div className={`strength-bar ${formData.password.length >= 6 ? 'good' : formData.password.length >= 3 ? 'fair' : 'weak'}`}></div>
              </div>
              <span className="strength-text">
                Password strength: {formData.password.length >= 6 ? 'Good' : formData.password.length >= 3 ? 'Fair' : 'Weak'}
              </span>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>✓ Review Details</h2>
              <p>Please review the member information before submitting</p>
            </div>
            
            <div className="review-container">
              <div className="review-section">
                <h3>Personal Information</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Full Name:</span>
                    <span className="review-value">{formData.fullName}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Email:</span>
                    <span className="review-value">{formData.email}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Gender:</span>
                    <span className="review-value">{formData.gender || 'Not specified'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Residence:</span>
                    <span className="review-value">{formData.residence || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              
              <div className="review-section">
                <h3>Account Information</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Username:</span>
                    <span className="review-value">{formData.username}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Password:</span>
                    <span className="review-value">••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="member-registration">
      {/* Hero Section */}
      <div className="registration-hero">
        <div className="hero-content">
          <h1>👥 Register New Member</h1>
          <p>Add a new member to your savings group with secure credentials</p>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">3</span>
            <span className="stat-label">Steps</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">2</span>
            <span className="stat-label">Minutes</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="steps-container">
        <div className="steps-progress">
          {steps.map((step, index) => (
            <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
              <div className="step-circle">
                <span className="step-icon">{currentStep > step.id ? '✓' : step.icon}</span>
              </div>
              <div className="step-info">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <div className="nav-left">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                >
                  ← Previous
                </button>
              )}
            </div>
            
            <div className="nav-right">
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next →
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Creating Member...' : '🚀 Register Member'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Member Registered Successfully"
        size="lg"
      >
        <div className="success-modal-content">
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>
          
          <div className="success-message">
            <h3>Welcome {successData?.fullName}!</h3>
            <p>Member account has been created successfully</p>
          </div>
          
          <div className="credentials-card">
            <div className="card-header">
              <h4>🔑 Login Credentials</h4>
              <span className="security-badge">Secure</span>
            </div>
            <div className="credentials-grid">
              <div className="credential-item">
                <div className="credential-label">👤 Username</div>
                <div className="credential-value">{successData?.username}</div>
              </div>
              <div className="credential-item">
                <div className="credential-label">📧 Email</div>
                <div className="credential-value">{successData?.email}</div>
              </div>
              <div className="credential-item">
                <div className="credential-label">🔐 Password</div>
                <div className="credential-value password-field">
                  <span className="password-text">{successData?.password}</span>
                  <button type="button" className="copy-btn" onClick={() => navigator.clipboard.writeText(successData?.password)}>
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="warning-card">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>Important Security Notice:</strong>
              <p>Please share these credentials with the member through a secure channel. They will need these details to access their account.</p>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigator.clipboard.writeText(`Username: ${successData?.username}\nEmail: ${successData?.email}\nPassword: ${successData?.password}`)}
            >
              📋 Copy All Credentials
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowSuccessModal(false)}
            >
              ✓ Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberRegistration;