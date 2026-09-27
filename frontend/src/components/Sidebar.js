import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  BarChart3, Users, FileText, DollarSign, TrendingUp,
  Menu, X, ChevronLeft, ChevronRight, Home, User,
} from 'lucide-react';

const S = {
  sidebar: {
    height: '100vh',
    background: 'linear-gradient(180deg,#1a1b3a 0%,#2d1b4e 50%,#1e1b4b 100%)',
    borderRight: '2px solid rgba(147,51,234,.2)',
    transition: 'width .3s cubic-bezier(.4,0,.2,1)',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(139,92,246,.15),0 8px 25px rgba(59,130,246,.15)',
    position: 'fixed',
    top: 0, left: 0,
    zIndex: 1600,
    display: 'flex',
    flexDirection: 'column',
  },
  topAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4)',
  },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
  },
  roleBadge: {
    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)',
    color: '#fff', padding: '2px 10px', borderRadius: 20,
    fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '.5px', display: 'inline-block',
  },
  navLinkBase: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 14px', borderRadius: 12,
    color: '#c7d2fe', textDecoration: 'none',
    transition: 'all .2s cubic-bezier(.4,0,.2,1)',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)',
    color: '#fff',
    border: '1px solid rgba(139,92,246,.3)',
    boxShadow: '0 4px 14px rgba(139,92,246,.25)',
  },
  navLinkHover: {
    background: 'rgba(139,92,246,.12)',
    color: '#f8fafc',
    transform: 'translateX(4px)',
  },
  tooltip: {
    position: 'absolute', left: 'calc(100% + 14px)', top: '50%',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(180deg,#1a1b3a,#2d1b4e)',
    color: '#f8fafc', padding: '7px 12px', borderRadius: 8,
    fontSize: '.8rem', fontWeight: 500, whiteSpace: 'nowrap',
    border: '1px solid rgba(139,92,246,.35)',
    boxShadow: '0 4px 14px rgba(139,92,246,.2)',
    zIndex: 2100, pointerEvents: 'none',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 1500,
  },
  mobileToggle: {
    position: 'fixed', top: 16, left: 16, zIndex: 2000,
    background: 'linear-gradient(180deg,#1a1b3a,#2d1b4e)',
    border: '1px solid rgba(147,51,234,.35)',
    color: '#f8fafc', padding: '9px 11px', borderRadius: 10,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
  },
  collapseBtn: {
    background: 'transparent',
    border: '1px solid rgba(147,51,234,.35)',
    color: '#c7d2fe', borderRadius: 8,
    padding: '6px 8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s ease', flexShrink: 0,
  },
  sectionBg: {
    borderBottom: '1px solid rgba(147,51,234,.2)',
    background: 'rgba(139,92,246,.05)',
  },
};

export const SIDEBAR_EXPANDED  = 280;
export const SIDEBAR_COLLAPSED = 68;

const Sidebar = () => {
  const { user } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const adminItems = [
    { path: '/admin',              label: 'Dashboard',       icon: BarChart3  },
    // { path: '/admin/register',     label: 'Register Member', icon: Users      },
    { path: '/admin/members',      label: 'Members',         icon: FileText   },
    { path: '/admin/transactions', label: 'Transactions',    icon: DollarSign },
    { path: '/admin/reports',      label: 'Reports',         icon: TrendingUp },
  ];

  const memberItems = [
    { path: '/member',              label: 'Dashboard',       icon: Home       },
    { path: '/member/transactions', label: 'My Transactions', icon: DollarSign },
  ];

  const menuItems = user?.role === 'admin' ? adminItems : memberItems;

  const showExpanded = !collapsed || isMobile;
  const sidebarWidth = isMobile ? 280 : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);

  const sidebarStyle = {
    ...S.sidebar,
    width: sidebarWidth,
    transform: isMobile
      ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
      : 'translateX(0)',
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="d-md-none"
        style={S.mobileToggle}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && <div style={S.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={S.topAccent} />

        {/* Header */}
        <div
          className="d-flex align-items-center px-3 py-3"
          style={{
            ...S.sectionBg,
            justifyContent: !showExpanded ? 'center' : 'space-between',
            minHeight: 72,
          }}
        >
          <div className="d-flex align-items-center" style={{ gap: 10, overflow: 'hidden', flex: 1 }}>
            <div style={S.logoIcon}><DollarSign size={20} /></div>
            {showExpanded && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                  Savings Group
                </div>
                <div style={{ color: '#c7d2fe', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Financial Management
                </div>
              </div>
            )}
          </div>

          <button
            className="d-none d-md-flex"
            style={S.collapseBtn}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User info */}
        {user && (
          <div
            className="d-flex align-items-center px-3 py-3"
            style={{
              ...S.sectionBg,
              justifyContent: !showExpanded ? 'center' : 'flex-start',
              gap: 10,
            }}
          >
            <div style={S.avatar}><User size={17} /></div>
            {showExpanded && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.displayName || 'User'}
                </div>
                <div style={{ color: '#c7d2fe', fontSize: '.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                  {user.email}
                </div>
                <span style={S.roleBadge}>{user.role}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          <ul className="list-unstyled mb-0 px-2">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHovered = hoveredIdx === idx;
              const showTooltip = !showExpanded && isHovered;

              const linkStyle = {
                ...S.navLinkBase,
                ...(isActive ? S.navLinkActive : {}),
                ...(isHovered && !isActive ? S.navLinkHover : {}),
                ...(!showExpanded ? { justifyContent: 'center', padding: '13px 10px' } : {}),
              };

              return (
                <li key={item.path} className="mb-1" style={{ position: 'relative' }}>
                  <Link
                    to={item.path}
                    style={linkStyle}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <span style={{ flexShrink: 0, display: 'flex' }}>
                      <Icon size={20} />
                    </span>
                    {showExpanded && (
                      <span style={{ fontWeight: 500, fontSize: '.87rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {showTooltip && <span style={S.tooltip}>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {showExpanded && (
          <div
            className="px-3 py-3 text-center"
            style={{ borderTop: '1px solid rgba(147,51,234,.2)', background: 'rgba(139,92,246,.05)' }}
          >
            <div style={{ color: '#a78bfa', fontSize: '.73rem' }}>© AcSoftwareLabs 2026 Savings Group</div>
            <div style={{ color: '#a78bfa', fontSize: '.73rem' }}>v1.0.0</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;