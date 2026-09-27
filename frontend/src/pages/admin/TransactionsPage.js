import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useMembers } from '../../hooks/useMembers';
import AutoSuggest from '../../components/AutoSuggest';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  TrendingUp, TrendingDown, Wallet, Plus,
  Trash2, Calendar, Filter, X, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Save,
  BarChart3, CheckCircle, DollarSign, Users,
  Clock, RefreshCw, Download, Printer,
  Percent, PiggyBank, Award, Target, Gift,
  ChevronDown, Sparkles, CircleDot, User
} from 'lucide-react';

/* ─── CSS Styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');

  :root {
    --ink:        #0d0f14;
    --ink2:       #52596b;
    --ink3:       #9ba3b4;
    --surface:    #f3f4f7;
    --card:       #ffffff;
    --border:     #e6e9f0;
    --border2:    #d0d5e2;
    --accent:     #1a56db;
    --accent-lt:  #e8effe;
    --green:      #0d9f6e;
    --green-lt:   #d6f5ea;
    --red:        #e02424;
    --red-lt:     #fde8e8;
    --amber:      #d97706;
    --amber-lt:   #fef3c7;
    --purple:     #7c3aed;
    --purple-lt:  #ede9fe;
    --gold:       #c9a84c;
    --gold-lt:    #fdf6e3;
    --shadow-xs:  0 1px 2px rgba(0,0,0,.04);
    --shadow-sm:  0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md:  0 6px 24px rgba(0,0,0,.07), 0 2px 6px rgba(0,0,0,.04);
    --shadow-lg:  0 16px 48px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.05);
    --shadow-xl:  0 32px 64px rgba(0,0,0,.13), 0 8px 24px rgba(0,0,0,.06);
  }

  .tp {
    font-family: 'Sora', sans-serif;
    background: var(--surface);
    min-height: 100vh;
    color: var(--ink);
  }

  .tp-hero {
    background: #0d0f14;
    border-radius: 24px;
    padding: 2.5rem 2.75rem;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
  }
  .tp-hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .tp-hero-glow {
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(26,86,219,.18) 0%, transparent 65%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .tp-hero-glow2 {
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(13,159,110,.12) 0%, transparent 65%);
    bottom: -100px; left: 80px;
    pointer-events: none;
  }
  .tp-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.65);
    padding: 5px 14px;
    border-radius: 100px;
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .8px;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }
  .tp-hero-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
    animation: breathe 2.2s ease-in-out infinite;
  }
  @keyframes breathe {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.4; transform:scale(1.3); }
  }
  .tp-hero-title {
    font-family: 'Fraunces', serif;
    font-size: clamp(1.9rem, 3.5vw, 2.6rem);
    font-weight: 700;
    color: #fff;
    letter-spacing: -.02em;
    line-height: 1.15;
    margin: 0 0 .4rem;
  }
  .tp-hero-sub {
    font-size: .82rem;
    color: rgba(255,255,255,.4);
    margin: 0;
    font-weight: 400;
  }

  .tp-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    background: linear-gradient(135deg, #1a56db 0%, #1244b5 100%);
    color: #fff;
    padding: .72rem 1.6rem;
    border-radius: 12px;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 4px 16px rgba(26,86,219,.4), inset 0 1px 0 rgba(255,255,255,.15);
    letter-spacing: .2px;
  }
  .tp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,86,219,.5), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .tp-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.7);
    padding: .6rem 1.2rem;
    border-radius: 10px;
    font-family: 'Sora', sans-serif;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
    margin-left: .6rem;
  }
  .tp-btn-ghost:hover {
    background: rgba(255,255,255,.12);
    color: #fff;
    transform: translateY(-1px);
  }

  .tp-kpi-strip { margin-top: -28px; position: relative; z-index: 10; }
  .tp-kpi {
    background: var(--card);
    border-radius: 18px;
    padding: 1.4rem 1.5rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    transition: all .28s cubic-bezier(.4,0,.2,1);
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .tp-kpi::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 0 0 18px 18px;
    opacity: 0;
    transition: opacity .3s;
  }
  .tp-kpi:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
  .tp-kpi:hover::after { opacity: 1; }
  .tp-kpi.c-blue::after  { background: linear-gradient(90deg, #1a56db, #60a5fa); }
  .tp-kpi.c-red::after   { background: linear-gradient(90deg, #e02424, #f87171); }
  .tp-kpi.c-green::after { background: linear-gradient(90deg, #0d9f6e, #34d399); }
  .tp-kpi.c-purple::after{ background: linear-gradient(90deg, #7c3aed, #a78bfa); }

  .tp-kpi-label {
    font-size: .64rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    color: var(--ink3);
    margin-bottom: .6rem;
  }
  .tp-kpi-value {
    font-family: 'DM Mono', monospace;
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.2;
    margin-bottom: .6rem;
    letter-spacing: -.5px;
  }
  .tp-kpi-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .tp-badge {
    font-size: .63rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 100px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    letter-spacing: .2px;
  }
  .tp-badge.up     { background: var(--green-lt); color: #065f46; }
  .tp-badge.down   { background: var(--red-lt);   color: #991b1b; }
  .tp-badge.neu    { background: var(--accent-lt); color: #1e40af; }
  .tp-badge.purple { background: var(--purple-lt); color: #5b21b6; }
  .tp-badge.amber  { background: var(--amber-lt);  color: #92400e; }

  .tp-spark {
    height: 36px;
    margin-top: .8rem;
    display: flex;
    align-items: flex-end;
    gap: 3px;
  }
  .tp-spark-bar {
    flex: 1;
    border-radius: 3px 3px 0 0;
    min-height: 4px;
    transition: height .8s cubic-bezier(.4,0,.2,1);
  }

  .tp-filter {
    background: var(--card);
    border-radius: 18px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    padding: 1.25rem 1.5rem;
  }
  .tp-filter-row { display: flex; flex-wrap: wrap; gap: .75rem; align-items: flex-end; }
  .tp-filter-label {
    display: block;
    font-size: .62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--ink3);
    margin-bottom: .35rem;
  }
  .tp-filter-input {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: .6rem .85rem;
    font-size: .82rem;
    font-family: 'Sora', sans-serif;
    color: var(--ink);
    transition: all .2s;
    outline: none;
    width: 100%;
  }
  .tp-filter-input:focus {
    border-color: var(--accent);
    background: var(--card);
    box-shadow: 0 0 0 3px rgba(26,86,219,.1);
  }
  .tp-filter-section-label {
    font-size: .76rem;
    font-weight: 600;
    color: var(--ink2);
    display: flex;
    align-items: center;
    gap: .4rem;
    margin-bottom: .85rem;
  }
  .tp-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    background: var(--surface);
    border: 1.5px solid var(--border2);
    color: var(--ink2);
    border-radius: 10px;
    padding: .58rem 1.1rem;
    font-family: 'Sora', sans-serif;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }
  .tp-clear-btn:hover {
    border-color: var(--red);
    color: var(--red);
    background: var(--red-lt);
  }

  .tp-table-card {
    background: var(--card);
    border-radius: 18px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }
  .tp-table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: #fafbfd;
  }
  .tp-stitle {
    font-family: 'Fraunces', serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: .6rem;
  }
  .tp-count {
    font-size: .7rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 100px;
    background: var(--accent-lt);
    color: var(--accent);
    font-family: 'DM Mono', monospace;
  }
  .tp-table-scroll { overflow-x: auto; }
  .tp-table { width: 100%; border-collapse: collapse; min-width: 850px; }
  .tp-table thead tr { background: #fafbfd; border-bottom: 2px solid var(--border); }
  .tp-table th {
    padding: .75rem 1rem;
    text-align: left;
    font-size: .62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ink3);
    white-space: nowrap;
  }
  .tp-table th.r { text-align: right; }
  .tp-table th.c { text-align: center; }
  .tp-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
  .tp-table tbody tr:last-child { border-bottom: none; }
  .tp-table tbody tr:hover { background: #f8faff; }
  .tp-table td { padding: .85rem 1rem; font-size: .82rem; vertical-align: middle; }
  .tp-table td.r { text-align: right; }
  .tp-table td.c { text-align: center; }

  .tp-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: .68rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 100px;
    letter-spacing: .2px;
  }
  .tp-chip.save { background: var(--green-lt); color: #065f46; }
  .tp-chip.wd   { background: var(--red-lt);   color: #991b1b; }
  .tp-chip.int  { background: var(--purple-lt); color: #5b21b6; }

  .mono-pos  { font-family: 'DM Mono', monospace; color: var(--green);  font-weight: 500; font-size: .82rem; }
  .mono-neg  { font-family: 'DM Mono', monospace; color: var(--red);    font-weight: 500; font-size: .82rem; }
  .mono-int  { font-family: 'DM Mono', monospace; color: var(--purple); font-weight: 500; font-size: .82rem; }
  .mono-dash { color: var(--border2); font-size: .9rem; }

  .tp-empty { text-align: center; padding: 4rem 2rem; }
  .tp-empty-icon {
    width: 64px; height: 64px;
    background: var(--surface);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--ink3);
  }

  .tp-error {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    background: var(--red-lt);
    border: 1px solid #fca5a5;
    border-radius: 14px;
    padding: 1rem 1.25rem;
    color: var(--red);
    font-size: .82rem;
  }

  .tp-int-banner {
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
    border-radius: 18px;
    border: 1px solid #c4b5fd;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .tp-int-rate {
    font-family: 'DM Mono', monospace;
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--purple);
    letter-spacing: -.5px;
  }

  .tp-scroll-hint {
    text-align: center;
    padding: 8px;
    font-size: .63rem;
    color: var(--ink3);
    background: #fafbfd;
    border-top: 1px solid var(--border);
    letter-spacing: .3px;
  }

  .tp-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 10, 16, 0.72);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
    animation: overlayIn .2s ease;
  }
  @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }

  .tp-modal {
    background: var(--card);
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 40px 80px rgba(0,0,0,.25),
      0 0 0 1px rgba(255,255,255,.6),
      inset 0 1px 0 rgba(255,255,255,.9);
    animation: modalIn .28s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes modalIn {
    from { opacity:0; transform: translateY(24px) scale(.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  .tp-modal-hdr {
    position: relative;
    padding: 1.75rem 2rem 0;
    background: linear-gradient(180deg, #fafbfd 0%, #ffffff 100%);
    flex-shrink: 0;
  }
  .tp-modal-hdr-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .tp-modal-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #1a56db 0%, #1244b5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 8px 20px rgba(26,86,219,.35);
    flex-shrink: 0;
  }
  .tp-modal-title {
    font-family: 'Fraunces', serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 .2rem;
    letter-spacing: -.01em;
  }
  .tp-modal-subtitle {
    font-size: .75rem;
    color: var(--ink3);
    margin: 0;
    font-weight: 400;
  }
  .tp-modal-close {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink2);
    transition: all .18s;
    flex-shrink: 0;
  }
  .tp-modal-close:hover { background: var(--red-lt); border-color: #fca5a5; color: var(--red); }

  .tp-type-selector {
    display: flex;
    gap: .6rem;
    padding: 0 2rem 1.5rem;
    background: linear-gradient(180deg, #fafbfd 0%, #ffffff 100%);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .tp-type-option {
    flex: 1;
    position: relative;
    border: 2px solid var(--border);
    border-radius: 14px;
    padding: 1rem 1rem .85rem;
    cursor: pointer;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    background: var(--surface);
    text-align: center;
    overflow: hidden;
  }
  .tp-type-option::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity .22s;
  }
  .tp-type-option.save::before  { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
  .tp-type-option.wd::before    { background: linear-gradient(135deg, #fff1f2 0%, #fde8e8 100%); }
  .tp-type-option.active::before { opacity: 1; }
  .tp-type-option.save.active  { border-color: var(--green); box-shadow: 0 0 0 4px rgba(13,159,110,.12); }
  .tp-type-option.wd.active    { border-color: var(--red);   box-shadow: 0 0 0 4px rgba(224,36,36,.1); }
  .tp-type-option:not(.active):hover {
    border-color: var(--border2);
    background: var(--card);
    transform: translateY(-1px);
  }
  .tp-type-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto .6rem;
    transition: all .22s;
    position: relative;
  }
  .tp-type-option.save .tp-type-icon {
    background: var(--green-lt);
    color: var(--green);
  }
  .tp-type-option.save.active .tp-type-icon {
    background: var(--green);
    color: #fff;
    box-shadow: 0 4px 12px rgba(13,159,110,.4);
  }
  .tp-type-option.wd .tp-type-icon {
    background: var(--red-lt);
    color: var(--red);
  }
  .tp-type-option.wd.active .tp-type-icon {
    background: var(--red);
    color: #fff;
    box-shadow: 0 4px 12px rgba(224,36,36,.35);
  }
  .tp-type-label {
    font-family: 'Sora', sans-serif;
    font-size: .8rem;
    font-weight: 700;
    color: var(--ink2);
    transition: color .2s;
    position: relative;
  }
  .tp-type-option.save.active .tp-type-label { color: #065f46; }
  .tp-type-option.wd.active   .tp-type-label { color: #991b1b; }
  .tp-type-sub {
    font-size: .62rem;
    font-weight: 400;
    color: var(--ink3);
    margin-top: 2px;
    position: relative;
    transition: color .2s;
  }
  .tp-type-option.save.active .tp-type-sub { color: rgba(6,95,70,.6); }
  .tp-type-option.wd.active   .tp-type-sub { color: rgba(153,27,27,.6); }
  .tp-type-check {
    position: absolute;
    top: .6rem;
    right: .6rem;
    opacity: 0;
    transition: all .2s;
    transform: scale(.5);
  }
  .tp-type-option.active .tp-type-check {
    opacity: 1;
    transform: scale(1);
  }

  .tp-modal-body {
    padding: 1.75rem 2rem;
    overflow-y: auto;
    flex: 1;
  }
  .tp-modal-body::-webkit-scrollbar { width: 4px; }
  .tp-modal-body::-webkit-scrollbar-track { background: transparent; }
  .tp-modal-body::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 100px; }

  .tp-field { margin-bottom: 1.2rem; }
  .tp-field:last-child { margin-bottom: 0; }
  .tp-field-label {
    display: flex;
    align-items: center;
    gap: .4rem;
    font-size: .65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .9px;
    color: var(--ink2);
    margin-bottom: .45rem;
  }
  .tp-field-label .req { color: var(--accent); }

  .tp-input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: .72rem 1rem;
    font-size: .87rem;
    font-family: 'Sora', sans-serif;
    color: var(--ink);
    transition: all .2s;
    outline: none;
    box-sizing: border-box;
  }
  .tp-input:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 3.5px rgba(26,86,219,.1);
  }
  .tp-input.err {
    border-color: var(--red);
    background: #fff9f9;
  }
  .tp-input.err:focus {
    box-shadow: 0 0 0 3.5px rgba(224,36,36,.1);
  }

  .tp-amount-wrap {
    position: relative;
  }
  .tp-amount-prefix {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    display: flex;
    align-items: center;
    padding: 0 .9rem;
    font-family: 'DM Mono', monospace;
    font-size: .72rem;
    font-weight: 500;
    color: var(--ink3);
    border-right: 1.5px solid var(--border);
    pointer-events: none;
    white-space: nowrap;
  }
  .tp-amount-input {
    padding-left: 4.2rem !important;
    font-family: 'DM Mono', monospace !important;
    font-size: .92rem !important;
    letter-spacing: -.3px;
  }

  .tp-field-err {
    font-size: .68rem;
    color: var(--red);
    margin-top: .4rem;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
  .tp-field-hint {
    font-size: .65rem;
    color: var(--ink3);
    margin-top: .35rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tp-member-confirm {
    display: flex;
    align-items: center;
    gap: .6rem;
    background: var(--green-lt);
    border: 1px solid #6ee7b7;
    border-radius: 10px;
    padding: .65rem 1rem;
    margin-top: .6rem;
    font-size: .8rem;
    color: #065f46;
    font-weight: 600;
  }
  .tp-member-avatar {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: .65rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .tp-divider {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin: 1.4rem 0 1.2rem;
  }
  .tp-divider-line { flex: 1; height: 1px; background: var(--border); }
  .tp-divider-label {
    font-size: .62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ink3);
    white-space: nowrap;
  }

  .tp-amount-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .75rem; }
  @media (max-width: 500px) { .tp-amount-grid { grid-template-columns: 1fr; } }

  .tp-amount-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 1rem;
    transition: all .2s;
    cursor: text;
  }
  .tp-amount-card:focus-within {
    border-color: var(--green);
    background: #fff;
    box-shadow: 0 0 0 3.5px rgba(13,159,110,.1);
  }
  .tp-amount-card-label {
    font-size: .6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--ink3);
    margin-bottom: .45rem;
  }
  .tp-amount-card-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 1rem;
    font-weight: 500;
    color: var(--ink);
    outline: none;
    padding: 0;
    letter-spacing: -.3px;
  }
  .tp-amount-card-input::placeholder { color: var(--border2); font-size: .9rem; }
  .tp-amount-card-currency {
    font-size: .58rem;
    font-weight: 600;
    color: var(--ink3);
    margin-top: .25rem;
    font-family: 'DM Mono', monospace;
  }

  .tp-wd-field {
    background: linear-gradient(135deg, #fff1f2 0%, #fde8e8 100%);
    border: 1.5px solid #fca5a5;
    border-radius: 16px;
    padding: 1.25rem;
  }
  .tp-wd-field:focus-within {
    border-color: var(--red);
    box-shadow: 0 0 0 4px rgba(224,36,36,.1);
  }
  .tp-wd-label {
    font-size: .62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .9px;
    color: #991b1b;
    margin-bottom: .5rem;
    display: flex;
    align-items: center;
    gap: .4rem;
  }
  .tp-wd-input-row { display: flex; align-items: center; gap: .6rem; }
  .tp-wd-currency {
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    font-weight: 500;
    color: #ef4444;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tp-wd-input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--red);
    outline: none;
    padding: 0;
    letter-spacing: -.5px;
    min-width: 0;
  }
  .tp-wd-input::placeholder { color: #fca5a5; }

  .tp-modal-ftr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 2rem 1.5rem;
    border-top: 1px solid var(--border);
    background: #fafbfd;
    flex-shrink: 0;
  }
  .tp-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    border: none;
    border-radius: 12px;
    padding: .78rem 1.75rem;
    font-family: 'Sora', sans-serif;
    font-size: .84rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    letter-spacing: .1px;
  }
  .tp-submit-btn.save {
    background: linear-gradient(135deg, #0d9f6e 0%, #057a55 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(13,159,110,.4), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .tp-submit-btn.save:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13,159,110,.5), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .tp-submit-btn.wd {
    background: linear-gradient(135deg, #e02424 0%, #b91c1c 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(224,36,36,.35), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .tp-submit-btn.wd:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(224,36,36,.45), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .tp-cancel-btn {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    background: transparent;
    border: 1.5px solid var(--border2);
    border-radius: 12px;
    padding: .76rem 1.4rem;
    font-family: 'Sora', sans-serif;
    font-size: .82rem;
    font-weight: 600;
    color: var(--ink2);
    cursor: pointer;
    transition: all .2s;
  }
  .tp-cancel-btn:hover {
    background: var(--surface);
    border-color: var(--ink3);
    color: var(--ink);
  }
  .tp-ftr-total {
    font-family: 'DM Mono', monospace;
    font-size: .78rem;
    color: var(--ink3);
    flex: 1;
  }
  .tp-ftr-total strong {
    font-size: .9rem;
    color: var(--green);
    display: block;
    font-weight: 500;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .tp .tp-hero       { animation: fadeUp .38s ease both; }
  .tp .tp-kpi-strip  { animation: fadeUp .38s .1s ease both; }
  .tp .tp-filter     { animation: fadeUp .38s .18s ease both; }
  .tp .tp-table-card { animation: fadeUp .38s .24s ease both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .8s linear infinite; }
`;

/* ─── Helpers ──────────────────────────────────────────────────────── */
const parseDecimal = v => { if (!v || v === '') return 0; const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const ANNUAL_INTEREST_RATE = 11.5;
const initials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

/* ─── Component ──────────────────────────────────────────────────────── */
const TransactionsPage = () => {
  const { user } = useAuth();
  const { transactions, loading, error, addTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const { members, loading: membersLoading, error: membersError, refreshMembers } = useMembers();

  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ memberId: '', startDate: '', endDate: '', type: '' });
  const [showInterestDetails, setShowInterestDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initialForm = {
    memberId: '', memberName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Saving',
    weeklySaving: '', munomukabi: '', otherSaving: '', withdrawal: '',
    enteredBy: user?.uid || 'admin',
  };
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const allTransactions = useMemo(() => transactions || [], [transactions]);

  // ── Member Summary ──
  const memberSummary = useMemo(() => {
    const map = new Map();
    allTransactions.forEach(tx => {
      if (filters.memberId && tx.memberId !== filters.memberId) return;
      if (filters.type && tx.type !== filters.type) return;
      if (filters.startDate && tx.date < filters.startDate) return;
      if (filters.endDate && tx.date > filters.endDate) return;

      if (!map.has(tx.memberId)) {
        map.set(tx.memberId, {
          id: tx.memberId,
          name: tx.memberName || 'Unknown',
          savings: 0,
          withdrawals: 0,
          interest: 0,
          netBalance: 0,
          transactionCount: 0,
        });
      }
      const m = map.get(tx.memberId);
      m.transactionCount += 1;
      if (tx.type === 'Saving') {
        const amt = parseDecimal(tx.weeklySaving) + parseDecimal(tx.munomukabi) + parseDecimal(tx.otherSaving);
        m.savings += amt;
        m.netBalance += amt;
      } else if (tx.type === 'Withdrawal') {
        const amt = parseDecimal(tx.withdrawal);
        m.withdrawals += amt;
        m.netBalance -= amt;
      } else if (tx.type === 'Interest') {
        const amt = parseDecimal(tx.otherSaving);
        m.interest += amt;
        m.netBalance += amt;
      }
    });
    return Array.from(map.values());
  }, [allTransactions, filters]);

  // ── Overall KPIs ──
  const totals = useMemo(() => {
    let totalSavings = 0, totalWithdrawals = 0, totalInterest = 0;
    allTransactions.forEach(tx => {
      if (filters.memberId && tx.memberId !== filters.memberId) return;
      if (filters.type && tx.type !== filters.type) return;
      if (filters.startDate && tx.date < filters.startDate) return;
      if (filters.endDate && tx.date > filters.endDate) return;
      if (tx.type === 'Saving') {
        totalSavings += parseDecimal(tx.weeklySaving) + parseDecimal(tx.munomukabi) + parseDecimal(tx.otherSaving);
      } else if (tx.type === 'Withdrawal') {
        totalWithdrawals += parseDecimal(tx.withdrawal);
      } else if (tx.type === 'Interest') {
        totalInterest += parseDecimal(tx.otherSaving);
      }
    });
    return { totalSavings, totalWithdrawals, totalInterest, netBalance: totalSavings + totalInterest - totalWithdrawals };
  }, [allTransactions, filters]);

  const fmt = amt => `UGX ${(amt || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const fmtDay = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  // ── Refresh Handler ──
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshTransactions(),
        refreshMembers()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Modal form handlers ──
  const formTotal = useMemo(() => {
    if (form.type === 'Saving')
      return parseDecimal(form.weeklySaving) + parseDecimal(form.munomukabi) + parseDecimal(form.otherSaving);
    return parseDecimal(form.withdrawal);
  }, [form]);

  const validateForm = () => {
    const e = {};
    if (!form.memberId) e.member = 'Please select a member';
    if (!form.date) e.date = 'Date is required';
    if (form.type === 'Saving') {
      if (parseDecimal(form.weeklySaving) + parseDecimal(form.munomukabi) + parseDecimal(form.otherSaving) <= 0)
        e.amount = 'Enter at least one savings amount';
    } else if (parseDecimal(form.withdrawal) <= 0) {
      e.withdrawal = 'Withdrawal amount is required';
    }
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleMemberSelect = member => {
    if (!member?.id) return;
    setSelectedMember(member);
    setForm(p => ({ ...p, memberId: member.id, memberName: member.fullName || member.username }));
    if (formErrors.member) setFormErrors(p => ({ ...p, member: '' }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await addTransaction({ ...form, weeklySaving: parseDecimal(form.weeklySaving), munomukabi: parseDecimal(form.munomukabi), otherSaving: parseDecimal(form.otherSaving), withdrawal: parseDecimal(form.withdrawal), enteredBy: user?.uid || 'admin' });
      await handleRefresh();
      closeModal();
    } catch (err) { console.error(err); }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setSelectedMember(null);
    setFormErrors({});
  };

  const clearFilters = () => setFilters({ memberId: '', startDate: '', endDate: '', type: '' });
  const hasFilters = filters.memberId || filters.startDate || filters.endDate || filters.type;
  const wdRatio = totals.totalSavings > 0 ? Math.min(100, Math.round((totals.totalWithdrawals / totals.totalSavings) * 100)) : 0;

  if (loading || membersLoading) return <LoadingSpinner text="Loading transactions…" />;

  const kpis = [
    { label: 'Total Savings', value: fmt(totals.totalSavings), badge: 'All deposits', bt: 'up', ibg: '#ecfdf5', ic: '#0d9f6e', icon: <TrendingUp size={16} />, cls: 'c-green', bars: [40,55,45,70,60,80,75] },
    { label: 'Withdrawals', value: fmt(totals.totalWithdrawals), badge: `${wdRatio}% ratio`, bt: wdRatio > 60 ? 'down' : 'amber', ibg: '#fff1f2', ic: '#e02424', icon: <TrendingDown size={16} />, cls: 'c-red', bars: [30,45,35,50,40,55,48] },
    { label: 'Net Balance', value: fmt(totals.netBalance), badge: totals.netBalance >= 0 ? 'Positive' : 'Deficit', bt: totals.netBalance >= 0 ? 'up' : 'down', ibg: '#eff6ff', ic: '#1a56db', icon: <Wallet size={16} />, cls: 'c-blue', bars: [60,50,65,55,70,75,80] },
    { label: 'Interest Earned', value: fmt(totals.totalInterest), badge: '11.5% p.a.', bt: 'purple', ibg: '#f5f3ff', ic: '#7c3aed', icon: <Percent size={16} />, cls: 'c-purple', bars: [20,25,30,28,35,40,45] },
  ];

  return (
    <div className="tp p-3 p-md-4">
      <style>{css}</style>

      {/* ── Hero ── */}
      <div className="tp-hero mb-4">
        <div className="tp-hero-grid" />
        <div className="tp-hero-glow" />
        <div className="tp-hero-glow2" />
        <div className="row align-items-center gy-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="col-md-7">
            <div className="tp-hero-eyebrow">
              <span className="tp-hero-dot" />
              Admin Portal · Live
            </div>
            <h1 className="tp-hero-title">Transaction Management</h1>
            <p className="tp-hero-sub">Savings, withdrawals &amp; automatically accrued interest at 11.5% p.a.</p>
          </div>
          <div className="col-md-5 text-md-end d-flex gap-2 justify-content-md-end flex-wrap">
            <button 
              className="tp-btn-ghost" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="tp-btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Transaction
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="tp-kpi-strip mb-4">
        <div className="row g-3">
          {kpis.map((k, i) => (
            <div key={i} className="col-6 col-xl-3">
              <div className={`tp-kpi ${k.cls}`}>
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="tp-kpi-label">{k.label}</div>
                  <div className="tp-kpi-icon" style={{ background: k.ibg, color: k.ic }}>{k.icon}</div>
                </div>
                <div className="tp-kpi-value">{k.value}</div>
                <span className={`tp-badge ${k.bt}`}>{k.badge}</span>
                <div className="tp-spark">
                  {k.bars.map((h, j) => (
                    <div key={j} className="tp-spark-bar" style={{ height: `${h}%`, background: k.ic, opacity: j === k.bars.length - 1 ? 1 : 0.2 + (j / k.bars.length) * 0.6 }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest Banner */}
      <div className="tp-int-banner mb-4">
        <div className="d-flex align-items-center gap-3">
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: '#f5f3ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#7c3aed', 
            flexShrink: 0 
          }}>
            <PiggyBank size={20} />
          </div>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.9px', color: '#6d28d9', marginBottom: '.2rem' }}>Interest Policy</div>
            <div style={{ fontSize: '.83rem', color: '#4c1d95' }}>
              <span className="tp-int-rate">11.5%</span>
              <span style={{ marginLeft: '.5rem', fontWeight: 500, color: '#5b21b6' }}>per annum</span>
              <span style={{ margin: '0 .5rem', color: '#c4b5fd' }}>·</span>
              <span style={{ fontSize: '.75rem', color: '#6d28d9' }}>Automatically accrued daily</span>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowInterestDetails(s => !s)} style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '.5rem 1.1rem', borderRadius: '10px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem', fontFamily: 'Sora, sans-serif', transition: 'all .2s', boxShadow: '0 4px 12px rgba(124,58,237,.35)' }}>
            <Award size={13} />
            {showInterestDetails ? 'Hide' : 'Summary'}
            <ChevronDown size={12} style={{ transition: 'transform .2s', transform: showInterestDetails ? 'rotate(180deg)' : '' }} />
          </button>
        </div>
      </div>

      {/* Detailed Interest Breakdown */}
      {showInterestDetails && (
        <div className="tp-int-table mb-4" style={{ background: 'var(--card)', borderRadius: '18px', border: '1px solid #c4b5fd', overflow: 'hidden' }}>
          <div className="tp-table-head" style={{ borderBottom: '1px solid #c4b5fd' }}>
            <div className="tp-stitle" style={{ color: '#5b21b6' }}><Percent size={15} /> Member Interest Breakdown</div>
            <span className="tp-count" style={{ background: '#ede9fe', color: '#7c3aed' }}>{memberSummary.length} members</span>
          </div>
          <div className="tp-table-scroll">
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th className="r">Savings</th>
                  <th className="r">Withdrawals</th>
                  <th className="r">Interest Earned</th>
                  <th className="r">Net Balance</th>
                  <th className="r">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {memberSummary.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td className="r"><span className="mono-pos">{fmt(m.savings)}</span></td>
                    <td className="r"><span className="mono-neg">{fmt(m.withdrawals)}</span></td>
                    <td className="r"><span className="mono-int">{fmt(m.interest)}</span></td>
                    <td className="r"><span className={m.netBalance >= 0 ? 'mono-pos' : 'mono-neg'}>{fmt(m.netBalance)}</span></td>
                    <td className="r"><span className="tp-count" style={{ background: '#e8effe', color: '#1a56db' }}>{m.transactionCount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors */}
      {(error || membersError) && (
        <div className="tp-error mb-3">
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>{error || `Members: ${membersError}`}</div>
        </div>
      )}

      {/* Filters */}
      <div className="tp-filter mb-4">
        <div className="tp-filter-section-label"><Filter size={13} /> Filter Transactions</div>
        <div className="tp-filter-row">
          <div style={{ flex: '1', minWidth: 150 }}>
            <label className="tp-filter-label">Member</label>
            <select className="tp-filter-input" value={filters.memberId} onChange={e => setFilters(p => ({ ...p, memberId: e.target.value }))}>
              <option value="">All Members</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.fullName || m.username}</option>)}
            </select>
          </div>
          <div style={{ flex: '1', minWidth: 120 }}>
            <label className="tp-filter-label">Type</label>
            <select className="tp-filter-input" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="Saving">Saving</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Interest">Interest</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: 140 }}>
            <label className="tp-filter-label">From Date</label>
            <input type="date" className="tp-filter-input" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div style={{ flex: '1', minWidth: 140 }}>
            <label className="tp-filter-label">To Date</label>
            <input type="date" className="tp-filter-input" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
          </div>
          {hasFilters && (
            <button className="tp-clear-btn" onClick={clearFilters}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ─── MAIN TABLE ─── */}
      <div className="tp-table-card">
        <div className="tp-table-head">
          <div className="tp-stitle"><BarChart3 size={16} style={{ color: 'var(--accent)' }} /> Member Summary</div>
          <span className="tp-count">{memberSummary.length} member{memberSummary.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="tp-table-scroll">
          <table className="tp-table">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Member</th>
                <th className="r" style={{ minWidth: 145 }}>Total Savings</th>
                <th className="r" style={{ minWidth: 135 }}>Total Withdrawals</th>
                <th className="r" style={{ minWidth: 150 }}>Interest Earned</th>
                <th className="r" style={{ minWidth: 145 }}>Net Balance</th>
                <th className="r" style={{ minWidth: 110 }}>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {memberSummary.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="tp-empty">
                    <div className="tp-empty-icon"><User size={24} /></div>
                    <h5 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, marginBottom: '.4rem' }}>No data</h5>
                    <p style={{ color: 'var(--ink3)', fontSize: '.82rem', margin: 0 }}>No transactions match your filters</p>
                  </div>
                </td></tr>
              ) : memberSummary.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td className="r"><span className="mono-pos">{fmt(m.savings)}</span></td>
                  <td className="r"><span className="mono-neg">{fmt(m.withdrawals)}</span></td>
                  <td className="r"><span className="mono-int">{fmt(m.interest)}</span></td>
                  <td className="r"><span className={m.netBalance >= 0 ? 'mono-pos' : 'mono-neg'}>{fmt(m.netBalance)}</span></td>
                  <td className="r"><span className="tp-count" style={{ background: '#e8effe', color: '#1a56db' }}>{m.transactionCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {memberSummary.length > 0 && (
          <div className="tp-scroll-hint">← scroll horizontally to see all columns →</div>
        )}
      </div>

      {/* ────── MODAL ────── */}
      <Modal isOpen={showModal} onClose={closeModal} size="lg">
        <div className="tp-modal">

          {/* Header */}
          <div className="tp-modal-hdr">
            <div className="tp-modal-hdr-top">
              <div className="d-flex align-items-center gap-3">
                <div className="tp-modal-icon-wrap">
                  <Plus size={22} />
                </div>
                <div>
                  <h3 className="tp-modal-title">New Transaction</h3>
                  <p className="tp-modal-subtitle">Record a savings deposit or fund withdrawal</p>
                </div>
              </div>
              <button className="tp-modal-close" onClick={closeModal} type="button">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Transaction Type Selector */}
          <div className="tp-type-selector">
            <div className={`tp-type-option save ${form.type === 'Saving' ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, type: 'Saving' }))}>
              {form.type === 'Saving' && <CheckCircle size={15} style={{ color: '#0d9f6e' }} className="tp-type-check" />}
              <div className="tp-type-icon"><ArrowUpRight size={16} /></div>
              <div className="tp-type-label">Savings Deposit</div>
              <div className="tp-type-sub">Weekly, Munomukabi, Other</div>
            </div>
            <div className={`tp-type-option wd ${form.type === 'Withdrawal' ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, type: 'Withdrawal' }))}>
              {form.type === 'Withdrawal' && <CheckCircle size={15} style={{ color: '#e02424' }} className="tp-type-check" />}
              <div className="tp-type-icon"><ArrowDownRight size={16} /></div>
              <div className="tp-type-label">Withdrawal</div>
              <div className="tp-type-sub">Deduct from balance</div>
            </div>
          </div>

          {/* Body */}
          <div className="tp-modal-body">
            <form onSubmit={handleSubmit} id="tx-form">

              {error && (
                <div style={{ display: 'flex', gap: '.6rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1.1rem', fontSize: '.78rem', color: 'var(--red)', alignItems: 'center' }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              {/* Member + Date row */}
              <div className="row g-3 mb-0">
                <div className="col-12">
                  <div className="tp-field">
                    <label className="tp-field-label">
                      <Users size={11} /> Member <span className="req">*</span>
                    </label>
                    <AutoSuggest onMemberSelect={handleMemberSelect} selectedMember={selectedMember} placeholder="Search by name…" />
                    {formErrors.member && <div className="tp-field-err"><AlertTriangle size={11} />{formErrors.member}</div>}
                    {selectedMember && (
                      <div className="tp-member-confirm">
                        <div className="tp-member-avatar">{initials(selectedMember.fullName || selectedMember.username)}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{selectedMember.fullName || selectedMember.username}</div>
                          <div style={{ fontSize: '.65rem', color: '#059669', fontWeight: 400 }}>Member confirmed</div>
                        </div>
                        <CheckCircle size={15} style={{ marginLeft: 'auto', color: '#059669' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className="tp-field">
                    <label className="tp-field-label">
                      <Calendar size={11} /> Transaction Date <span className="req">*</span>
                    </label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} className={`tp-input ${formErrors.date ? 'err' : ''}`} />
                    {formErrors.date && <div className="tp-field-err"><AlertTriangle size={11} />{formErrors.date}</div>}
                  </div>
                </div>
              </div>

              {/* Amount section */}
              <div className="tp-divider">
                <div className="tp-divider-line" />
                <div className="tp-divider-label">{form.type === 'Saving' ? 'Savings Breakdown' : 'Withdrawal Amount'}</div>
                <div className="tp-divider-line" />
              </div>

              {form.type === 'Saving' ? (
                <>
                  <div className="tp-amount-grid">
                    {[
                      { name: 'weeklySaving', label: 'Weekly Saving' },
                      { name: 'munomukabi',   label: 'Munomukabi' },
                      { name: 'otherSaving',  label: 'Other Saving' },
                    ].map(f => (
                      <div key={f.name} className="tp-amount-card">
                        <div className="tp-amount-card-label">{f.label}</div>
                        <input
                          type="number"
                          name={f.name}
                          value={form[f.name]}
                          onChange={handleChange}
                          placeholder="0"
                          step="any"
                          min="0"
                          className="tp-amount-card-input"
                        />
                        <div className="tp-amount-card-currency">UGX</div>
                      </div>
                    ))}
                  </div>
                  {formErrors.amount && (
                    <div className="tp-field-err mt-2"><AlertTriangle size={11} />{formErrors.amount}</div>
                  )}
                  <div className="tp-field-hint mt-2">
                    <CircleDot size={11} />
                    All amounts support decimals. Leave unused fields at 0.
                  </div>
                </>
              ) : (
                <>
                  <div className={`tp-wd-field ${formErrors.withdrawal ? 'err' : ''}`} style={formErrors.withdrawal ? { borderColor: 'var(--red)', boxShadow: '0 0 0 4px rgba(224,36,36,.1)' } : {}}>
                    <div className="tp-wd-label">
                      <ArrowDownRight size={12} />
                      Amount to Withdraw (UGX)
                    </div>
                    <div className="tp-wd-input-row">
                      <div className="tp-wd-currency">UGX</div>
                      <input
                        type="number"
                        name="withdrawal"
                        value={form.withdrawal}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="any"
                        min="0"
                        className="tp-wd-input"
                      />
                    </div>
                  </div>
                  {formErrors.withdrawal && (
                    <div className="tp-field-err mt-2"><AlertTriangle size={11} />{formErrors.withdrawal}</div>
                  )}
                  <div className="tp-field-hint mt-2">
                    <CircleDot size={11} />
                    This amount will be deducted from the member's balance.
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="tp-modal-ftr">
            <div className="tp-ftr-total">
              {formTotal > 0 && (
                <>
                  <div style={{ fontSize: '.62rem', marginBottom: '.1rem', textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>
                    {form.type === 'Saving' ? 'Total deposit' : 'Amount'}
                  </div>
                  <strong style={{ color: form.type === 'Saving' ? 'var(--green)' : 'var(--red)' }}>
                    {fmt(formTotal)}
                  </strong>
                </>
              )}
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="tp-cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" form="tx-form" className={`tp-submit-btn ${form.type === 'Saving' ? 'save' : 'wd'}`}>
                <Save size={14} />
                {form.type === 'Saving' ? 'Record Deposit' : 'Record Withdrawal'}
              </button>
            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
};

export default TransactionsPage;