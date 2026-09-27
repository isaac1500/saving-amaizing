import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../hooks/useMembers';
import { useTransactions } from '../../hooks/useTransactions';
import { getGroupSummary } from '../../services/reportService';
import { calculateGroupTotals, formatCurrency } from '../../utils/calculateTotals';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

/* ─── Design tokens & styles ───────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap');

  .adash {
    --ink:       #0d0f1a;
    --ink2:      #64748b;
    --surface:   #f4f5fb;
    --card:      #ffffff;
    --accent1:   #4f46e5;
    --accent2:   #06b6d4;
    --accent3:   #10b981;
    --accent4:   #f59e0b;
    --purple:    #8b5cf6;
    --border:    rgba(79,70,229,.1);
    --shadow:    0 2px 16px rgba(79,70,229,.07);
    --shadow-lg: 0 8px 40px rgba(79,70,229,.13);
    font-family: 'DM Sans', sans-serif;
    background: var(--surface);
    min-height: 100vh;
    color: var(--ink);
  }

  /* Hero */
  .adash-hero {
    background: linear-gradient(135deg,#0d0f1a 0%,#1e1b4b 55%,#312e81 100%);
    border-radius: 20px;
    padding: 2.5rem 2.5rem 3.8rem;
    position: relative;
    overflow: hidden;
  }
  .adash-hero::before {
    content:''; position:absolute;
    width:420px; height:420px; border-radius:50%;
    background:radial-gradient(circle,rgba(99,102,241,.35) 0%,transparent 70%);
    top:-140px; right:-80px; pointer-events:none;
  }
  .adash-hero::after {
    content:''; position:absolute;
    width:260px; height:260px; border-radius:50%;
    background:radial-gradient(circle,rgba(6,182,212,.2) 0%,transparent 70%);
    bottom:-80px; left:30%; pointer-events:none;
  }
  .adash-hero-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    backdrop-filter:blur(8px); color:#e0e7ff;
    padding:4px 14px; border-radius:20px;
    font-size:.72rem; font-weight:500; letter-spacing:.3px;
  }
  .adash-hero-pill .dot { color:#6ee7b7; }
  .adash-hero-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.6rem,3vw,2.4rem);
    font-weight:800; color:#fff; letter-spacing:-.5px; margin:0;
  }
  .adash-hero-sub { color:rgba(199,210,254,.7); font-size:.9rem; font-weight:300; margin:.35rem 0 0; }
  .adash-hero-balance-label { color:rgba(199,210,254,.55); font-size:.7rem; text-transform:uppercase; letter-spacing:.8px; margin-bottom:.3rem; }
  .adash-hero-balance-value {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800; color:#fff; letter-spacing:-1px;
  }
  .adash-hero-balance-sub { color:rgba(199,210,254,.5); font-size:.78rem; margin-top:.2rem; }

  /* KPI strip */
  .adash-kpi-strip { margin-top:-28px; position:relative; z-index:10; }
  .adash-kpi {
    background:var(--card); border-radius:16px;
    padding:1.4rem 1.5rem;
    box-shadow:var(--shadow-lg); border:1px solid var(--border);
    transition:transform .2s ease,box-shadow .2s ease; height:100%;
  }
  .adash-kpi:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(79,70,229,.18); }
  .adash-kpi-label { font-size:.7rem; font-weight:500; text-transform:uppercase; letter-spacing:.7px; color:var(--ink2); margin-bottom:.45rem; }
  .adash-kpi-value { font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:700; color:var(--ink); line-height:1; margin-bottom:.4rem; }
  .adash-kpi-badge { font-size:.7rem; font-weight:500; padding:3px 10px; border-radius:20px; display:inline-block; }
  .badge-up   { background:#d1fae5; color:#065f46; }
  .badge-down { background:#fee2e2; color:#991b1b; }
  .badge-neu  { background:#e0e7ff; color:#3730a3; }
  .badge-purple { background:#ede9fe; color:#5b21b6; }
  .adash-kpi-icon {
    width:38px; height:38px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:1rem; flex-shrink:0;
  }
  .icon-indigo{background:#eef2ff;} .icon-cyan{background:#ecfeff;}
  .icon-green{background:#d1fae5;}  .icon-amber{background:#fef3c7;}
  .icon-purple{background:#ede9fe;}

  /* Section title */
  .adash-stitle {
    font-family:'Syne',sans-serif; font-size:1rem; font-weight:700;
    color:var(--ink); letter-spacing:-.2px; margin-bottom:.9rem;
  }
  .adash-stitle small {
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:.68rem;
    color:var(--ink2); letter-spacing:.5px; text-transform:uppercase;
    display:block; margin-bottom:2px;
  }

  /* Cards */
  .adash-card { background:var(--card); border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow); overflow:hidden; }
  .adash-card-body { padding:1.5rem; }

  /* Balance hero card */
  .adash-balance {
    background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
    border-radius:16px; padding:1.8rem; color:#fff;
    position:relative; overflow:hidden;
  }
  .adash-balance::before {
    content:''; position:absolute; width:200px; height:200px; border-radius:50%;
    background:rgba(255,255,255,.08); top:-60px; right:-40px;
  }
  .adash-balance-label { font-size:.7rem; font-weight:500; text-transform:uppercase; letter-spacing:.8px; color:rgba(255,255,255,.6); margin-bottom:.4rem; }
  .adash-balance-amount { font-family:'Syne',sans-serif; font-size:clamp(1.6rem,3vw,2.2rem); font-weight:800; letter-spacing:-1px; margin-bottom:.7rem; }
  .adash-progress { height:5px; background:rgba(255,255,255,.2); border-radius:3px; overflow:hidden; margin:.9rem 0 .35rem; }
  .adash-progress-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#6ee7b7,#a7f3d0); transition:width .8s cubic-bezier(.4,0,.2,1); }
  .adash-balance-meta { font-size:.7rem; color:rgba(255,255,255,.45); display:flex; justify-content:space-between; margin-bottom:1rem; }
  .adash-balance-row { display:flex; gap:1.2rem; flex-wrap:wrap; }
  .adash-balance-row-item strong { color:#fff; display:block; font-size:.88rem; margin-bottom:1px; }
  .adash-balance-row-item span { color:rgba(255,255,255,.55); font-size:.7rem; }

  /* Interest Card */
  .interest-card {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #c4b5fd;
    position: relative;
    overflow: hidden;
  }
  .interest-card::before {
    content: '✨';
    position: absolute;
    font-size: 60px;
    opacity: 0.1;
    bottom: -15px;
    right: -15px;
    pointer-events: none;
  }

  /* Breakdown */
  .adash-breakdown-item { padding:.85rem 0; border-bottom:1px solid #f1f5f9; }
  .adash-breakdown-item:last-child { border-bottom:none; }
  .adash-breakdown-bar { height:4px; background:#f1f5f9; border-radius:2px; overflow:hidden; margin:.45rem 0 .2rem; }
  .adash-breakdown-fill { height:100%; border-radius:2px; transition:width .8s cubic-bezier(.4,0,.2,1); }
  .interest-breakdown-fill { background: #8b5cf6; }

  /* Action links */
  .adash-action {
    display:flex; align-items:center; gap:.9rem;
    padding:.9rem 1.1rem; border-radius:12px; text-decoration:none;
    border:1px solid var(--border); background:var(--card);
    transition:all .2s ease; margin-bottom:.5rem;
  }
  .adash-action:last-child { margin-bottom:0; }
  .adash-action:hover {
    border-color:var(--accent1);
    box-shadow:0 4px 20px rgba(79,70,229,.1);
    transform:translateX(4px); background:#fafbff; text-decoration:none;
  }
  .adash-action-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
  .adash-action-title { font-weight:600; font-size:.86rem; color:var(--ink); margin:0; line-height:1.2; }
  .adash-action-sub { font-size:.72rem; color:var(--ink2); }
  .adash-action-arrow { margin-left:auto; color:var(--ink2); font-size:1.1rem; transition:transform .2s; }
  .adash-action:hover .adash-action-arrow { transform:translateX(4px); }

  /* Activity */
  .adash-tx { display:flex; align-items:center; gap:.8rem; padding:.8rem 0; border-bottom:1px solid #f8fafc; }
  .adash-tx:last-child { border-bottom:none; }
  .adash-tx-dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; flex-shrink:0; }
  .dot-s { background:#d1fae5; color:#059669; }
  .dot-w { background:#fee2e2; color:#dc2626; }
  .dot-i { background:#ede9fe; color:#7c3aed; }
  .adash-tx-name { font-weight:500; font-size:.83rem; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; }
  .adash-tx-meta { font-size:.7rem; color:var(--ink2); }
  .adash-tx-amt { margin-left:auto; font-family:'Syne',sans-serif; font-size:.88rem; font-weight:700; white-space:nowrap; }
  .pos { color:#059669; } .neg { color:#dc2626; } .interest-amt { color:#7c3aed; }

  /* Filter bar */
  .adash-filter {
    background:var(--card); border-radius:13px; border:1px solid var(--border);
    padding:.9rem 1.3rem; display:flex; align-items:center; gap:.7rem; flex-wrap:wrap;
  }
  .adash-filter label { font-size:.7rem; font-weight:500; text-transform:uppercase; letter-spacing:.5px; color:var(--ink2); margin:0; white-space:nowrap; }
  .adash-filter-input {
    border:1px solid #e2e8f0; border-radius:8px; padding:5px 11px;
    font-size:.8rem; color:var(--ink); outline:none; transition:border-color .2s;
    font-family:'DM Sans',sans-serif;
  }
  .adash-filter-input:focus { border-color:var(--accent1); box-shadow:0 0 0 3px rgba(79,70,229,.08); }

  /* Entrance animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .adash .adash-hero       { animation:fadeUp .35s ease both; }
  .adash .adash-kpi-strip  { animation:fadeUp .35s .1s ease both; }
  .adash .adash-filter     { animation:fadeUp .35s .15s ease both; }
  .adash .adash-col-l      { animation:fadeUp .35s .2s ease both; }
  .adash .adash-col-r      { animation:fadeUp .35s .27s ease both; }
`;

/* ─── Helper Functions ─────────────────────────────────────────── */
const parseDecimal = (value) => {
  if (!value || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/* ─── Component ─────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user }   = useAuth();
  const { members,      loading: mLoading } = useMembers();
  const { transactions, loading: tLoading } = useTransactions();
  const [groupSummary,   setGroupSummary]   = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [dateRange,      setDateRange]      = useState({ startDate:'', endDate:'' });
  const drRef = useRef(dateRange);
  drRef.current = dateRange;

  // =============================================================
  // CORRECTED: Total Interest = sum of all Interest transactions
  // =============================================================
  const totalInterest = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    
    let total = 0;
    transactions.forEach(tx => {
      if (tx.type === 'Interest') {
        total += parseFloat(tx.otherSaving || 0);
      }
    });
    return total;
  }, [transactions]);

  // Optional: manual trigger (not yet implemented)
  // You can uncomment this block when you add the button.
  /*
  const [applyingInterest, setApplyingInterest] = useState(false);
  const handleApplyInterest = async () => {
    // ... (code from step 5)
  };
  */

  useEffect(() => {
    if (!user || mLoading || tLoading) return;
    (async () => {
      setSummaryLoading(true);
      try {
        const p = {};
        if (drRef.current.startDate) p.startDate = drRef.current.startDate;
        if (drRef.current.endDate)   p.endDate   = drRef.current.endDate;
        setGroupSummary(await getGroupSummary(p));
      } catch {
        setGroupSummary({ summary: calculateGroupTotals(transactions, members) });
      } finally { setSummaryLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, mLoading, tLoading]);

  const applyFilter = async () => {
    setSummaryLoading(true);
    try {
      const p = {};
      if (dateRange.startDate) p.startDate = dateRange.startDate;
      if (dateRange.endDate)   p.endDate   = dateRange.endDate;
      setGroupSummary(await getGroupSummary(p));
    } catch {
      setGroupSummary({ summary: calculateGroupTotals(transactions, members) });
    } finally { setSummaryLoading(false); }
  };

  const clearFilter = () => {
    setDateRange({ startDate:'', endDate:'' });
    setGroupSummary({ summary: calculateGroupTotals(transactions, members) });
  };

  /* derived */
  const summary = groupSummary?.summary || calculateGroupTotals(transactions, members);
  const sumSave = arr => arr.reduce((s,t) =>
    s + parseFloat(t.weeklySaving||0) + parseFloat(t.munomukabi||0) + parseFloat(t.otherSaving||0), 0);

  const today      = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
  const oneMonAgo  = new Date(); oneMonAgo.setDate(oneMonAgo.getDate()-30);
  const weekTx     = transactions.filter(t => new Date(t.date) >= oneWeekAgo);
  const todaySav   = sumSave(transactions.filter(t => t.date===today && t.type==='Saving'));
  const weekSav    = sumSave(weekTx.filter(t => t.type==='Saving'));
  const activeM    = new Set(transactions.filter(t=>new Date(t.date)>=oneMonAgo).map(t=>t.memberId)).size;
  const weekPartic = new Set(weekTx.filter(t=>t.type==='Saving').map(t=>t.memberId)).size;
  const rate       = members.length > 0 ? Math.round((weekPartic/members.length)*100) : 0;

  // Interest percentage of total savings
  const interestPercentage = summary.totalSavings > 0 ? Math.min(100, Math.round((totalInterest / summary.totalSavings) * 100)) : 0;
  const projectedAnnualInterest = summary.netBalance * (0.115); // 11.5% of net balance

  const totalBreakdown =
    parseFloat(summary.totalWeeklySaving||0) +
    parseFloat(summary.totalMunomukabi  ||0) +
    parseFloat(summary.totalOtherSaving ||0);
  const pct = v => totalBreakdown > 0 ? (parseFloat(v||0)/totalBreakdown)*100 : 0;

  const goalPct  = Math.min(100, Math.round(((summary.totalSavings||0)/2000000)*100));
  const recentTx = [...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);

  const hr = new Date().getHours();
  const greeting = hr<12 ? 'Good morning' : hr<17 ? 'Good afternoon' : 'Good evening';

  if (mLoading || tLoading || summaryLoading) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <div className="adash p-3 p-md-4">
      <style>{css}</style>

      {/* ══ Hero ══ */}
      <div className="adash-hero mb-4">
        <div className="row align-items-end gy-3">
          <div className="col-md-7">
            <div className="adash-hero-pill mb-3">
              <span className="dot">●</span> Live · {new Date().toLocaleDateString('en-UG',{weekday:'long',month:'short',day:'numeric'})}
            </div>
            <h1 className="adash-hero-title">{greeting},<br />{user?.displayName?.split(' ')[0] || 'Admin'} 👋</h1>
            <p className="adash-hero-sub">Here's your savings group at a glance.</p>
          </div>
          <div className="col-md-5 text-md-end">
            <div className="adash-hero-balance-label">Net Group Balance</div>
            <div className="adash-hero-balance-value">{formatCurrency(summary.netBalance||0)}</div>
            <div className="adash-hero-balance-sub">{members.length} members · {transactions.length} transactions total</div>
          </div>
        </div>
      </div>

      {/* ══ KPI strip ══ */}
      <div className="adash-kpi-strip mb-4">
        <div className="row g-3">
          {[
            { label:"Today's Savings",      value:formatCurrency(todaySav), badge:todaySav>0?'Active':'No activity', type:todaySav>0?'up':'neu', icon:'💰', cls:'icon-indigo' },
            { label:'This Week',             value:formatCurrency(weekSav),  badge:`${Math.round(weekSav/1000)}K collected`, type:'up', icon:'📅', cls:'icon-cyan'   },
            { label:'Total Interest Earned', value:formatCurrency(totalInterest),  badge:`${interestPercentage}% of savings`, type:'purple', icon:'💹', cls:'icon-purple'   },
            { label:'Weekly Participation',  value:`${rate}%`,               badge:rate>50?'On track':'Below avg', type:rate>50?'up':'down', icon:'🎯', cls:'icon-amber' },
          ].map((k,i) => (
            <div key={i} className="col-6 col-xl-3">
              <div className="adash-kpi">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="adash-kpi-label">{k.label}</div>
                  <div className={`adash-kpi-icon ${k.cls}`}>{k.icon}</div>
                </div>
                <div className="adash-kpi-value">{k.value}</div>
                <span className={`adash-kpi-badge badge-${k.type}`}>{k.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Interest Summary Card ══ */}
      {totalInterest > 0 && (
        <div className="interest-card">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span style={{ fontSize: '1.2rem' }}>💰</span>
                <h6 style={{ fontWeight: 800, margin: 0, color: '#5b21b6' }}>Interest Summary</h6>
              </div>
              <p style={{ margin: 0, fontSize: '.85rem', color: '#4c1d95' }}>
                <strong>Annual Rate: 11.5%</strong> | Daily Rate: 0.0315%
              </p>
              <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: '#6d28d9' }}>
                Total interest earned to date: <strong>{formatCurrency(totalInterest)}</strong> | 
                Projected annual interest: <strong>{formatCurrency(projectedAnnualInterest)}</strong>
              </p>
            </div>
            <Link 
              to="/admin/reports"
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
                gap: '.5rem',
                textDecoration: 'none'
              }}
            >
              <span>📊</span>
              View Detailed Report
            </Link>
          </div>
        </div>
      )}

      {/* ══ Filter bar ══ */}
      <div className="adash-filter mb-4">
        <label>Filter period</label>
        <input className="adash-filter-input" type="date" value={dateRange.startDate} onChange={e=>setDateRange(p=>({...p,startDate:e.target.value}))} />
        <span style={{color:'#cbd5e1',fontSize:'.8rem'}}>→</span>
        <input className="adash-filter-input" type="date" value={dateRange.endDate} onChange={e=>setDateRange(p=>({...p,endDate:e.target.value}))} />
        <button className="btn btn-sm px-3 ms-1" style={{background:'var(--accent1)',color:'#fff',borderRadius:8,fontSize:'.8rem',fontFamily:'DM Sans'}} onClick={applyFilter}>Apply</button>
        <button className="btn btn-sm px-3" style={{background:'#f1f5f9',color:'var(--ink2)',borderRadius:8,fontSize:'.8rem',fontFamily:'DM Sans'}} onClick={clearFilter}>Clear</button>
      </div>

      {/* ══ Main grid ══ */}
      <div className="row g-4">

        {/* Left col */}
        <div className="col-lg-7 adash-col-l">

          {/* Balance card */}
          <div className="adash-balance mb-4">
            <div className="adash-balance-label">Total Group Savings</div>
            <div className="adash-balance-amount">{formatCurrency(summary.totalSavings||0)}</div>
            <div className="adash-progress">
              <div className="adash-progress-fill" style={{width:`${goalPct}%`}} />
            </div>
            <div className="adash-balance-meta">
              <span>{goalPct}% of UGX 2M goal</span>
              <span>{formatCurrency(Math.max(0,2000000-(summary.totalSavings||0)))} to go</span>
            </div>
            <div className="adash-balance-row">
              {[
                { label:'Total Saved',   value:summary.totalSavings     ||0 },
                { label:'Withdrawn',     value:summary.totalWithdrawals ||0 },
                { label:'Interest Earned', value:totalInterest ||0 },
                { label:'Net Balance',   value:summary.netBalance       ||0 },
              ].map(r=>(
                <div key={r.label} className="adash-balance-row-item">
                  <strong>{formatCurrency(r.value)}</strong>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings breakdown */}
          <div className="adash-card mb-4">
            <div className="adash-card-body">
              <div className="adash-stitle"><small>Composition</small>Savings Breakdown</div>
              {[
                { label:'Weekly Savings', value:summary.totalWeeklySaving||0, color:'#4f46e5' },
                { label:'Munomukabi',     value:summary.totalMunomukabi  ||0, color:'#06b6d4' },
                { label:'Other Savings',  value:summary.totalOtherSaving ||0, color:'#10b981' },
              ].map(item=>(
                <div key={item.label} className="adash-breakdown-item">
                  <div className="d-flex justify-content-between">
                    <span style={{fontSize:'.82rem',fontWeight:500}}>{item.label}</span>
                    <span style={{fontSize:'.82rem',fontWeight:600,fontFamily:'Syne'}}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className="adash-breakdown-bar">
                    <div className="adash-breakdown-fill" style={{width:`${pct(item.value)}%`,background:item.color}} />
                  </div>
                  <div style={{fontSize:'.68rem',color:'var(--ink2)'}}>{Math.round(pct(item.value))}% of total</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini stats row */}
          <div className="row g-3">
            {[
              { label:'Avg per Member',    value:formatCurrency(members.length>0?(summary.totalSavings||0)/members.length:0), icon:'📈' },
              { label:'Transactions',      value:transactions.length, icon:'🔄' },
              { label:'Total Members',     value:members.length,      icon:'👤' },
            ].map((m,i)=>(
              <div key={i} className="col-4">
                <div className="adash-card text-center">
                  <div className="adash-card-body py-3 px-2">
                    <div style={{fontSize:'1.3rem',marginBottom:'.25rem'}}>{m.icon}</div>
                    <div style={{fontFamily:'Syne',fontWeight:700,fontSize:'1.05rem',color:'var(--ink)'}}>{m.value}</div>
                    <div style={{fontSize:'.67rem',color:'var(--ink2)',textTransform:'uppercase',letterSpacing:'.4px',fontWeight:500}}>{m.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="col-lg-5 adash-col-r">

          {/* Quick actions */}
          <div className="adash-card mb-4">
            <div className="adash-card-body">
              <div className="adash-stitle"><small>Shortcuts</small>Quick Actions</div>
              {[
                { to:'/admin/register',     icon:'👤', bg:'#eef2ff', title:'Add Member',         sub:'Register a new member'    },
                { to:'/admin/transactions', icon:'💳', bg:'#ecfeff', title:'Record Transaction',  sub:'Add savings or withdrawal' },
                { to:'/admin/reports',      icon:'📄', bg:'#d1fae5', title:'Generate Report',     sub:'Export financial summary' },
                { to:'/admin/members',      icon:'👥', bg:'#fef3c7', title:'Manage Members',      sub:'Edit, view, deactivate'   },
              ].map((a,i)=>(
                <Link key={i} to={a.to} className="adash-action">
                  <div className="adash-action-icon" style={{background:a.bg}}>{a.icon}</div>
                  <div>
                    <p className="adash-action-title">{a.title}</p>
                    <span className="adash-action-sub">{a.sub}</span>
                  </div>
                  <span className="adash-action-arrow">›</span>
                </Link>
              ))}

              {/* ─── Optional Manual Trigger Button ─── */}
              {/* Uncomment the following block when you want to add it */}
              {/*
              <button
                className="adash-action"
                onClick={handleApplyInterest}
                disabled={applyingInterest}
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: applyingInterest ? 'wait' : 'pointer'
                }}
              >
                <div className="adash-action-icon" style={{ background: '#ede9fe' }}>
                  {applyingInterest ? '⏳' : '💰'}
                </div>
                <div>
                  <p className="adash-action-title">
                    {applyingInterest ? 'Applying Interest...' : 'Apply Daily Interest'}
                  </p>
                  <span className="adash-action-sub">
                    {applyingInterest ? 'Please wait...' : 'Compound interest for all members'}
                  </span>
                </div>
                <span className="adash-action-arrow">›</span>
              </button>
              */}
              {/* ─── End Optional Block ─── */}

            </div>
          </div>

          {/* Recent activity */}
          <div className="adash-card">
            <div className="adash-card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="adash-stitle mb-0"><small>Last 6 entries</small>Recent Activity</div>
                <Link to="/admin/transactions" style={{fontSize:'.73rem',color:'var(--accent1)',fontWeight:600,textDecoration:'none'}}>
                  View all →
                </Link>
              </div>

              {recentTx.length > 0 ? recentTx.map(tx => {
                const amt = tx.type==='Saving'
                  ? parseFloat(tx.weeklySaving||0)+parseFloat(tx.munomukabi||0)+parseFloat(tx.otherSaving||0)
                  : parseFloat(tx.withdrawal||0);
                const isInterest = tx.type === 'Interest';
                return (
                  <div key={tx.id} className="adash-tx">
                    <div className={`adash-tx-dot ${isInterest ? 'dot-i' : (tx.type==='Saving'?'dot-s':'dot-w')}`}>
                      {isInterest ? '💹' : (tx.type==='Saving'?'↑':'↓')}
                    </div>
                    <div style={{minWidth:0,flex:1}}>
                      <div className="adash-tx-name">{tx.memberName||'Unknown'}</div>
                      <div className="adash-tx-meta">
                        {new Date(tx.date).toLocaleDateString('en-UG',{day:'numeric',month:'short'})} · {tx.type}
                        {isInterest && ' (11.5% p.a.)'}
                      </div>
                    </div>
                    <div className={`adash-tx-amt ${isInterest ? 'interest-amt' : (tx.type==='Saving'?'pos':'neg')}`}>
                      {isInterest ? '+' : (tx.type==='Saving'?'+':'-')}{formatCurrency(amt)}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-5" style={{color:'var(--ink2)'}}>
                  <div style={{fontSize:'2.2rem',marginBottom:'.5rem'}}>📭</div>
                  <div style={{fontSize:'.85rem'}}>No transactions yet</div>
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