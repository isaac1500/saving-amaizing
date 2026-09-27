import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// Import Lucide React icons for better icons
import { 
  BarChart3, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3, color: '#667eea' },
    { path: '/admin/register', label: 'Register Member', icon: Users, color: '#f093fb' },
    { path: '/admin/members', label: 'Members', icon: FileText, color: '#4facfe' },
    { path: '/admin/transactions', label: 'Transactions', icon: DollarSign, color: '#43e97b' },
    { path: '/admin/reports', label: 'Reports', icon: TrendingUp, color: '#fa709a' },
  ];

  const memberMenuItems = [
    { path: '/member', label: 'Dashboard', icon: Home, color: '#667eea' },
    { path: '/member/transactions', label: 'My Transactions', icon: DollarSign, color: '#43e97b' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : memberMenuItems;

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    // Force a small delay to ensure state updates properly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="menu-toggle"
        onClick={toggleMobile}
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={toggleMobile} />}

      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <DollarSign size={24} />
            </div>
            {!isCollapsed && (
              <div className="logo-text">
                <h3>Savings Group</h3>
                <span className="tagline">Financial Management</span>
              </div>
            )}
          </div>
          
          {/* Collapse Toggle - Desktop Only */}
          <button 
            className="collapse-toggle desktop-only"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <p className="user-name">{user.displayName || 'User'}</p>
                <p className="user-email">{user.email}</p>
                <span className="user-role">{user.role}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li 
                  key={item.path}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    style={{
                      '--item-color': item.color,
                      '--hover-bg': `${item.color}15`,
                    }}
                  >
                    <div className="nav-icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && <div className="active-indicator" />}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="nav-tooltip">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="footer-content">
              <p>© 2024 Savings Group</p>
              <p>v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;