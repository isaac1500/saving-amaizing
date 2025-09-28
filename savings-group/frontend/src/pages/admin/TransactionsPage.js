import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useMembers } from '../../hooks/useMembers';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import '../../styles/TransactionsPage.css';

const TransactionsPage = () => {
  const { user } = useAuth();
  const { transactions, loading, error, addTransaction, deleteTransaction } = useTransactions();
  const { members, loading: membersLoading, error: membersError } = useMembers();
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [filters, setFilters] = useState({
    memberId: '',
    startDate: '',
    endDate: '',
    type: ''
  });
  
  const initialFormData = {
    memberId: '',
    memberName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Saving',
    weeklySaving: '',
    munomukabi: '',
    otherSaving: '',
    withdrawal: '',
    enteredBy: user?.uid || 'admin'
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Debug: Check what data we're getting from Firestore
  useEffect(() => {
    console.log('🔍 TRANSACTIONS DATA FROM FIRESTORE:', transactions);
    if (transactions.length > 0) {
      console.log('📊 First transaction object:', transactions[0]);
      console.log('🔑 Transaction object keys:', Object.keys(transactions[0]));
    }
  }, [transactions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(member => 
      member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // CORRECTED: Memoized filtered transactions and calculations
  const { filteredTransactions, totalSavings, totalWithdrawals, netBalance } = useMemo(() => {
    console.log('🔄 Filtering transactions...');
    
    const filtered = transactions.filter(transaction => {
      // Debug each transaction being filtered
      console.log('📋 Processing transaction:', transaction);
      
      if (filters.memberId && transaction.memberId !== filters.memberId) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;
      return true;
    });

    console.log('✅ Filtered transactions count:', filtered.length);

    const savings = filtered
      .filter(t => t.type === 'Saving')
      .reduce((sum, t) => {
        const weekly = parseFloat(t.weeklySaving || 0);
        const munomukabi = parseFloat(t.munomukabi || 0);
        const other = parseFloat(t.otherSaving || 0);
        return sum + weekly + munomukabi + other;
      }, 0);

    const withdrawals = filtered
      .filter(t => t.type === 'Withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.withdrawal || 0), 0);

    return {
      filteredTransactions: filtered,
      totalSavings: savings,
      totalWithdrawals: withdrawals,
      netBalance: savings - withdrawals
    };
  }, [transactions, filters]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.memberId) errors.member = 'Member selection is required';
    if (!formData.date) errors.date = 'Date is required';
    
    if (formData.type === 'Saving') {
      const totalSaving = parseFloat(formData.weeklySaving || 0) + 
                         parseFloat(formData.munomukabi || 0) + 
                         parseFloat(formData.otherSaving || 0);
      if (totalSaving <= 0) errors.amount = 'At least one saving amount is required';
    } else if (formData.type === 'Withdrawal') {
      if (!formData.withdrawal || parseFloat(formData.withdrawal) <= 0) {
        errors.withdrawal = 'Withdrawal amount is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setFormData(prev => ({
      ...prev,
      memberId: member.id,
      memberName: member.fullName || member.username
    }));
    setSearchTerm(member.fullName || member.username);
    setShowSuggestions(false);
    
    if (formErrors.member) {
      setFormErrors(prev => ({ ...prev, member: '' }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    
    if (!value && selectedMember) {
      setSelectedMember(null);
      setFormData(prev => ({
        ...prev,
        memberId: '',
        memberName: ''
      }));
    }
  };

  const handleSearchFocus = () => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      console.log('➕ Adding transaction with data:', formData);
      
      await addTransaction({
        ...formData,
        weeklySaving: parseFloat(formData.weeklySaving || 0),
        munomukabi: parseFloat(formData.munomukabi || 0),
        otherSaving: parseFloat(formData.otherSaving || 0),
        withdrawal: parseFloat(formData.withdrawal || 0),
        enteredBy: user?.uid || 'admin'
      });
      
      handleCloseModal();
    } catch (err) {
      console.error('❌ Transaction error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setFormData(initialFormData);
    setSelectedMember(null);
    setSearchTerm('');
    setShowSuggestions(false);
    setFormErrors({});
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
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

  // CORRECTED: Data normalization function
  const normalizeTransactionData = (transaction) => {
    if (!transaction) return null;
    
    return {
      id: transaction.id,
      // Ensure all fields have proper fallbacks
      date: transaction.date || '',
      memberId: transaction.memberId || '',
      memberName: transaction.memberName || '',
      type: transaction.type || '',
      weeklySaving: transaction.weeklySaving || 0,
      munomukabi: transaction.munomukabi || 0,
      otherSaving: transaction.otherSaving || 0,
      withdrawal: transaction.withdrawal || 0,
      enteredBy: transaction.enteredBy || '',
      createdAt: transaction.createdAt || ''
    };
  };

  if (loading || membersLoading) {
    return <LoadingSpinner text="Loading transactions..." />;
  }

  return (
    <div className="transactions-page">
      {/* Header Section */}
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">Transactions Management</h1>
          <p className="page-subtitle">Record and manage all group transactions</p>
        </div>
        <button
          className="btn btn-primary btn-new-transaction"
          onClick={() => setShowTransactionModal(true)}
        >
          <span className="btn-icon">+</span>
          New Transaction
        </button>
      </header>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Member</label>
            <FormInput
              name="memberFilter"
              type="select"
              value={filters.memberId}
              onChange={(e) => handleFilterChange('memberId', e.target.value)}
              options={[
                { value: '', label: 'All Members' },
                ...members.map(m => ({ value: m.id, label: m.fullName || m.username }))
              ]}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Type</label>
            <FormInput
              name="typeFilter"
              type="select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'Saving', label: 'Savings' },
                { value: 'Withdrawal', label: 'Withdrawals' }
              ]}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <FormInput
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">End Date</label>
            <FormInput
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </section>

      {/* Summary Cards Section */}
      <section className="summary-section">
        <div className="summary-grid">
          <div className="summary-card savings">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3 className="card-title">Total Savings</h3>
              <p className="card-amount">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
          
          <div className="summary-card withdrawals">
            <div className="card-icon">📉</div>
            <div className="card-content">
              <h3 className="card-title">Total Withdrawals</h3>
              <p className="card-amount">{formatCurrency(totalWithdrawals)}</p>
            </div>
          </div>
          
          <div className="summary-card balance">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3 className="card-title">Net Balance</h3>
              <p className="card-amount">{formatCurrency(netBalance)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {membersError && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          Error loading members: {membersError}
        </div>
      )}

      {/* CORRECTED: Transactions Table Section */}
      <section className="table-section">
        <div className="table-header">
          <h2>Transaction History</h2>
          <span className="record-count">
            {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th>Weekly Saving</th>
                <th>Munomukabi</th>
                <th>Other Saving</th>
                <th>Withdrawal</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="9">
                    <div className="no-data">
                      <div className="no-data-icon">📊</div>
                      <p>No transactions found</p>
                      <p>Try adjusting your filters or add a new transaction</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(rawTransaction => {
                  // Normalize the transaction data to ensure consistent structure
                  const transaction = normalizeTransactionData(rawTransaction);
                  
                  if (!transaction) return null;
                  
                  return (
                    <tr key={transaction.id} className="transaction-row">
                      {/* Date - CORRECTED */}
                      <td className="date-cell">
                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                      </td>
                      
                      {/* Member Name - CORRECTED */}
                      <td className="member-cell">
                        {transaction.memberName || '-'}
                      </td>
                      
                      {/* Type - CORRECTED */}
                      <td className="type-cell">
                        <span className={`transaction-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type}
                        </span>
                      </td>
                      
                      {/* Weekly Saving - CORRECTED */}
                      <td className="amount-cell">
                        {parseFloat(transaction.weeklySaving) > 0 
                          ? formatCurrency(parseFloat(transaction.weeklySaving)) 
                          : '-'}
                      </td>
                      
                      {/* Munomukabi - CORRECTED */}
                      <td className="amount-cell">
                        {parseFloat(transaction.munomukabi) > 0 
                          ? formatCurrency(parseFloat(transaction.munomukabi)) 
                          : '-'}
                      </td>
                      
                      {/* Other Saving - CORRECTED */}
                      <td className="amount-cell">
                        {parseFloat(transaction.otherSaving) > 0 
                          ? formatCurrency(parseFloat(transaction.otherSaving)) 
                          : '-'}
                      </td>
                      
                      {/* Withdrawal - CORRECTED */}
                      <td className="amount-cell">
                        {parseFloat(transaction.withdrawal) > 0 
                          ? formatCurrency(parseFloat(transaction.withdrawal)) 
                          : '-'}
                      </td>
                      
                      {/* Total - CORRECTED */}
                      <td className="total-cell">
                        <strong>{formatCurrency(calculateTransactionTotal(transaction))}</strong>
                      </td>
                      
                      {/* Actions */}
                      <td className="actions-cell">
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={handleCloseModal}
        title="Record New Transaction"
        size="lg"
        className="transaction-modal"
      >
        <form onSubmit={handleSubmit} className="transaction-form">
          {error && (
            <div className="form-error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-group" ref={searchRef}>
              <label className="form-label required">Select Member</label>
              <div className="autosuggest-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Type to search for a member..."
                  className={`autosuggest-input ${formErrors.member ? 'error' : ''}`}
                />
                {showSuggestions && filteredMembers.length > 0 && (
                  <div className="autosuggest-dropdown">
                    {filteredMembers.map(member => (
                      <div
                        key={member.id}
                        className="autosuggest-item"
                        onClick={() => handleMemberSelect(member)}
                      >
                        {member.fullName || member.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formErrors.member && (
                <div className="form-error">{formErrors.member}</div>
              )}
              {selectedMember && (
                <div className="selected-member">
                  <span className="selected-icon">✓</span>
                  Selected: <strong>{selectedMember.fullName || selectedMember.username}</strong>
                </div>
              )}
            </div>

            <div className="form-row">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={formErrors.date}
                required
                className="date-input"
              />
              
              <FormInput
                label="Transaction Type"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: 'Saving', label: 'Saving' },
                  { value: 'Withdrawal', label: 'Withdrawal' }
                ]}
                required
                className="type-input"
              />
            </div>
          </div>

          {formData.type === 'Saving' ? (
            <div className="form-section saving-section">
              <h4 className="section-title">
                <span className="section-icon">💰</span>
                Saving Amounts
              </h4>
              
              <div className="form-row">
                <FormInput
                  label="Weekly Saving"
                  name="weeklySaving"
                  type="number"
                  value={formData.weeklySaving}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="amount-input"
                />
                
                <FormInput
                  label="Munomukabi"
                  name="munomukabi"
                  type="number"
                  value={formData.munomukabi}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="amount-input"
                />
              </div>
              
              <FormInput
                label="Other Saving"
                name="otherSaving"
                type="number"
                value={formData.otherSaving}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="100"
                className="amount-input"
              />
              
              {formErrors.amount && (
                <div className="form-error">{formErrors.amount}</div>
              )}
            </div>
          ) : (
            <div className="form-section withdrawal-section">
              <h4 className="section-title">
                <span className="section-icon">💸</span>
                Withdrawal Amount
              </h4>
              
              <FormInput
                label="Withdrawal Amount"
                name="withdrawal"
                type="number"
                value={formData.withdrawal}
                onChange={handleChange}
                error={formErrors.withdrawal}
                placeholder="0"
                min="0"
                step="100"
                required
                className="amount-input"
              />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <span className="btn-icon">💾</span>
              Record Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;