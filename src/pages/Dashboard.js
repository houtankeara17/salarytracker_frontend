// src/pages/Dashboard.js — Redesigned using globals.css design system
// Uses: --dash-surface, --card-bg, --text-primary/secondary, --border, --accent
// Fonts: Syne (display), DM Mono (numbers), DM Sans / Suwannaphum (body)
// Classes: card, dash-glass-card, badge-*, stat-card, skeleton, btn-*
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../utils/api";
import CalendarModal from "../components/modals/CalendarModal";
import ExpenseModal from "../components/modals/ExpenseModal";
import { formatDate } from "../utils/khmerUtils";
import StatusBanner from "../components/StatusBanner";
import { useLocation } from "react-router-dom";

/* ─── Palette — sidebar nav colors ─── */
const C = {
  purple: "#7C6BFF",
  pink: "#FF6B9D",
  teal: "#00D4AA",
  amber: "#FFB547",
  blue: "#60CFFF",
  orange: "#FF8C6B",
  violet: "#A78BFA",
  slate: "#94A3B8",
  green: "#34D399",
};

const CATEGORY_COLORS = {
  food: C.amber,
  drink: C.orange,
  fruit: C.teal,
  transport: C.blue,
  clothing: C.violet,
  health: C.pink,
  entertainment: C.purple,
  education: C.green,
  utilities: C.blue,
  shopping: C.orange,
  other: C.slate,
};

const CATEGORY_EMOJI = {
  food: "🍜",
  drink: "🧃",
  fruit: "🍊",
  transport: "🚗",
  clothing: "👕",
  health: "💊",
  entertainment: "🎮",
  education: "📚",
  utilities: "💡",
  shopping: "🛍️",
  other: "📦",
};

const STATUS_COLORS = {
  planned: C.blue,
  ongoing: C.amber,
  completed: C.teal,
  cancelled: C.pink,
};

const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_NAMES_KH = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

/* ─────────────────────────────────────────────────────
   Extra CSS — layered on top of globals.css
   Only adds what globals.css doesn't cover
───────────────────────────────────────────────────── */
const EXTRA_CSS = `
/* ── Dashboard v4 root ── */
.dv4-root {
  display: flex; flex-direction: column; gap: 16px;
  max-width: 1320px; margin: 0 auto;
  padding-bottom: 48px;
  font-family: var(--dash-body, 'DM Sans', 'Suwannaphum', sans-serif);
}

/* Staggered entrance */
.dv4-anim { animation: dv4-up 0.45s cubic-bezier(0.16,1,0.3,1) both; }
.dv4-anim:nth-child(1){ animation-delay:0.00s }
.dv4-anim:nth-child(2){ animation-delay:0.07s }
.dv4-anim:nth-child(3){ animation-delay:0.13s }
.dv4-anim:nth-child(4){ animation-delay:0.19s }
@keyframes dv4-up {
  from { opacity:0; transform:translateY(14px) }
  to   { opacity:1; transform:translateY(0) }
}

/* ── Top bar ── */
.dv4-topbar {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 24px 0 20px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 14px;
}
.dv4-page-eyebrow {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--text-secondary); margin-bottom: 6px;
  opacity: 0.6;
}
.dv4-page-title {
  font-family: var(--dash-display, 'Syne', sans-serif);
  font-size: 30px; font-weight: 800;
  color: var(--text-primary); line-height: 1; letter-spacing: -0.025em;
}
.dv4-topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Month nav */
.dv4-month-nav {
  display: flex; align-items: center;
  border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
}
.dv4-nav-btn {
  width: 32px; height: 32px;
  background: var(--dash-surface);
  border: none; cursor: pointer;
  color: var(--text-secondary); font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: background .14s, color .14s;
  font-family: var(--dash-body);
}
.dv4-nav-btn:hover { background: var(--border); color: var(--text-primary); }
.dv4-nav-month {
  padding: 0 14px; height: 32px;
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 11px; letter-spacing: 0.04em; font-weight: 500;
  color: var(--text-primary);
  background: var(--dash-tile-bg);
  border-left: 1px solid var(--border); border-right: 1px solid var(--border);
  display: flex; align-items: center; white-space: nowrap;
}

/* ── Hero row ── */
.dv4-hero-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 14px;
}
@media(max-width:1100px){ .dv4-hero-row{ grid-template-columns:1fr 1fr; } }
@media(max-width:600px){  .dv4-hero-row{ grid-template-columns:1fr; } }

.dv4-hero-card {
  position: relative; overflow: hidden;
  padding: 24px 26px;
}
.dv4-hero-glow {
  position: absolute; top: -60px; right: -60px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 68%);
  pointer-events: none;
}
.dv4-hero-eyebrow {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text-secondary); margin-bottom: 10px; opacity: 0.7;
  display: flex; align-items: center; gap: 8px;
}
.dv4-hero-eyebrow::before {
  content:''; width:18px; height:1px;
  background: var(--accent, #6366f1);
}
.dv4-hero-amount {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 38px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.04em; line-height: 1;
  margin-bottom: 10px;
}
.dv4-hero-delta {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 11px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
}
.dv4-hero-delta.pos { background: rgba(52,211,153,0.12); color: #34D399; }
.dv4-hero-delta.neg { background: rgba(255,107,157,0.12); color: #FF6B9D; }

/* mini bars replaced with horizontal category bars — inline styles */

/* Metric tiles */
.dv4-metric-tile {
  position: relative; overflow: hidden;
  padding: 18px 20px;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: transform .16s;
}
.dv4-metric-tile:hover { transform: translateY(-2px); }
.dv4-metric-tile::after {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: var(--mt-c, var(--accent)); border-radius: 3px 3px 0 0; opacity: 0.7;
}
.dv4-mt-top {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;
}
.dv4-mt-label {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.8;
}
.dv4-mt-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.dv4-mt-value {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 20px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; margin-bottom: 5px;
}
.dv4-mt-sub {
  font-size: 10px; color: var(--text-secondary); letter-spacing: 0.02em;
}

/* ── Burn rate band ── */
.dv4-burn-band {
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 20px;
  padding: 16px 22px;
  border-radius: 14px;
}
.dv4-bb-left { display: flex; flex-direction: column; gap: 9px; }
.dv4-bb-toprow {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
}
.dv4-bb-label {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.7;
}
.dv4-bb-vals {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 11px; color: var(--text-secondary);
  display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap;
}
.dv4-bb-vals strong { font-size: 14px; font-weight: 800; color: var(--text-primary); }
.dv4-bb-foot {
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 10px; color: var(--text-secondary);
}
.dv4-bb-foot b { font-weight: 400; color: var(--text-primary); }
.dv4-bb-pct {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 26px; font-weight: 800; letter-spacing: -0.04em;
}
.dv4-bar {
  width: 100%; height: var(--bh,4px);
  background: var(--border); border-radius: 99px; overflow: hidden;
}
.dv4-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 0.7s cubic-bezier(0.34,1.3,0.64,1);
}

/* ── Stat cards row ── */
.dv4-stat-row {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
}
@media(max-width:900px){ .dv4-stat-row{ grid-template-columns:1fr 1fr; } }
.dv4-stat-card {
  padding: 18px 20px; cursor: pointer; position: relative; overflow: hidden;
  border-radius: 16px;
}
.dv4-sc-glow {
  position:absolute; bottom:-20px; right:-20px; width:80px; height:80px; border-radius:50%;
  background: radial-gradient(circle, var(--sc-c) 0%, transparent 70%);
  opacity:.1; pointer-events:none; transition:opacity .2s;
}
.dv4-stat-card:hover .dv4-sc-glow { opacity:.22; }
.dv4-sc-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.dv4-sc-tag {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 4px;
  border: 1px solid currentColor; opacity: 0.6;
}
.dv4-sc-amount {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 18px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.03em; margin-bottom: 4px;
}
.dv4-sc-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-secondary); margin-bottom: 3px;
}
.dv4-sc-count {
  font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 10px; color: var(--text-secondary);
}
.dv4-sc-bar { margin-top: 14px; }
.dv4-sc-accent {
  position: absolute; bottom: 0; left: 0;
  height: 2px; width: 28%; background: var(--sc-c);
  opacity: 0.5; transition: width 0.28s ease;
}
.dv4-stat-card:hover .dv4-sc-accent { width: 55%; }

/* ── Bottom 3-col grid ── */
.dv4-bottom {
  display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: 14px;
}
@media(max-width:1100px){ .dv4-bottom{ grid-template-columns:1fr 1fr; } }
@media(max-width:700px){  .dv4-bottom{ grid-template-columns:1fr; } }

/* Panel */
.dv4-panel { padding: 22px; border-radius: 20px; display: flex; flex-direction: column; }
.dv4-panel-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 18px; gap: 12px;
}
.dv4-ph-eyebrow {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-secondary); margin-bottom: 5px; opacity: 0.65;
}
.dv4-ph-title {
  font-family: var(--dash-display, 'Syne', sans-serif);
  font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em;
}
.dv4-ph-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;
}
.dv4-ph-total {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 15px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.03em;
}
.dv4-ph-chip {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: #FFB547; border: 1px solid rgba(255,181,71,0.3);
  border-radius: 5px; padding: 3px 9px; white-space: nowrap;
}

/* Category rows */
.dv4-cat-row {
  display: grid; grid-template-columns: 18px 34px 1fr 52px;
  align-items: center; gap: 10px;
  padding: 10px 6px; border-bottom: 1px solid var(--border);
  border-radius: 8px; transition: background .12s; cursor: default;
  position: relative;
}
.dv4-cat-row:hover { background: var(--dash-surface-hover, rgba(255,255,255,0.06)); }
.dv4-cat-row:last-of-type { border-bottom: none; }
.dv4-cat-row:hover .dv4-cat-tooltip { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

.dv4-cat-num {
  font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 9px;
  color: var(--text-secondary); text-align: right; opacity: 0.5;
}

/* Emoji icon badge */
.dv4-cat-icon {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
  transition: transform .18s cubic-bezier(0.34,1.6,0.64,1);
}
.dv4-cat-row:hover .dv4-cat-icon { transform: scale(1.15) rotate(-4deg); }

.dv4-cat-meta { display: flex; justify-content: space-between; margin-bottom: 5px; }
.dv4-cat-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.dv4-cat-usd {
  font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 11px; color: var(--text-secondary);
}
.dv4-cat-pct  { font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 12px; font-weight: 800; text-align: right; }
.dv4-cat-txn  { font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 9px; color: var(--text-secondary); text-align: right; margin-top: 2px; }

/* Hover tooltip */
.dv4-cat-tooltip {
  position: absolute; left: 64px; top: -8px; z-index: 20;
  background: var(--card-bg, #0f1525);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 13px;
  min-width: 170px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.28);
  opacity: 0;
  transform: translateY(4px) scale(0.96);
  transition: opacity .18s ease, transform .18s cubic-bezier(0.34,1.3,0.64,1);
  pointer-events: none;
}
.dv4-cat-tooltip::before {
  content: '';
  position: absolute; left: -5px; top: 16px;
  width: 9px; height: 9px;
  background: var(--card-bg, #0f1525);
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  transform: rotate(45deg);
}
.dv4-tt-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.dv4-tt-emoji { font-size: 18px; }
.dv4-tt-name {
  font-family: var(--dash-display, 'Syne', sans-serif);
  font-size: 13px; font-weight: 700; color: var(--text-primary);
}
.dv4-tt-divider {
  height: 1px; background: var(--border); margin-bottom: 8px;
}
.dv4-tt-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 5px;
}
.dv4-tt-row:last-child { margin-bottom: 0; }
.dv4-tt-lbl {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.6;
}
.dv4-tt-val {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 11px; font-weight: 700; color: var(--text-primary);
}
.dv4-tt-bar {
  width: 100%; height: 3px; background: var(--border);
  border-radius: 99px; overflow: hidden; margin-top: 8px;
}
.dv4-tt-bar-fill {
  height: 100%; border-radius: 99px;
}
.dv4-cat-footer {
  margin-top: 14px; padding: 13px 15px;
  border-radius: 12px;
  background: rgba(99,102,241,0.07);
  border: 1px solid rgba(99,102,241,0.2);
  display: flex; justify-content: space-between; align-items: center;
}
.dv4-cf-left {}
.dv4-cf-label {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase;
  color: #818CF8; margin-bottom: 2px;
}
.dv4-cf-sub { font-size: 10px; color: var(--text-secondary); }
.dv4-cf-total {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 18px; font-weight: 800; color: #818CF8; letter-spacing: -0.03em;
}

/* heatmap CSS removed — replaced by weekly bar chart with inline styles */

/* Stat pills */
.dv4-pill-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-top: 14px; }
.dv4-pill {
  padding: 11px 7px 9px;
  background: var(--dash-tile-bg); border: 1px solid var(--border);
  border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center;
  transition: transform .14s;
}
.dv4-pill:hover { transform: translateY(-2px); }
.dv4-pill-icon  { font-size: 15px; }
.dv4-pill-count {
  font-family: var(--dash-display, 'Syne', sans-serif);
  font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1;
}
.dv4-pill-name  {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); opacity: 0.6;
}
.dv4-pill-prog  {
  font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 9px; color: var(--text-secondary);
}

/* Plans */
.dv4-comp-banner {
  padding: 12px 14px; margin-bottom: 14px;
  background: rgba(52,211,153,0.07);
  border: 1px solid rgba(52,211,153,0.2); border-radius: 12px;
}
.dv4-comp-head {
  display: flex; justify-content: space-between;
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: #34D399; margin-bottom: 10px;
}
.dv4-comp-row {
  display: flex; align-items: center; gap: 9px; padding: 4px 0;
  border-top: 1px solid rgba(52,211,153,0.08);
}
.dv4-comp-row:first-of-type { border-top: none; }
.dv4-comp-tick { width: 2px; height: 14px; background: #34D399; opacity: 0.4; border-radius: 1px; flex-shrink: 0; }
.dv4-comp-name { font-size: 11px; color: var(--text-secondary); flex: 1; }
.dv4-comp-amt  { font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 11px; color: #34D399; font-weight: 700; }
.dv4-comp-more { font-family: var(--dash-mono, 'DM Mono', monospace); font-size: 9px; color: var(--text-secondary); margin-top: 5px; }

.dv4-type-lbl {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-secondary); margin: 14px 0 7px; opacity: 0.6;
}
.dv4-type-lbl::after { content:''; flex:1; height:1px; background:var(--border); }

.dv4-plan-item {
  padding: 11px 13px;
  border-radius: 12px;
  border-left: 3px solid var(--pi-c, #6366f1);
  background: var(--dash-tile-bg);
  border-top: 1px solid var(--border);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 6px; transition: background .14s, transform .13s;
}
.dv4-plan-item:hover { background: var(--dash-surface-hover); transform: translateX(2px); }
.dv4-pi-top { display: flex; align-items: center; gap: 9px; margin-bottom: 7px; }
.dv4-pi-icon { font-size: 13px; flex-shrink: 0; }
.dv4-pi-name {
  flex:1; font-size: 12px; font-weight: 600;
  color: var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.dv4-pi-badge {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 5px;
}
.dv4-pi-amt {
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.dv4-pi-foot {
  display: flex; justify-content: space-between;
  font-family: var(--dash-mono, 'DM Mono', monospace);
  font-size: 9px; color: var(--text-secondary); margin-top: 6px;
}

/* Empty */
.dv4-empty { text-align: center; padding: 36px 0; }
.dv4-empty-icon {
  font-size: 28px; opacity: .3; margin-bottom: 10px; display: block;
  animation: dv4-float 4s ease-in-out infinite;
}
@keyframes dv4-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
.dv4-empty-title {
  font-family: var(--dash-display, 'Syne', sans-serif);
  font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;
}
.dv4-empty-sub { font-size: 12px; color: var(--text-secondary); }

/* Skeleton */
.dv4-sk-root { display: flex; flex-direction: column; gap: 14px; }
`;

let _injected = false;
function injectCSS() {
  if (_injected) return;
  const s = document.createElement("style");
  s.textContent = EXTRA_CSS;
  document.head.appendChild(s);
  _injected = true;
}

/* ─────────── Sub-components ─────────── */
function Bar({ pct, color, height = 4 }) {
  return (
    <div className="dv4-bar" style={{ "--bh": `${height}px` }}>
      <div
        className="dv4-bar-fill"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color || "var(--accent)",
        }}
      />
    </div>
  );
}

function MonthNav({ month, year, onPrev, onNext, language }) {
  const names = language === "kh" ? MONTH_NAMES_KH : MONTH_NAMES_EN;
  return (
    <div className="dv4-month-nav">
      <button className="dv4-nav-btn" onClick={onPrev}>
        ‹
      </button>
      <div className="dv4-nav-month">
        {names[month]} {year}
      </div>
      <button className="dv4-nav-btn" onClick={onNext}>
        ›
      </button>
    </div>
  );
}

function StatPill({ icon, label, total, completed }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="dv4-pill">
      <div className="dv4-pill-icon">{icon}</div>
      <div className="dv4-pill-count">{total}</div>
      <div className="dv4-pill-name">{label}</div>
      <Bar pct={pct} color={C.teal} height={2} />
      <div className="dv4-pill-prog">
        {completed}/{total}
      </div>
    </div>
  );
}

function PlanItem({ item, icon, t, formatAmount }) {
  const saved = item.savedAmount ?? item.givenAmount ?? item.paidAmount ?? 0;
  const pct =
    item.targetAmount > 0
      ? Math.min(100, (saved / item.targetAmount) * 100)
      : 0;
  const clr = STATUS_COLORS[item.status] || C.blue;
  return (
    <div className="dv4-plan-item" style={{ "--pi-c": clr }}>
      <div className="dv4-pi-top">
        <span className="dv4-pi-icon">{icon}</span>
        <div className="dv4-pi-name">{item.title}</div>
        <span
          className="dv4-pi-badge"
          style={{ color: clr, background: `${clr}18` }}
        >
          {t(item.status)}
        </span>
        <div className="dv4-pi-amt" style={{ color: clr }}>
          {formatAmount(item.amountUSD)}
        </div>
      </div>
      <Bar pct={pct} color={clr} height={3} />
      <div className="dv4-pi-foot">
        <span>{saved ? formatAmount(saved) : "—"} saved</span>
        <span style={{ color: clr }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function hmColor(value, max, hex) {
  const alpha = max > 0 ? Math.max(0.06, (value / max) * 0.85) : 0.06;
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

/* ─────────────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────────────── */
export default function Dashboard() {
  injectCSS();

  const { t, formatAmount, formatNum, language } = useApp();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calModal, setCalModal] = useState({ open: false, view: "monthly" });
  const [addExpense, setAddExpense] = useState(false);
  const [banner, setBanner] = useState(null);

  const today = new Date();
  const [navMonth, setNavMonth] = useState(today.getMonth());
  const [navYear, setNavYear] = useState(today.getFullYear());

  const location = useLocation();
  useEffect(() => {
    if (location.state?.justLoggedIn) {
      setBanner({
        type: "success",
        title: language === "kh" ? "ចូលគណនីបានជោគជ័យ" : t("Login successful"),
      });
      window.history.replaceState({}, "");
    }
  }, []);

  const handlePrevMonth = () =>
    setNavMonth((p) => {
      if (p === 0) {
        setNavYear((y) => y - 1);
        return 11;
      }
      return p - 1;
    });
  const handleNextMonth = () =>
    setNavMonth((p) => {
      if (p === 11) {
        setNavYear((y) => y + 1);
        return 0;
      }
      return p + 1;
    });

  const loadData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await dashboardAPI.getSummary({
          month: navMonth + 1,
          year: navYear,
        });
        setData(res.data);
      } catch (err) {
        setBanner({ type: "error", title: "Failed to load", sub: err.message });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navMonth, navYear],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Skeleton — uses globals.css .skeleton ── */
  if (loading)
    return (
      <div className="dv4-sk-root">
        <div className="skeleton" style={{ height: 52 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {[200, 110, 110, 110].map((h, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: h, borderRadius: 20 }}
            />
          ))}
        </div>
        <div className="skeleton" style={{ height: 58, borderRadius: 14 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 104, borderRadius: 16 }}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr 1fr",
            gap: 14,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 340, borderRadius: 20 }}
            />
          ))}
        </div>
        <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
      </div>
    );

  /* ── Derived ── */
  const todayY = today.getFullYear(),
    todayM = today.getMonth();
  const isFutureMonth =
    navYear > todayY || (navYear === todayY && navMonth > todayM);
  const hasData =
    !isFutureMonth &&
    !!data?.salary &&
    (data?.monthlySpentUSD > 0 || data?.plans);

  const stats = data?.stats || {};
  const statCards = [
    { key: "daily", label: t("dailyExpenses"), icon: "☀️", color: C.pink },
    { key: "weekly", label: t("weeklyExpenses"), icon: "📅", color: C.blue },
    { key: "monthly", label: t("monthlyExpenses"), icon: "📆", color: C.amber },
    { key: "yearly", label: t("yearlyExpenses"), icon: "🗓️", color: C.teal },
  ];

  const salaryUSD = hasData ? data?.salaryUSD || 0 : 0;
  const savingUSD = hasData ? data?.savingUSD || 0 : 0;
  const spendableUSD = hasData ? data?.spendableUSD || 0 : 0;
  const remainingUSD = hasData ? data?.remainingUSD || 0 : 0;
  const monthlySpentUSD = hasData ? data?.monthlySpentUSD || 0 : 0;
  const completedDeductionUSD = hasData ? data?.completedDeductionUSD || 0 : 0;
  const plans = hasData ? data?.plans || {} : {};

  const spendPercent =
    spendableUSD > 0
      ? Math.min(
          100,
          ((monthlySpentUSD + completedDeductionUSD) / spendableUSD) * 100,
        )
      : 0;
  const dailyBudget = spendableUSD / 30;
  const savingPercent = salaryUSD > 0 ? (savingUSD / salaryUSD) * 100 : 0;
  const spendColor =
    spendPercent > 90 ? C.pink : spendPercent > 70 ? C.amber : C.teal;
  const monthLabel = (language === "kh" ? MONTH_NAMES_KH : MONTH_NAMES_EN)[
    navMonth
  ];

  const filterByMonth = (items = []) =>
    items.filter((item) => {
      const dateStr =
        item.completedAt || item.updatedAt || item.startDate || item.createdAt;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      return d.getFullYear() === navYear && d.getMonth() === navMonth;
    });

  const monthlyCompletedPlans = filterByMonth(plans.completedThisMonth);
  const monthlyTrips = filterByMonth(plans.recentTrips);
  const monthlyGoals = filterByMonth(plans.recentGoals);
  const monthlyGivings = filterByMonth(plans.recentGivings);
  const monthlyOthers = filterByMonth(plans.recentOthers);
  const hasAnyPlans =
    monthlyTrips.length ||
    monthlyGoals.length ||
    monthlyGivings.length ||
    monthlyOthers.length;

  const catBreakdown = data?.categoryBreakdown || [];
  const maxCat = Math.max(...catBreakdown.map((c) => c.totalUSD), 0.01);

  /* ── Weekly pattern — now powered by real backend aggregation ──────────────
     data.weeklyPattern comes from the updated dashboardController.js.
     Each element: { dow: 0-6, totalUSD: number, count: number }
     0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
     Falls back to category-spread estimation if API not yet updated.
  ─────────────────────────────────────────────────────────────────────────── */
  const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WEEK_DAYS_EN_FULL = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const WEEK_DAYS_KH = [
    "\u17A2\u17B6",
    "\u1785",
    "\u17A2",
    "\u1796",
    "\u1796\u17D2\u179A",
    "\u179F\u17BB",
    "\u179F",
  ];
  const WEEK_DAYS = language === "kh" ? WEEK_DAYS_KH : WEEK_DAYS_EN;
  const WEEK_COLORS = [
    C.purple,
    C.blue,
    C.teal,
    C.amber,
    C.orange,
    C.pink,
    C.violet,
  ];

  const rawPattern = data?.weeklyPattern || [];
  const hasRealWeekData =
    rawPattern.length === 7 && rawPattern.some((d) => d.totalUSD > 0);

  const weekTotals = Array(7).fill(0);
  const weekCounts = Array(7).fill(0);

  if (hasRealWeekData) {
    // ✅ Real data from controller — direct from MongoDB $dayOfWeek aggregation
    rawPattern.forEach(({ dow, totalUSD, count }) => {
      weekTotals[dow] = totalUSD || 0;
      weekCounts[dow] = count || 0;
    });
  } else if (catBreakdown.length > 0) {
    // ⚠️ Fallback: spread category totals using realistic weekday weights
    const totalTxn = catBreakdown.reduce((s, c) => s + c.count, 0);
    const weights = [0.08, 0.16, 0.18, 0.2, 0.16, 0.14, 0.08];
    catBreakdown.forEach((cat) => {
      const share =
        totalTxn > 0 ? cat.count / totalTxn : 1 / catBreakdown.length;
      weights.forEach((w, di) => {
        weekTotals[di] += cat.totalUSD * share * w;
        weekCounts[di] += Math.round(cat.count * share * w);
      });
    });
  }

  const weekMax = Math.max(...weekTotals, 0.01);
  const weekGrandTotal = weekTotals.reduce((s, v) => s + v, 0);
  const totalActivity = catBreakdown.reduce((s, c) => s + c.count, 0);
  const todayDow = today.getDay();

  // Safe busiest day — reduce never returns undefined
  const busiestIdx = weekTotals.reduce(
    (best, v, i) => (v > weekTotals[best] ? i : best),
    0,
  );
  const busiestDayName =
    weekGrandTotal > 0 ? WEEK_DAYS_EN_FULL[busiestIdx] : null;
  const busiestDayAmt = weekGrandTotal > 0 ? weekTotals[busiestIdx] : 0;

  return (
    <div className="dv4-root">
      {/* ══ SECTION 1: TOP BAR + HERO ══ */}
      <div className="dv4-anim">
        {/* Top bar */}
        <div className="dv4-topbar">
          <div>
            <div className="dv4-page-eyebrow">Financial Overview</div>
            <div className="dv4-page-title">{t("dashboard")}</div>
          </div>
          <div className="dv4-topbar-right">
            <MonthNav
              month={navMonth}
              year={navYear}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              language={language}
            />
            {/* Uses globals.css btn-primary */}
            <button
              className="btn btn-primary"
              onClick={() => setAddExpense(true)}
              style={{
                height: 32,
                padding: "0 16px",
                fontSize: 12,
                borderRadius: 10,
              }}
            >
              + {t("addNew")}
            </button>
          </div>
        </div>

        {hasData ? (
          <>
            {/* HERO ROW */}
            <div className="dv4-hero-row" style={{ marginTop: 18 }}>
              {/* Hero card — uses globals .card */}
              <div className="card dv4-hero-card">
                <div className="dv4-hero-glow" />
                <div className="dv4-hero-eyebrow">{t("totalSalary")}</div>
                <div className="dv4-hero-amount">{formatAmount(salaryUSD)}</div>
                <span
                  className={`dv4-hero-delta ${savingPercent >= 15 ? "pos" : "neg"}`}
                >
                  {savingPercent >= 15 ? "▲" : "▼"} {savingPercent.toFixed(1)}%
                  saved
                </span>
                {/* ── Category horizontal bars ── */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {catBreakdown.length > 0 ? (
                    catBreakdown.slice(0, 5).map((cat) => {
                      const color = CATEGORY_COLORS[cat._id] || C.slate;
                      const emoji =
                        CATEGORY_EMOJI[cat._id] || cat.emoji || "📦";
                      const pct =
                        maxCat > 0 ? (cat.totalUSD / maxCat) * 100 : 0;
                      return (
                        <div
                          key={cat._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {/* emoji + name */}
                          <span style={{ fontSize: 13, flexShrink: 0 }}>
                            {emoji}
                          </span>
                          <span
                            style={{
                              fontFamily:
                                "var(--dash-mono,'DM Mono',monospace)",
                              fontSize: 9,
                              color: "var(--text-secondary)",
                              width: 58,
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {t(cat._id)}
                          </span>
                          {/* bar track */}
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              borderRadius: 99,
                              background: "var(--border)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: color,
                                borderRadius: 99,
                                transition:
                                  "width 0.7s cubic-bezier(0.34,1.3,0.64,1)",
                              }}
                            />
                          </div>
                          {/* amount */}
                          <span
                            style={{
                              fontFamily:
                                "var(--dash-mono,'DM Mono',monospace)",
                              fontSize: 9,
                              fontWeight: 700,
                              color,
                              flexShrink: 0,
                              minWidth: 42,
                              textAlign: "right",
                            }}
                          >
                            {formatAmount(cat.totalUSD)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                        fontSize: 9,
                        color: "var(--text-secondary)",
                        opacity: 0.4,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      No spending data yet
                    </div>
                  )}
                  {catBreakdown.length > 5 && (
                    <div
                      style={{
                        fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                        fontSize: 8,
                        color: "var(--text-secondary)",
                        opacity: 0.4,
                        letterSpacing: "0.1em",
                        marginTop: 2,
                      }}
                    >
                      +{catBreakdown.length - 5} more categories
                    </div>
                  )}
                </div>
              </div>

              {/* Metric tiles — uses globals .card */}
              {[
                {
                  label: t("totalSaving"),
                  val: formatAmount(savingUSD),
                  color: C.teal,
                  icon: "🏦",
                  sub: `${savingPercent.toFixed(0)}% of salary`,
                },
                {
                  label: t("spendable"),
                  val: formatAmount(spendableUSD),
                  color: C.amber,
                  icon: "💳",
                  sub: `${formatAmount(dailyBudget)}/day budget`,
                },
                {
                  label: t("remaining"),
                  val: formatAmount(remainingUSD),
                  color: remainingUSD < 0 ? C.pink : C.green,
                  icon: remainingUSD < 0 ? "⚠️" : "✅",
                  sub: remainingUSD < 0 ? "Over budget" : "Available",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="card dv4-metric-tile"
                  style={{ "--mt-c": m.color }}
                >
                  <div className="dv4-mt-top">
                    <div className="dv4-mt-label">{m.label}</div>
                    <div
                      className="dv4-mt-icon"
                      style={{ background: `${m.color}18` }}
                    >
                      {m.icon}
                    </div>
                  </div>
                  <div>
                    <div
                      className="dv4-mt-value"
                      style={{
                        color:
                          i === 2 && remainingUSD < 0
                            ? C.pink
                            : "var(--text-primary)",
                      }}
                    >
                      {m.val}
                    </div>
                    <div className="dv4-mt-sub">{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* BURN BAND — uses globals .card */}
            <div className="card dv4-burn-band" style={{ marginTop: 12 }}>
              <div className="dv4-bb-left">
                <div className="dv4-bb-toprow">
                  <span className="dv4-bb-label">Monthly Burn Rate</span>
                  <div className="dv4-bb-vals">
                    <strong>{formatAmount(monthlySpentUSD)}</strong>
                    {completedDeductionUSD > 0 && (
                      <span>
                        + {formatAmount(completedDeductionUSD)} deducted
                      </span>
                    )}
                    <span>/ {formatAmount(spendableUSD)}</span>
                  </div>
                </div>
                <Bar pct={spendPercent} color={spendColor} height={6} />
                <div className="dv4-bb-foot">
                  <span>
                    Daily — <b>{formatAmount(dailyBudget)}</b>
                  </span>
                  <span>
                    Remaining —{" "}
                    <b style={{ color: remainingUSD < 0 ? C.pink : C.teal }}>
                      {formatAmount(remainingUSD)}
                    </b>
                  </span>
                </div>
              </div>
              <div className="dv4-bb-pct" style={{ color: spendColor }}>
                {formatNum(spendPercent.toFixed(1))}%
              </div>
            </div>
          </>
        ) : (
          <div
            className="dash-empty"
            style={{ paddingTop: 52, paddingBottom: 52 }}
          >
            <div className="dash-empty-icon">{isFutureMonth ? "🔮" : "📭"}</div>
            <div className="dash-empty-title">
              {isFutureMonth
                ? language === "kh"
                  ? "មិនទាន់មានទិន្នន័យ"
                  : "No data yet"
                : language === "kh"
                  ? "គ្មានប្រាក់ខែ"
                  : "No salary for this month"}
            </div>
            <div className="dash-empty-sub">
              {isFutureMonth
                ? language === "kh"
                  ? "ខែនេះនៅមិនទាន់មកដល់ទេ"
                  : "This month hasn't started yet"
                : language === "kh"
                  ? "សូមបន្ថែមប្រាក់ខែ"
                  : "No salary was set for this month"}
            </div>
          </div>
        )}
      </div>

      {/* ══ SECTION 2: STAT CARDS ══ */}
      {hasData && (
        <div className="dv4-stat-row dv4-anim">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="card dv4-stat-card"
              style={{ "--sc-c": card.color }}
              onClick={() => setCalModal({ open: true, view: card.key })}
            >
              <div className="dv4-sc-glow" />
              <div className="dv4-sc-accent" />
              <div className="dv4-sc-top">
                <span className="dv4-sc-tag" style={{ color: card.color }}>
                  {card.key}
                </span>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
              </div>
              <div className="dv4-sc-amount">
                {formatAmount(
                  stats[card.key]?.totalUSD,
                  stats[card.key]?.totalKHR,
                )}
              </div>
              <div className="dv4-sc-label">{card.label}</div>
              <div className="dv4-sc-count">
                {formatNum(stats[card.key]?.count || 0)} {t("items")}
              </div>
              <div className="dv4-sc-bar">
                <Bar
                  pct={card.key === "monthly" ? spendPercent : 0}
                  color={card.color}
                  height={3}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ SECTION 3: BOTTOM 3-COL ══ */}
      {hasData && (
        <div className="dv4-bottom dv4-anim">
          {/* ── Col 1: Category Breakdown ── */}
          <div className="card dv4-panel">
            <div className="dv4-panel-head">
              <div>
                <div className="dv4-ph-eyebrow">Spending by Category</div>
                <div className="dv4-ph-title">{t("monthly")} breakdown</div>
              </div>
              <div className="dv4-ph-right">
                <div className="dv4-ph-total">
                  {formatAmount(monthlySpentUSD)}
                </div>
              </div>
            </div>

            {catBreakdown.length > 0 ? (
              <>
                {catBreakdown.map((cat, i) => {
                  const pct =
                    monthlySpentUSD > 0
                      ? (cat.totalUSD / monthlySpentUSD) * 100
                      : 0;
                  const color = CATEGORY_COLORS[cat._id] || C.slate;
                  const emoji = CATEGORY_EMOJI[cat._id] || cat.emoji || "📦";
                  const avgPerTxn =
                    cat.count > 0 ? cat.totalUSD / cat.count : 0;
                  return (
                    <div key={cat._id} className="dv4-cat-row">
                      <span className="dv4-cat-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Emoji icon */}
                      <div
                        className="dv4-cat-icon"
                        style={{ background: `${color}18` }}
                      >
                        {emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="dv4-cat-meta">
                          <span className="dv4-cat-name">{t(cat._id)}</span>
                          <span className="dv4-cat-usd">
                            {formatAmount(cat.totalUSD)}
                          </span>
                        </div>
                        <Bar pct={pct} color={color} height={2} />
                      </div>

                      <div>
                        <div className="dv4-cat-pct" style={{ color }}>
                          {pct.toFixed(1)}%
                        </div>
                        <div className="dv4-cat-txn">{cat.count}×</div>
                      </div>

                      {/* Hover tooltip */}
                      <div className="dv4-cat-tooltip">
                        <div className="dv4-tt-header">
                          <span className="dv4-tt-emoji">{emoji}</span>
                          <span className="dv4-tt-name">{t(cat._id)}</span>
                        </div>
                        <div className="dv4-tt-divider" />
                        <div className="dv4-tt-row">
                          <span className="dv4-tt-lbl">Total spent</span>
                          <span className="dv4-tt-val" style={{ color }}>
                            {formatAmount(cat.totalUSD)}
                          </span>
                        </div>
                        <div className="dv4-tt-row">
                          <span className="dv4-tt-lbl">Transactions</span>
                          <span className="dv4-tt-val">{cat.count}×</span>
                        </div>
                        <div className="dv4-tt-row">
                          <span className="dv4-tt-lbl">Avg per txn</span>
                          <span className="dv4-tt-val">
                            {formatAmount(avgPerTxn)}
                          </span>
                        </div>
                        <div className="dv4-tt-row">
                          <span className="dv4-tt-lbl">% of total</span>
                          <span className="dv4-tt-val" style={{ color }}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="dv4-tt-bar">
                          <div
                            className="dv4-tt-bar-fill"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="dv4-cat-footer">
                  <div className="dv4-cf-left">
                    <div className="dv4-cf-label">Total This Month</div>
                    <div className="dv4-cf-sub">
                      {catBreakdown.reduce((s, c) => s + c.count, 0)}{" "}
                      transactions
                    </div>
                  </div>
                  <div className="dv4-cf-total">
                    {formatAmount(monthlySpentUSD)}
                  </div>
                </div>
              </>
            ) : (
              <div className="dv4-empty">
                <div className="dv4-empty-icon">📊</div>
                <div className="dv4-empty-title">No spending yet</div>
                <div className="dv4-empty-sub">{t("noExpenses")}</div>
              </div>
            )}
          </div>

          {/* ── Col 2: Weekly Spending Bars ── */}
          <div className="card dv4-panel">
            <div className="dv4-panel-head">
              <div>
                <div className="dv4-ph-eyebrow">Weekly Pattern</div>
                <div
                  className="dv4-ph-title"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  Spending by day of week
                  {!hasRealWeekData && catBreakdown.length > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                        fontSize: 7,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "rgba(255,181,71,0.1)",
                        border: "1px solid rgba(255,181,71,0.25)",
                        color: "#FFB547",
                        opacity: 0.8,
                      }}
                    >
                      estimated
                    </span>
                  )}
                </div>
              </div>
              <div className="dv4-ph-right">
                <div className="dv4-ph-chip">
                  {monthLabel} {navYear}
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 110,
                marginBottom: 8,
              }}
            >
              {WEEK_DAYS.map((day, di) => {
                const val = weekTotals[di];
                const count = weekCounts[di];
                const pctH =
                  weekMax > 0
                    ? Math.max(val > 0 ? 8 : 0, (val / weekMax) * 100)
                    : 0;
                const color = WEEK_COLORS[di];
                const isToday = di === todayDow;
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      height: "100%",
                    }}
                  >
                    {/* Amount label above bar */}
                    <div
                      style={{
                        fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                        fontSize: 8,
                        color: val > 0 ? color : "transparent",
                        letterSpacing: "-0.02em",
                        fontWeight: 700,
                        height: 14,
                        display: "flex",
                        alignItems: "flex-end",
                        transition: "color 0.2s",
                      }}
                    >
                      {val > 0 ? `$${val.toFixed(0)}` : ""}
                    </div>

                    {/* Bar track */}
                    <div
                      style={{
                        width: "100%",
                        flex: 1,
                        background: "var(--border)",
                        borderRadius: "4px 4px 2px 2px",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      {/* Fill */}
                      <div
                        style={{
                          width: "100%",
                          height: `${pctH}%`,
                          background: isToday
                            ? `linear-gradient(180deg, ${color}, ${color}99)`
                            : `${color}88`,
                          borderRadius: "4px 4px 2px 2px",
                          transition:
                            "height 0.7s cubic-bezier(0.34,1.3,0.64,1)",
                          boxShadow: isToday ? `0 0 12px ${color}55` : "none",
                          position: "relative",
                        }}
                      >
                        {/* Today glow line at top */}
                        {isToday && val > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 2,
                              background: color,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Day label */}
                    <div
                      style={{
                        fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                        fontSize: 9,
                        letterSpacing: "0.06em",
                        color: isToday ? color : "var(--text-secondary)",
                        fontWeight: isToday ? 700 : 400,
                        opacity: isToday ? 1 : 0.55,
                      }}
                    >
                      {day}
                    </div>

                    {/* Today dot */}
                    {isToday && (
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: color,
                          marginTop: -2,
                          boxShadow: `0 0 6px ${color}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 6,
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              {[
                {
                  label: "This month total",
                  val:
                    weekGrandTotal > 0
                      ? formatAmount(weekGrandTotal)
                      : "No data yet",
                  color: "var(--text-primary)",
                },
                {
                  label: "Busiest day",
                  val: busiestDayName
                    ? `${busiestDayName} — ${formatAmount(busiestDayAmt)}`
                    : "—",
                  color: busiestDayName
                    ? WEEK_COLORS[busiestIdx]
                    : "var(--text-secondary)",
                },
                {
                  label: "Avg / active day",
                  val:
                    weekGrandTotal > 0
                      ? formatAmount(
                          weekGrandTotal /
                            Math.max(weekTotals.filter((v) => v > 0).length, 1),
                        )
                      : "—",
                  color: "var(--text-primary)",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "9px 10px",
                    background: "var(--dash-tile-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                      fontSize: 7,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      opacity: 0.55,
                      marginBottom: 5,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--dash-mono,'DM Mono',monospace)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: s.color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Stat pills */}
            <div className="dv4-pill-grid">
              <StatPill
                icon="✈️"
                label={t("trips")}
                total={plans.stats?.trips?.total || 0}
                completed={plans.stats?.trips?.completed || 0}
              />
              <StatPill
                icon="🎯"
                label={t("goals")}
                total={plans.stats?.goals?.total || 0}
                completed={plans.stats?.goals?.completed || 0}
              />
              <StatPill
                icon="🤝"
                label={t("givings")}
                total={plans.stats?.givings?.total || 0}
                completed={plans.stats?.givings?.completed || 0}
              />
              <StatPill
                icon="📦"
                label={t("others")}
                total={plans.stats?.others?.total || 0}
                completed={plans.stats?.others?.completed || 0}
              />
            </div>
          </div>

          {/* ── Col 3: Plans Overview ── */}
          <div className="card dv4-panel">
            <div className="dv4-panel-head">
              <div>
                <div className="dv4-ph-eyebrow">Plans Overview</div>
                <div className="dv4-ph-title">Active &amp; completed</div>
              </div>
              <div className="dv4-ph-right">
                <div className="dv4-ph-chip">📅 {monthLabel}</div>
              </div>
            </div>

            {/* Completed banner */}
            {monthlyCompletedPlans.length > 0 && (
              <div className="dv4-comp-banner">
                <div className="dv4-comp-head">
                  <span>✓ Completed</span>
                  <strong>{formatAmount(data?.completedDeductionUSD)}</strong>
                </div>
                {monthlyCompletedPlans.slice(0, 3).map((item) => (
                  <div key={item._id} className="dv4-comp-row">
                    <div className="dv4-comp-tick" />
                    <span className="dv4-comp-name">{item.title}</span>
                    <span className="dv4-comp-amt">
                      {formatAmount(item.amountUSD)}
                    </span>
                  </div>
                ))}
                {monthlyCompletedPlans.length > 3 && (
                  <div className="dv4-comp-more">
                    +{monthlyCompletedPlans.length - 3} more
                  </div>
                )}
              </div>
            )}

            {/* Plan items */}
            {[
              { items: monthlyTrips, icon: "✈️", type: "trips" },
              { items: monthlyGoals, icon: "🎯", type: "goals" },
              { items: monthlyGivings, icon: "🤝", type: "givings" },
              { items: monthlyOthers, icon: "📦", type: "others" },
            ].map(({ items, icon, type }) =>
              items.length > 0 ? (
                <div key={type}>
                  <div className="dv4-type-lbl">
                    {icon} {t(type)}
                  </div>
                  {items.slice(0, 2).map((item) => (
                    <PlanItem
                      key={item._id}
                      item={item}
                      icon={icon}
                      t={t}
                      formatAmount={formatAmount}
                    />
                  ))}
                </div>
              ) : null,
            )}

            {!hasAnyPlans && !monthlyCompletedPlans.length && (
              <div className="dv4-empty" style={{ paddingTop: 24 }}>
                <div className="dv4-empty-icon">📋</div>
                <div className="dv4-empty-title">
                  {language === "kh"
                    ? "គ្មានផែនការ"
                    : `No plans in ${monthLabel}`}
                </div>
                <div className="dv4-empty-sub">{t("noPlans")}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CalendarModal
        isOpen={calModal.open}
        onClose={() => setCalModal({ open: false, view: "monthly" })}
        initialView={calModal.view}
      />
      <ExpenseModal
        isOpen={addExpense}
        onClose={() => setAddExpense(false)}
        editData={null}
        onSuccess={() => {
          setAddExpense(false);
          setBanner({ type: "success", title: t("addedSuccess") });
          loadData(true);
        }}
      />
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </div>
  );
}
