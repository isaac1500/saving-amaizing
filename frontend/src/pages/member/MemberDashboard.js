// src/pages/member/MemberDashboard.js
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet,
  MessageCircle, Download, RefreshCw,
  ArrowUpRight, ArrowDownRight, Sparkles,
  ChevronRight, Activity, Percent, PiggyBank, Gift
} from 'lucide-react';

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --void:      #080b12;
    --deep:      #0d1117;
    --surface:   #111823;
    --raised:    #161d2a;
    --elevated:  #1c2535;
    --rim:       rgba(255,255,255,.06);
    --rim2:      rgba(255,255,255,.10);
    --gold:      #c9a84c;
    --gold-lt:   #e8c97e;
    --gold-dim:  rgba(201,168,76,.15);
    --gold-glow: rgba(201,168,76,.35);
    --jade:      #3ecf8e;
    --jade-dim:  rgba(62,207,142,.12);
    --ruby:      #f05252;
    --ruby-dim:  rgba(240,82,82,.12);
    --sky:       #60a5fa;
    --sky-dim:   rgba(96,165,250,.12);
    --purple:    #8b5cf6;
    --purple-dim: rgba(139,92,246,.12);
    --text:      #e8ecf4;
    --muted:     #6e7a94;
    --faint:     rgba(232,236,244,.35);
    --r-sm: 10px;
    --r-md: 16px;
    --r-lg: 24px;
    --shadow-gold: 0 0 40px rgba(201,168,76,.08), 0 8px 32px rgba(0,0,0,.4);
    --shadow-card: 0 4px 24px rgba(0,0,0,.35);
    --shadow-float: 0 16px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05);
  }

  .md-root {
    font-family: 'Outfit', sans-serif;
    background: var(--void);
    min-height: 100vh;
    color: var(--text);
    padding: 1.5rem;
    padding-top: calc(80px + 1.5rem);
  }
  @media(min-width:768px){
    .md-root {
      padding: 2rem;
      padding-top: calc(80px + 2rem);
    }
  }

  .md-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: .5;
  }

  * { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(.95); box-shadow: 0 0 0 0 rgba(201,168,76,.4); }
    70%  { transform: scale(1);   box-shadow: 0 0 0 10px rgba(201,168,76,0); }
    100% { transform: scale(.95); box-shadow: 0 0 0 0 rgba(201,168,76,0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes progress-fill {
    from { width: 0; }
  }
  @keyframes number-pop {
    0%   { transform: scale(.85); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-8px) rotate(1deg); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: .3; }
    50%       { opacity: .7; }
  }

  .anim-1 { animation: fadeSlideUp .5s cubic-bezier(.22,1,.36,1) both; }
  .anim-2 { animation: fadeSlideUp .5s .08s cubic-bezier(.22,1,.36,1) both; }
  .anim-3 { animation: fadeSlideUp .5s .16s cubic-bezier(.22,1,.36,1) both; }
  .anim-4 { animation: fadeSlideUp .5s .24s cubic-bezier(.22,1,.36,1) both; }
  .anim-5 { animation: fadeSlideUp .5s .32s cubic-bezier(.22,1,.36,1) both; }

  .md-hero {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--rim2);
    border-radius: var(--r-lg);
    padding: 2.5rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-float);
  }
  .md-hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 70% at 85% 20%, rgba(201,168,76,.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 10% 80%, rgba(62,207,142,.06) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 40% 50%, rgba(139,92,246,.06) 0%, transparent 60%);
    pointer-events: none;
  }
  .md-hero-lines {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  }
  .md-hero-lines::before {
    content: '';
    position: absolute;
    top: -50%; right: -20%;
    width: 500px; height: 500px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,.08);
  }
  .md-hero-lines::after {
    content: '';
    position: absolute;
    top: -30%; right: -5%;
    width: 300px; height: 300px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,.05);
  }

  .md-hero-content { position: relative; z-index: 1; }

  .md-live-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(201,168,76,.1);
    border: 1px solid rgba(201,168,76,.25);
    color: var(--gold-lt);
    padding: 5px 14px 5px 10px;
    border-radius: 50px;
    font-size: .7rem; font-weight: 600; letter-spacing: .5px;
    text-transform: uppercase; margin-bottom: 1.2rem;
  }
  .md-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    animation: pulse-ring 2s ease-in-out infinite;
  }

  .md-hero-greeting {
    font-size: .72rem; font-weight: 500;
    color: var(--muted); letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: .4rem;
  }
  .md-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800; color: var(--text);
    letter-spacing: -.5px; line-height: 1.1;
    margin-bottom: .3rem;
  }
  .md-hero-name span { color: var(--gold); }
  .md-hero-date {
    font-size: .8rem; color: var(--muted); font-weight: 300;
  }

  .md-period-row {
    display: inline-flex; align-items: center;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--rim);
    border-radius: 50px; padding: 4px;
    margin-top: 1.5rem; gap: 2px;
  }
  .md-period-btn {
    border: none; background: transparent;
    color: var(--muted); padding: 6px 16px;
    border-radius: 50px; font-size: .75rem;
    font-weight: 500; cursor: pointer;
    transition: all .22s cubic-bezier(.22,1,.36,1);
    font-family: 'Outfit', sans-serif;
    letter-spacing: .3px; white-space: nowrap;
  }
  .md-period-btn.active {
    background: var(--gold);
    color: #1a1200;
    font-weight: 700;
    box-shadow: 0 2px 12px rgba(201,168,76,.4);
  }

  .md-balance-panel {
    background: linear-gradient(135deg, rgba(201,168,76,.1) 0%, rgba(201,168,76,.03) 100%);
    border: 1px solid rgba(201,168,76,.2);
    border-radius: var(--r-md);
    padding: 1.8rem 2rem;
    position: relative; overflow: hidden;
    height: 100%;
  }
  .md-balance-panel::before {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(201,168,76,.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .md-balance-label {
    font-size: .68rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--gold);
    margin-bottom: .7rem;
  }
  .md-balance-value {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800; color: var(--text);
    line-height: 1; margin-bottom: .6rem;
    animation: number-pop .5s .3s cubic-bezier(.22,1,.36,1) both;
  }
  .md-balance-meta {
    display: flex; gap: 1.5rem; flex-wrap: wrap;
  }
  .md-balance-meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: .72rem; color: var(--muted);
  }
  .md-balance-meta-item .dot { width: 6px; height: 6px; border-radius: 50%; }

  .interest-card {
    background: linear-gradient(135deg, rgba(139,92,246,.08) 0%, rgba(79,70,229,.05) 100%);
    border: 1px solid rgba(139,92,246,.25);
    border-radius: var(--r-lg);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  .interest-card::before {
    content: '💹';
    position: absolute;
    font-size: 70px;
    opacity: 0.05;
    bottom: -15px;
    right: -10px;
    pointer-events: none;
  }

  .md-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media(min-width:1024px){
    .md-kpi-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .md-kpi {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: var(--r-md);
    padding: 1.4rem;
    position: relative; overflow: hidden;
    cursor: default;
    transition: transform .25s cubic-bezier(.22,1,.36,1),
                box-shadow .25s ease,
                border-color .25s ease;
    box-shadow: var(--shadow-card);
  }
  .md-kpi:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-float);
    border-color: var(--rim2);
  }
  .md-kpi-glow {
    position: absolute; top: -30px; right: -30px;
    width: 100px; height: 100px; border-radius: 50%;
    pointer-events: none; transition: opacity .3s;
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .md-kpi:hover .md-kpi-glow { opacity: 1 !important; }

  .md-kpi-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 1rem;
  }
  .md-kpi-label {
    font-size: .67rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1px; color: var(--muted); line-height: 1.4;
  }
  .md-kpi-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .md-kpi-value {
    font-family: 'Playfair Display', serif;
    font-size: 1.35rem; font-weight: 700;
    color: var(--text); line-height: 1; margin-bottom: .7rem;
  }
  .md-kpi-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: .67rem; font-weight: 600; padding: 3px 9px;
    border-radius: 50px; letter-spacing: .3px;
  }
  .badge-up   { background: var(--jade-dim); color: var(--jade); }
  .badge-down { background: var(--ruby-dim); color: var(--ruby); }
  .badge-neu  { background: var(--sky-dim);  color: var(--sky);  }
  .badge-purple { background: var(--purple-dim); color: var(--purple); }

  .md-progress {
    height: 2px; background: rgba(255,255,255,.06);
    border-radius: 2px; overflow: hidden; margin-top: .9rem;
  }
  .md-progress-bar {
    height: 100%; border-radius: 2px;
    animation: progress-fill .9s .4s cubic-bezier(.22,1,.36,1) both;
  }

  .md-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media(min-width:1024px){
    .md-main { grid-template-columns: 1fr 380px; }
  }

  .md-card {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: var(--r-md);
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: box-shadow .25s ease;
  }
  .md-card-body { padding: 1.5rem; }
  .md-card + .md-card { margin-top: 1rem; }

  .md-section-label {
    font-size: .64rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--gold); margin-bottom: .3rem;
  }
  .md-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; font-weight: 700; color: var(--text);
    letter-spacing: -.2px;
  }
  .md-view-all {
    font-size: .72rem; color: var(--gold); font-weight: 600;
    text-decoration: none; opacity: .8;
    display: flex; align-items: center; gap: 3px;
    transition: opacity .2s, transform .2s;
  }
  .md-view-all:hover { opacity: 1; transform: translateX(2px); }

  .md-tx {
    display: flex; align-items: center; gap: 1rem;
    padding: .9rem 0;
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .18s;
    border-radius: 8px;
    margin: 0 -.5rem;
    padding-left: .5rem; padding-right: .5rem;
    cursor: default;
  }
  .md-tx:last-child { border-bottom: none; }
  .md-tx:hover { background: rgba(255,255,255,.025); }

  .md-tx-icon {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: .75rem;
    transition: transform .2s;
  }
  .md-tx:hover .md-tx-icon { transform: scale(1.08); }
  .tx-save { background: var(--jade-dim); color: var(--jade); }
  .tx-with { background: var(--ruby-dim); color: var(--ruby); }
  .tx-int  { background: var(--purple-dim); color: var(--purple); }

  .md-tx-info { flex: 1; min-width: 0; }
  .md-tx-name {
    font-size: .84rem; font-weight: 500; color: var(--text);
    margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .md-tx-date {
    font-size: .7rem; color: var(--muted); margin: 0;
  }
  .md-tx-tags { display: flex; gap: 4px; margin-top: 3px; }
  .md-tx-tag {
    font-size: .6rem; padding: 1px 7px; border-radius: 50px;
    font-weight: 600; letter-spacing: .3px;
  }
  .tag-weekly { background: rgba(96,165,250,.12); color: var(--sky); }
  .tag-muno   { background: rgba(201,168,76,.1);  color: var(--gold-lt); }
  .tag-interest { background: rgba(139,92,246,.15); color: var(--purple); }

  .md-tx-amt {
    font-family: 'Playfair Display', serif;
    font-size: .95rem; font-weight: 700;
    white-space: nowrap; margin-left: auto;
  }
  .amt-pos { color: var(--jade); }
  .amt-neg { color: var(--ruby); }
  .amt-int { color: var(--purple); }

  .md-empty {
    text-align: center; padding: 3rem 1.5rem;
  }
  .md-empty-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(255,255,255,.04);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    animation: float 4s ease-in-out infinite;
  }
  .md-empty h4 {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; color: var(--text); margin-bottom: .4rem;
  }
  .md-empty p { font-size: .8rem; color: var(--muted); font-weight: 300; }

  .md-breakdown-row { margin-bottom: 1.1rem; }
  .md-breakdown-row:last-child { margin-bottom: 0; }
  .md-breakdown-info {
    display: flex; justify-content: space-between; margin-bottom: .35rem;
  }
  .md-breakdown-name { font-size: .8rem; font-weight: 500; color: var(--text); }
  .md-breakdown-val  { font-size: .8rem; font-weight: 600; color: var(--text); font-family: 'Playfair Display', serif; }
  .md-breakdown-track {
    height: 4px; background: rgba(255,255,255,.06); border-radius: 4px; overflow: hidden;
  }
  .md-breakdown-fill {
    height: 100%; border-radius: 4px;
    animation: progress-fill .9s cubic-bezier(.22,1,.36,1) both;
  }
  .md-breakdown-pct { font-size: .64rem; color: var(--muted); margin-top: 3px; }

  .md-action {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.1rem 1.2rem; border-radius: 12px; border: 1px solid var(--rim);
    cursor: pointer; width: 100%; text-align: left;
    background: var(--raised);
    transition: all .25s cubic-bezier(.22,1,.36,1);
    margin-bottom: .7rem; font-family: 'Outfit', sans-serif;
    position: relative; overflow: hidden;
  }
  .md-action:last-child { margin-bottom: 0; }
  .md-action::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.03), transparent);
    transform: translateX(-100%);
    transition: transform .4s ease;
  }
  .md-action:hover::before { transform: translateX(100%); }
  .md-action:hover {
    background: var(--elevated);
    border-color: var(--rim2);
    transform: translateX(3px);
    box-shadow: 0 4px 20px rgba(0,0,0,.3);
  }
  .md-action:disabled {
    opacity: .4; cursor: not-allowed; transform: none !important;
  }

  .md-action-icon {
    width: 42px; height: 42px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: transform .25s;
  }
  .md-action:hover .md-action-icon { transform: scale(1.1) rotate(-3deg); }
  .md-action:disabled .md-action-icon { transform: none !important; }

  .md-action-label { font-weight: 600; font-size: .86rem; color: var(--text); margin: 0 0 2px; }
  .md-action-sub   { font-size: .71rem; color: var(--muted); font-weight: 400; }
  .md-action-chevron { margin-left: auto; color: var(--muted); transition: transform .25s, color .25s; }
  .md-action:hover:not(:disabled) .md-action-chevron { transform: translateX(4px); color: var(--gold); }

  .md-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: .75rem 0;
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .18s;
  }
  .md-summary-row:last-child { border-bottom: none; }
  .md-summary-label { font-size: .8rem; color: var(--muted); font-weight: 400; }
  .md-summary-val   { font-size: .82rem; font-weight: 600; font-family: 'Playfair Display', serif; }

  .md-error {
    display: flex; align-items: flex-start; gap: .75rem;
    background: var(--ruby-dim); border: 1px solid rgba(240,82,82,.2);
    border-radius: 12px; padding: 1rem 1.2rem;
    color: var(--ruby); font-size: .83rem; margin-bottom: 1.5rem;
  }

  .spinning { animation: spin .7s linear infinite; }

  .md-shimmer {
    background: linear-gradient(90deg, var(--gold) 0%, var(--gold-lt) 50%, var(--gold) 100%);
    background-size: 400px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: var(--rim2); border-radius: 4px; }
`;

/* ─── Helper Functions ─────────────────────────────────────────── */
const parseDecimal = (value) => {
  if (!value || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const ANNUAL_INTEREST_RATE = 11.5;
const fmt = amt => `UGX ${(amt || 0).toLocaleString()}`;

/* ─── Component ──────────────────────────────────────────────────── */
const MemberDashboard = () => {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.uid);
  const [timeRange, setTimeRange] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ADMIN_WHATSAPP = '+256702251155';

  // ── Get ALL transactions for this member (not just filtered) ──
  const allMemberTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return transactions;
  }, [transactions]);

  // ── Total interest = sum of all Interest transactions ──
  const memberInterest = useMemo(() => {
    if (!allMemberTransactions || allMemberTransactions.length === 0) return 0;
    return allMemberTransactions
      .filter(tx => tx.type === 'Interest')
      .reduce((sum, tx) => sum + parseFloat(tx.otherSaving || 0), 0);
  }, [allMemberTransactions]);

  // ── Calculate ALL-TIME totals (not filtered by time range) ──
  const allTimeSavings = useMemo(() => {
    if (!allMemberTransactions || allMemberTransactions.length === 0) return 0;
    return allMemberTransactions
      .filter(t => t.type === 'Saving')
      .reduce((s, t) => s + parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0), 0);
  }, [allMemberTransactions]);

  const allTimeWithdrawals = useMemo(() => {
    if (!allMemberTransactions || allMemberTransactions.length === 0) return 0;
    return allMemberTransactions
      .filter(t => t.type === 'Withdrawal')
      .reduce((s, t) => s + parseFloat(t.withdrawal || 0), 0);
  }, [allMemberTransactions]);

  const allTimeNetBalance = allTimeSavings + memberInterest - allTimeWithdrawals;

  // ── Calculate time-range filtered totals for display ──
  const {
    totalSavings,
    totalWithdrawals,
    netBalanceWithInterest,
    recentTransactions,
    savingsGrowth,
    transactionTrend,
  } = useMemo(() => {
    if (!allMemberTransactions || allMemberTransactions.length === 0) {
      return {
        totalSavings: 0,
        totalWithdrawals: 0,
        netBalanceWithInterest: 0,
        recentTransactions: [],
        savingsGrowth: 0,
        transactionTrend: 0,
      };
    }

    const now = new Date();
    let startDate;
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(0);
    }

    const filtered = allMemberTransactions.filter(t => new Date(t.date) >= startDate);

    // Calculate savings from filtered transactions
    const savings = filtered
      .filter(t => t.type === 'Saving')
      .reduce((s, t) => s + parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0), 0);

    // Calculate withdrawals from filtered transactions
    const withdrawals = filtered
      .filter(t => t.type === 'Withdrawal')
      .reduce((s, t) => s + parseFloat(t.withdrawal || 0), 0);

    // ✅ CORRECT: Net balance = savings + interest - withdrawals (using ALL interest)
    const netWithInterest = savings + memberInterest - withdrawals;

    // Calculate growth compared to previous period
    let prevStartDate;
    if (timeRange === 'week') {
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      prevStartDate = new Date(0);
    }
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevTransactions = allMemberTransactions.filter(t => {
      const d = new Date(t.date);
      return d >= prevStartDate && d <= prevEndDate;
    });
    const prevSavings = prevTransactions
      .filter(t => t.type === 'Saving')
      .reduce((s, t) => s + parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0), 0);
    const growth = prevSavings > 0 ? ((savings - prevSavings) / prevSavings) * 100 : 0;

    return {
      totalSavings: savings,
      totalWithdrawals: withdrawals,
      netBalanceWithInterest: netWithInterest,
      recentTransactions: filtered.slice(0, 7),
      savingsGrowth: growth,
      transactionTrend: filtered.length,
    };
  }, [allMemberTransactions, timeRange, memberInterest]);

  const projectedAnnualInterest = allTimeSavings * (ANNUAL_INTEREST_RATE / 100);
  const interestPercentage = allTimeSavings > 0 ? Math.min(100, Math.round((memberInterest / allTimeSavings) * 100)) : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1500);
  };

  const handleStatement = () => {
    // [Keep existing handleStatement]
  };

  const handleWhatsApp = () => {
    // [Keep existing handleWhatsApp]
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.fullName || 'Member').split(' ')[0];

  if (error) {
    return (
      <div className="md-root" style={{ padding: '2rem' }}>
        <div className="md-error" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '8px', color: '#dc2626' }}>
          <span>⚠️</span>
          <div>
            <strong>Unable to load data</strong>
            <p style={{ margin: 0, fontSize: '.9rem' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading your dashboard…" />;

  /* KPI metrics - using ALL-TIME values for accurate totals */
  const goalPct = Math.min(100, Math.round((allTimeSavings / 1_000_000) * 100));
  const wdPct = allTimeSavings > 0 ? Math.min(100, Math.round((allTimeWithdrawals / allTimeSavings) * 100)) : 0;
  const balPct = Math.min(100, Math.round((Math.abs(allTimeNetBalance) / Math.max(allTimeSavings, 1)) * 100));

  const kpis = [
    {
      label: 'Total Savings',
      value: fmt(allTimeSavings),  // ← ALL-TIME savings
      badge: allTimeSavings > 0 ? `${Math.round(allTimeSavings / 1000)}K saved` : '0%',
      btype: 'badge-up',
      icon: <TrendingUp size={15} />,
      ibg: 'rgba(62,207,142,.15)',
      icolor: 'var(--jade)',
      prog: goalPct,
      pfill: 'var(--jade)',
      glowColor: 'rgba(62,207,142,.15)',
    },
    {
      label: 'Total Withdrawals',
      value: fmt(allTimeWithdrawals),  // ← ALL-TIME withdrawals
      badge: allTimeWithdrawals > 0 ? 'Active' : 'None',
      btype: allTimeWithdrawals > 0 ? 'badge-down' : 'badge-neu',
      icon: <TrendingDown size={15} />,
      ibg: 'rgba(240,82,82,.15)',
      icolor: 'var(--ruby)',
      prog: wdPct,
      pfill: 'var(--ruby)',
      glowColor: 'rgba(240,82,82,.15)',
    },
    {
      label: 'Interest Earned',
      value: fmt(memberInterest),  // ← ALL-TIME interest
      badge: `${interestPercentage}% APY`,
      btype: 'badge-purple',
      icon: <Percent size={15} />,
      ibg: 'rgba(139,92,246,.15)',
      icolor: 'var(--purple)',
      prog: interestPercentage,
      pfill: 'var(--purple)',
      glowColor: 'rgba(139,92,246,.15)',
    },
    {
      label: 'Net Balance',
      value: fmt(allTimeNetBalance),  // ← ALL-TIME net balance with interest
      badge: allTimeNetBalance > 0 ? 'Positive' : 'Balanced',
      btype: allTimeNetBalance > 0 ? 'badge-up' : 'badge-neu',
      icon: <Wallet size={15} />,
      ibg: 'rgba(201,168,76,.15)',
      icolor: 'var(--gold)',
      prog: balPct,
      pfill: 'var(--gold)',
      glowColor: 'rgba(201,168,76,.18)',
    },
  ];

  /* Savings breakdown data - ALL-TIME */
  const allTimeBreakdownTotal = allMemberTransactions.reduce(
    (s, t) => s + parseFloat(t.weeklySaving || 0) + parseFloat(t.munomukabi || 0) + parseFloat(t.otherSaving || 0),
    0
  );
  const breakdowns = [
    { label: 'Weekly Savings', val: allMemberTransactions.reduce((s, t) => s + parseFloat(t.weeklySaving || 0), 0), color: 'var(--sky)' },
    { label: 'Munomukabi', val: allMemberTransactions.reduce((s, t) => s + parseFloat(t.munomukabi || 0), 0), color: 'var(--gold)' },
    { label: 'Other Savings', val: allMemberTransactions.reduce((s, t) => s + parseFloat(t.otherSaving || 0), 0), color: 'var(--jade)' },
  ];

  const summaryRows = [
    { label: 'All-time savings', val: fmt(allTimeSavings), color: 'var(--jade)' },
    { label: 'All-time withdrawals', val: fmt(allTimeWithdrawals), color: 'var(--ruby)' },
    { label: 'Interest earned', val: fmt(memberInterest), color: 'var(--purple)' },
    { label: 'Total records', val: allMemberTransactions.length, color: 'var(--sky)' },
    { label: 'Period activity', val: `${transactionTrend} transactions`, color: 'var(--gold)' },
    { label: 'Interest rate', val: '11.5% p.a. (daily)', color: 'var(--purple)' },
  ];

  return (
    <div className="md-root">
      <style>{css}</style>

      {/* ══ Hero ══ */}
      <div className="md-hero anim-1">
        <div className="md-hero-bg" />
        <div className="md-hero-lines" />
        <div className="md-hero-content">
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '1.5rem' }}
            className="d-lg-grid"
          >
            <div>
              <div className="md-live-badge">
                <span className="md-live-dot" />
                Member Portal
              </div>
              <p className="md-hero-greeting">{greeting}</p>
              <h1 className="md-hero-name">
                {firstName} <span className="md-shimmer">✦</span>
              </h1>
              <p className="md-hero-date">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="md-period-row">
                {[
                  ['week', 'This Week'],
                  ['month', 'This Month'],
                  ['all', 'All Time']
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={`md-period-btn ${timeRange === v ? 'active' : ''}`}
                    onClick={() => setTimeRange(v)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="md-balance-panel" style={{ minWidth: '260px' }}>
              <div className="md-balance-label">
                <Activity size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Net Balance (with Interest)
              </div>
              <div className="md-balance-value">{fmt(allTimeNetBalance)}</div>
              <div className="md-balance-meta">
                <div className="md-balance-meta-item">
                  <span className="dot" style={{ background: 'var(--jade)' }} />
                  {fmt(allTimeSavings)} saved
                </div>
                <div className="md-balance-meta-item">
                  <span className="dot" style={{ background: 'var(--ruby)' }} />
                  {fmt(allTimeWithdrawals)} withdrawn
                </div>
                <div className="md-balance-meta-item">
                  <span className="dot" style={{ background: 'var(--purple)' }} />
                  +{fmt(memberInterest)} interest
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Interest Summary Card ══ */}
      {memberInterest > 0 && (
        <div className="interest-card anim-2">
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
                Total interest earned to date: <strong>{fmt(memberInterest)}</strong> | 
                Projected annual interest: <strong>{fmt(projectedAnnualInterest)}</strong>
              </p>
            </div>
            <Gift size={24} style={{ color: '#8b5cf6', opacity: 0.5 }} />
          </div>
        </div>
      )}

      {/* ══ KPI Grid ══ */}
      <div className="md-kpi-grid anim-2">
        {kpis.map((k, i) => (
          <div key={i} className="md-kpi">
            <div className="md-kpi-glow" style={{ background: k.glowColor, opacity: .6 }} />
            <div className="md-kpi-header">
              <div className="md-kpi-label">{k.label}</div>
              <div className="md-kpi-icon" style={{ background: k.ibg, color: k.icolor }}>
                {k.icon}
              </div>
            </div>
            <div className="md-kpi-value">{k.value}</div>
            <span className={`md-kpi-badge ${k.btype}`}>{k.badge}</span>
            <div className="md-progress">
              <div className="md-progress-bar" style={{ width: `${k.prog}%`, background: k.pfill }} />
            </div>
          </div>
        ))}
      </div>

      {/* ══ Main Grid ══ */}
      <div className="md-main">
        {/* Left — Transactions + Breakdown */}
        <div className="anim-3">
          <div className="md-card">
            <div className="md-card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <div>
                  <div className="md-section-label">Recent Activity</div>
                  <div className="md-section-title">Transactions</div>
                </div>
                <Link to="/member/transactions" className="md-view-all">
                  View all <ChevronRight size={13} />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="md-empty">
                  <div className="md-empty-icon">
                    <Sparkles size={26} color="var(--gold)" />
                  </div>
                  <h4>No transactions yet</h4>
                  <p>Your history will appear here once you start saving</p>
                </div>
              ) : (
                recentTransactions.map(tx => {
                  const isSaving = tx.type === 'Saving';
                  const isWithdrawal = tx.type === 'Withdrawal';
                  const isInterest = tx.type === 'Interest';
                  let amt = 0;
                  let displayType = '';
                  if (isSaving) {
                    amt = parseFloat(tx.weeklySaving || 0) + parseFloat(tx.munomukabi || 0) + parseFloat(tx.otherSaving || 0);
                    displayType = 'Savings';
                  } else if (isWithdrawal) {
                    amt = parseFloat(tx.withdrawal || 0);
                    displayType = 'Withdrawal';
                  } else if (isInterest) {
                    amt = parseFloat(tx.otherSaving || 0);
                    displayType = 'Interest';
                  }
                  return (
                    <div key={tx.id} className="md-tx">
                      <div className={`md-tx-icon ${isSaving ? 'tx-save' : isWithdrawal ? 'tx-with' : 'tx-int'}`}>
                        {isSaving ? <ArrowUpRight size={15} /> : isWithdrawal ? <ArrowDownRight size={15} /> : <Gift size={15} />}
                      </div>
                      <div className="md-tx-info">
                        <p className="md-tx-name">{displayType}</p>
                        <p className="md-tx-date">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {isSaving && (
                          <div className="md-tx-tags">
                            {tx.weeklySaving > 0 && <span className="md-tx-tag tag-weekly">Weekly</span>}
                            {tx.munomukabi > 0 && <span className="md-tx-tag tag-muno">Munomukabi</span>}
                          </div>
                        )}
                        {isInterest && (
                          <div className="md-tx-tags">
                            <span className="md-tx-tag tag-interest">11.5% p.a.</span>
                          </div>
                        )}
                      </div>
                      <div className={`md-tx-amt ${isSaving || isInterest ? 'amt-pos' : 'amt-neg'}`}>
                        {isSaving || isInterest ? '+' : '-'}{fmt(amt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Savings Breakdown */}
          {allTimeBreakdownTotal > 0 && (
            <div className="md-card" style={{ marginTop: '1rem' }}>
              <div className="md-card-body">
                <div className="md-section-label">Composition</div>
                <div className="md-section-title" style={{ marginBottom: '1.3rem' }}>Savings Breakdown</div>
                {breakdowns.map(item => {
                  const pct = allTimeBreakdownTotal > 0 ? (item.val / allTimeBreakdownTotal) * 100 : 0;
                  return (
                    <div key={item.label} className="md-breakdown-row">
                      <div className="md-breakdown-info">
                        <span className="md-breakdown-name">{item.label}</span>
                        <span className="md-breakdown-val">{fmt(item.val)}</span>
                      </div>
                      <div className="md-breakdown-track">
                        <div className="md-breakdown-fill" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                      <div className="md-breakdown-pct">{Math.round(pct)}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — Actions + Summary */}
        <div className="anim-4">
          {/* Quick Actions */}
          <div className="md-card" style={{ marginBottom: '1rem' }}>
            <div className="md-card-body">
              <div className="md-section-label">Tools</div>
              <div className="md-section-title" style={{ marginBottom: '1.2rem' }}>Quick Actions</div>

              <button
                className="md-action"
                onClick={handleStatement}
                disabled={allMemberTransactions.length === 0}
              >
                <div className="md-action-icon" style={{ background: 'rgba(96,165,250,.12)', color: 'var(--sky)' }}>
                  <Download size={17} />
                </div>
                <div>
                  <p className="md-action-label">Generate Statement</p>
                  <span className="md-action-sub">Print your transaction history with interest</span>
                </div>
                <ChevronRight size={15} className="md-action-chevron" />
              </button>

              <button className="md-action" onClick={handleWhatsApp}>
                <div className="md-action-icon" style={{ background: 'rgba(62,207,142,.12)', color: 'var(--jade)' }}>
                  <MessageCircle size={17} />
                </div>
                <div>
                  <p className="md-action-label">Contact Admin</p>
                  <span className="md-action-sub">Get help via WhatsApp</span>
                </div>
                <ChevronRight size={15} className="md-action-chevron" />
              </button>

              <button className="md-action" onClick={handleRefresh} disabled={isRefreshing}>
                <div className="md-action-icon" style={{ background: 'rgba(201,168,76,.12)', color: 'var(--gold)' }}>
                  <RefreshCw size={17} className={isRefreshing ? 'spinning' : ''} />
                </div>
                <div>
                  <p className="md-action-label">{isRefreshing ? 'Refreshing…' : 'Refresh Data'}</p>
                  <span className="md-action-sub">Sync latest transactions</span>
                </div>
                <ChevronRight size={15} className="md-action-chevron" />
              </button>
            </div>
          </div>

          {/* Account Summary */}
          <div className="md-card">
            <div className="md-card-body">
              <div className="md-section-label">Overview</div>
              <div className="md-section-title" style={{ marginBottom: '1.1rem' }}>Account Summary</div>
              {summaryRows.map((row, i) => (
                <div key={i} className="md-summary-row">
                  <span className="md-summary-label">{row.label}</span>
                  <span className="md-summary-val" style={{ color: row.color }}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;