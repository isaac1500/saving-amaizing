import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .login-page {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #0d0f1a;
    overflow: hidden;
    position: relative;
  }

  /* ── Animated background ── */
  .login-bg {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
  }
  .login-bg-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: .5;
  }
  .orb1 { width:500px; height:500px; background:radial-gradient(circle,#4f46e5,transparent 70%); top:-150px; left:-100px; animation: drift1 12s ease-in-out infinite alternate; }
  .orb2 { width:400px; height:400px; background:radial-gradient(circle,#06b6d4,transparent 70%); bottom:-100px; right:-80px; animation: drift2 10s ease-in-out infinite alternate; }
  .orb3 { width:300px; height:300px; background:radial-gradient(circle,#7c3aed,transparent 70%); top:40%; left:40%; animation: drift3 14s ease-in-out infinite alternate; }

  @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(40px,30px)} }
  @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(-30px,-40px)} }
  @keyframes drift3 { from{transform:translate(0,0)} to{transform:translate(20px,-30px)} }

  /* ── Left panel ── */
  .login-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 4rem;
    position: relative; z-index: 1;
  }
  .login-brand {
    display: flex; align-items: center; gap: 14px; margin-bottom: 3.5rem;
  }
  .login-brand-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    box-shadow: 0 8px 24px rgba(79,70,229,.4);
  }
  .login-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0;
  }
  .login-brand-tag {
    font-size: .7rem; font-weight: 400; color: rgba(199,210,254,.5);
    text-transform: uppercase; letter-spacing: .6px;
  }
  .login-headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800; color: #fff; line-height: 1.1;
    letter-spacing: -.8px; margin-bottom: 1rem;
  }
  .login-headline span {
    background: linear-gradient(90deg,#818cf8,#06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .login-sub {
    color: rgba(199,210,254,.6); font-size: .95rem; font-weight: 300;
    line-height: 1.6; max-width: 380px; margin-bottom: 2.5rem;
  }
  .login-features { display: flex; flex-direction: column; gap: .75rem; }
  .login-feature {
    display: flex; align-items: center; gap: .75rem;
    color: rgba(199,210,254,.7); font-size: .85rem;
  }
  .login-feature-dot {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: .8rem;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  }

  /* ── Right panel (form) ── */
  .login-right {
    width: 480px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 2.5rem;
    position: relative; z-index: 1;
  }
  .login-card {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.1);
    backdrop-filter: blur(24px);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 24px 80px rgba(0,0,0,.4);
    animation: slideUp .4s ease both;
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .login-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.55rem; font-weight: 800; color: #fff;
    letter-spacing: -.4px; margin-bottom: .35rem;
  }
  .login-card-sub {
    color: rgba(199,210,254,.55); font-size: .85rem; font-weight: 300;
    margin-bottom: 2rem;
  }

  /* ── Form fields ── */
  .login-field { margin-bottom: 1.2rem; }
  .login-label {
    display: block; font-size: .72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .6px;
    color: rgba(199,210,254,.6); margin-bottom: .5rem;
  }
  .login-input-wrap { position: relative; }
  .login-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: .9rem; pointer-events: none; opacity: .5;
  }
  .login-input {
    width: 100%;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 13px 14px 13px 40px;
    color: #fff;
    font-size: .9rem; font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .login-input::placeholder { color: rgba(255,255,255,.25); }
  .login-input:focus {
    border-color: #4f46e5;
    background: rgba(79,70,229,.1);
    box-shadow: 0 0 0 3px rgba(79,70,229,.2);
  }
  .login-input:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Error ── */
  .login-error {
    display: flex; align-items: flex-start; gap: .6rem;
    background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25);
    border-radius: 10px; padding: .8rem 1rem;
    color: #fca5a5; font-size: .82rem; margin-bottom: 1.2rem;
    animation: shake .3s ease;
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    25%{transform:translateX(-4px)}
    75%{transform:translateX(4px)}
  }

  /* ── Submit button ── */
  .login-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    border: none; border-radius: 12px;
    color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: .95rem; font-weight: 600; cursor: pointer;
    transition: all .2s ease;
    box-shadow: 0 4px 20px rgba(79,70,229,.4);
    display: flex; align-items: center; justify-content: center; gap: .5rem;
    margin-bottom: .75rem;
  }
  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(79,70,229,.5);
  }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

  /* ── Divider ── */
  .login-divider {
    display: flex; align-items: center; gap: 1rem;
    margin: 1.2rem 0; color: rgba(199,210,254,.3);
    font-size: .75rem;
  }
  .login-divider-line {
    flex: 1; height: 1px; background: rgba(255,255,255,.1);
  }

  /* ── Sign up link ── */
  .login-signup {
    text-align: center; margin-top: 1rem;
    color: rgba(199,210,254,.5); font-size: .85rem;
  }
  .login-signup-link {
    color: #818cf8; text-decoration: none; font-weight: 600;
    transition: color .2s; margin-left: .5rem;
  }
  .login-signup-link:hover {
    color: #a5b4fc; text-decoration: underline;
  }

  /* ── Clear button ── */
  .login-clear {
    width: 100%; padding: 12px;
    background: transparent;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    color: rgba(199,210,254,.6);
    font-family: 'DM Sans', sans-serif;
    font-size: .85rem; font-weight: 500; cursor: pointer;
    transition: all .2s ease;
  }
  .login-clear:hover:not(:disabled) {
    background: rgba(255,255,255,.05);
    border-color: rgba(255,255,255,.2);
    color: rgba(199,210,254,.9);
  }
  .login-clear:disabled { opacity: .4; cursor: not-allowed; }

  /* ── Spinner ── */
  .login-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ── Footer note ── */
  .login-note {
    margin-top: 1.5rem; padding-top: 1.2rem;
    border-top: 1px solid rgba(255,255,255,.07);
    text-align: center;
    color: rgba(199,210,254,.4); font-size: .75rem; line-height: 1.5;
  }
  .login-note strong { color: rgba(199,210,254,.65); }

  /* ── Redirect screen ── */
  .login-redirect {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: #0d0f1a; color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .login-redirect-spinner {
    width: 48px; height: 48px; border-radius: 50%;
    border: 3px solid rgba(79,70,229,.3);
    border-top-color: #4f46e5;
    animation: spin .8s linear infinite; margin-bottom: 1.2rem;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .login-left  { display: none; }
    .login-right { width: 100%; padding: 1.5rem; }
    .login-card  { padding: 2rem 1.5rem; }
  }
`;

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isLoading,setIsLoading]= useState(false);
  const { user, login, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const target = user.role === 'admin' ? '/admin' : '/member';
      if (window.location.pathname !== target) navigate(target);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => { setEmail(''); setPassword(''); setError(''); };

  /* Redirect screen */
  if (user) {
    return (
      <div className="login-redirect">
        <style>{css}</style>
        <div className="login-redirect-spinner" />
        <p style={{ color: 'rgba(199,210,254,.7)', fontSize: '.95rem' }}>
          Redirecting to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <style>{css}</style>

      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="login-bg-orb orb1" />
        <div className="login-bg-orb orb2" />
        <div className="login-bg-orb orb3" />
      </div>

      {/* ── Left panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">💰</div>
          <div>
            <p className="login-brand-name">Savings Group</p>
            <p className="login-brand-tag">Financial Management System</p>
          </div>
        </div>

        <h1 className="login-headline">
          Manage your<br />
          group savings<br />
          <span>with confidence.</span>
        </h1>

        <p className="login-sub">
          A secure, real-time platform for tracking member savings,
          withdrawals, and group financial health — all in one place.
        </p>

        <div className="login-features">
          {[
            { icon: '🔒', text: 'Secure role-based access for admins and members' },
            { icon: '📊', text: 'Real-time transaction tracking and reporting'    },
            { icon: '👥', text: 'Full member management with credential sharing'  },
            { icon: '📥', text: 'Export reports as CSV for offline records'        },
          ].map((f, i) => (
            <div key={i} className="login-feature">
              <div className="login-feature-dot">{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Welcome back</h2>
          <p className="login-card-sub">Sign in to access your dashboard</p>

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉️</span>
              <input
                className="login-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔑</span>
              <input
                className="login-input"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? (
              <><div className="login-spinner" /> Signing in…</>
            ) : (
              <>Sign In →</>
            )}
          </button>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span>or</span>
            <div className="login-divider-line" />
          </div>

          <button
            className="login-clear"
            onClick={clearForm}
            disabled={isLoading}
          >
            Clear form
          </button>

          <div className="login-signup">
            Don't have an account?
            <Link to="/signup" className="login-signup-link">
              Create Account →
            </Link>
          </div>

          <div className="login-note">
            <strong>Members:</strong> Sign up to join the group or log in with your credentials.<br />
            Contact your administrator if you need help accessing your account.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;