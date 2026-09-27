import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, DollarSign, X, CheckCircle, AlertTriangle,
  Eye, EyeOff, Shield, UserCheck, AtSign, ChevronRight
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useSidebar } from '../context/SidebarContext';
import Modal from './Modal';

/* ─── tiny helpers ─────────────────────────────────────────────── */
const Label = ({ children }) => (
  <label style={{
    display: 'block', fontSize: '.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.6px',
    color: '#6b7280', marginBottom: '6px'
  }}>
    {children}
  </label>
);

const FieldWrap = ({ children, error }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    {children}
    {error && (
      <p style={{ fontSize: '.72rem', color: '#ef4444', marginTop: '5px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <AlertTriangle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputBase = (hasError = false) => ({
  width: '100%',
  padding: '11px 14px',
  background: '#fafafa',
  border: `1.5px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  borderRadius: '10px',
  fontSize: '.88rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .2s, background .2s',
  color: '#111827',
  boxSizing: 'border-box',
});

/* ─── password strength ─────────────────────────────────────────── */
const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(5, s);
};
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#059669'];

/* ─── Toast ─────────────────────────────────────────────────────── */
const Toast = ({ msg, onClose }) => msg.text ? (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px', borderRadius: '10px', marginBottom: '1.25rem',
    background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
    border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
    color: msg.type === 'success' ? '#065f46' : '#991b1b',
    fontSize: '.84rem', fontWeight: 500,
  }}>
    {msg.type === 'success' ? <CheckCircle size={17} /> : <AlertTriangle size={17} />}
    <span style={{ flex: 1 }}>{msg.text}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
      <X size={14} />
    </button>
  </div>
) : null;

/* ─── TABS (removed email) ──────────────────────────────────────── */
const TABS = [
  { id: 'profile',  label: 'Profile',  Icon: UserCheck },
  { id: 'security', label: 'Security', Icon: Shield },
];

/* ══════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const { user, logout, updateUserProfile, updatePassword } = useAuth();
  const { toggleCollapsed } = useSidebar();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  /* profile */
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
  });

  /* password */
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  /* Reset forms when modal opens */
  const resetForms = () => {
    setProfile({
      fullName: user?.fullName || '',
      username: user?.username || '',
    });
    setPwdForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setMsg({ type: '', text: '' });
    setShowCur(false);
    setShowNew(false);
    setShowCon(false);
  };

  useEffect(() => {
    if (open) resetForms();
  }, [open, user]);

  const flash = (type, text) => setMsg({ type, text });
  const closeModal = () => {
    setOpen(false);
    resetForms();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  /* profile update */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.fullName.trim()) errs.fullName = 'Full name is required';
    if (!profile.username.trim()) errs.username = 'Username is required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({ fullName: profile.fullName, username: profile.username });
      flash('success', 'Profile updated successfully!');
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      flash('error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  /* password update */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwdForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwdForm.newPassword) errs.newPassword = 'New password is required';
    else if (pwdForm.newPassword.length < 6) errs.newPassword = 'At least 6 characters required';
    if (pwdForm.newPassword !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(pwdForm.currentPassword, pwdForm.newPassword);
      flash('success', 'Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      flash('error', err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(pwdForm.newPassword);

  return (
    <>
      {/* NAVBAR */}
      <nav
        style={{
          height: 64,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(99,102,241,.12)',
          boxShadow: '0 2px 16px rgba(99,102,241,.06)',
        }}
        className="d-flex align-items-center px-3 px-md-4 w-100"
      >
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <button
            onClick={toggleCollapsed}
            className="btn d-flex align-items-center justify-content-center"
            style={{
              width: 38, height: 38,
              background: 'rgba(99,102,241,.08)',
              border: '1px solid rgba(99,102,241,.18)',
              borderRadius: 10,
              color: '#6366f1',
              transition: 'all .2s',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}
            >
              <DollarSign size={16} />
            </div>
            <span
              className="d-none d-sm-block"
              style={{
                fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Savings Group
            </span>
          </div>
        </div>

        {user && (
          <div className="d-flex align-items-center gap-2 gap-md-3">
            <div
              className="d-none d-md-flex align-items-center gap-2 px-3 py-2"
              onClick={() => setOpen(true)}
              style={{
                background: 'rgba(99,102,241,.07)',
                border: '1px solid rgba(99,102,241,.15)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}
              >
                <User size={14} />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontWeight: 600, fontSize: '.82rem', color: '#1e1b4b', whiteSpace: 'nowrap' }}>
                  {user.fullName || user.displayName || user.email}
                </div>
                <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6366f1' }}>
                  {user.role}
                </div>
              </div>
              <ChevronRight size={13} style={{ color: '#9ca3af', marginLeft: 2 }} />
            </div>

            <div
              className="d-flex d-md-none align-items-center justify-content-center"
              onClick={() => setOpen(true)}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                color: '#fff', flexShrink: 0, cursor: 'pointer',
              }}
            >
              <User size={16} />
            </div>

            <button
              onClick={handleLogout}
              className="btn d-flex align-items-center gap-2"
              style={{
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '7px 14px',
                fontWeight: 600,
                fontSize: '.82rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(239,68,68,.22)',
              }}
            >
              <LogOut size={15} />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* MODAL – only Profile & Security */}
      <Modal isOpen={open} onClose={closeModal} size="md">
        <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: '#fff', borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)', padding: '1.4rem 1.75rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Account Settings</h3>
                <p style={{ margin: '5px 0 0', fontSize: '.78rem', opacity: .75 }}>Manage your profile and password</p>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex', color: '#fff' }}>
                <X size={19} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: '1.1rem' }}>
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setMsg({ type: '', text: '' }); setErrors({}); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '.78rem',
                    background: tab === id ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)',
                    color: tab === id ? '#fff' : 'rgba(255,255,255,.6)',
                    borderBottom: tab === id ? '2px solid rgba(255,255,255,.7)' : '2px solid transparent',
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1.75rem', background: '#fff' }}>
            <Toast msg={msg} onClose={() => setMsg({ type: '', text: '' })} />

            {/* PROFILE TAB */}
            {tab === 'profile' && (
              <form onSubmit={handleProfileSave}>
                <FieldWrap error={errors.fullName}>
                  <Label>Full Name</Label>
                  <input
                    type="text"
                    value={profile.fullName}
                    placeholder="Your full name"
                    onChange={e => { setProfile(p => ({ ...p, fullName: e.target.value })); setErrors(p => ({ ...p, fullName: '' })); }}
                    style={inputBase(!!errors.fullName)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.fullName ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
                  />
                </FieldWrap>

                <FieldWrap error={errors.username}>
                  <Label>Username</Label>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      value={profile.username}
                      placeholder="your_username"
                      onChange={e => { setProfile(p => ({ ...p, username: e.target.value })); setErrors(p => ({ ...p, username: '' })); }}
                      style={{ ...inputBase(!!errors.username), paddingLeft: 34 }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.username ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
                    />
                  </div>
                </FieldWrap>

                {/* Email read-only preview */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <Label>Email Address</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 10 }}>
                    <span style={{ fontSize: '.88rem', color: '#6b7280' }}>{user?.email || '—'}</span>
                  </div>
                  <p style={{ fontSize: '.7rem', color: '#9ca3af', marginTop: 5 }}>Email cannot be changed. Contact an administrator if you need to update it.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={closeModal} style={{ padding: '10px 22px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: 'pointer', color: '#4b5563' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* SECURITY TAB */}
            {tab === 'security' && (
              <form onSubmit={handlePasswordSave}>
                <FieldWrap error={errors.currentPassword}>
                  <Label>Current Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCur ? 'text' : 'password'}
                      value={pwdForm.currentPassword}
                      placeholder="Your current password"
                      autoComplete="off"
                      onChange={e => { setPwdForm(p => ({ ...p, currentPassword: e.target.value })); setErrors(p => ({ ...p, currentPassword: '' })); }}
                      style={{ ...inputBase(!!errors.currentPassword), paddingRight: 44 }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                    />
                    <button type="button" onClick={() => setShowCur(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showCur ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </FieldWrap>

                <div style={{ marginBottom: '1.1rem' }}>
                  <Label>New Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={pwdForm.newPassword}
                      placeholder="Create a strong password"
                      autoComplete="off"
                      onChange={e => { setPwdForm(p => ({ ...p, newPassword: e.target.value })); setErrors(p => ({ ...p, newPassword: '' })); }}
                      style={{ ...inputBase(!!errors.newPassword), paddingRight: 44 }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {pwdForm.newPassword && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '.7rem', color: '#6b7280' }}>
                          Strength: <strong style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.newPassword && <p style={{ fontSize: '.72rem', color: '#ef4444', marginTop: 5 }}>{errors.newPassword}</p>}
                </div>

                <FieldWrap error={errors.confirmPassword}>
                  <Label>Confirm New Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCon ? 'text' : 'password'}
                      value={pwdForm.confirmPassword}
                      placeholder="Repeat new password"
                      autoComplete="off"
                      onChange={e => { setPwdForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                      style={{ ...inputBase(!!errors.confirmPassword), paddingRight: 44 }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff'; }}
                    />
                    <button type="button" onClick={() => setShowCon(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showCon ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </FieldWrap>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => { setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setErrors({}); }} style={{ padding: '10px 22px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: 'pointer', color: '#4b5563' }}>
                    Clear
                  </button>
                  <button type="submit" disabled={loading} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '.84rem', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;