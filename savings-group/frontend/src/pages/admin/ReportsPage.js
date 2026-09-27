import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar, Users, TrendingUp, TrendingDown, Wallet, Activity, Eye } from 'lucide-react';

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [exportType, setExportType] = useState('balances');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Mock data for demonstration
  const mockReports = {
    reportDate: new Date().toISOString(),
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    members: [
      {
        id: 1,
        fullName: 'John Doe',
        username: 'johndoe',
        totalSavings: 15000,
        totalWithdrawals: 5000,
        balance: 10000,
        transactionCount: 25,
        lastTransaction: '2024-09-10',
        isActive: true
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        username: 'janesmith',
        totalSavings: 22000,
        totalWithdrawals: 8000,
        balance: 14000,
        transactionCount: 32,
        lastTransaction: '2024-09-12',
        isActive: true
      },
      {
        id: 3,
        fullName: 'Mike Johnson',
        username: 'mikej',
        totalSavings: 8000,
        totalWithdrawals: 3000,
        balance: 5000,
        transactionCount: 18,
        lastTransaction: '2024-08-20',
        isActive: false
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReports(mockReports);
    } catch (err) {
      setError('Failed to generate reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowExportModal(false);
      // Show success message
    } catch (err) {
      setError('Export failed. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const totalStats = reports ? {
    totalMembers: reports.members.length,
    totalSavings: reports.members.reduce((sum, m) => sum + m.totalSavings, 0),
    totalWithdrawals: reports.members.reduce((sum, m) => sum + m.totalWithdrawals, 0),
    netBalance: reports.members.reduce((sum, m) => sum + m.balance, 0),
    activeMembers: reports.members.filter(m => m.isActive).length
  } : null;

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Generating Reports...</h3>
          <p>Please wait while we compile your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header Section */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <BarChart3 className="header-icon" />
              Reports & Analytics
            </h1>
            <p>Comprehensive insights into member activities and financial data</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-export"
              onClick={() => setShowExportModal(true)}
            >
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-card">
          <div className="filters-header">
            <Filter size={20} />
            <span>Filters</span>
          </div>
          <div className="filters-content">
            <div className="filter-group">
              <label>
                <Calendar size={16} />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={generateReports}
              disabled={loading}
            >
              <BarChart3 size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {reports && (
        <div className="results-section">
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-header">
                <Users className="stat-icon" />
                <span className="stat-label">Total Members</span>
              </div>
              <div className="stat-value">{totalStats.totalMembers}</div>
              <div className="stat-detail">
                {totalStats.activeMembers} active
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-header">
                <TrendingUp className="stat-icon" />
                <span className="stat-label">Total Savings</span>
              </div>
              <div className="stat-value">{formatCurrency(totalStats.totalSavings)}</div>
              <div className="stat-detail">All time deposits</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-header">
                <TrendingDown className="stat-icon" />
                <span className="stat-label">Total Withdrawals</span>
              </div>
              <div className="stat-value">{formatCurrency(totalStats.totalWithdrawals)}</div>
              <div className="stat-detail">All time withdrawals</div>
            </div>

            <div className="stat-card info">
              <div className="stat-header">
                <Wallet className="stat-icon" />
                <span className="stat-label">Net Balance</span>
              </div>
              <div className="stat-value">{formatCurrency(totalStats.netBalance)}</div>
              <div className="stat-detail">Current total</div>
            </div>
          </div>

          {/* Report Details */}
          <div className="report-details">
            <div className="report-header">
              <h3>Member Balance Details</h3>
              <div className="report-meta">
                Generated on {formatDate(reports.reportDate)}
                {reports.dateRange.startDate && (
                  <span className="date-range">
                    • {formatDate(reports.dateRange.startDate)} to {formatDate(reports.dateRange.endDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="members-table">
              <div className="table-header">
                <div>Member</div>
                <div>Savings</div>
                <div>Withdrawals</div>
                <div>Balance</div>
                <div>Transactions</div>
                <div>Last Activity</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {reports.members.map(member => (
                <div key={member.id} className="table-row">
                  <div className="member-cell">
                    <div className="member-avatar">
                      {member.fullName.charAt(0)}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.fullName}</div>
                      <div className="member-username">@{member.username}</div>
                    </div>
                  </div>
                  
                  <div className="amount-cell positive">
                    {formatCurrency(member.totalSavings)}
                  </div>
                  
                  <div className="amount-cell negative">
                    {formatCurrency(member.totalWithdrawals)}
                  </div>
                  
                  <div className={`amount-cell balance ${member.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(member.balance)}
                  </div>
                  
                  <div className="transaction-cell">
                    <Activity size={14} />
                    {member.transactionCount}
                  </div>
                  
                  <div className="date-cell">
                    {member.lastTransaction ? formatDate(member.lastTransaction) : 'Never'}
                  </div>
                  
                  <div className="status-cell">
                    <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="actions-cell">
                    <button 
                      className="btn-icon"
                      onClick={() => setSelectedMember(member)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Export Data</h3>
              <button 
                className="modal-close"
                onClick={() => setShowExportModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Export Type</label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="form-select"
                >
                  <option value="balances">Member Balances</option>
                  <option value="transactions">Transaction History</option>
                  <option value="members">Members Directory</option>
                </select>
              </div>
              
              <div className="export-info">
                <p>
                  This will export <strong>{exportType}</strong> data 
                  {filters.startDate || filters.endDate 
                    ? ' for the selected date range' 
                    : ' (all available data)'
                  }
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleExport}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reports-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .reports-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          color: white;
        }

        .header-text h1 {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #fff, #e1e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: #fff;
        }

        .header-text p {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .filters-section {
          margin-bottom: 2rem;
        }

        .filters-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .filters-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #5b21b6;
        }

        .filters-content {
          display: flex;
          gap: 1rem;
          align-items: end;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #6b21a8;
          font-size: 0.9rem;
        }

        .filter-input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .filter-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        .btn-export {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-export:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: #6b21a8;
          border: 1px solid #d1d5db;
        }

        .btn-ghost:hover {
          background: #f3f4f6;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          color: #6b21a8;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f3e8ff;
        }

        .error-alert {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .stat-label {
          font-weight: 500;
          color: #6b7280;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-detail {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .stat-card.primary { border-left: 4px solid #8b5cf6; }
        .stat-card.primary .stat-icon { color: #8b5cf6; }
        .stat-card.primary .stat-value { color: #7c3aed; }

        .stat-card.success { border-left: 4px solid #10b981; }
        .stat-card.success .stat-icon { color: #10b981; }
        .stat-card.success .stat-value { color: #059669; }

        .stat-card.warning { border-left: 4px solid #f59e0b; }
        .stat-card.warning .stat-icon { color: #f59e0b; }
        .stat-card.warning .stat-value { color: #d97706; }

        .stat-card.info { border-left: 4px solid #3b82f6; }
        .stat-card.info .stat-icon { color: #3b82f6; }
        .stat-card.info .stat-value { color: #2563eb; }

        .report-details {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .report-header {
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .report-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #1f2937;
        }

        .report-meta {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .date-range {
          font-weight: 500;
        }

        .members-table {
          overflow-x: auto;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 0.8fr 0.6fr;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
        }

        .table-header {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row:hover {
          background: #fafbff;
        }

        .member-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .member-info {
          min-width: 0;
        }

        .member-name {
          font-weight: 500;
          color: #1f2937;
        }

        .member-username {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .amount-cell {
          font-weight: 500;
          text-align: right;
        }

        .amount-cell.positive { color: #059669; }
        .amount-cell.negative { color: #dc2626; }
        .amount-cell.balance { font-weight: 600; }

        .transaction-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        .date-cell {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .form-select:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .export-info {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #8b5cf6;
        }

        .export-info p {
          margin: 0;
          color: #475569;
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        @media (max-width: 768px) {
          .reports-container {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .filters-content {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            min-width: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            padding: 1rem;
          }

          .table-header > div, .table-row > div {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .table-header > div:before, .table-row > div:before {
            content: attr(data-label);
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;