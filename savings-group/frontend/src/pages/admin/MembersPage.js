import React, { useState, useMemo, useEffect } from 'react';
import { useMembers } from '../../hooks/useMembers';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import '../../styles/MembersPage.css';

const MembersPage = () => {
  const { members, loading, error, deleteMember, updateMember, fetchMembers } = useMembers();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Add useEffect for debugging
  useEffect(() => {
    console.log('Members data:', members);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [members, loading, error]);

  // Memoized filtered and sorted members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = 
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && member.isActive) ||
        (filterStatus === 'inactive' && !member.isActive);
      
      return matchesSearch && matchesStatus;
    });

    // Sort members
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [members, searchTerm, filterStatus, sortConfig]);

  // Event handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteMember(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      await updateMember(editModal.id, editForm);
      setEditModal(null);
      setEditForm({});
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (member) => {
    setEditModal(member);
    setEditForm({
      fullName: member.fullName || '',
      email: member.email || '',
      residence: member.residence || '',
      gender: member.gender || ''
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditForm({});
    setEditError('');
  };

  // Statistics
  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    inactive: members.filter(m => !m.isActive).length,
    filtered: filteredAndSortedMembers.length
  };

  if (loading && members.length === 0) {
    return (
      <div className="members-page-loading">
        <LoadingSpinner text="Loading members..." />
      </div>
    );
  }

  return (
    <div className="members-page">
      {/* Header Section */}
      <div className="members-header">
        <div className="header-content">
          <div className="header-text">
            <h1>👥 Members Management</h1>
            <p>Manage and view all group members in one place</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={fetchMembers}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="members-controls">
        <div className="controls-left">
          <div className="search-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search members by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="controls-right">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Members ({stats.total})</option>
            <option value="active">Active ({stats.active})</option>
            <option value="inactive">Inactive ({stats.inactive})</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <span>{error}</span>
          <button 
            onClick={fetchMembers}
            className="error-retry-btn"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Members Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('fullName')} className="sortable">
                  <div className="th-content">
                    <span>Member Details</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'fullName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('username')} className="sortable">
                  <div className="th-content">
                    <span>Username</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'username' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  <div className="th-content">
                    <span>Contact</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('dateJoined')} className="sortable">
                  <div className="th-content">
                    <span>Joined</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'dateJoined' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('isActive')} className="sortable">
                  <div className="th-content">
                    <span>Status</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'isActive' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                    </span>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-state">
                    <div className="loading-content">
                      <LoadingSpinner text="Loading members..." />
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon">👤</div>
                      <h3>{searchTerm || filterStatus !== 'all' ? 'No members match your criteria' : 'No members found'}</h3>
                      <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Start by adding your first member'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedMembers.map(member => (
                  <tr key={member.id} className="member-row">
                    <td>
                      <div className="member-details">
                        <div className="member-avatar">
                          <span className="avatar-text">
                            {member.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA'}
                          </span>
                        </div>
                        <div className="member-info">
                          <div className="member-name">{member.fullName || 'Unknown'}</div>
                          <div className="member-meta">
                            <span className="member-gender">{member.gender || 'Not specified'}</span>
                            {member.residence && (
                              <>
                                <span className="meta-separator">•</span>
                                <span className="member-residence">{member.residence}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="username-badge">@{member.username || 'unknown'}</span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span className="email">{member.email || 'No email'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="join-date">
                        {member.dateJoined 
                          ? new Date(member.dateJoined).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : 'Unknown'
                        }
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${member.isActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot"></span>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditModal(member)}
                          title="Edit member"
                        >
                          <span className="btn-icon">✏️</span>
                          <span className="btn-text">Edit</span>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => setDeleteConfirm(member)}
                          title="Delete member"
                        >
                          <span className="btn-icon">🗑️</span>
                          <span className="btn-text">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Info */}
      {filteredAndSortedMembers.length > 0 && (
        <div className="results-info">
          Showing {filteredAndSortedMembers.length} of {stats.total} members
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="⚠️ Confirm Delete"
        size="sm"
      >
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <p>Are you sure you want to delete <strong>{deleteConfirm?.fullName}</strong>?</p>
            <p className="warning-text">This action cannot be undone and will permanently remove all member data.</p>
          </div>
          
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={closeEditModal}
        title="✏️ Edit Member"
        size="md"
      >
        <form onSubmit={handleEdit} className="edit-form">
          {editError && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {editError}
            </div>
          )}

          <div className="form-grid">
            <FormInput
              label="Full Name"
              name="fullName"
              type="text"
              value={editForm.fullName || ''}
              onChange={handleEditChange}
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={editForm.email || ''}
              onChange={handleEditChange}
              required
            />

            <FormInput
              label="Residence"
              name="residence"
              type="text"
              value={editForm.residence || ''}
              onChange={handleEditChange}
              placeholder="Enter residence (optional)"
            />

            <FormInput
              label="Gender"
              name="gender"
              type="select"
              value={editForm.gender || ''}
              onChange={handleEditChange}
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeEditModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editLoading}
            >
              {editLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Member'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembersPage;