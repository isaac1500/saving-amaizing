// src/pages/member/TransactionsHistory.js
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  TrendingUp, TrendingDown, BarChart3, Wallet,
  X, Search, Download, FileText,
  Printer, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Calendar, ChevronRight, SlidersHorizontal, Sparkles,
  Percent, PiggyBank, Gift
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  STYLES                                                             */
/* ─────────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #06080f;
  --bg2:     #0c0f1d;
  --bg3:     #111425;
  --surface: #161929;
  --surface2:#1c2035;
  --border:  rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.13);
  --teal:    #00d4aa;
  --blue:    #4f7cff;
  --amber:   #ffb347;
  --rose:    #ff6b8a;
  --purple:  #8b5cf6;
  --text:    #f0f4ff;
  --text2:   #8892b0;
  --text3:   #4a5578;
  --r-md:18px; --r-lg:24px; --r-xl:32px;
  --glow-teal:  0 0 40px rgba(0,212,170,.15);
  --glow-blue:  0 0 40px rgba(79,124,255,.15);
  --glow-amber: 0 0 40px rgba(255,179,71,.12);
  --glow-rose:  0 0 40px rgba(255,107,138,.12);
  --glow-purple:0 0 40px rgba(139,92,246,.15);
}

.th {
  font-family: 'Outfit', sans-serif;
  background: var(--bg); min-height: 100vh;
  color: var(--text); padding: 36px 32px 72px;
  position: relative;
}
.th::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: .35;
}
.th > * { position: relative; z-index: 1; }

/* ══ HEADER ══ */
.th-header { margin-bottom: 30px; }
.th-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.th-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--teal); box-shadow: 0 0 10px var(--teal);
  animation: th-pulse 2s ease-in-out infinite;
}
@keyframes th-pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.5);} }
.th-portal-label { font-size: 11px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 2.5px; }
.th-title {
  font-size: clamp(28px,4vw,42px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1;
  background: linear-gradient(135deg, #fff 0%, #a8d8ff 40%, var(--teal) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.th-sub { font-size: 13px; color: var(--text3); margin-top: 6px; }

/* ══ BANNER ══ */
.th-banner {
  background: linear-gradient(135deg, #0a122b 0%, #0c1e3e 60%, #081830 100%);
  border: 1px solid rgba(79,124,255,.25); border-radius: var(--r-xl);
  padding: 36px 44px; position: relative; overflow: hidden; margin-bottom: 22px;
  box-shadow: var(--glow-blue), inset 0 1px 0 rgba(255,255,255,.06);
}
.th-banner .th-orb1 { position:absolute; top:-90px; right:-70px; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(79,124,255,.22) 0%,transparent 70%); pointer-events:none; }
.th-banner .th-orb2 { position:absolute; bottom:-60px; left:10%; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(0,212,170,.13) 0%,transparent 70%); pointer-events:none; }
.th-banner .th-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px); background-size:44px 44px; }
.th-banner-inner { position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
.th-b-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:2.5px; color:rgba(255,255,255,.3); margin-bottom:10px; }
.th-b-value { font-size:clamp(28px,4vw,48px); font-weight:800; color:#fff; letter-spacing:-2px; line-height:1; }
.th-b-meta  { font-size:13px; color:rgba(255,255,255,.35); margin-top:10px; }
.th-b-stats { display:flex; gap:36px; flex-wrap:wrap; }
.th-bstat   { text-align:right; }
.th-bstat-l { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.3); margin-bottom:5px; }
.th-bstat-v { font-size:16px; font-weight:700; }
.th-bstat-v.pos { color:var(--teal); }
.th-bstat-v.neg { color:var(--rose); }

/* ══ KPI GRID ══ */
.th-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
@media(max-width:1024px){ .th-kpi-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:520px) { .th-kpi-grid{grid-template-columns:1fr;} }

.th-kpi {
  background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg);
  padding:22px 22px 18px; position:relative; overflow:hidden;
  transition:transform .3s cubic-bezier(.34,1.4,.64,1), box-shadow .3s, border-color .3s;
  cursor:default;
}
.th-kpi::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; opacity:0; transition:opacity .3s; }
.th-kpi:hover { transform:translateY(-6px); }
.th-kpi:hover::after { opacity:1; }
.kc-blue:hover  { border-color:rgba(79,124,255,.3);  box-shadow:var(--glow-blue); }
.kc-blue::after { background:linear-gradient(90deg,transparent,#4f7cff,transparent); }
.kc-teal:hover  { border-color:rgba(0,212,170,.3);   box-shadow:var(--glow-teal); }
.kc-teal::after { background:linear-gradient(90deg,transparent,#00d4aa,transparent); }
.kc-rose:hover  { border-color:rgba(255,107,138,.3); box-shadow:var(--glow-rose); }
.kc-rose::after { background:linear-gradient(90deg,transparent,#ff6b8a,transparent); }
.kc-amber:hover { border-color:rgba(255,179,71,.3);  box-shadow:var(--glow-amber); }
.kc-amber::after{ background:linear-gradient(90deg,transparent,#ffb347,transparent); }
.kc-purple:hover { border-color:rgba(139,92,246,.3); box-shadow:var(--glow-purple); }
.kc-purple::after { background:linear-gradient(90deg,transparent,#8b5cf6,transparent); }
.kpi-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.kpi-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.kpi-badge{ font-size:10px; font-weight:600; padding:3px 9px; border-radius:100px; letter-spacing:.5px; white-space:nowrap; }
.kpi-val  { font-size:21px; font-weight:800; color:var(--text); letter-spacing:-.5px; margin-bottom:4px; }
.kpi-lbl  { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; }
.kpi-bar  { height:3px; background:var(--bg3); border-radius:2px; overflow:hidden; margin-top:16px; }
.kpi-fill { height:100%; border-radius:2px; transition:width 1.3s cubic-bezier(.4,0,.2,1); }

/* Interest Card */
.interest-card {
  background: linear-gradient(135deg, rgba(139,92,246,.1) 0%, rgba(79,70,229,.08) 100%);
  border: 1px solid rgba(139,92,246,.25);
  border-radius: var(--r-lg);
  padding: 24px;
  margin-bottom: 22px;
  position: relative;
  overflow: hidden;
}
.interest-card::before {
  content: '💹';
  position: absolute;
  font-size: 80px;
  opacity: 0.05;
  bottom: -20px;
  right: -10px;
  pointer-events: none;
}

/* ══ MAIN LAYOUT ══ */
.th-layout {
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 24px;
  align-items: start;
}
@media(max-width:1200px) { .th-layout { grid-template-columns: 1fr; } }

/* ══ FILTER ══ */
.th-filter { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); padding:22px 24px; margin-bottom:18px; }
.th-filter-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.th-filter-row { display:flex; align-items:center; gap:8px; }
.th-filter-ttl { font-size:14px; font-weight:700; color:var(--text); }
.th-clear-btn {
  display:inline-flex; align-items:center; gap:5px;
  background:rgba(255,107,138,.12); border:1px solid rgba(255,107,138,.25);
  color:var(--rose); border-radius:100px; padding:5px 13px;
  font-size:11px; font-weight:600; cursor:pointer; transition:all .2s; font-family:'Outfit',sans-serif;
}
.th-clear-btn:hover { background:rgba(255,107,138,.22); }
.th-filter-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
@media(max-width:880px){ .th-filter-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:480px){ .th-filter-grid{grid-template-columns:1fr;} }
.th-flabel { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.2px; color:var(--text3); margin-bottom:7px; }
.th-input  { width:100%; background:var(--bg2); border:1px solid var(--border2); border-radius:10px; padding:9px 12px; font-size:13px; font-family:'Outfit',sans-serif; color:var(--text); outline:none; appearance:none; transition:all .2s; }
.th-input:focus { border-color:var(--teal); background:var(--bg3); box-shadow:0 0 0 3px rgba(0,212,170,.1); }
.th-input option { background:var(--bg2); }
.th-srch { position:relative; }
.th-srch-ico { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text3); pointer-events:none; display:flex; }
.th-srch-input { width:100%; background:var(--bg2); border:1px solid var(--border2); border-radius:10px; padding:9px 12px 9px 34px; font-size:13px; font-family:'Outfit',sans-serif; color:var(--text); outline:none; transition:all .2s; }
.th-srch-input:focus { border-color:var(--teal); background:var(--bg3); box-shadow:0 0 0 3px rgba(0,212,170,.1); }
.th-srch-input::placeholder { color:var(--text3); }

/* ══ TABLE CARD ══ */
.th-tcard  { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
.th-thead  { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid var(--border); }
.th-ttitle { font-size:15px; font-weight:700; color:var(--text); }
.th-tsub   { font-size:10px; font-weight:500; color:var(--text3); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:3px; }
.th-cnt    { font-size:11px; font-weight:600; padding:4px 13px; border-radius:100px; background:rgba(0,212,170,.12); color:var(--teal); border:1px solid rgba(0,212,170,.22); }
.th-scroll { overflow-x:auto; }
.th-scroll::-webkit-scrollbar { height:3px; }
.th-scroll::-webkit-scrollbar-track { background:var(--bg3); }
.th-scroll::-webkit-scrollbar-thumb { background:var(--teal); border-radius:2px; }
.th-table  { width:100%; border-collapse:collapse; min-width:900px; }
.th-table thead tr { border-bottom:1px solid var(--border); }
.th-table th { padding:11px 16px; text-align:left; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:var(--text3); white-space:nowrap; background:var(--bg2); }
.th-table th.r { text-align:right; }
.th-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.th-table tbody tr:last-child { border-bottom:none; }
.th-table tbody tr:hover { background:rgba(79,124,255,.05); }
.th-table td { padding:13px 16px; font-size:13px; vertical-align:middle; }
.th-table td.r { text-align:right; }
.th-ty   { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; padding:4px 11px; border-radius:100px; white-space:nowrap; }
.th-ty-s { background:rgba(0,212,170,.12); color:var(--teal); border:1px solid rgba(0,212,170,.22); }
.th-ty-w { background:rgba(255,107,138,.12); color:var(--rose); border:1px solid rgba(255,107,138,.22); }
.th-ty-i { background:rgba(139,92,246,.12); color:var(--purple); border:1px solid rgba(139,92,246,.22); }
.th-ap   { color:var(--teal); font-weight:700; }
.th-an   { color:var(--rose); font-weight:700; }
.th-ai   { color:var(--purple); font-weight:700; }
.th-ad   { color:var(--text3); font-size:12px; }
.th-atp  { color:var(--teal); font-size:14px; font-weight:800; }
.th-atn  { color:var(--rose); font-size:14px; font-weight:800; }
.th-ati  { color:var(--purple); font-size:14px; font-weight:800; }
.th-dc   { display:flex; align-items:center; gap:6px; color:var(--text2); font-size:12px; }
.th-hint { text-align:center; padding:9px; font-size:11px; color:var(--text3); border-top:1px solid var(--border); }

/* ══ EMPTY / ERROR ══ */
.th-empty       { text-align:center; padding:56px 24px; }
.th-empty-icon  { font-size:44px; opacity:.25; display:block; margin-bottom:14px; }
.th-empty-title { font-size:15px; font-weight:700; color:var(--text2); margin-bottom:6px; }
.th-empty-text  { font-size:12px; color:var(--text3); }
.th-error { display:flex; align-items:center; gap:10px; background:rgba(255,107,138,.08); border:1px solid rgba(255,107,138,.22); border-radius:var(--r-md); padding:14px 18px; margin-bottom:22px; color:var(--rose); font-size:13px; }

/* ══ RIGHT COLUMN ══ */
.th-right { display:flex; flex-direction:column; gap:18px; }

/* ══ EXPORT CARD ══ */
.th-exp-card {
  background: var(--surface);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,.3);
}
.th-exp-head {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  background: var(--bg2);
}
.th-exp-head-sub   { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); margin-bottom:4px; }
.th-exp-head-title { font-size:16px; font-weight:700; color:var(--text); }
.th-exp-body { padding:20px 20px 22px; display:flex; flex-direction:column; gap:10px; }
.th-exp-desc { font-size:12px; color:var(--text3); margin-bottom:4px; }

.exp-btn {
  display: flex; align-items: center; gap: 14px;
  width: 100%; border-radius: var(--r-md); padding: 15px 17px;
  cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all .25s cubic-bezier(.34,1.2,.64,1);
  text-align: left;
}
.exp-btn:hover { transform: translateY(-2px); }
.exp-blue  { background:rgba(79,124,255,.1);  border:1px solid rgba(79,124,255,.3);  color:var(--text); }
.exp-teal  { background:rgba(0,212,170,.1);   border:1px solid rgba(0,212,170,.3);   color:var(--text); }
.exp-amber { background:rgba(255,179,71,.1);  border:1px solid rgba(255,179,71,.3);  color:var(--text); }
.exp-purple { background:rgba(139,92,246,.1); border:1px solid rgba(139,92,246,.3); color:var(--text); }
.exp-blue:hover:not(:disabled)  { background:rgba(79,124,255,.18); border-color:rgba(79,124,255,.55); box-shadow:0 8px 24px rgba(79,124,255,.15); }
.exp-teal:hover:not(:disabled)  { background:rgba(0,212,170,.18);  border-color:rgba(0,212,170,.55);  box-shadow:0 8px 24px rgba(0,212,170,.12); }
.exp-amber:hover:not(:disabled) { background:rgba(255,179,71,.18); border-color:rgba(255,179,71,.55); box-shadow:0 8px 24px rgba(255,179,71,.1); }
.exp-purple:hover:not(:disabled) { background:rgba(139,92,246,.18); border-color:rgba(139,92,246,.55); box-shadow:0 8px 24px rgba(139,92,246,.15); }
.exp-btn:disabled { opacity:.35; cursor:not-allowed; }
.exp-ico       { width:44px; height:44px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.exp-ico-blue  { background:rgba(79,124,255,.2);  color:#4f7cff; }
.exp-ico-teal  { background:rgba(0,212,170,.2);   color:#00d4aa; }
.exp-ico-amber { background:rgba(255,179,71,.2);  color:#ffb347; }
.exp-ico-purple { background:rgba(139,92,246,.2); color:#8b5cf6; }
.exp-txt   { flex:1; }
.exp-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:2px; }
.exp-sub   { font-size:11px; color:var(--text2); }
.exp-arr   { flex-shrink:0; color:var(--text3); transition:transform .2s, color .2s; }

/* ══ PERIOD SUMMARY CARD ══ */
.th-sum-card {
  background: var(--surface);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,.3);
}
.th-sum-head {
  display:flex; align-items:center; justify-content:space-between;
  padding: 20px 24px 16px;
  background: var(--bg2);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.th-sum-sub   { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); margin-bottom:4px; }
.th-sum-title { font-size:16px; font-weight:700; color:var(--text); }
.th-sum-body  { padding:4px 0; }
.th-sum-row   { display:flex; justify-content:space-between; align-items:center; padding:14px 24px; border-bottom:1px solid rgba(255,255,255,.05); }
.th-sum-row:last-child { border-bottom:none; }
.th-sum-lbl { font-size:13px; color:var(--text2); font-weight:400; }
.th-sum-val { font-size:13px; font-weight:700; }

/* ══ ANIMATIONS ══ */
@keyframes th-fadeUp { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
.th-a1{animation:th-fadeUp .45s cubic-bezier(.4,0,.2,1) both;}
.th-a2{animation:th-fadeUp .45s .07s cubic-bezier(.4,0,.2,1) both;}
.th-a3{animation:th-fadeUp .45s .14s cubic-bezier(.4,0,.2,1) both;}
.th-a4{animation:th-fadeUp .45s .21s cubic-bezier(.4,0,.2,1) both;}
.th-a5{animation:th-fadeUp .45s .28s cubic-bezier(.4,0,.2,1) both;}

.th ::-webkit-scrollbar { width:4px; }
.th ::-webkit-scrollbar-track { background:transparent; }
.th ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
`;

/* ─── Helper Functions ─────────────────────────────────────────── */
const parseDecimal = (value) => {
  if (!value || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Annual interest rate (for display only)
const ANNUAL_INTEREST_RATE = 11.5;

/* ─────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                          */
/* ─────────────────────────────────────────────────────────────────── */
const TransactionsHistory = () => {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.uid);
  const [filters, setFilters] = useState({ type:'', startDate:'', endDate:'', search:'' });

  // ── SIMPLIFIED: total interest = sum of all Interest transactions ──
  const memberInterest = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    return transactions
      .filter(tx => tx.type === 'Interest')
      .reduce((sum, tx) => sum + parseFloat(tx.otherSaving || 0), 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const list = transactions.filter(t => {
      if (filters.type && t.type !== filters.type) return false;
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return t.type.toLowerCase().includes(q) ||
               t.memberName?.toLowerCase().includes(q) ||
               t.date.includes(q);
      }
      return true;
    });
    return list.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      let amt = 0;
      if (t.type === 'Saving') {
        amt = parseFloat(t.weeklySaving||0) + parseFloat(t.munomukabi||0) + parseFloat(t.otherSaving||0);
        acc.savings += amt;
      } else if (t.type === 'Withdrawal') {
        amt = parseFloat(t.withdrawal||0);
        acc.withdrawals += amt;
      } else if (t.type === 'Interest') {
        amt = parseFloat(t.otherSaving||0);
        acc.interest += amt;
      }
      return acc;
    }, { savings:0, withdrawals:0, interest:0 });
  }, [filteredTransactions]);

  const calcTotal = (t) => {
    if (t.type === 'Saving') {
      return parseFloat(t.weeklySaving||0) + parseFloat(t.munomukabi||0) + parseFloat(t.otherSaving||0);
    } else if (t.type === 'Withdrawal') {
      return parseFloat(t.withdrawal||0);
    } else if (t.type === 'Interest') {
      return parseFloat(t.otherSaving||0);
    }
    return 0;
  };

  const fmt = (amt) => `UGX ${(amt||0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const fmtDay = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '-';

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const clearFilters = () => setFilters({ type:'', startDate:'', endDate:'', search:'' });
  const hasFilters = filters.type || filters.startDate || filters.endDate || filters.search;

  const netBalance = totals.savings - totals.withdrawals + totals.interest;
  const wdRatio = totals.savings > 0 ? Math.min(100, Math.round((totals.withdrawals / totals.savings) * 100)) : 0;
  const interestPercentage = totals.savings > 0 ? Math.min(100, Math.round((totals.interest / totals.savings) * 100)) : 0;
  const projectedAnnualInterest = netBalance * (ANNUAL_INTEREST_RATE / 100);

  /* ── Export ── */
  const exportCSV = () => {
    const rows = [
      ['Date','Type','Weekly Saving','Munomukabi','Other Saving','Withdrawal','Interest','Total'],
      ...filteredTransactions.map(t => [
        fmtDay(t.date), t.type,
        t.weeklySaving||0, t.munomukabi||0, t.otherSaving||0,
        t.withdrawal||0,
        t.type === 'Interest' ? (t.otherSaving||0) : 0,
        calcTotal(t)
      ])
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Statement</title>
          <style>
            body{font-family:Arial,sans-serif;padding:40px;color:#1a1a2e;max-width:820px;margin:0 auto;background:#f8fafc}
            h1{font-size:26px;color:#3563e9;border-bottom:3px solid #3563e9;padding-bottom:14px;margin-bottom:8px}
            .badge{display:inline-block;background:#e0e7ff;color:#3563e9;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:20px}
            .info{background:#fff;padding:16px 20px;border-radius:10px;margin:16px 0;border:1px solid #e2e8f0;display:flex;gap:14px;flex-wrap:wrap}
            .s{border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;flex:1;min-width:120px}
            .s h3{margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8}
            .s .v{font-size:18px;font-weight:800;color:#3563e9}
            .s .v.pos{color:#00b894} .s .v.neg{color:#ff6b8a} .s .v.purple{color:#8b5cf6}
            table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;margin-top:20px}
            th{background:#3563e9;color:#fff;padding:10px 12px;font-size:10px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
            td{padding:10px 12px;font-size:12px;border-bottom:1px solid #f1f5f9}
            tr:last-child td{border-bottom:none}
            .saving{color:#00b894;font-weight:700} .withdrawal{color:#ff6b8a;font-weight:700} .interest{color:#8b5cf6;font-weight:700}
            .footer{margin-top:28px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}
          </style>
        </head>
        <body>
          <h1>Transaction Statement</h1>
          <div class="badge">My Records · ${filteredTransactions.length} transactions</div>
          <div class="info">
            <div class="s"><h3>Records</h3><div class="v">${filteredTransactions.length}</div></div>
            <div class="s"><h3>Total Savings</h3><div class="v pos">${fmt(totals.savings)}</div></div>
            <div class="s"><h3>Withdrawals</h3><div class="v neg">${fmt(totals.withdrawals)}</div></div>
            <div class="s"><h3>Interest Earned</h3><div class="v purple">${fmt(totals.interest)}</div></div>
            <div class="s"><h3>Net Balance</h3><div class="v">${fmt(netBalance)}</div></div>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${fmtDay(t.date)}</td>
                  <td class="${t.type.toLowerCase()}">${t.type}</td>
                  <td style="font-weight:700;color:${t.type==='Saving'?'#00b894':t.type==='Withdrawal'?'#ff6b8a':'#8b5cf6'}">
                    ${t.type==='Saving'||t.type==='Interest'?'+':'-'}${fmt(calcTotal(t))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer"><p>Generated ${new Date().toLocaleString()} · Computer-generated · No signature required</p></div>
        </body>
      </html>
    `);
    w.document.close();
    w.onload = () => w.print();
  };

  if (loading) return <LoadingSpinner text="Loading your transactions…" />;

  const kpis = [
    {
      label:'Total Records', value:filteredTransactions.length,
      badge:`of ${transactions.length} total`,
      iconBg:'rgba(79,124,255,.18)', iconColor:'#4f7cff', barColor:'#4f7cff',
      prog: transactions.length > 0 ? Math.min(100, Math.round((filteredTransactions.length / transactions.length) * 100)) : 0,
      cls:'kc-blue',
      icon:<BarChart3 size={18} />,
    },
    {
      label:'Total Savings', value:fmt(totals.savings),
      badge:'Deposits',
      iconBg:'rgba(0,212,170,.18)', iconColor:'#00d4aa', barColor:'#00d4aa',
      prog:70, cls:'kc-teal',
      icon:<TrendingUp size={18} />,
    },
    {
      label:'Total Withdrawals', value:fmt(totals.withdrawals),
      badge:`${wdRatio}% of savings`,
      iconBg:'rgba(255,107,138,.18)', iconColor:'#ff6b8a', barColor:'#ff6b8a',
      prog:wdRatio, cls:'kc-rose',
      icon:<TrendingDown size={18} />,
    },
    {
      label:'Interest Earned', value:fmt(totals.interest),
      badge:`${interestPercentage}% APY`,
      iconBg:'rgba(139,92,246,.18)', iconColor:'#8b5cf6', barColor:'#8b5cf6',
      prog:interestPercentage, cls:'kc-purple',
      icon:<Percent size={18} />,
    },
  ];

  return (
    <div className="th">
      <style>{css}</style>

      {/* Header */}
      <div className="th-header th-a1">
        <div className="th-logo-row">
          <div className="th-dot" />
          <span className="th-portal-label">Member Portal</span>
        </div>
        <h1 className="th-title">My Transactions</h1>
        <p className="th-sub">View, filter and export your full transaction history including interest earnings</p>
      </div>

      {/* Error */}
      {error && (
        <div className="th-error">
          <AlertTriangle size={16} style={{ flexShrink:0 }} />
          <div><strong>Error loading data</strong> — {error}</div>
        </div>
      )}

      {/* Banner */}
      <div className="th-banner th-a2">
        <div className="th-orb1" /><div className="th-orb2" /><div className="th-grid" />
        <div className="th-banner-inner">
          <div>
            <div className="th-b-label">Net Balance</div>
            <div className="th-b-value">{fmt(netBalance)}</div>
            <div className="th-b-meta">
              {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''} shown
              {hasFilters && <span style={{ color:'var(--amber)' }}> · Filtered view</span>}
            </div>
          </div>
          <div className="th-b-stats">
            <div className="th-bstat">
              <div className="th-bstat-l">Savings</div>
              <div className="th-bstat-v pos">{fmt(totals.savings)}</div>
            </div>
            <div className="th-bstat">
              <div className="th-bstat-l">Withdrawn</div>
              <div className="th-bstat-v neg">{fmt(totals.withdrawals)}</div>
            </div>
            <div className="th-bstat">
              <div className="th-bstat-l">Interest</div>
              <div className="th-bstat-v" style={{ color: '#8b5cf6' }}>{fmt(totals.interest)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Summary Card */}
      {totals.interest > 0 && (
        <div className="interest-card th-a2">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <PiggyBank size={18} style={{ color: '#8b5cf6' }} />
                <h6 style={{ fontWeight: 800, margin: 0, color: '#c4b5fd' }}>Interest Summary</h6>
              </div>
              <p style={{ margin: 0, fontSize: '.85rem', color: '#a78bfa' }}>
                💰 <strong>Annual Rate: 11.5%</strong> | Daily Rate: 0.0315%
              </p>
              <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: '#c4b5fd' }}>
                Total interest earned to date: <strong>{fmt(totals.interest)}</strong> | 
                Projected annual interest: <strong>{fmt(projectedAnnualInterest)}</strong>
              </p>
            </div>
            <Gift size={24} style={{ color: '#8b5cf6', opacity: 0.5 }} />
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="th-kpi-grid th-a3">
        {kpis.map((k, i) => (
          <div key={i} className={`th-kpi ${k.cls}`}>
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background:k.iconBg, color:k.iconColor }}>{k.icon}</div>
              <span className="kpi-badge" style={{ background:k.iconBg, color:k.iconColor, border:`1px solid ${k.iconColor}44` }}>{k.badge}</span>
            </div>
            <div className="kpi-val">{k.value}</div>
            <div className="kpi-lbl">{k.label}</div>
            <div className="kpi-bar"><div className="kpi-fill" style={{ width:`${k.prog}%`, background:k.barColor }} /></div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="th-layout">
        {/* Left column */}
        <div className="th-a4">
          {/* Filter card */}
          <div className="th-filter">
            <div className="th-filter-top">
              <div className="th-filter-row">
                <SlidersHorizontal size={14} style={{ color:'var(--text2)' }} />
                <span className="th-filter-ttl">Filters</span>
              </div>
              {hasFilters && (
                <button className="th-clear-btn" onClick={clearFilters}>
                  <X size={11} /> Clear all
                </button>
              )}
            </div>
            <div className="th-filter-grid">
              <div>
                <label className="th-flabel">Type</label>
                <select className="th-input" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                  <option value="">All Types</option>
                  <option value="Saving">Savings</option>
                  <option value="Withdrawal">Withdrawals</option>
                  <option value="Interest">Interest</option>
                </select>
              </div>
              <div>
                <label className="th-flabel">Start Date</label>
                <input type="date" className="th-input" value={filters.startDate}
                  onChange={e => setFilter('startDate', e.target.value)} />
              </div>
              <div>
                <label className="th-flabel">End Date</label>
                <input type="date" className="th-input" value={filters.endDate}
                  onChange={e => setFilter('endDate', e.target.value)} />
              </div>
              <div>
                <label className="th-flabel">Search</label>
                <div className="th-srch">
                  <span className="th-srch-ico"><Search size={13} /></span>
                  <input type="text" className="th-srch-input" placeholder="Search…"
                    value={filters.search} onChange={e => setFilter('search', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="th-tcard">
            <div className="th-thead">
              <div>
                <div className="th-tsub">My Records</div>
                <div className="th-ttitle">Transaction History</div>
              </div>
              <span className="th-cnt">{filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}</span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="th-empty">
                <span className="th-empty-icon">📊</span>
                <div className="th-empty-title">No transactions found</div>
                <div className="th-empty-text">
                  {hasFilters ? 'Try adjusting or clearing your filters' : 'Your history will appear here once you start saving'}
                </div>
              </div>
            ) : (
              <>
                <div className="th-scroll">
                  <table className="th-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth:120 }}>Date</th>
                        <th style={{ minWidth:120 }}>Type</th>
                        <th className="r" style={{ minWidth:145 }}>Weekly</th>
                        <th className="r" style={{ minWidth:135 }}>Munomukabi</th>
                        <th className="r" style={{ minWidth:110 }}>Other</th>
                        <th className="r" style={{ minWidth:135 }}>Withdrawal</th>
                        <th className="r" style={{ minWidth:135 }}>Interest</th>
                        <th className="r" style={{ minWidth:145 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(t => {
                        const isSaving = t.type === 'Saving';
                        const isWithdrawal = t.type === 'Withdrawal';
                        const isInterest = t.type === 'Interest';
                        const total = calcTotal(t);
                        return (
                          <tr key={t.id}>
                            <td>
                              <div className="th-dc">
                                <Calendar size={11} />
                                {fmtDay(t.date)}
                              </div>
                            </td>
                            <td>
                              <span className={`th-ty ${isSaving ? 'th-ty-s' : isWithdrawal ? 'th-ty-w' : 'th-ty-i'}`}>
                                {isSaving ? <ArrowUpRight size={11}/> : isWithdrawal ? <ArrowDownRight size={11}/> : <Gift size={11}/>}
                                {isSaving ? 'Saving' : isWithdrawal ? 'Withdrawal' : 'Interest'}
                                {isInterest && ' (11.5% p.a.)'}
                              </span>
                            </td>
                            <td className="r">{parseFloat(t.weeklySaving) > 0 ? <span className="th-ap">{fmt(parseFloat(t.weeklySaving))}</span> : <span className="th-ad">—</span>}</td>
                            <td className="r">{parseFloat(t.munomukabi) > 0 ? <span className="th-ap">{fmt(parseFloat(t.munomukabi))}</span> : <span className="th-ad">—</span>}</td>
                            <td className="r">{parseFloat(t.otherSaving) > 0 && !isInterest ? <span className="th-ap">{fmt(parseFloat(t.otherSaving))}</span> : <span className="th-ad">—</span>}</td>
                            <td className="r">{parseFloat(t.withdrawal) > 0 ? <span className="th-an">{fmt(parseFloat(t.withdrawal))}</span> : <span className="th-ad">—</span>}</td>
                            <td className="r">{isInterest && parseFloat(t.otherSaving) > 0 ? <span className="th-ai">{fmt(parseFloat(t.otherSaving))}</span> : <span className="th-ad">—</span>}</td>
                            <td className="r">
                              <span className={isSaving ? 'th-atp' : isWithdrawal ? 'th-atn' : 'th-ati'}>
                                {(isSaving || isInterest) ? '+' : '-'}{fmt(total)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="th-hint">← Scroll horizontally to see all columns →</div>
              </>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="th-right th-a5">
          {/* Export & Print card */}
          <div className="th-exp-card">
            <div className="th-exp-head">
              <div className="th-exp-head-sub">Tools</div>
              <div className="th-exp-head-title">Export &amp; Print</div>
            </div>
            <div className="th-exp-body">
              <p className="th-exp-desc">Download your transaction history in different formats</p>

              <button className="exp-btn exp-blue" onClick={exportPDF} disabled={filteredTransactions.length === 0}>
                <div className="exp-ico exp-ico-blue"><FileText size={18} /></div>
                <div className="exp-txt">
                  <div className="exp-title">Export as PDF</div>
                  <div className="exp-sub">Printable statement with interest</div>
                </div>
                <ChevronRight size={15} className="exp-arr" />
              </button>

              <button className="exp-btn exp-teal" onClick={exportCSV} disabled={filteredTransactions.length === 0}>
                <div className="exp-ico exp-ico-teal"><Download size={18} /></div>
                <div className="exp-txt">
                  <div className="exp-title">Export as CSV</div>
                  <div className="exp-sub">Spreadsheet format</div>
                </div>
                <ChevronRight size={15} className="exp-arr" />
              </button>

              <button className="exp-btn exp-purple" onClick={exportPDF} disabled={filteredTransactions.length === 0}>
                <div className="exp-ico exp-ico-purple"><Printer size={18} /></div>
                <div className="exp-txt">
                  <div className="exp-title">Print Statement</div>
                  <div className="exp-sub">Direct to printer</div>
                </div>
                <ChevronRight size={15} className="exp-arr" />
              </button>
            </div>
          </div>

          {/* Period Summary card */}
          <div className="th-sum-card">
            <div className="th-sum-head">
              <div>
                <div className="th-sum-sub">Overview</div>
                <div className="th-sum-title">Period Summary</div>
              </div>
              <Sparkles size={15} style={{ color:'var(--amber)', opacity:.85 }} />
            </div>
            <div className="th-sum-body">
              <div className="th-sum-row">
                <span className="th-sum-lbl">Total deposits</span>
                <span className="th-sum-val" style={{ color:'#00d4aa' }}>{fmt(totals.savings)}</span>
              </div>
              <div className="th-sum-row">
                <span className="th-sum-lbl">Total withdrawn</span>
                <span className="th-sum-val" style={{ color:'#ff6b8a' }}>{fmt(totals.withdrawals)}</span>
              </div>
              <div className="th-sum-row">
                <span className="th-sum-lbl">Interest earned</span>
                <span className="th-sum-val" style={{ color:'#8b5cf6' }}>{fmt(totals.interest)}</span>
              </div>
              <div className="th-sum-row">
                <span className="th-sum-lbl">Net balance</span>
                <span className="th-sum-val" style={{ color: netBalance >= 0 ? '#00d4aa' : '#ff6b8a' }}>{fmt(netBalance)}</span>
              </div>
              <div className="th-sum-row">
                <span className="th-sum-lbl">Records shown</span>
                <span className="th-sum-val" style={{ color:'#4f7cff' }}>{filteredTransactions.length} / {transactions.length}</span>
              </div>
              <div className="th-sum-row">
                <span className="th-sum-lbl">Interest rate</span>
                <span className="th-sum-val" style={{ color:'#8b5cf6' }}>11.5% p.a. (daily)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsHistory;