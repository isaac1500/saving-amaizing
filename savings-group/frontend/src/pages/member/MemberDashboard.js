// src/pages/member/MemberDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  Download, 
  Mail, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  Filter
} from 'lucide-react';
import '../../styles/MemberDashboard.css';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.uid);
  const [timeRange, setTimeRange] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate statistics with enhanced logic
  const { 
    totalSavings, 
    totalWithdrawals, 
    netBalance, 
    recentTransactions,
    savingsGrowth,
    transactionTrend 
  } = useMemo(() => {
    const now = new Date();
    let startDate;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(0); // All time
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate;
    });

    const savings = filteredTransactions
      .filter(t => t.type === 'Saving')
      .reduce((sum, t) => sum + (parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0)), 0);

    const withdrawals = filteredTransactions
      .filter(t => t.type === 'Withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.withdrawal || 0), 0);

    // Calculate growth trend (previous period vs current)
    const previousPeriod = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      let previousStart, previousEnd;
      
      if (timeRange === 'week') {
        previousEnd = new Date(startDate.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        previousEnd = new Date(startDate.getTime() - 1);
        previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
      } else {
        return false;
      }
      
      return transactionDate >= previousStart && transactionDate <= previousEnd;
    });

    const previousSavings = previousPeriod
      .filter(t => t.type === 'Saving')
      .reduce((sum, t) => sum + (parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0)), 0);

    const growth = previousSavings > 0 ? ((savings - previousSavings) / previousSavings) * 100 : 0;

    return {
      totalSavings: savings,
      totalWithdrawals: withdrawals,
      netBalance: savings - withdrawals,
      recentTransactions: filteredTransactions.slice(0, 5),
      savingsGrowth: growth,
      transactionTrend: filteredTransactions.length
    };
  }, [transactions, timeRange]);

  const formatCurrency = (amount) => {
    return `UGX ${amount?.toLocaleString() || '0'}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="member-dashboard">
      {/* Enhanced Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <p className="greeting">{getGreeting()}</p>
            <h1 className="welcome-title">
              <span className="user-name">{user?.fullName || 'Member'}</span>
            </h1>
            <p className="welcome-subtitle">
              <Calendar className="subtitle-icon" />
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="time-filter">
            <Filter className="filter-icon" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className="refresh-icon" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Unable to load data</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card savings">
          <div className="card-header">
            <div className="card-icon savings-icon">
              <TrendingUp />
            </div>
            <div className="card-trend positive">
              <ArrowUpRight className="trend-icon" />
              {savingsGrowth > 0 ? `+${savingsGrowth.toFixed(1)}%` : '0%'}
            </div>
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Savings</h3>
            <p className="card-amount">{formatCurrency(totalSavings)}</p>
            <p className="card-subtitle">
              <DollarSign className="subtitle-icon" />
              Your contributions this {timeRange}
            </p>
          </div>
          <div className="card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill savings-progress" 
                style={{ width: `${Math.min((totalSavings / 1000000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card withdrawals">
          <div className="card-header">
            <div className="card-icon withdrawals-icon">
              <TrendingDown />
            </div>
            <div className="card-trend negative">
              <ArrowDownRight className="trend-icon" />
              {totalWithdrawals > 0 ? 'Active' : 'None'}
            </div>
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Withdrawals</h3>
            <p className="card-amount">{formatCurrency(totalWithdrawals)}</p>
            <p className="card-subtitle">
              <Clock className="subtitle-icon" />
              Amount withdrawn this {timeRange}
            </p>
          </div>
          <div className="card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill withdrawals-progress" 
                style={{ width: `${Math.min((totalWithdrawals / totalSavings) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="card-header">
            <div className="card-icon balance-icon">
              <Wallet />
            </div>
            <div className={`card-trend ${netBalance > 0 ? 'positive' : 'neutral'}`}>
              {netBalance > 0 ? <ArrowUpRight className="trend-icon" /> : <BarChart3 className="trend-icon" />}
              {netBalance > 0 ? 'Positive' : 'Balanced'}
            </div>
          </div>
          <div className="card-content">
            <h3 className="card-title">Net Balance</h3>
            <p className="card-amount">{formatCurrency(netBalance)}</p>
            <p className="card-subtitle">
              <BarChart3 className="subtitle-icon" />
              Current available balance
            </p>
          </div>
          <div className="card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill balance-progress" 
                style={{ width: `${Math.min(Math.abs(netBalance) / Math.max(totalSavings, 1) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card transactions">
          <div className="card-header">
            <div className="card-icon transactions-icon">
              <FileText />
            </div>
            <div className="card-trend neutral">
              <BarChart3 className="trend-icon" />
              {transactionTrend} this {timeRange}
            </div>
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Transactions</h3>
            <p className="card-amount">{transactions.length}</p>
            <p className="card-subtitle">
              <Clock className="subtitle-icon" />
              All-time transaction records
            </p>
          </div>
          <div className="card-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill transactions-progress" 
                style={{ width: `${Math.min((transactions.length / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Transactions */}
      <section className="recent-transactions">
        <div className="section-header">
          <div className="section-title">
            <FileText className="section-icon" />
            <h2>Recent Transactions</h2>
            <span className="transaction-count">{recentTransactions.length}</span>
          </div>
          <a href="/member/transactions" className="view-all-link">
            View All
            <ArrowUpRight className="link-icon" />
          </a>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <FileText className="empty-icon" />
              <div className="empty-particles">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <h3>No transactions yet</h3>
            <p>Your transaction history will appear here once you start saving</p>
          </div>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="transaction-item"
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className={`transaction-icon ${transaction.type.toLowerCase()}`}>
                  {transaction.type === 'Saving' ? 
                    <TrendingUp className="icon" /> : 
                    <TrendingDown className="icon" />
                  }
                </div>
                <div className="transaction-details">
                  <h4 className="transaction-type">
                    {transaction.type} {transaction.type === 'Saving' ? 'Deposit' : ''}
                  </h4>
                  <p className="transaction-date">
                    <Calendar className="date-icon" />
                    {new Date(transaction.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="transaction-amount">
                  <span className={`amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'Saving' ? '+' : '-'} 
                    {formatCurrency(
                      transaction.type === 'Saving' 
                        ? (parseFloat(transaction.weeklySaving || 0) + parseFloat(transaction.munomukabi || 0) + parseFloat(transaction.otherSaving || 0))
                        : parseFloat(transaction.withdrawal || 0)
                    )}
                  </span>
                  <div className="amount-indicator">
                    {transaction.type === 'Saving' ? 
                      <ArrowUpRight className="indicator-icon positive" /> : 
                      <ArrowDownRight className="indicator-icon negative" />
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Enhanced Quick Actions */}
      <section className="quick-actions">
        <div className="section-header">
          <div className="section-title">
            <BarChart3 className="section-icon" />
            <h2>Quick Actions</h2>
          </div>
        </div>
        
        <div className="actions-grid">
          <button className="action-btn primary">
            <div className="action-icon">
              <Download />
            </div>
            <div className="action-content">
              <span className="action-label">Generate Statement</span>
              <span className="action-subtitle">Download your transaction history</span>
            </div>
            <ArrowUpRight className="action-arrow" />
          </button>
          
          <button className="action-btn secondary">
            <div className="action-icon">
              <Mail />
            </div>
            <div className="action-content">
              <span className="action-label">Contact Admin</span>
              <span className="action-subtitle">Get help or ask questions</span>
            </div>
            <ArrowUpRight className="action-arrow" />
          </button>
          
          <button 
            className={`action-btn tertiary ${isRefreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <div className="action-icon">
              <RefreshCw className={isRefreshing ? 'spinning' : ''} />
            </div>
            <div className="action-content">
              <span className="action-label">
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </span>
              <span className="action-subtitle">Update your information</span>
            </div>
            <ArrowUpRight className="action-arrow" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default MemberDashboard;