import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useMembers } from '../../hooks/useMembers';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { exportToCSV } from '../../utils/exportCSV';
import {
  TrendingUp, TrendingDown, Wallet, Users,
  Download, Filter, X, BarChart3, Calendar,
  CheckCircle, XCircle, Activity, FileText,
  ChevronRight, AlertTriangle, Percent,
  PiggyBank, Award, Gift, RefreshCw
} from 'lucide-react';

/* ─── Styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rpage {
    --ink:       #0d0f1a;
    --ink2:      #64748b;
    --surface:   #f4f5fb;
    --card:      #ffffff;
    --accent1:   #0ea5e9;
    --accent2:   #10b981;
    --accent3:   #f59e0b;
    --danger:    #ef4444;
    --purple:    #8b5cf6;
    --indigo:    #4f46e5;
    --border:    rgba(14,165,233,.1);
    --shadow:    0 2px 16px rgba(14,165,233,.07);
    --shadow-lg: 0 8px 40px rgba(14,165,233,.13);
    font-family: 'DM Sans', sans-serif;
    background: var(--surface);
    min-height: 100vh;
    color: var(--ink);
  }

  /* ── Hero ── */
  .rpage-hero {
    background: linear-gradient(135deg,#020617 0%,#0c1a2e 50%,#0f3460 100%);
    border-radius: 20px;
    padding: 2.4rem 2.5rem 3.6rem;
    position: relative; overflow: hidden;
  }
  .rpage-hero::before {
    content:''; position:absolute;
    width:480px; height:480px; border-radius:50%;
    background:radial-gradient(circle,rgba(14,165,233,.3) 0%,transparent 70%);
    top:-160px; right:-100px; pointer-events:none;
  }
  .rpage-hero::after {
    content:''; position:absolute;
    width:280px; height:280px; border-radius:50%;
    background:radial-gradient(circle,rgba(16,185,129,.18) 0%,transparent 70%);
    bottom:-80px; left:25%; pointer-events:none;
  }
  .rpage-hero-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15);
    backdrop-filter:blur(8px); color:#bae6fd;
    padding:4px 14px; border-radius:20px;
    font-size:.72rem; font-weight:500; letter-spacing:.3px; margin-bottom:.9rem;
  }
  .rpage-hero-pill .live { color:#6ee7b7; }
  .rpage-hero-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.7rem,3.5vw,2.4rem);
    font-weight:800; color:#fff; letter-spacing:-.5px; margin:0 0 .35rem;
  }
  .rpage-hero-sub { color:rgba(186,230,253,.55); font-size:.88rem; font-weight:300; margin:0; }

  .rpage-export-btn {
    display:inline-flex; align-items:center; gap:.5rem;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
    backdrop-filter:blur(8px); color:#fff;
    padding:.65rem 1.4rem; border-radius:11px;
    font-size:.86rem; font-weight:600; font-family:'DM Sans',sans-serif;
    cursor:pointer; transition:all .2s ease;
  }
  .rpage-export-btn:hover { background:rgba(255,255,255,.18); transform:translateY(-1px); }

  /* ── KPI strip ── */
  .rpage-kpi-strip { margin-top:-28px; position:relative; z-index:10; }
  .rpage-kpi {
    background:var(--card); border-radius:16px;
    padding:1.3rem 1.4rem; box-shadow:var(--shadow-lg);
    border:1px solid var(--border);
    transition:transform .2s ease, box-shadow .2s ease; height:100%;
  }
  .rpage-kpi:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(14,165,233,.18); }
  .rpage-kpi-label {
    font-size:.68rem; font-weight:500; text-transform:uppercase;
    letter-spacing:.7px; color:var(--ink2); margin-bottom:.35rem;
  }
  .rpage-kpi-value {
    font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:700;
    color:var(--ink); line-height:1; margin-bottom:.45rem;
  }
  .rpage-kpi-badge { font-size:.68rem; font-weight:500; padding:3px 10px; border-radius:20px; display:inline-block; }
  .b-up  { background:#d1fae5; color:#065f46; }
  .b-neu { background:#e0f2fe; color:#0369a1; }
  .b-warn{ background:#fef3c7; color:#92400e; }
  .b-red { background:#fee2e2; color:#991b1b; }
  .b-purple { background:#ede9fe; color:#5b21b6; }
  .rpage-kpi-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .rpage-progress { height:3px; background:#f1f5f9; border-radius:2px; overflow:hidden; margin:.55rem 0 0; }
  .rpage-progress-fill { height:100%; border-radius:2px; transition:width .8s cubic-bezier(.4,0,.2,1); }

  /* ── Filter card ── */
  .rpage-filter-card {
    background:var(--card); border-radius:16px;
    border:1px solid var(--border); box-shadow:var(--shadow);
    padding:1.3rem 1.5rem;
  }
  .rpage-filter-title {
    font-family:'Syne',sans-serif; font-size:.9rem; font-weight:700;
    color:var(--ink); margin-bottom:1rem; display:flex; align-items:center; gap:.45rem;
  }
  .rpage-date-input {
    width:100%; background:#f8fafc; border:1.5px solid #e2e8f0;
    border-radius:10px; padding:.6rem .85rem;
    font-size:.86rem; font-family:'DM Sans',sans-serif; color:var(--ink);
    transition:all .2s; outline:none;
  }
  .rpage-date-input:focus { border-color:var(--accent1); background:#fff; box-shadow:0 0 0 3px rgba(14,165,233,.1); }
  .rpage-date-label {
    display:block; font-size:.7rem; font-weight:600; text-transform:uppercase;
    letter-spacing:.5px; color:var(--ink2); margin-bottom:.38rem;
  }
  .rpage-clear-btn {
    display:inline-flex; align-items:center; gap:.4rem;
    background:#f8fafc; border:1.5px solid #e2e8f0; color:var(--ink2);
    border-radius:10px; padding:.55rem 1rem;
    font-size:.8rem; font-weight:600; font-family:'DM Sans',sans-serif;
    cursor:pointer; transition:all .2s;
  }
  .rpage-clear-btn:hover { background:#e2e8f0; color:var(--ink); }
  .rpage-filter-meta {
    font-size:.74rem; color:var(--ink2); display:flex; align-items:center; gap:.4rem;
    background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;
    padding:.4rem .8rem; white-space:nowrap;
  }

  .interest-summary-card {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #c4b5fd;
    position: relative;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .interest-summary-card::before {
    content: '✨';
    position: absolute;
    font-size: 60px;
    opacity: 0.1;
    bottom: -10px;
    right: -10px;
    pointer-events: none;
  }

  /* ── Table card ── */
  .rpage-table-card {
    background:var(--card); border-radius:16px;
    border:1px solid var(--border); box-shadow:var(--shadow);
    overflow:hidden;
    margin-bottom: 1.5rem;
  }
  .rpage-table-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:1.2rem 1.5rem .9rem; border-bottom:1px solid #f1f5f9;
  }
  .rpage-stitle {
    font-family:'Syne',sans-serif; font-size:1rem; font-weight:700;
    color:var(--ink); letter-spacing:-.2px; margin:0;
  }
  .rpage-stitle small {
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:.67rem;
    color:var(--ink2); letter-spacing:.5px; text-transform:uppercase;
    display:block; margin-bottom:1px;
  }
  .rpage-gen-badge {
    font-size:.7rem; color:var(--ink2); background:#f8fafc;
    border:1px solid #e2e8f0; border-radius:8px; padding:4px 10px;
  }

  .rpage-table-scroll { overflow-x:auto; width:100%; }
  .rpage-table-scroll::-webkit-scrollbar { height:4px; }
  .rpage-table-scroll::-webkit-scrollbar-track { background:#f1f5f9; }
  .rpage-table-scroll::-webkit-scrollbar-thumb { background:var(--accent1); border-radius:2px; }

  .rpage-table { width:100%; border-collapse:collapse; min-width:1100px; }
  .rpage-table thead tr { background:#fafbff; border-bottom:2px solid #f1f5f9; }
  .rpage-table th {
    padding:.75rem 1rem; text-align:left;
    font-size:.67rem; font-weight:600; text-transform:uppercase;
    letter-spacing:.6px; color:var(--ink2); white-space:nowrap;
  }
  .rpage-table th.right { text-align:right; }
  .rpage-table th.center { text-align:center; }
  .rpage-table tbody tr { border-bottom:1px solid #f8fafc; transition:background .15s; }
  .rpage-table tbody tr:last-child { border-bottom:none; }
  .rpage-table tbody tr:hover { background:#f0f9ff; }
  .rpage-table td { padding:.85rem 1rem; font-size:.84rem; vertical-align:middle; }
  .rpage-table td.right  { text-align:right; }
  .rpage-table td.center { text-align:center; }

  .rpage-avatar {
    width:38px; height:38px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif; font-size:.75rem; font-weight:800;
    color:#fff; flex-shrink:0;
  }
  .rpage-member-name { font-weight:600; color:var(--ink); font-size:.86rem; margin:0 0 1px; }
  .rpage-username     { font-size:.72rem; color:var(--ink2); }

  .amt-pos { color:#059669; font-family:'Syne',sans-serif; font-size:.84rem; font-weight:700; }
  .amt-neg { color:#dc2626; font-family:'Syne',sans-serif; font-size:.84rem; font-weight:700; }
  .amt-interest { color:#7c3aed; font-family:'Syne',sans-serif; font-size:.84rem; font-weight:700; }
  .amt-neu { color:var(--ink); font-family:'Syne',sans-serif; font-size:.84rem; font-weight:700; }

  .rpage-tx-badge {
    display:inline-block; background:#eff6ff; color:#1d4ed8;
    border-radius:20px; padding:3px 10px;
    font-size:.72rem; font-weight:600;
  }

  .rpage-status {
    display:inline-flex; align-items:center; gap:5px;
    font-size:.72rem; font-weight:600; padding:4px 11px; border-radius:20px;
  }
  .rpage-status.active   { background:#d1fae5; color:#065f46; }
  .rpage-status.inactive { background:#fee2e2; color:#991b1b; }
  .rpage-status-dot { width:6px; height:6px; border-radius:50%; }
  .rpage-status.active   .rpage-status-dot { background:#059669; }
  .rpage-status.inactive .rpage-status-dot { background:#dc2626; }

  .rpage-empty { text-align:center; padding:4rem 1rem; }
  .rpage-empty-icon { font-size:2.8rem; opacity:.3; margin-bottom:.75rem; }
  .rpage-empty h4 { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:var(--ink2); margin-bottom:.35rem; }
  .rpage-empty p  { font-size:.83rem; color:var(--ink2); font-weight:300; }

  .rpage-scroll-hint { text-align:center; padding:7px; font-size:.71rem; color:var(--ink2); font-style:italic; opacity:.7; }

  /* ── Export modal fields ── */
  .rpage-field { margin-bottom:1rem; }
  .rpage-field-label {
    display:block; font-size:.72rem; font-weight:600;
    text-transform:uppercase; letter-spacing:.5px; color:var(--ink2); margin-bottom:.38rem;
  }
  .rpage-field-select {
    width:100%; background:#f8fafc; border:1.5px solid #e2e8f0;
    border-radius:10px; padding:.62rem .85rem;
    font-size:.87rem; font-family:'DM Sans',sans-serif; color:var(--ink);
    transition:all .2s; outline:none; appearance:none;
  }
  .rpage-field-select:focus { border-color:var(--accent1); background:#fff; box-shadow:0 0 0 3px rgba(14,165,233,.1); }
  .rpage-export-info {
    background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px;
    padding:.85rem 1rem; font-size:.82rem; color:#0369a1; margin-top:.25rem;
  }
  .rpage-modal-footer {
    display:flex; justify-content:flex-end; gap:.7rem;
    padding-top:1.2rem; border-top:1px solid #f1f5f9; margin-top:.5rem;
  }
  .rpage-modal-btn {
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.62rem 1.4rem; border-radius:10px; border:none;
    font-family:'DM Sans',sans-serif; font-size:.86rem; font-weight:600;
    cursor:pointer; transition:all .2s ease;
  }
  .rpage-modal-btn:disabled { opacity:.45; cursor:not-allowed; }
  .rpage-modal-btn.ghost   { background:#f1f5f9; color:var(--ink2); }
  .rpage-modal-btn.ghost:hover:not(:disabled)   { background:#e2e8f0; }
  .rpage-modal-btn.primary { background:var(--accent1); color:#fff; box-shadow:0 4px 12px rgba(14,165,233,.3); }
  .rpage-modal-btn.primary:hover:not(:disabled) { background:#0284c7; transform:translateY(-1px); }
  .rpage-modal-btn.purple { background:#7c3aed; color:#fff; box-shadow:0 4px 12px rgba(124,58,237,.3); }
  .rpage-modal-btn.purple:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spinning { animation:spin .7s linear infinite; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .rpage .rpage-hero        { animation:fadeUp .35s ease both; }
  .rpage .rpage-kpi-strip   { animation:fadeUp .35s .1s ease both; }
  .rpage .rpage-filter-card { animation:fadeUp .35s .18s ease both; }
  .rpage .rpage-table-card  { animation:fadeUp .35s .26s ease both; }
`;

/* ── Avatar colours ── */
const COLORS = ['#0ea5e9','#10b981','#f59e0b','#4f46e5','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
const avatarColor = n => COLORS[(n?.charCodeAt(0)||0) % COLORS.length];
const initials    = n => (n||'NA').split(' ').map(c=>c[0]).join('').substring(0,2).toUpperCase();

/* ─── Helper Functions ──────────────────────────────────────────── */
const parseDecimal = (value) => {
  if (!value || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Annual interest rate (for display/projection only)
const ANNUAL_INTEREST_RATE = 11.5;

/* ─── Component ──────────────────────────────────────────────────── */
const ReportsPage = () => {
  const { transactions, loading: txLoading } = useTransactions();
  const { members, loading: memLoading } = useMembers();

  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [exportType, setExportType] = useState('balances');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showInterestDetails, setShowInterestDetails] = useState(false);

  const fmt = amt => `UGX ${(amt || 0).toLocaleString()}`;
  const fmtDay = str => {
    if (!str || str === 'All time' || str === 'Present') return str;
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredTx = useMemo(() => {
    let list = transactions;
    if (filters.startDate) list = list.filter(t => t.date >= filters.startDate);
    if (filters.endDate) list = list.filter(t => t.date <= filters.endDate);
    return list;
  }, [transactions, filters]);

  // ── SIMPLIFIED: total interest per member = sum of all Interest transactions ──
  const memberInterestMap = useMemo(() => {
    const map = new Map();
    if (!transactions.length) return map;

    transactions.forEach(tx => {
      if (tx.type === 'Interest') {
        const amount = parseDecimal(tx.otherSaving);
        if (amount > 0) {
          map.set(tx.memberId, (map.get(tx.memberId) || 0) + amount);
        }
      }
    });
    return map;
  }, [transactions]);

  const reports = useMemo(() => {
    if (!transactions.length || !members.length) return null;

    const memberReports = members.map(member => {
      const mt = filteredTx.filter(t => t.memberId === member.id);
      const totals = mt.reduce((a, t) => {
        if (t.type === 'Saving') {
          a.totalSavings += parseDecimal(t.weeklySaving) + parseDecimal(t.munomukabi) + parseDecimal(t.otherSaving);
        } else if (t.type === 'Withdrawal') {
          a.totalWithdrawals += parseDecimal(t.withdrawal);
        } else if (t.type === 'Interest') {
          a.totalInterest += parseDecimal(t.otherSaving);
        }
        return a;
      }, { totalSavings: 0, totalWithdrawals: 0, totalInterest: 0 });

      // Use the pre‑computed interest from the map (which includes all Interest transactions, regardless of date filter)
      // However, we want to show interest that is relevant to the filtered period? Usually total interest earned to date.
      // We'll show the sum of all Interest transactions (no date filter) because interest is cumulative.
      const totalInterestFromMap = memberInterestMap.get(member.id) || 0;

      // But if we want only interest from the filtered period, we'd use totals.totalInterest.
      // However, to keep consistent with other pages, we'll show the total interest earned to date.
      // So we override totals.totalInterest with the map value.
      const finalInterest = totalInterestFromMap;

      const last = mt.length
        ? mt.reduce((l, c) => new Date(c.date) > new Date(l.date) ? c : l).date
        : null;

      // Projected annual interest based on current balance (simple projection)
      const balance = (totals.totalSavings - totals.totalWithdrawals) + finalInterest;
      const projectedInterest = balance * (ANNUAL_INTEREST_RATE / 100);

      return {
        id: member.id,
        fullName: member.fullName,
        username: member.username,
        totalSavings: totals.totalSavings,
        totalWithdrawals: totals.totalWithdrawals,
        totalInterest: finalInterest,
        balance: balance,
        transactionCount: mt.length,
        lastTransaction: last,
        isActive: member.isActive !== false,
        projectedInterest: projectedInterest,
      };
    });

    return {
      reportDate: new Date().toISOString(),
      dateRange: { startDate: filters.startDate || 'All time', endDate: filters.endDate || 'Present' },
      members: memberReports,
    };
  }, [transactions, members, filteredTx, memberInterestMap]);

  const totalStats = reports ? {
    totalMembers: reports.members.length,
    totalSavings: reports.members.reduce((s, m) => s + m.totalSavings, 0),
    totalWithdrawals: reports.members.reduce((s, m) => s + m.totalWithdrawals, 0),
    totalInterest: reports.members.reduce((s, m) => s + m.totalInterest, 0),
    netBalance: reports.members.reduce((s, m) => s + m.balance, 0),
    activeMembers: reports.members.filter(m => m.isActive).length,
    totalTransactions: reports.members.reduce((s, m) => s + m.transactionCount, 0),
    projectedAnnualInterest: reports.members.reduce((s, m) => s + m.projectedInterest, 0),
  } : null;

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const configs = {
        balances: {
          data: reports.members.map(m => ({
            'Member Name': m.fullName,
            'Username': m.username,
            'Total Savings': m.totalSavings,
            'Total Withdrawals': m.totalWithdrawals,
            'Total Interest Earned': m.totalInterest,
            'Net Balance': m.balance,
            'Transactions': m.transactionCount,
            'Last Activity': m.lastTransaction ? fmtDay(m.lastTransaction) : 'Never',
            'Status': m.isActive ? 'Active' : 'Inactive',
            'Projected Annual Interest (11.5%)': m.projectedInterest,
          })),
          filename: `member-balances-${new Date().toISOString().split('T')[0]}.csv`,
        },
        transactions: {
          data: filteredTx.map(t => ({
            'Date': t.date,
            'Member': t.memberName,
            'Type': t.type,
            'Weekly Saving': t.weeklySaving || 0,
            'Munomukabi': t.munomukabi || 0,
            'Other Saving': t.otherSaving || 0,
            'Withdrawal': t.withdrawal || 0,
            'Interest Amount': t.type === 'Interest' ? (t.otherSaving || 0) : 0,
            'Entered By': t.enteredBy,
          })),
          filename: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
        },
        members: {
          data: members.map(m => ({
            'Full Name': m.fullName,
            'Username': m.username,
            'Email': m.email || '',
            'Gender': m.gender || '',
            'Residence': m.residence || '',
            'Date Joined': m.dateJoined,
            'Status': m.isActive ? 'Active' : 'Inactive',
          })),
          filename: `members-directory-${new Date().toISOString().split('T')[0]}.csv`,
        },
      };
      const { data, filename } = configs[exportType] || configs.balances;
      exportToCSV(data, filename);
      setShowExportModal(false);
    } catch (e) { console.error(e); }
    finally { setExportLoading(false); }
  };

  if (txLoading || memLoading) return <LoadingSpinner text="Loading reports…" />;

  const activeRatio = totalStats ? Math.round((totalStats.activeMembers / totalStats.totalMembers) * 100) : 0;
  const interestPercentage = totalStats?.totalSavings > 0
    ? Math.min(100, Math.round((totalStats.totalInterest / totalStats.totalSavings) * 100))
    : 0;

  return (
    <div className="rpage p-3 p-md-4">
      <style>{css}</style>

      {/* Hero Section */}
      <div className="rpage-hero mb-4">
        <div className="row align-items-center gy-3">
          <div className="col-md-8">
            <div className="rpage-hero-pill">
              <span className="live">●</span> Admin Portal
            </div>
            <h1 className="rpage-hero-title">Reports & Analytics</h1>
            <p className="rpage-hero-sub">Comprehensive insights with 11.5% annual interest tracking</p>
          </div>
          <div className="col-md-4 text-md-end">
            <button className="rpage-export-btn" onClick={() => setShowExportModal(true)}>
              <Download size={15} /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      {totalStats && (
        <div className="rpage-kpi-strip mb-4">
          <div className="row g-3">
            {[
              { label: 'Total Members', value: totalStats.totalMembers, badge: `${totalStats.activeMembers} active`, btype: 'b-neu', ibg: '#e0f2fe', icolor: '#0369a1', icon: <Users size={16} />, prog: Math.min(100, totalStats.totalMembers * 2), pfill: '#0ea5e9' },
              { label: 'Total Savings', value: fmt(totalStats.totalSavings), badge: 'All deposits', btype: 'b-up', ibg: '#d1fae5', icolor: '#059669', icon: <TrendingUp size={16} />, prog: 70, pfill: '#10b981' },
              { label: 'Total Interest Earned', value: fmt(totalStats.totalInterest), badge: `${interestPercentage}% of savings`, btype: 'b-purple', ibg: '#ede9fe', icolor: '#7c3aed', icon: <Percent size={16} />, prog: interestPercentage, pfill: '#8b5cf6' },
              { label: 'Net Group Balance', value: fmt(totalStats.netBalance), badge: totalStats.netBalance > 0 ? 'Positive' : 'Zero', btype: totalStats.netBalance > 0 ? 'b-up' : 'b-neu', ibg: '#fef3c7', icolor: '#b45309', icon: <Wallet size={16} />, prog: 60, pfill: '#f59e0b' },
            ].map((k, i) => (
              <div key={i} className="col-6 col-xl-3">
                <div className="rpage-kpi">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div className="rpage-kpi-label">{k.label}</div>
                    <div className="rpage-kpi-icon" style={{ background: k.ibg, color: k.icolor }}>{k.icon}</div>
                  </div>
                  <div className="rpage-kpi-value">{k.value}</div>
                  <span className={`rpage-kpi-badge ${k.btype}`}>{k.badge}</span>
                  <div className="rpage-progress">
                    <div className="rpage-progress-fill" style={{ width: `${k.prog}%`, background: k.pfill }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interest Summary Card */}
      {totalStats && totalStats.totalInterest > 0 && (
        <div className="interest-summary-card">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <PiggyBank size={18} style={{ color: '#7c3aed' }} />
                <h6 style={{ fontWeight: 800, margin: 0, color: '#5b21b6' }}>Interest Summary</h6>
              </div>
              <p style={{ margin: 0, fontSize: '.85rem', color: '#4c1d95' }}>
                💰 <strong>Annual Rate: 11.5%</strong> | Daily Rate: 0.0315%
              </p>
              <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: '#6d28d9' }}>
                Total interest earned to date: <strong>{fmt(totalStats.totalInterest)}</strong> |
                Projected annual interest: <strong>{fmt(totalStats.projectedAnnualInterest)}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowInterestDetails(!showInterestDetails)}
              style={{
                background: '#7c3aed',
                border: 'none',
                color: 'white',
                padding: '.5rem 1rem',
                borderRadius: '10px',
                fontSize: '.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem'
              }}
            >
              <Award size={14} />
              {showInterestDetails ? 'Hide Details' : 'View Interest Details'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rpage-filter-card mb-4">
        <div className="rpage-filter-title">
          <Filter size={15} /> Report Filters
        </div>
        <div className="d-flex flex-wrap align-items-end gap-3">
          <div style={{ flex: '1', minWidth: 160 }}>
            <label className="rpage-date-label">Start Date</label>
            <input type="date" name="startDate" value={filters.startDate}
              onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
              className="rpage-date-input" />
          </div>
          <div style={{ flex: '1', minWidth: 160 }}>
            <label className="rpage-date-label">End Date</label>
            <input type="date" name="endDate" value={filters.endDate}
              onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
              className="rpage-date-input" />
          </div>
          <button className="rpage-clear-btn" onClick={() => setFilters({ startDate: '', endDate: '' })}>
            <X size={13} /> Clear
          </button>
          <div className="rpage-filter-meta">
            <Activity size={12} />
            {transactions.length} transactions · {members.length} members
          </div>
        </div>
      </div>

      {/* Main Member Balances Table */}
      {reports ? (
        <div className="rpage-table-card">
          <div className="rpage-table-head">
            <div className="rpage-stitle">
              <small>Financial Overview</small>
              Member Balance Details
            </div>
            <span className="rpage-gen-badge">
              Generated {fmtDay(reports.reportDate)}
              {reports.dateRange.startDate !== 'All time' && ` · ${fmtDay(reports.dateRange.startDate)} → ${fmtDay(reports.dateRange.endDate)}`}
            </span>
          </div>

          <div className="rpage-table-scroll">
            <table className="rpage-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Member</th>
                  <th className="right" style={{ minWidth: 155 }}>Savings</th>
                  <th className="right" style={{ minWidth: 155 }}>Withdrawals</th>
                  <th className="right" style={{ minWidth: 155 }}>Interest Earned</th>
                  <th className="right" style={{ minWidth: 155 }}>Total Balance</th>
                  <th className="center" style={{ minWidth: 110 }}>Transactions</th>
                  <th style={{ minWidth: 140 }}>Last Activity</th>
                  <th className="sticky-col center" style={{ minWidth: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.members.map(m => (
                  <tr key={m.id}>
                    {/* Member */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rpage-avatar" style={{ background: avatarColor(m.fullName) }}>
                          {initials(m.fullName)}
                        </div>
                        <div>
                          <p className="rpage-member-name">{m.fullName}</p>
                          <p className="rpage-username">@{m.username}</p>
                        </div>
                      </div>
                    </td>
                    {/* Savings */}
                    <td className="right"><span className="amt-pos">{fmt(m.totalSavings)}</span></td>
                    {/* Withdrawals */}
                    <td className="right"><span className="amt-neg">{fmt(m.totalWithdrawals)}</span></td>
                    {/* Interest Earned */}
                    <td className="right">
                      <span className="amt-interest">
                        {fmt(m.totalInterest)}
                        {m.projectedInterest > 0 && (
                          <div style={{ fontSize: '.65rem', color: '#8b5cf6', marginTop: '2px' }}>
                            +{fmt(m.projectedInterest)}/year
                          </div>
                        )}
                      </span>
                    </td>
                    {/* Balance */}
                    <td className="right">
                      <span className={m.balance >= 0 ? 'amt-pos' : 'amt-neg'}>{fmt(m.balance)}</span>
                    </td>
                    {/* Tx count */}
                    <td className="center">
                      <span className="rpage-tx-badge">{m.transactionCount}</span>
                    </td>
                    {/* Last activity */}
                    <td className="center">
                      <span style={{ fontSize: '.8rem', color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {m.lastTransaction ? fmtDay(m.lastTransaction) : 'Never'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="sticky-col center">
                      <span className={`rpage-status ${m.isActive ? 'active' : 'inactive'}`}>
                        <span className="rpage-status-dot" />
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reports.members.length > 0 && (
            <div className="rpage-scroll-hint">← Scroll to view all columns →</div>
          )}
        </div>
      ) : (
        <div className="rpage-table-card">
          <div className="rpage-empty">
            <div className="rpage-empty-icon">📊</div>
            <h4>No Report Data Yet</h4>
            <p>Add members and transactions to generate your first report</p>
          </div>
        </div>
      )}

      {/* Additional Interest Details Table */}
      {showInterestDetails && totalStats && totalStats.totalInterest > 0 && (
        <div className="rpage-table-card">
          <div className="rpage-table-head">
            <div className="rpage-stitle">
              <small>Interest Breakdown</small>
              Detailed Interest Calculations (11.5% p.a.)
            </div>
            <span className="rpage-gen-badge">
              Daily Rate: 0.0315%
            </span>
          </div>
          <div className="rpage-table-scroll">
            <table className="rpage-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th className="right">Current Balance</th>
                  <th className="right">Interest Earned</th>
                  <th className="right">Interest Rate</th>
                  <th className="right">Daily Interest</th>
                  <th className="right">Monthly Interest</th>
                  <th className="right">Annual Interest</th>
                </tr>
              </thead>
              <tbody>
                {reports.members.filter(m => m.balance > 0).map(m => {
                  const dailyInterest = m.balance * (0.115 / 365);
                  const monthlyInterest = dailyInterest * 30;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                      <td className="right">{fmt(m.balance)}</td>
                      <td className="right"><span className="amt-interest">{fmt(m.totalInterest)}</span></td>
                      <td className="right">11.5% p.a.</td>
                      <td className="right"><span className="amt-interest">{fmt(dailyInterest)}</span></td>
                      <td className="right"><span className="amt-interest">{fmt(monthlyInterest)}</span></td>
                      <td className="right"><span className="amt-interest">{fmt(m.projectedInterest)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Data" size="sm">
        <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
          <div className="rpage-field">
            <label className="rpage-field-label">Export Type</label>
            <select value={exportType} onChange={e => setExportType(e.target.value)}
              className="rpage-field-select">
              <option value="balances">Member Balances (with Interest)</option>
              <option value="transactions">Transaction History</option>
              <option value="members">Members Directory</option>
            </select>
          </div>
          <div className="rpage-export-info">
            Exporting <strong>{exportType}</strong> data
            {filters.startDate || filters.endDate ? ' for the selected date range' : ' — all available records'}.
            {exportType === 'balances' && ' Includes interest calculations at 11.5% per annum.'}
          </div>
          <div className="rpage-modal-footer">
            <button className="rpage-modal-btn ghost" onClick={() => setShowExportModal(false)} disabled={exportLoading}>
              Cancel
            </button>
            <button className="rpage-modal-btn purple" onClick={handleExport} disabled={exportLoading}>
              {exportLoading
                ? <><FileText size={13} className="spinning" /> Exporting…</>
                : <><Download size={13} /> Export CSV</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;