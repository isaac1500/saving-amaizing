import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../hooks/useMembers';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  User, Mail, Lock, Eye, EyeOff, MapPin, Users,
  CheckCircle, AlertTriangle, Rocket, Shield, ArrowLeft
} from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .signup-page {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #0d0f1a;
    overflow: auto;
    position: relative;
  }

  /* Animated background */
  .signup-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }
  .signup-bg-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: .5;
  }
  .orb1 { width:500px; height:500px; background:radial-gradient(circle,#4f46e5,transparent 70%); top:-150px; left:-100px; animation: drift1 12s ease-in-out infinite alternate; }
  .orb2 { width:400px; height:400px; background:radial-gradient(circle,#06b6d4,transparent 70%); bottom:-100px; right:-80px; animation: drift2 10s ease-in-out infinite alternate; }
  .orb3 { width:300px; height:300px; background:radial-gradient(circle,#7c3aed,transparent 70%); top:40%; left:40%; animation: drift3 14s ease-in-out infinite alternate; }

  @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(40px,30px)} }
  @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(-30px,-40px)} }
  @keyframes drift3 { from{transform:translate(0,0)} to{transform:translate(20px,-30px)} }

  /* Main container */
  .signup-container {
    width: 100%;
    max-width: 600px;
    margin: 2rem auto;
    position: relative;
    z-index: 1;
    padding: 1rem;
  }

  /* Card */
  .signup-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.1);
    backdrop-filter: blur(24px);
    border-radius: 28px;
    padding: 2.5rem;
    animation: slideUp .4s ease both;
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* Header */
  .signup-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .signup-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 8px 24px rgba(79,70,229,.4);
  }
  .signup-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -.4px;
    margin-bottom: .5rem;
  }
  .signup-subtitle {
    color: rgba(199,210,254,.6);
    font-size: .9rem;
  }

  /* Form fields */
  .signup-field { margin-bottom: 1.2rem; }
  .signup-label {
    display: block;
    font-size: .72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: rgba(199,210,254,.6);
    margin-bottom: .5rem;
  }
  .signup-input-wrap { position: relative; }
  .signup-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: .9rem;
    pointer-events: none;
    opacity: .5;
  }
  .signup-input {
    width: 100%;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 13px 14px 13px 40px;
    color: #fff;
    font-size: .9rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .signup-input::placeholder { color: rgba(255,255,255,.25); }
  .signup-input:focus {
    border-color: #4f46e5;
    background: rgba(79,70,229,.1);
    box-shadow: 0 0 0 3px rgba(79,70,229,.2);
  }
  .signup-input.has-error {
    border-color: #ef4444;
  }
  .signup-toggle-pw {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(199,210,254,.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
  }
  .signup-error-msg {
    font-size: .7rem;
    color: #fca5a5;
    margin-top: .5rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Password strength */
  .signup-strength-row {
    display: flex;
    gap: 4px;
    margin: .6rem 0 .25rem;
  }
  .signup-strength-bar {
    height: 3px;
    flex: 1;
    border-radius: 2px;
    background: rgba(255,255,255,.1);
    transition: background .3s;
  }
  .signup-strength-bar.weak { background: #ef4444; }
  .signup-strength-bar.fair { background: #f59e0b; }
  .signup-strength-bar.good { background: #10b981; }
  .signup-strength-label {
    font-size: .68rem;
    color: rgba(199,210,254,.5);
  }

  /* Button */
  .signup-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: .95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
    box-shadow: 0 4px 20px rgba(79,70,229,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    margin-bottom: 1rem;
  }
  .signup-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(79,70,229,.5);
  }
  .signup-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  /* Login link */
  .signup-login-link {
    text-align: center;
    color: rgba(199,210,254,.5);
    font-size: .85rem;
    margin-top: 1rem;
  }
  .signup-login-link a {
    color: #818cf8;
    text-decoration: none;
    font-weight: 600;
    margin-left: .5rem;
  }
  .signup-login-link a:hover {
    color: #a5b4fc;
    text-decoration: underline;
  }

  /* Back to login */
  .signup-back {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    color: rgba(199,210,254,.6);
    text-decoration: none;
    font-size: .85rem;
    margin-bottom: 1rem;
    transition: color .2s;
  }
  .signup-back:hover {
    color: #fff;
  }

  /* Error banner */
  .signup-error-banner {
    display: flex;
    align-items: flex-start;
    gap: .7rem;
    background: rgba(239,68,68,.12);
    border: 1px solid rgba(239,68,68,.25);
    border-radius: 12px;
    padding: 1rem;
    color: #fca5a5;
    font-size: .83rem;
    margin-bottom: 1.2rem;
  }

  /* Success modal */
  .signup-success-check {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg,#d1fae5,#a7f3d0);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 20px rgba(16,185,129,.3);
  }
  .signup-success-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--ink);
    margin-bottom: .25rem;
  }
  .signup-success-sub {
    font-size: .84rem;
    color: var(--ink2);
    margin-bottom: 1.5rem;
  }
  .signup-warning-box {
    display: flex;
    align-items: flex-start;
    gap: .7rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 11px;
    padding: .9rem 1.1rem;
    font-size: .8rem;
    color: #92400e;
    margin-bottom: 1.2rem;
  }
  .signup-modal-actions {
    display: flex;
    gap: .75rem;
  }
  .signup-modal-actions button {
    flex: 1;
    justify-content: center;
  }

  /* Spinner */
  .signup-spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

const SignUp = () => {
  const navigate = useNavigate();
  const { createMember, loading, error, clearError } = useMembers();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (password.length >= 8) return 3;
    if (password.length >= 5) return 2;
    if (password.length > 0) return 1;
    return 0;
  };

  const strengthLevel = getPasswordStrength(formData.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (clearError) clearError();
      await createMember({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender,
        residence: formData.residence,
        role: 'member' // Explicitly set role as member
      });
      
      setSuccessData({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  if (loading) return <LoadingSpinner text="Creating your account..." />;

  return (
    <div className="signup-page">
      <style>{css}</style>

      {/* Animated background */}
      <div className="signup-bg">
        <div className="signup-bg-orb orb1" />
        <div className="signup-bg-orb orb2" />
        <div className="signup-bg-orb orb3" />
      </div>

      <div className="signup-container">
        <Link to="/login" className="signup-back">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-icon">💰</div>
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Join the savings group and start your journey</p>
          </div>

          {error && (
            <div className="signup-error-banner">
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="signup-field">
              <label className="signup-label">Full Name *</label>
              <div className="signup-input-wrap">
                <span className="signup-input-icon">👤</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`signup-input ${formErrors.fullName ? 'has-error' : ''}`}
                />
              </div>
              {formErrors.fullName && (
                <div className="signup-error-msg">
                  <AlertTriangle size={11} /> {formErrors.fullName}
                </div>
              )}
            </div>

            <div className="signup-field">
              <label className="signup-label">Email Address *</label>
              <div className="signup-input-wrap">
                <span className="signup-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`signup-input ${formErrors.email ? 'has-error' : ''}`}
                />
              </div>
              {formErrors.email && (
                <div className="signup-error-msg">
                  <AlertTriangle size={11} /> {formErrors.email}
                </div>
              )}
            </div>

            <div className="signup-field">
              <label className="signup-label">Username *</label>
              <div className="signup-input-wrap">
                <span className="signup-input-icon">🔤</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`signup-input ${formErrors.username ? 'has-error' : ''}`}
                />
              </div>
              {formErrors.username && (
                <div className="signup-error-msg">
                  <AlertTriangle size={11} /> {formErrors.username}
                </div>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="signup-field">
                  <label className="signup-label">Gender</label>
                  <div className="signup-input-wrap">
                    <span className="signup-input-icon">👥</span>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="signup-input"
                      style={{ appearance: 'none' }}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="signup-field">
                  <label className="signup-label">Residence</label>
                  <div className="signup-input-wrap">
                    <span className="signup-input-icon">📍</span>
                    <input
                      type="text"
                      name="residence"
                      value={formData.residence}
                      onChange={handleChange}
                      placeholder="Your location"
                      className="signup-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="signup-field">
              <label className="signup-label">Password *</label>
              <div className="signup-input-wrap">
                <span className="signup-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`signup-input ${formErrors.password ? 'has-error' : ''}`}
                />
                <button
                  type="button"
                  className="signup-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formData.password && (
                <>
                  <div className="signup-strength-row">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`signup-strength-bar ${i <= strengthLevel ? 
                          (strengthLevel === 1 ? 'weak' : strengthLevel === 2 ? 'fair' : 'good') : ''}`}
                      />
                    ))}
                  </div>
                  <div className="signup-strength-label">
                    Strength: <strong>{strengthLabels[strengthLevel]}</strong>
                  </div>
                </>
              )}
              {formErrors.password && (
                <div className="signup-error-msg">
                  <AlertTriangle size={11} /> {formErrors.password}
                </div>
              )}
            </div>

            <div className="signup-field">
              <label className="signup-label">Confirm Password *</label>
              <div className="signup-input-wrap">
                <span className="signup-input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`signup-input ${formErrors.confirmPassword ? 'has-error' : ''}`}
                />
                <button
                  type="button"
                  className="signup-toggle-pw"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div className="signup-error-msg">
                  <AlertTriangle size={11} /> {formErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="signup-btn"
              disabled={loading}
            >
              {loading ? (
                <><div className="signup-spinner" /> Creating Account...</>
              ) : (
                <><Rocket size={18} /> Sign Up →</>
              )}
            </button>

            <div className="signup-login-link">
              Already have an account?
              <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Account Created!"
        size="lg"
      >
        <div style={{ fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
          <div className="signup-success-check">
            <CheckCircle size={30} color="#059669" />
          </div>
          <h3 className="signup-success-title">Welcome, {successData?.fullName}!</h3>
          <p className="signup-success-sub">
            Your account has been created successfully. You can now log in.
          </p>

          <div className="signup-warning-box">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Important:</strong> Please remember your username: <strong>{successData?.username}</strong>
              <br />
              You'll need this along with your password to log in.
            </div>
          </div>

          <div className="signup-modal-actions">
            <button
              className="mreg-btn mreg-btn-primary"
              onClick={handleSuccessClose}
              style={{
                flex: 1,
                padding: '.7rem',
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Proceed to Login →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignUp;