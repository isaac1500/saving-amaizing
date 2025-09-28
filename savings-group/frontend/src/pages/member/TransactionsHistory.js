// src/pages/member/TransactionsHistory.js
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';
import '../../styles/TransactionsHistory.css';

const TransactionsHistory = () => {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.uid);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          transaction.type.toLowerCase().includes(searchLower) ||
          transaction.memberName?.toLowerCase().includes(searchLower) ||
          transaction.date.includes(searchLower)
        );
      }
      return true;
    });

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const formatCurrency = (amount) => {
    return `UGX ${amount?.toLocaleString() || '0'}`;
  };

  const calculateTransactionTotal = (transaction) => {
    if (transaction.type === 'Saving') {
      return parseFloat(transaction.weeklySaving || 0) + 
             parseFloat(transaction.munomukabi || 0) + 
             parseFloat(transaction.otherSaving || 0);
    } else {
      return parseFloat(transaction.withdrawal || 0);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const amount = calculateTransactionTotal(transaction);
      if (transaction.type === 'Saving') {
        acc.savings += amount;
      } else {
        acc.withdrawals += amount;
      }
      return acc;
    }, { savings: 0, withdrawals: 0 });
  }, [filteredTransactions]);

  const handleExport = (type) => {
    console.log(`Exporting as ${type}...`);
    // Implementation for export functionality
  };

  if (loading) {
    return (
      <div className="transactions-history">
        <div className="loading-container">
          <LoadingSpinner text="Loading your transactions..." />
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-history">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content glass-card">
          <div className="header-text">
            <h1 className="gradient-text">My Transactions</h1>
            <p className="header-subtitle">View and manage your transaction history</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={() => document.documentElement.toggleAttribute('data-theme', 'dark')}>
              🌓
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner glass-card bounce-in">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <section className="summary-section">
        <div className="summary-grid">
          <div className="summary-card glass-card hover-lift">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3 className="card-title">Total Transactions</h3>
              <p className="card-value gradient-text">{filteredTransactions.length}</p>
            </div>
            <div className="card-glow"></div>
          </div>

          <div className="summary-card glass-card hover-lift">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3 className="card-title">Total Savings</h3>
              <p className="card-value positive">{formatCurrency(totals.savings)}</p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill savings-progress"></div>
            </div>
            <div className="card-glow"></div>
          </div>

          <div className="summary-card glass-card hover-lift">
            <div className="card-icon">📤</div>
            <div className="card-content">
              <h3 className="card-title">Total Withdrawals</h3>
              <p className="card-value negative">{formatCurrency(totals.withdrawals)}</p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill withdrawals-progress"></div>
            </div>
            <div className="card-glow"></div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container glass-card">
          <div className="filters-header">
            <h3 className="gradient-text">Filter Transactions</h3>
            <button onClick={clearFilters} className="clear-filters-btn glass-button">
              <span className="button-icon">🗑️</span>
              Clear Filters
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <FormInput
                type="select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'Saving', label: 'Savings' },
                  { value: 'Withdrawal', label: 'Withdrawals' }
                ]}
                placeholder="Filter by type"
                className="glass-input"
              />
            </div>
            
            <div className="filter-group">
              <FormInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start Date"
                className="glass-input"
              />
            </div>
            
            <div className="filter-group">
              <FormInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="End Date"
                className="glass-input"
              />
            </div>
            
            <div className="filter-group">
              <FormInput
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search transactions..."
                className="glass-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transactions Table */}
      <section className="transactions-section">
        <div className="transactions-container glass-card">
          <div className="table-header">
            <h2 className="gradient-text">Transaction History</h2>
            <div className="table-meta">
              <span className="results-count">
                {filteredTransactions.length} transactions found
              </span>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No transactions found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Weekly Saving</th>
                      <th>Munomukabi</th>
                      <th>Other Saving</th>
                      <th>Withdrawal</th>
                      <th>Total Amount</th>
                      <th>Entered By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <tr 
                        key={transaction.id} 
                        className="transaction-row hover-row"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="date-cell">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="type-cell">
                          <span className={`transaction-badge ${transaction.type.toLowerCase()}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="amount-cell">
                          {transaction.weeklySaving ? formatCurrency(transaction.weeklySaving) : '-'}
                        </td>
                        <td className="amount-cell">
                          {transaction.munomukabi ? formatCurrency(transaction.munomukabi) : '-'}
                        </td>
                        <td className="amount-cell">
                          {transaction.otherSaving ? formatCurrency(transaction.otherSaving) : '-'}
                        </td>
                        <td className="amount-cell">
                          {transaction.withdrawal ? formatCurrency(transaction.withdrawal) : '-'}
                        </td>
                        <td className="total-cell">
                          <strong className={`total-amount ${transaction.type === 'Saving' ? 'positive' : 'negative'}`}>
                            {transaction.type === 'Saving' ? '+' : '-'}
                            {formatCurrency(calculateTransactionTotal(transaction))}
                          </strong>
                        </td>
                        <td className="entered-by-cell">
                          <span className="entered-by-badge">
                            {transaction.enteredBy || 'System'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Export Section */}
      <section className="export-section">
        <div className="export-container glass-card">
          <div className="export-header">
            <h3 className="gradient-text">Export Transactions</h3>
            <p>Download your transaction history in different formats</p>
          </div>
          
          <div className="export-grid">
            <button 
              className="export-btn glass-button hover-lift"
              onClick={() => handleExport('pdf')}
            >
              <span className="export-icon">📄</span>
              <span className="export-text">Export as PDF</span>
              <div className="button-glow"></div>
            </button>
            
            <button 
              className="export-btn glass-button hover-lift"
              onClick={() => handleExport('csv')}
            >
              <span className="export-icon">📊</span>
              <span className="export-text">Export as CSV</span>
              <div className="button-glow"></div>
            </button>
            
            <button 
              className="export-btn glass-button hover-lift"
              onClick={() => handleExport('print')}
            >
              <span className="export-icon">🖨️</span>
              <span className="export-text">Print Statement</span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransactionsHistory;