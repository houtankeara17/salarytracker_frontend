// CalendarModal — Modern Redesign 2025
// Dark-first glass morphism with editorial typography & fluid micro-interactions
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { expenseAPI } from "../../utils/api";
import { toKhmerNum } from "../../utils/khmerUtils";

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toISO(date) {
  return new Date(date).toISOString().split("T")[0];
}

const VIEWS = ["daily", "weekly", "monthly", "yearly"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&display=swap');

:root {
  --c-bg:         #080810;
  --c-surface:    #0f0f1a;
  --c-glass:      rgba(255,255,255,0.04);
  --c-glass-hover:rgba(255,255,255,0.07);
  --c-border:     rgba(255,255,255,0.07);
  --c-border-md:  rgba(255,255,255,0.13);
  --c-border-hi:  rgba(255,255,255,0.22);
  --c-text-1:     #F2F0FF;
  --c-text-2:     #8B87A8;
  --c-text-3:     #3E3C55;
  --c-accent:     #7C6BFF;
  --c-accent-2:   #FF6B9D;
  --c-accent-3:   #00D4AA;
  --c-accent-glow:rgba(124,107,255,0.2);
  --c-accent-soft:rgba(124,107,255,0.08);
  --c-today:      #7C6BFF;
  --c-overlay:    rgba(4,4,12,0.85);
  --radius-xl:    24px;
  --radius-md:    14px;
  --radius-sm:    9px;
  --shadow-modal: 0 40px 120px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px -30px rgba(124,107,255,0.15);
  --font-display: 'Fraunces', Georgia, serif;
  --font-ui:      'Syne', system-ui, sans-serif;
  --font-mono:    'DM Mono', 'JetBrains Mono', monospace;
}

[data-theme="light"] {
  --c-bg:         #F8F7FF;
  --c-surface:    #FFFFFF;
  --c-glass:      rgba(0,0,0,0.02);
  --c-glass-hover:rgba(0,0,0,0.04);
  --c-border:     rgba(0,0,0,0.06);
  --c-border-md:  rgba(0,0,0,0.1);
  --c-border-hi:  rgba(0,0,0,0.16);
  --c-text-1:     #120F2A;
  --c-text-2:     #6B6580;
  --c-text-3:     #C0BCCC;
  --c-overlay:    rgba(8,8,20,0.6);
  --shadow-modal: 0 40px 120px -20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
}

/* ═══════════════ OVERLAY ═══════════════ */
.cm-overlay {
  position: fixed; inset: 0;
  background: var(--c-overlay);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
  font-family: var(--font-ui);
  animation: cm-fade 0.2s ease;
}
@keyframes cm-fade { from { opacity: 0 } to { opacity: 1 } }

/* ═══════════════ MODAL BOX ═══════════════ */
.cm-box {
  width: 100%; max-width: 560px;
  background: var(--c-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-modal);
  display: flex; flex-direction: column;
  overflow: hidden;
  max-height: 92vh;
  animation: cm-rise 0.32s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
@keyframes cm-rise {
  from { opacity: 0; transform: translateY(32px) scale(0.96) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}

/* Ambient glow orbs */
.cm-box::before {
  content: '';
  position: absolute; top: -80px; right: -80px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(124,107,255,0.12) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}
.cm-box::after {
  content: '';
  position: absolute; bottom: -60px; left: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

/* ═══════════════ HEADER ═══════════════ */
.cm-hdr {
  padding: 28px 28px 24px;
  position: relative; z-index: 1;
  border-bottom: 1px solid var(--c-border);
}
.cm-hdr-row {
  display: flex; justify-content: space-between; align-items: flex-start;
}
.cm-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-accent);
  background: var(--c-accent-soft);
  border: 1px solid rgba(124,107,255,0.2);
  border-radius: 30px;
  padding: 4px 10px;
  display: inline-block; margin-bottom: 10px;
}
.cm-htitle {
  font-family: var(--font-display);
  font-size: 34px; font-weight: 300;
  color: var(--c-text-1);
  line-height: 1; letter-spacing: -0.02em;
  font-style: italic;
}
.cm-htitle span {
  font-style: normal; font-weight: 400;
  color: var(--c-text-2);
  font-size: 22px; margin-left: 6px;
}
.cm-close {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s ease; flex-shrink: 0;
}
.cm-close:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
  color: var(--c-text-1);
  transform: rotate(90deg);
}

/* Stats strip */
.cm-stats {
  display: flex; gap: 1px;
  margin-top: 20px;
  background: var(--c-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.cm-stat {
  flex: 1; padding: 12px 14px;
  background: var(--c-surface);
  display: flex; flex-direction: column; gap: 3px;
  transition: background 0.15s;
}
.cm-stat:hover { background: var(--c-glass-hover); }
.cm-stat:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
.cm-stat:last-child  { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
.cm-stat-val {
  font-family: var(--font-mono);
  font-size: 15px; font-weight: 500;
  color: var(--c-text-1); letter-spacing: -0.03em;
}
.cm-stat-lbl {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--c-text-3);
}
.cm-stat-accent .cm-stat-val { color: var(--c-accent); }

/* ═══════════════ TABS ═══════════════ */
.cm-tabs {
  display: flex; padding: 0 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  gap: 0; position: relative; z-index: 1;
}
.cm-tab {
  padding: 14px 16px 13px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  border: none; cursor: pointer;
  background: transparent;
  color: var(--c-text-3);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.16s ease;
  font-family: var(--font-ui);
  position: relative;
}
.cm-tab::after {
  content: '';
  position: absolute; bottom: -1px; left: 16px; right: 16px;
  height: 2px; border-radius: 2px;
  background: var(--c-accent);
  transform: scaleX(0);
  transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1);
}
.cm-tab:hover { color: var(--c-text-2); }
.cm-tab.on {
  color: var(--c-text-1);
  border-bottom-color: transparent;
}
.cm-tab.on::after { transform: scaleX(1); }

/* ═══════════════ NAV ═══════════════ */
.cm-nav {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
  position: relative; z-index: 1;
}
.cm-navbtn {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.16s ease; flex-shrink: 0; line-height: 1;
}
.cm-navbtn:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
  color: var(--c-text-1);
  transform: scale(1.05);
}
.cm-navbtn:active { transform: scale(0.95); }
.cm-navlabel {
  font-family: var(--font-display);
  font-size: 16px; font-weight: 300;
  font-style: italic;
  color: var(--c-text-1); flex: 1;
}
.cm-navyear {
  font-family: var(--font-mono);
  font-size: 11px; color: var(--c-text-3);
  letter-spacing: 0.04em;
}

/* ═══════════════ CONTENT AREA ═══════════════ */
.cm-ct {
  overflow-y: auto; flex: 1;
  max-height: 420px;
  padding: 18px 20px 22px;
  background: var(--c-bg);
  position: relative; z-index: 1;
}
.cm-ct::-webkit-scrollbar { width: 3px; }
.cm-ct::-webkit-scrollbar-track { background: transparent; }
.cm-ct::-webkit-scrollbar-thumb {
  background: var(--c-border-md);
  border-radius: 3px;
}

/* ═══════════════ EXPENSE ROWS ═══════════════ */
.cm-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  margin-bottom: 6px;
  transition: all 0.18s ease;
  position: relative; overflow: hidden;
}
.cm-row::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; border-radius: 2px;
  background: var(--c-accent);
  transform: scaleY(0);
  transition: transform 0.2s ease;
}
.cm-row:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
  transform: translateX(2px);
}
.cm-row:hover::before { transform: scaleY(1); }
.cm-row-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.cm-row-name {
  font-size: 13px; font-weight: 600;
  color: var(--c-text-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: var(--font-ui);
}
.cm-row-meta {
  font-size: 11px; color: var(--c-text-3);
  margin-top: 2px; font-family: var(--font-ui);
}
.cm-row-meta span {
  color: var(--c-text-2);
  background: var(--c-glass);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.cm-row-amt {
  font-family: var(--font-mono);
  font-size: 13px; font-weight: 500;
  color: var(--c-text-1);
  flex-shrink: 0; margin-left: auto; text-align: right;
}
.cm-qr {
  display: inline-block;
  margin-top: 3px;
  font-size: 8px; font-weight: 700; letter-spacing: 0.08em;
  color: var(--c-accent);
  background: var(--c-accent-soft);
  border-radius: 4px; padding: 1px 5px;
}

/* ═══════════════ WEEKLY BARS ═══════════════ */
.cm-wk-chart {
  display: flex; align-items: flex-end; gap: 6px;
  height: 80px; margin-bottom: 18px;
  padding: 4px 2px 0;
}
.cm-wk-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 5px; height: 100%;
}
.cm-wk-amt-label {
  font-size: 8px; font-weight: 500;
  font-family: var(--font-mono);
  color: transparent;
  line-height: 1; height: 10px;
  transition: color 0.2s;
}
.cm-wk-amt-label.vis { color: var(--c-text-2); }
.cm-wk-track {
  width: 100%; background: var(--c-glass);
  border: 1px solid var(--c-border);
  border-radius: 5px 5px 4px 4px; flex: 1;
  display: flex; align-items: flex-end;
  overflow: hidden; position: relative;
}
.cm-wk-fill {
  width: 100%; border-radius: 5px 5px 4px 4px;
  background: linear-gradient(180deg, var(--c-accent) 0%, rgba(124,107,255,0.4) 100%);
  transition: height 0.45s cubic-bezier(0.34,1.2,0.64,1);
  min-height: 0;
}
.cm-wk-fill.today {
  background: linear-gradient(180deg, var(--c-accent-2) 0%, rgba(255,107,157,0.4) 100%);
  box-shadow: 0 0 12px rgba(255,107,157,0.3);
}
.cm-wk-day {
  font-size: 9px; font-weight: 700;
  color: var(--c-text-3); letter-spacing: 0.06em;
  font-family: var(--font-ui);
}
.cm-wk-day.today { color: var(--c-accent-2); }

.cm-wk-item {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px;
  border-radius: var(--radius-md);
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  margin-bottom: 5px; cursor: pointer;
  transition: all 0.16s ease;
  text-align: left; font-family: var(--font-ui);
  position: relative; overflow: hidden;
}
.cm-wk-item:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
}
.cm-wk-item.today { border-color: rgba(124,107,255,0.3); }
.cm-wk-item.today::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(124,107,255,0.05), transparent 60%);
  pointer-events: none;
}
.cm-wk-daynum {
  width: 32px; height: 32px; border-radius: 9px;
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 12px; font-weight: 500;
  color: var(--c-text-2); flex-shrink: 0;
  transition: all 0.16s;
}
.cm-wk-daynum.today {
  background: var(--c-today);
  border-color: var(--c-today);
  color: #fff;
  box-shadow: 0 0 14px rgba(124,107,255,0.5);
}
.cm-wk-name { font-size: 13px; font-weight: 600; color: var(--c-text-1); }
.cm-wk-sub  { font-size: 10px; color: var(--c-text-3); margin-top: 2px; letter-spacing: 0.02em; }
.cm-today-pill {
  font-size: 8px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent); background: var(--c-accent-soft);
  border: 1px solid rgba(124,107,255,0.2);
  border-radius: 20px; padding: 2px 7px; margin-left: 7px;
}
.cm-wk-total {
  font-family: var(--font-mono); font-size: 13px; font-weight: 500;
  color: var(--c-text-1);
}
.cm-wk-total.nil { color: var(--c-text-3); }

/* ═══════════════ MONTHLY GRID ═══════════════ */
.cm-cal-dh {
  display: grid; grid-template-columns: repeat(7, 1fr);
  gap: 2px; margin-bottom: 5px;
}
.cm-cal-dhc {
  text-align: center; font-size: 9px; font-weight: 700;
  color: var(--c-text-3); padding: 4px;
  letter-spacing: 0.08em; font-family: var(--font-ui);
  text-transform: uppercase;
}
.cm-cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.cm-cal-day {
  padding: 6px 3px 5px; min-height: 50px;
  border-radius: 10px;
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.15s ease;
  font-family: var(--font-ui);
  position: relative; overflow: hidden;
}
.cm-cal-day:hover {
  background: var(--c-glass);
  border-color: var(--c-border);
}
.cm-cal-day.has {
  background: var(--c-glass);
  border-color: var(--c-border);
}
.cm-cal-day.has:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
}
.cm-cal-day.today {
  background: var(--c-accent-soft) !important;
  border-color: rgba(124,107,255,0.3) !important;
}
.cm-cal-day.today::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(124,107,255,0.1), transparent 70%);
}
.cm-cal-num {
  font-family: var(--font-mono); font-size: 12px; font-weight: 400;
  color: var(--c-text-3); line-height: 1; position: relative;
}
.cm-cal-day.has .cm-cal-num { color: var(--c-text-1); font-weight: 500; }
.cm-cal-day.today .cm-cal-num {
  color: var(--c-accent);
  font-weight: 700;
}
.cm-cal-bar {
  width: 70%; height: 2px; border-radius: 2px;
  background: var(--c-border);
  margin-top: 5px; overflow: hidden;
}
.cm-cal-barfill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  transition: width 0.4s ease;
}
.cm-cal-day.today .cm-cal-barfill { background: var(--c-accent); }
.cm-cal-mini {
  font-size: 8px; font-family: var(--font-mono); font-weight: 400;
  color: var(--c-text-3); margin-top: 3px; line-height: 1;
}
.cm-cal-day.has .cm-cal-mini { color: var(--c-text-2); }
.cm-cal-day.today .cm-cal-mini { color: var(--c-accent); }

.cm-mo-foot {
  margin-top: 14px; padding: 13px 16px;
  border-radius: var(--radius-md);
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between;
}
.cm-mo-foot-lbl {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--c-text-3);
  font-family: var(--font-ui);
}
.cm-mo-foot-val {
  font-family: var(--font-mono); font-size: 16px; font-weight: 500;
  color: var(--c-text-1); letter-spacing: -0.02em;
}

/* ═══════════════ YEARLY GRID ═══════════════ */
.cm-yr-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
}
.cm-yr-card {
  padding: 14px 12px 12px;
  border-radius: var(--radius-md);
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  cursor: pointer; text-align: left;
  display: flex; flex-direction: column; gap: 8px;
  transition: all 0.16s ease;
  font-family: var(--font-ui);
  width: 100%; position: relative; overflow: hidden;
}
.cm-yr-card:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
  transform: translateY(-1px);
}
.cm-yr-card.cur {
  border-color: rgba(124,107,255,0.35);
  background: var(--c-accent-soft);
}
.cm-yr-card.cur::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
}
.cm-yr-mn {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--c-text-3);
}
.cm-yr-card.cur .cm-yr-mn { color: var(--c-accent); }
.cm-yr-track {
  height: 3px; border-radius: 3px;
  background: var(--c-border); overflow: hidden;
}
.cm-yr-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  transition: width 0.5s cubic-bezier(0.34,1.2,0.64,1);
}
.cm-yr-amt {
  font-family: var(--font-mono); font-size: 14px; font-weight: 500;
  color: var(--c-text-1); letter-spacing: -0.02em;
}
.cm-yr-ct { font-size: 10px; color: var(--c-text-3); letter-spacing: 0.02em; }

/* ═══════════════ DRILL VIEW ═══════════════ */
.cm-drill-hdr {
  display: flex; align-items: center;
  gap: 10px; margin-bottom: 16px;
}
.cm-back {
  padding: 7px 12px; border-radius: 8px;
  background: var(--c-glass);
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  cursor: pointer; transition: all 0.15s ease; font-family: var(--font-ui);
}
.cm-back:hover {
  background: var(--c-glass-hover);
  border-color: var(--c-border-md);
  color: var(--c-text-1);
}
.cm-drill-name {
  font-family: var(--font-display);
  font-size: 16px; font-style: italic; font-weight: 300;
  color: var(--c-text-1);
}
.cm-drill-sub {
  font-size: 10px; color: var(--c-text-3); margin-top: 2px;
  letter-spacing: 0.04em; font-family: var(--font-ui);
}
.cm-total-strip {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-radius: var(--radius-md);
  background: var(--c-accent-soft);
  border: 1px solid rgba(124,107,255,0.2);
  margin-top: 10px;
}
.cm-total-lbl {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--c-accent);
  font-family: var(--font-ui);
}
.cm-total-val {
  font-family: var(--font-mono); font-size: 16px; font-weight: 500;
  color: var(--c-text-1); letter-spacing: -0.02em;
}

/* ═══════════════ STATES ═══════════════ */
.cm-loading {
  display: flex; align-items: center; justify-content: center;
  height: 140px; gap: 10px; flex-direction: column;
}
.cm-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-accent);
  animation: cm-spin 0.7s linear infinite;
}
.cm-spin-label {
  font-size: 11px; color: var(--c-text-3);
  letter-spacing: 0.06em; font-family: var(--font-ui);
}
@keyframes cm-spin { to { transform: rotate(360deg) } }
.cm-empty {
  text-align: center; padding: 52px 0;
  color: var(--c-text-3);
}
.cm-empty-icon {
  font-size: 30px; margin-bottom: 10px;
  display: block; opacity: 0.4;
  animation: cm-float 3s ease-in-out infinite;
}
.cm-empty-msg {
  font-size: 12px; letter-spacing: 0.04em;
  font-family: var(--font-ui);
}
@keyframes cm-float {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-6px) }
}

/* Staggered row entrance */
.cm-row, .cm-wk-item, .cm-yr-card {
  animation: cm-row-in 0.25s ease both;
}
@keyframes cm-row-in {
  from { opacity: 0; transform: translateY(8px) }
  to   { opacity: 1; transform: translateY(0) }
}
.cm-row:nth-child(1)  { animation-delay: 0.03s }
.cm-row:nth-child(2)  { animation-delay: 0.06s }
.cm-row:nth-child(3)  { animation-delay: 0.09s }
.cm-row:nth-child(4)  { animation-delay: 0.12s }
.cm-row:nth-child(5)  { animation-delay: 0.15s }
.cm-wk-item:nth-child(1) { animation-delay: 0.04s }
.cm-wk-item:nth-child(2) { animation-delay: 0.08s }
.cm-wk-item:nth-child(3) { animation-delay: 0.12s }
.cm-wk-item:nth-child(4) { animation-delay: 0.16s }
.cm-wk-item:nth-child(5) { animation-delay: 0.20s }
.cm-wk-item:nth-child(6) { animation-delay: 0.24s }
.cm-wk-item:nth-child(7) { animation-delay: 0.28s }
`;

let _css_injected = false;
function injectCSS() {
  if (_css_injected) return;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
  _css_injected = true;
}

export default function CalendarModal({
  isOpen,
  onClose,
  initialView = "monthly",
}) {
  const { t, formatAmount, formatNum, language } = useApp();
  injectCSS();

  const [view, setView] = useState(initialView);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selDate, setSelDate] = useState(new Date());
  const [wkStart, setWkStart] = useState(getWeekStart(new Date()));
  const [drill, setDrill] = useState(null);
  const [drillTitle, setDrillTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDrill(null);
      load();
    }
  }, [isOpen, view, selYear, selMonth, selDate, wkStart]);

  const load = async () => {
    setLoading(true);
    try {
      let p = {};
      if (view === "daily") p = { date: toISO(selDate) };
      if (view === "weekly")
        p = { startDate: toISO(wkStart), endDate: toISO(addDays(wkStart, 6)) };
      if (view === "monthly") p = { month: selMonth + 1, year: selYear };
      if (view === "yearly") p = { year: selYear };
      const res = await expenseAPI.getAll(p);
      setExpenses(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearDrill = useCallback(() => setDrill(null), []);

  const onPrev = useCallback(() => {
    clearDrill();
    if (view === "daily") setSelDate((d) => addDays(d, -1));
    else if (view === "weekly") setWkStart((d) => addDays(d, -7));
    else if (view === "monthly") {
      setSelMonth((m) => {
        if (m === 0) {
          setSelYear((y) => y - 1);
          return 11;
        }
        return m - 1;
      });
    } else setSelYear((y) => y - 1);
  }, [view, clearDrill]);

  const onNext = useCallback(() => {
    clearDrill();
    if (view === "daily") setSelDate((d) => addDays(d, 1));
    else if (view === "weekly") setWkStart((d) => addDays(d, 7));
    else if (view === "monthly") {
      setSelMonth((m) => {
        if (m === 11) {
          setSelYear((y) => y + 1);
          return 0;
        }
        return m + 1;
      });
    } else setSelYear((y) => y + 1);
  }, [view, clearDrill]);

  const isKh = language === "kh";
  const locale = isKh ? "km-KH" : "en-US";

  const MONTHS_S = isKh
    ? [
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
      ]
    : [
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
  const MONTHS_L = isKh
    ? MONTHS_S
    : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
  const DAY_H = isKh
    ? ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalAll = expenses.reduce((s, e) => s + (e.amountUSD || 0), 0);
  const txCount = expenses.length;
  const maxDay = new Date(selYear, selMonth + 1, 0).getDate();
  const avgPerDay = totalAll / Math.max(maxDay, 1);

  const expDay = (d) =>
    expenses.filter((e) => {
      const dt = new Date(e.date);
      return (
        dt.getFullYear() === selYear &&
        dt.getMonth() === selMonth &&
        dt.getDate() === d
      );
    });
  const expMo = (mi) =>
    expenses.filter((e) => {
      const dt = new Date(e.date);
      return dt.getFullYear() === selYear && dt.getMonth() === mi;
    });
  const dayTot = (d) => expDay(d).reduce((s, e) => s + (e.amountUSD || 0), 0);
  const moTot = (mi) => expMo(mi).reduce((s, e) => s + (e.amountUSD || 0), 0);

  const weekRows = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(wkStart, i),
      ds = toISO(day);
    const items = expenses.filter((e) => toISO(new Date(e.date)) === ds);
    return {
      day,
      ds,
      items,
      total: items.reduce((s, e) => s + (e.amountUSD || 0), 0),
    };
  });
  const maxWk = Math.max(...weekRows.map((w) => w.total), 0.01);

  const navLabel = () => {
    if (view === "daily")
      return new Date(selDate).toLocaleDateString(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    if (view === "weekly")
      return `${new Date(wkStart).toLocaleDateString(locale, { month: "short", day: "numeric" })} – ${addDays(wkStart, 6).toLocaleDateString(locale, { month: "short", day: "numeric" })}`;
    if (view === "monthly") return MONTHS_L[selMonth];
    return String(selYear);
  };

  if (!isOpen) return null;

  const today = new Date();
  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selYear, selMonth, 1).getDay();
  const maxDayTot = Math.max(
    ...Array.from({ length: daysInMonth }, (_, i) => dayTot(i + 1)),
    0.01,
  );

  /* ─── ExpRow ─── */
  const ExpRow = ({ item }) => (
    <div className="cm-row">
      <div className="cm-row-icon">{item.categoryEmoji || "💸"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cm-row-name">{item.itemName}</div>
        <div className="cm-row-meta">
          <span>{t(item.category)}</span>&nbsp;
          {isKh ? toKhmerNum(item.quantity) : item.quantity}× ·{" "}
          {t(item.paymentMethod)}
          {item.noted && <>&nbsp;· {item.noted}</>}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="cm-row-amt">
          {formatAmount(item.amountUSD, item.amountKHR)}
        </div>
        {item.imageQr && <div className="cm-qr">QR</div>}
      </div>
    </div>
  );

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-box" onClick={(e) => e.stopPropagation()}>
        {/* ── HEADER ── */}
        <div className="cm-hdr">
          <div className="cm-hdr-row">
            <div>
              <div className="cm-badge">Expense Calendar</div>
              <div className="cm-htitle">
                {MONTHS_L[selMonth]}
                <span>{selYear}</span>
              </div>
            </div>
            <button className="cm-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="cm-stats">
            <div className="cm-stat cm-stat-accent">
              <div className="cm-stat-val">{formatAmount(totalAll)}</div>
              <div className="cm-stat-lbl">Total Spent</div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-val">
                {isKh ? toKhmerNum(txCount) : txCount}
              </div>
              <div className="cm-stat-lbl">Transactions</div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-val">{formatAmount(avgPerDay)}</div>
              <div className="cm-stat-lbl">Daily Avg</div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="cm-tabs">
          {VIEWS.map((v) => (
            <button
              key={v}
              className={`cm-tab${view === v ? " on" : ""}`}
              onClick={() => {
                setView(v);
                setDrill(null);
              }}
            >
              {t(v)}
            </button>
          ))}
        </div>

        {/* ── NAV ── */}
        <div className="cm-nav">
          <button className="cm-navbtn" onClick={onPrev}>
            ‹
          </button>
          <button className="cm-navbtn" onClick={onNext}>
            ›
          </button>
          <div className="cm-navlabel">{navLabel()}</div>
          {view !== "yearly" && <div className="cm-navyear">{selYear}</div>}
        </div>

        {/* ── CONTENT ── */}
        <div className="cm-ct">
          {/* Loading */}
          {loading && (
            <div className="cm-loading">
              <div className="cm-spinner" />
              <div className="cm-spin-label">Loading…</div>
            </div>
          )}

          {/* ── DRILL VIEW ── */}
          {!loading && drill && (
            <div>
              <div className="cm-drill-hdr">
                <button className="cm-back" onClick={() => setDrill(null)}>
                  ← {t("back")}
                </button>
                <div>
                  <div className="cm-drill-name">{drillTitle}</div>
                  <div className="cm-drill-sub">
                    {isKh ? toKhmerNum(drill.length) : drill.length}{" "}
                    {t("items")}
                  </div>
                </div>
              </div>
              {drill.length === 0 ? (
                <div className="cm-empty">
                  <span className="cm-empty-icon">🌿</span>
                  <div className="cm-empty-msg">{t("noExpenses")}</div>
                </div>
              ) : (
                <>
                  {drill.map((item) => (
                    <ExpRow key={item._id} item={item} />
                  ))}
                  <div className="cm-total-strip">
                    <span className="cm-total-lbl">{t("total")}</span>
                    <span className="cm-total-val">
                      {formatAmount(
                        drill.reduce((s, i) => s + (i.amountUSD || 0), 0),
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── DAILY ── */}
          {!loading &&
            !drill &&
            view === "daily" &&
            (expenses.length === 0 ? (
              <div className="cm-empty">
                <span className="cm-empty-icon">🌿</span>
                <div className="cm-empty-msg">{t("noExpenses")}</div>
              </div>
            ) : (
              expenses.map((item) => <ExpRow key={item._id} item={item} />)
            ))}

          {/* ── WEEKLY ── */}
          {!loading && !drill && view === "weekly" && (
            <div>
              {/* Bar chart */}
              <div className="cm-wk-chart">
                {weekRows.map(({ day, ds, total }) => {
                  const pct = total / maxWk;
                  const isToday = toISO(new Date()) === ds;
                  return (
                    <div key={ds} className="cm-wk-col">
                      <div
                        className={`cm-wk-amt-label${total > 0 ? " vis" : ""}`}
                      >
                        {total > 0 ? `$${total.toFixed(0)}` : ""}
                      </div>
                      <div className="cm-wk-track">
                        <div
                          className={`cm-wk-fill${isToday ? " today" : ""}`}
                          style={{
                            height: `${Math.max(pct * 100, total > 0 ? 6 : 0)}%`,
                          }}
                        />
                      </div>
                      <div className={`cm-wk-day${isToday ? " today" : ""}`}>
                        {new Date(day).toLocaleDateString(locale, {
                          weekday: "narrow",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day rows */}
              {weekRows.map(({ day, ds, items, total }) => {
                const isToday = toISO(new Date()) === ds;
                return (
                  <button
                    key={ds}
                    className={`cm-wk-item${isToday ? " today" : ""}`}
                    onClick={() => {
                      setDrill(items);
                      setDrillTitle(
                        new Date(day).toLocaleDateString(locale, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }),
                      );
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div className={`cm-wk-daynum${isToday ? " today" : ""}`}>
                        {isKh
                          ? toKhmerNum(new Date(day).getDate())
                          : new Date(day).getDate()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="cm-wk-name">
                            {new Date(day).toLocaleDateString(locale, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {isToday && (
                            <span className="cm-today-pill">Today</span>
                          )}
                        </div>
                        <div className="cm-wk-sub">
                          {isKh ? toKhmerNum(items.length) : items.length}{" "}
                          {t("items")}
                        </div>
                      </div>
                    </div>
                    <div className={`cm-wk-total${total === 0 ? " nil" : ""}`}>
                      {total > 0 ? formatAmount(total) : "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── MONTHLY ── */}
          {!loading && !drill && view === "monthly" && (
            <div>
              <div className="cm-cal-dh">
                {DAY_H.map((d, i) => (
                  <div key={i} className="cm-cal-dhc">
                    {d}
                  </div>
                ))}
              </div>
              <div className="cm-cal-grid">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const items = expDay(day);
                  const total = dayTot(day);
                  const isToday =
                    today.getFullYear() === selYear &&
                    today.getMonth() === selMonth &&
                    today.getDate() === day;
                  const barPct = total > 0 ? (total / maxDayTot) * 100 : 0;
                  return (
                    <button
                      key={day}
                      className={`cm-cal-day${isToday ? " today" : items.length > 0 ? " has" : ""}`}
                      onClick={() => {
                        setDrill(items);
                        setDrillTitle(
                          `${MONTHS_S[selMonth]} ${isKh ? toKhmerNum(day) : day}`,
                        );
                      }}
                      style={{ border: "none" }}
                    >
                      <span className="cm-cal-num">
                        {isKh ? toKhmerNum(day) : day}
                      </span>
                      {items.length > 0 && (
                        <div className="cm-cal-bar">
                          <div
                            className="cm-cal-barfill"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      )}
                      {total > 0 && (
                        <span className="cm-cal-mini">${total.toFixed(0)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="cm-mo-foot">
                <div className="cm-mo-foot-lbl">
                  {MONTHS_S[selMonth]} {selYear} ·{" "}
                  {isKh ? toKhmerNum(txCount) : txCount} {t("items")}
                </div>
                <div className="cm-mo-foot-val">{formatAmount(totalAll)}</div>
              </div>
            </div>
          )}

          {/* ── YEARLY ── */}
          {!loading &&
            !drill &&
            view === "yearly" &&
            (() => {
              const max = Math.max(
                ...Array.from({ length: 12 }, (_, mi) => moTot(mi)),
                0.01,
              );
              return (
                <div className="cm-yr-grid">
                  {MONTHS_S.map((ml, mi) => {
                    const items = expMo(mi);
                    const total = moTot(mi);
                    const isCur =
                      today.getMonth() === mi &&
                      today.getFullYear() === selYear;
                    return (
                      <button
                        key={mi}
                        className={`cm-yr-card${isCur ? " cur" : ""}`}
                        onClick={() => {
                          setDrill(items);
                          setDrillTitle(MONTHS_L[mi]);
                        }}
                      >
                        <div className="cm-yr-mn">{ml}</div>
                        <div className="cm-yr-track">
                          <div
                            className="cm-yr-fill"
                            style={{ width: `${(total / max) * 100}%` }}
                          />
                        </div>
                        <div className="cm-yr-amt">
                          {total > 0 ? `$${total.toFixed(0)}` : "—"}
                        </div>
                        <div className="cm-yr-ct">
                          {isKh ? toKhmerNum(items.length) : items.length}{" "}
                          {t("items")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
