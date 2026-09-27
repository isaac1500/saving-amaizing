// src/pages/admin/MembersPage.js
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../hooks/useMembers';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import MemberRegistration from './MemberRegistration';
import {
  Plus, Edit, Trash2, User, Mail, MapPin, Calendar,
  Users, Search, Filter, X, AlertTriangle, CheckCircle,
  MoreVertical, Eye, RefreshCw, Download, Shield
} from 'lucide-react';

/* ─── Styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .mpage {
    --ink:       #0d0f1a;
    --ink2:      #64748b;
    --ink3:      #94a3b8;
    --surface:   #f4f5fb;
    --card:      #ffffff;
    --border:    rgba(0,0,0,.06);
    --border2:   #e2e8f0;
    --accent:    #0ea5e9;
    --accent-lt: #e0f2fe;
    --green:     #10b981;
    --green-lt:  #d1fae5;
    --red:       #ef4444;
    --red-lt:    #fee2e2;
    --amber:     #f59e0b;
    --amber-lt:  #fef3c7;
    --purple:    #8b5cf6;
    --purple-lt: #ede9fe;
    --shadow:    0 2px 16px rgba(0,0,0,.06);
    --shadow-lg: 0 8px 40px rgba(0,0,0,.08);
    font-family: 'DM Sans', sans-serif;
    background: var(--surface);
    min-height: 100vh;
    color: var(--ink);
  }

  .mpage-hero {
    background: linear-gradient(135deg,#020617 0%,#0c1a2e 50%,#0f3460 100%);
    border-radius: 20px;
    padding: 2rem 2.5rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .mpage-hero::before {
    content:''; position:absolute;
    width:400px; height:400px; border-radius:50%;
    background:radial-gradient(circle,rgba(14,165,233,.25) 0%,transparent 70%);
    top:-120px; right:-80px; pointer-events:none;
  }
  .mpage-hero::after {
    content:''; position:absolute;
    width:200px; height:200px; border-radius:50%;
    background:radial-gradient(circle,rgba(16,185,129,.15) 0%,transparent 70%);
    bottom:-60px; left:20%; pointer-events:none;
  }
  .mpage-hero-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15);
    backdrop-filter:blur(8px); color:#bae6fd;
    padding:4px 14px; border-radius:20px;
    font-size:.7rem; font-weight:500; letter-spacing:.3px; margin-bottom:.7rem;
  }
  .mpage-hero-pill .live { color:#6ee7b7; }
  .mpage-hero-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.5rem,3vw,2.2rem);
    font-weight:800; color:#fff; letter-spacing:-.5px; margin:0 0 .2rem;
  }
  .mpage-hero-sub { color:rgba(186,230,253,.5); font-size:.85rem; font-weight:300; margin:0; }

  .mpage-hero-stats {
    display:flex; gap:1.5rem; margin-top:1rem;
  }
  .mpage-hero-stat {
    background:rgba(255,255,255,.07);
    border:1px solid rgba(255,255,255,.1);
    border-radius:12px; padding:.7rem 1.2rem;
    text-align:center; min-width:80px;
  }
  .mpage-hero-stat-val {
    font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:800; color:#fff;
  }
  .mpage-hero-stat-lbl {
    font-size:.6rem; text-transform:uppercase; letter-spacing:.6px;
    color:rgba(186,230,253,.5); margin-top:2px;
  }

  .mpage-toolbar {
    display:flex; flex-wrap:wrap; gap:.75rem;
    align-items:center; justify-content:space-between;
    margin-bottom:1.5rem;
  }
  .mpage-toolbar-left {
    display:flex; flex-wrap:wrap; gap:.75rem; align-items:center;
  }
  .mpage-toolbar-right {
    display:flex; flex-wrap:wrap; gap:.75rem; align-items:center;
  }

  .mpage-search-wrap { position:relative; }
  .mpage-search-icon {
    position:absolute; left:12px; top:50%; transform:translateY(-50%);
    color:var(--ink3); display:flex;
  }
  .mpage-search-input {
    background:#fff; border:1.5px solid var(--border2); border-radius:10px;
    padding:.55rem .85rem .55rem 2.3rem; font-size:.82rem;
    font-family:'DM Sans',sans-serif; color:var(--ink);
    outline:none; transition:all .2s; width:240px;
  }
  .mpage-search-input:focus {
    border-color:var(--accent); box-shadow:0 0 0 3px rgba(14,165,233,.1);
  }

  .mpage-btn {
    display:inline-flex; align-items:center; gap:.5rem;
    padding:.55rem 1.2rem; border-radius:10px; border:none;
    font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:600;
    cursor:pointer; transition:all .2s ease; text-decoration:none;
  }
  .mpage-btn-primary {
    background:var(--accent); color:#fff;
    box-shadow:0 4px 12px rgba(14,165,233,.3);
  }
  .mpage-btn-primary:hover { background:#0284c7; transform:translateY(-1px); box-shadow:0 6px 16px rgba(14,165,233,.4); }
  .mpage-btn-outline {
    background:transparent; color:var(--ink); border:1.5px solid var(--border2);
  }
  .mpage-btn-outline:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-lt); }
  .mpage-btn-danger {
    background:var(--red); color:#fff;
  }
  .mpage-btn-danger:hover { background:#dc2626; }

  .mpage-card {
    background:var(--card); border-radius:16px;
    border:1px solid var(--border); box-shadow:var(--shadow);
    overflow:hidden;
  }
  .mpage-card-body { padding:1.5rem; }

  .mpage-empty {
    text-align:center; padding:3rem 1.5rem;
  }
  .mpage-empty-icon {
    width:64px; height:64px; border-radius:50%;
    background:var(--surface); display:flex; align-items:center; justify-content:center;
    margin:0 auto 1rem;
  }
  .mpage-empty-title { font-size:1rem; font-weight:700; color:var(--ink); margin-bottom:.3rem; }
  .mpage-empty-sub { font-size:.85rem; color:var(--ink2); }

  .mpage-table-wrap { overflow-x:auto; }
  .mpage-table {
    width:100%; border-collapse:collapse; font-size:.86rem;
  }
  .mpage-table thead tr { border-bottom:2px solid var(--border); }
  .mpage-table th {
    padding:.85rem .75rem; text-align:left; font-size:.65rem;
    font-weight:700; text-transform:uppercase; letter-spacing:.6px;
    color:var(--ink3); white-space:nowrap;
  }
  .mpage-table td { padding:.75rem; vertical-align:middle; border-bottom:1px solid var(--border); }
  .mpage-table tbody tr { transition:background .15s; }
  .mpage-table tbody tr:hover { background:#f8faff; }
  .mpage-table tbody tr:last-child td { border-bottom:none; }

  .mpage-avatar {
    width:40px; height:40px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif; font-size:.8rem; font-weight:800; color:#fff;
    flex-shrink:0;
  }
  .mpage-member-name { font-weight:600; color:var(--ink); }
  .mpage-member-username { font-size:.72rem; color:var(--ink2); }

  .mpage-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:.65rem; font-weight:600; padding:3px 10px; border-radius:100px;
  }
  .mpage-badge-active { background:var(--green-lt); color:#065f46; }
  .mpage-badge-inactive { background:var(--red-lt); color:#991b1b; }

  .mpage-action-btn {
    display:inline-flex; align-items:center; gap:.3rem;
    background:transparent; border:none; padding:.3rem .6rem;
    border-radius:6px; font-size:.75rem; font-weight:600;
    cursor:pointer; transition:all .15s; color:var(--ink2);
  }
  .mpage-action-btn:hover { background:var(--surface); }
  .mpage-action-btn.edit:hover { color:var(--accent); background:var(--accent-lt); }
  .mpage-action-btn.delete:hover { color:var(--red); background:var(--red-lt); }

  .mpage-error {
    display:flex; align-items:center; gap:.75rem;
    background:var(--red-lt); border:1px solid #fca5a5;
    border-radius:12px; padding:.85rem 1.2rem; color:var(--red);
    font-size:.85rem; margin-bottom:1rem;
  }

  .mpage-success-banner {
    display:flex; align-items:center; gap:.75rem;
    background:var(--green-lt); border:1px solid #6ee7b7;
    border-radius:12px; padding:.75rem 1.2rem;
    color:#065f46; font-size:.82rem;
    margin-bottom:1rem;
  }

  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .mpage .mpage-hero { animation:fadeUp .35s ease both; }
  .mpage .mpage-toolbar { animation:fadeUp .35s .08s ease both; }
  .mpage .mpage-card { animation:fadeUp .35s .16s ease both; }
`;

const avatarColor = (name) => {
  const colors = ['#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#14b8a6','#f97316'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
};
const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase() : '?';

/* ─── Component ──────────────────────────────────────────────────── */
const MembersPage = () => {
  const { user } = useAuth();
  const { members, loading, error, deleteMember, updateMember, refreshMembers } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    residence: '',
    gender: '',
    isActive: true,
    role: 'member'
  });

  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL || 'http://localhost:3002';

  // ── Filter members ──
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return m.fullName?.toLowerCase().includes(term) ||
           m.username?.toLowerCase().includes(term) ||
           m.email?.toLowerCase().includes(term) ||
           m.residence?.toLowerCase().includes(term);
  });

  const activeCount = members.filter(m => m.isActive).length;

  // ── Handle Edit (with Admin API for email updates) ──
  const handleEdit = (member) => {
    setSelectedMemberId(member.id);
    setEditForm({
      fullName: member.fullName || '',
      email: member.email || '',
      residence: member.residence || '',
      gender: member.gender || '',
      isActive: member.isActive !== false,
      role: member.role || 'member'
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    
    setIsProcessing(true);
    setSuccessMessage('');
    
    try {
      const originalMember = members.find(m => m.id === selectedMemberId);
      
      await updateMember(selectedMemberId, {
        fullName: editForm.fullName,
        residence: editForm.residence,
        gender: editForm.gender,
        isActive: editForm.isActive,
        role: editForm.role
      });

      if (originalMember && editForm.email !== originalMember.email) {
        const token = await user?.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedMemberId}/email`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: editForm.email })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update email');
        }
      }

      setSuccessMessage(`✅ Successfully updated ${editForm.fullName}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setShowEditModal(false);
      refreshMembers();
      
    } catch (err) {
      console.error('❌ Edit error:', err);
      setSuccessMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Handle Delete (with Admin API) ──
  const handleDelete = async () => {
    if (!selectedMemberId) return;
    
    setIsProcessing(true);
    setSuccessMessage('');
    
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedMemberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete member');
      }

      await deleteMember(selectedMemberId);
      
      setSuccessMessage(`✅ Successfully deleted member`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setShowDeleteModal(false);
      setSelectedMemberId(null);
      refreshMembers();
      
    } catch (err) {
      console.error('❌ Delete error:', err);
      setSuccessMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    refreshMembers();
    setSuccessMessage('🔄 Members refreshed');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  if (loading) return <LoadingSpinner text="Loading members..." />;

  return (
    <div className="mpage p-3 p-md-4">
      <style>{css}</style>

      {/* ── Hero ── */}
      <div className="mpage-hero">
        <div className="row align-items-center gy-3">
          <div className="col-md-7">
            <div className="mpage-hero-pill">
              <span className="live">●</span> Admin · Member Management
            </div>
            <h1 className="mpage-hero-title">Members</h1>
            <p className="mpage-hero-sub">Manage your savings group members</p>
          </div>
          <div className="col-md-5">
            <div className="mpage-hero-stats">
              <div className="mpage-hero-stat">
                <div className="mpage-hero-stat-val">{members.length}</div>
                <div className="mpage-hero-stat-lbl">Total</div>
              </div>
              <div className="mpage-hero-stat">
                <div className="mpage-hero-stat-val">{activeCount}</div>
                <div className="mpage-hero-stat-lbl">Active</div>
              </div>
              <div className="mpage-hero-stat">
                <div className="mpage-hero-stat-val">{members.length - activeCount}</div>
                <div className="mpage-hero-stat-lbl">Inactive</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successMessage && (
        <div className="mpage-success-banner mb-3">
          {successMessage.startsWith('✅') ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {successMessage}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="mpage-toolbar">
        <div className="mpage-toolbar-left">
          <div className="mpage-search-wrap">
            <span className="mpage-search-icon"><Search size={15} /></span>
            <input
              type="text"
              className="mpage-search-input"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button 
              className="mpage-btn mpage-btn-outline"
              onClick={() => setSearchTerm('')}
              style={{padding:'.4rem .8rem'}}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
        <div className="mpage-toolbar-right">
          <button 
            className="mpage-btn mpage-btn-outline"
            onClick={handleRefresh}
            title="Refresh"
            disabled={isProcessing}
          >
            <RefreshCw size={14} className={isProcessing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mpage-error">
          <AlertTriangle size={16} style={{flexShrink:0}} />
          <div><strong>Error loading members:</strong> {error}</div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="mpage-card">
        <div className="mpage-card-body" style={{padding:0}}>

          {members.length === 0 ? (
            <div className="mpage-empty">
              <div className="mpage-empty-icon">
                <Users size={28} color="var(--ink3)" />
              </div>
              <div className="mpage-empty-title">No Members Yet</div>
              <div className="mpage-empty-sub">Members will appear here once they are registered.</div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="mpage-empty">
              <div className="mpage-empty-icon">
                <Search size={28} color="var(--ink3)" />
              </div>
              <div className="mpage-empty-title">No matching members</div>
              <div className="mpage-empty-sub">Try adjusting your search criteria</div>
            </div>
          ) : (
            <div className="mpage-table-wrap">
              <table className="mpage-table">
                <thead>
                  <tr>
                    <th style={{minWidth:200}}>Member</th>
                    <th style={{minWidth:130}}>Username</th>
                    <th style={{minWidth:180}}>Email</th>
                    <th style={{minWidth:120}}>Residence</th>
                    <th style={{minWidth:120}}>Joined</th>
                    <th style={{minWidth:100}}>Status</th>
                    <th style={{minWidth:120,textAlign:'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="mpage-avatar" style={{background: avatarColor(member.fullName)}}>
                            {initials(member.fullName)}
                          </div>
                          <div>
                            <div className="mpage-member-name">{member.fullName}</div>
                            <div className="mpage-member-username">ID: {member.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>@{member.username}</td>
                      <td>{member.email}</td>
                      <td>{member.residence || '—'}</td>
                      <td>{member.dateJoined}</td>
                      <td>
                        <span className={`mpage-badge ${member.isActive ? 'mpage-badge-active' : 'mpage-badge-inactive'}`}>
                          {member.isActive ? <CheckCircle size={10}/> : <X size={10}/>}
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <button 
                            className="mpage-action-btn edit"
                            onClick={() => handleEdit(member)}
                            title="Edit member"
                            disabled={isProcessing}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            className="mpage-action-btn delete"
                            onClick={() => {
                              setSelectedMemberId(member.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete member"
                            disabled={isProcessing}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Member Modal ── */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        size="md"
        title="Edit Member"
      >
        <form onSubmit={handleEditSubmit} style={{fontFamily:"'DM Sans',sans-serif"}}>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Full Name *</label>
                <input
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  placeholder="Full name"
                  className="mpage-field-input"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  placeholder="Email address"
                  className="mpage-field-input"
                  required
                />
                <small style={{fontSize:'.65rem',color:'var(--ink2)',display:'block',marginTop:'.2rem'}}>
                  Changing email will update both Firestore and Firebase Auth
                </small>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Residence</label>
                <input
                  name="residence"
                  value={editForm.residence}
                  onChange={handleEditChange}
                  placeholder="Location (optional)"
                  className="mpage-field-input"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Gender</label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="mpage-field-input"
                  style={{appearance:'none'}}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Status</label>
                <select
                  name="isActive"
                  value={editForm.isActive ? 'true' : 'false'}
                  onChange={handleEditChange}
                  className="mpage-field-input"
                  style={{appearance:'none'}}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mpage-field">
                <label className="mpage-field-label">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="mpage-field-input"
                  style={{appearance:'none'}}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mpage-modal-footer" style={{display:'flex', justifyContent:'flex-end', gap:'.7rem', paddingTop:'1.2rem', borderTop:'1px solid #f1f5f9', marginTop:'1rem'}}>
            <button type="button" className="mpage-modal-btn ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="mpage-modal-btn primary" disabled={isProcessing}>
              {isProcessing ? <><RefreshCw size={13} className="spinning"/> Saving…</> : <><CheckCircle size={13}/> Save Changes</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        size="sm"
        title="Delete Member"
      >
        <div className="text-center py-3">
          <Trash2 size={48} className="text-danger mb-3" />
          <h5 className="mb-2">Delete Member?</h5>
          <p className="text-muted" style={{fontSize:'.9rem'}}>
            This action <strong>cannot be undone</strong>. The member will be removed from both Firestore and Firebase Auth.
          </p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <button className="mpage-btn mpage-btn-outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="mpage-btn mpage-btn-danger" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? <><RefreshCw size={14} className="spinning"/> Deleting…</> : <><Trash2 size={14} /> Delete Member</>}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MembersPage;