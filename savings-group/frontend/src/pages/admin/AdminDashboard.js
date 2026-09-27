import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../hooks/useMembers';
import { useTransactions } from '../../hooks/useTransactions';
import { getGroupSummary } from '../../services/reportService';
import { calculateGroupTotals, formatCurrency } from '../../utils/calculateTotals';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { members, loading: membersLoading } = useMembers();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [groupSummary, setGroupSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchGroupSummary = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const params = {};
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
        
        const summary = await getGroupSummary(params, user.accessToken);
        setGroupSummary(summary);
      } catch (error) {
        console.error('Error fetching group summary:', error);
        const calculatedSummary = calculateGroupTotals(transactions, members);
        setGroupSummary({
          summary: calculatedSummary,
          dateRange,
          generatedAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupSummary();
  }, [user, transactions, members, dateRange]);

  const loadingState = membersLoading || transactionsLoading || loading;

  if (loadingState) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const summary = groupSummary?.summary || calculateGroupTotals(transactions, members);

  // Get recent transactions with proper sorting
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Quick stats for overview
  const quickStats = [
    {
      title: "Today's Savings",
      value: formatCurrency(summary.todaysSavings || 0),
      icon: "💰",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "This Week",
      value: formatCurrency(summary.weekSavings || 0),
      icon: "📅",
      trend: "+8%",
      trendUp: true
    },
    {
      title: "Active Members",
      value: summary.activeMembers,
      icon: "👥",
      trend: "+2",
      trendUp: true
    },
    {
      title: "Completion Rate",
      value: "94%",
      icon: "🎯",
      trend: "+5%",
      trendUp: true
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome back, {user?.name || 'Admin'}!</h1>
            <p>Here's what's happening with your savings group today.</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <span className="hero-stat-value">{formatCurrency(summary.totalSavings)}</span>
              <span className="hero-stat-label">Total Savings</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-value">{summary.totalMembers}</span>
              <span className="hero-stat-label">Members</span>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className="quick-stat-card">
            <div className="quick-stat-icon">{stat.icon}</div>
            <div className="quick-stat-content">
              <h3>{stat.title}</h3>
              <div className="quick-stat-value">{stat.value}</div>
              <div className={`quick-stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                <span className="trend-arrow">{stat.trendUp ? '↗' : '↘'}</span>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="dashboard-controls">
        <div className="controls-header">
          <h2>📊 Analytics & Filters</h2>
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>📅 Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>📅 End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="filter-input"
            />
          </div>
          <button
            className="filter-clear-btn"
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Summary Cards */}
        <div className="dashboard-left">
          <div className="summary-section">
            <h2>💼 Financial Overview</h2>
            <div className="summary-cards">
              <div className="summary-card primary-card">
                <div className="card-header">
                  <span className="card-icon">💰</span>
                  <h3>Total Group Balance</h3>
                </div>
                <div className="card-body">
                  <div className="main-amount">{formatCurrency(summary.netBalance)}</div>
                  <div className="amount-breakdown">
                    <span>Total Savings: {formatCurrency(summary.totalSavings)}</span>
                    <span>Total Withdrawals: {formatCurrency(summary.totalWithdrawals)}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <span className="progress-text">75% of monthly goal</span>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-header">
                  <span className="card-icon">📈</span>
                  <h3>Average Savings</h3>
                </div>
                <div className="card-body">
                  <div className="main-amount">{formatCurrency(summary.averageSavings)}</div>
                  <div className="amount-subtext">Per member</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-header">
                  <span className="card-icon">🔄</span>
                  <h3>Transactions</h3>
                </div>
                <div className="card-body">
                  <div className="main-amount">{summary.totalTransactions}</div>
                  <div className="amount-subtext">This period</div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Breakdown */}
          <div className="breakdown-section">
            <h2>📊 Savings Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-card">
                <div className="breakdown-header">
                  <span className="breakdown-icon">📅</span>
                  <span>Weekly Savings</span>
                </div>
                <div className="breakdown-amount">{formatCurrency(summary.totalWeeklySaving)}</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{width: '60%'}}></div>
                </div>
              </div>

              <div className="breakdown-card">
                <div className="breakdown-header">
                  <span className="breakdown-icon">🎯</span>
                  <span>Munomukabi</span>
                </div>
                <div className="breakdown-amount">{formatCurrency(summary.totalMunomukabi)}</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{width: '30%'}}></div>
                </div>
              </div>

              <div className="breakdown-card">
                <div className="breakdown-header">
                  <span className="breakdown-icon">💡</span>
                  <span>Other Savings</span>
                </div>
                <div className="breakdown-amount">{formatCurrency(summary.totalOtherSaving)}</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{width: '10%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="dashboard-right">
          {/* Quick Actions */}
          <div className="actions-section">
            <h2>⚡ Quick Actions</h2>
            <div className="action-grid">
              <Link to="/admin/members/register" className="action-btn primary-action">
                <span className="action-icon">👤</span>
                <span className="action-text">
                  <strong>Add Member</strong>
                  <small>Register new member</small>
                </span>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/transactions" className="action-btn secondary-action">
                <span className="action-icon">💳</span>
                <span className="action-text">
                  <strong>Record Transaction</strong>
                  <small>Add savings/withdrawal</small>
                </span>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/reports" className="action-btn tertiary-action">
                <span className="action-icon">📄</span>
                <span className="action-text">
                  <strong>Generate Report</strong>
                  <small>Financial summary</small>
                </span>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/members" className="action-btn quaternary-action">
                <span className="action-icon">👥</span>
                <span className="action-text">
                  <strong>View Members</strong>
                  <small>Manage all members</small>
                </span>
                <span className="action-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-header">
              <h2>🕒 Recent Activity</h2>
              <Link to="/admin/transactions" className="view-all-btn">View All</Link>
            </div>
            <div className="activity-feed">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="activity-item">
                    <div className="activity-avatar">
                      <span className="avatar-icon">
                        {transaction.type === 'Saving' ? '💰' : '💸'}
                      </span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-main">
                        <span className="activity-name">{transaction.memberName}</span>
                        <span className="activity-type">{transaction.type}</span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-date">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <span className="activity-time">
                          {new Date(transaction.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <div className={`activity-amount ${transaction.type === 'Saving' ? 'positive' : 'negative'}`}>
                      {transaction.type === 'Saving' ? (
                        `+${formatCurrency(transaction.weeklySaving + transaction.munomukabi + transaction.otherSaving)}`
                      ) : (
                        `-${formatCurrency(transaction.withdrawal)}`
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;