// src/pages/SavingsPage.js — Redesigned to match SalaryPage design system
// Uses globals.css tokens + same Syne/DM Mono/DM Sans font stack
// All logic identical to original — only UI updated
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { savingAPI } from "../utils/api";
import SalaryModal from "../components/modals/SalaryModal";
import DeleteModal from "../components/modals/DeleteModal";
import StatusBanner from "../components/StatusBanner";

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];

const MONTH_ORDER = [
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

/* ── Extra CSS (mirrors SalaryPage, rebranded for savings #FFB547 amber) ── */
const SVP_CSS = `
.svp-root {
  display: flex; flex-direction: column; gap: 20px;
  animation: svp-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes svp-in {
  from { opacity:0; transform:translateY(12px) }
  to   { opacity:1; transform:translateY(0) }
}

/* Header */
.svp-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 22px 0 18px; border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 14px;
}
.svp-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.55; margin-bottom: 5px;
}
.svp-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.025em; line-height: 1;
}
.svp-subtitle {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: var(--text-secondary);
  margin-top: 6px; display: flex; gap: 14px; flex-wrap: wrap;
}
.svp-subtitle-item { display: flex; align-items: center; gap: 5px; }
.svp-subtitle-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}

/* Stats band */
.svp-stats-band {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
@media(max-width:640px){ .svp-stats-band{ grid-template-columns:1fr; } }
.svp-stat-tile {
  padding: 16px 18px; border-radius: 14px;
  position: relative; overflow: hidden;
  transition: transform .15s;
}
.svp-stat-tile:hover { transform: translateY(-2px); }
.svp-stat-tile::after {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background: var(--svt-c, #FFB547); opacity: 0.6; border-radius: 2px 2px 0 0;
}
.svp-st-label {
  font-family: 'DM Mono', monospace;
  font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.65; margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.svp-st-label::before {
  content:''; width:16px; height:1px; background: var(--svt-c, #FFB547); opacity: 0.5;
}
.svp-st-val {
  font-family: 'DM Mono', monospace;
  font-size: 22px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.03em; line-height: 1;
  margin-bottom: 4px;
}
.svp-st-sub { font-size: 10px; color: var(--text-secondary); opacity: 0.6; }

/* Toolbar */
.svp-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.svp-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.svp-year-select {
  height: 32px; padding: 0 28px 0 10px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.04em;
  background: var(--dash-tile-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-primary); cursor: pointer;
  transition: border-color .14s;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23FFB547'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  outline: none;
}
.svp-year-select:focus { border-color: #FFB547; }
.svp-clear-btn {
  height: 32px; padding: 0 12px;
  font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase;
  background: transparent; border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-secondary); cursor: pointer;
  transition: border-color .14s, color .14s;
}
.svp-clear-btn:hover { border-color: #FFB547; color: var(--text-primary); }
.svp-count-badge {
  font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.08em;
  color: var(--text-secondary); opacity: 0.55;
  padding: 2px 8px; border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
}

/* Grid */
.svp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

/* Saving card */
.svp-card {
  padding: 18px 20px; border-radius: 16px;
  position: relative; overflow: hidden;
  transition: transform .16s, box-shadow .16s;
  display: flex; flex-direction: column;
}
.svp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.svp-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg, var(--svc-main, #FFB547), var(--svc-right, #FF8C6B));
  border-radius: 3px 3px 0 0;
}
.svp-card-glow {
  position: absolute; bottom: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle, var(--svc-main, #FFB547) 0%, transparent 70%);
  opacity: 0.06; pointer-events: none; transition: opacity .2s;
}
.svp-card:hover .svp-card-glow { opacity: 0.12; }

.svp-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.svp-card-month-badge {
  font-family: 'DM Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 9px; border-radius: 4px;
}
.svp-card-actions {
  display: flex; gap: 4px; opacity: 0; transition: opacity .15s;
}
.svp-card:hover .svp-card-actions { opacity: 1; }
.svp-action-btn {
  width: 26px; height: 26px; border-radius: 6px;
  background: var(--dash-tile-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; cursor: pointer;
  transition: background .14s, border-color .14s, transform .12s;
}
.svp-action-btn:hover { background: var(--border); transform: scale(1.08); }
.svp-action-btn.danger:hover {
  background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3);
}

.svp-card-amount {
  font-family: 'DM Mono', monospace;
  font-size: 24px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.04em; line-height: 1;
  margin-bottom: 5px;
}
.svp-card-raw {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: var(--text-secondary); opacity: 0.55;
}
.svp-card-note {
  margin-top: 12px; padding: 8px 10px;
  border-radius: 8px; border-left: 2px solid #FFB547;
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
  font-size: 11px; color: var(--text-secondary); line-height: 1.5;
}

/* Year section label */
.svp-year-group-label {
  display: flex; align-items: center; gap: 10px;
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.5;
  margin-bottom: 8px; margin-top: 4px;
}
.svp-year-group-label::after { content:''; flex:1; height:1px; background:var(--border); }

/* Empty state */
.svp-empty {
  grid-column: 1 / -1; text-align: center; padding: 60px 20px; border-radius: 20px;
}
.svp-empty-icon {
  font-size: 36px; opacity: 0.25; margin-bottom: 12px; display: block;
  animation: svp-float 4s ease-in-out infinite;
}
@keyframes svp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.svp-empty-title {
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
  color: var(--text-primary); margin-bottom: 5px;
}
.svp-empty-sub { font-size: 12px; color: var(--text-secondary); opacity: 0.6; }

/* Skeleton */
.svp-skel {
  background: linear-gradient(90deg,
    rgba(128,128,128,0.06) 0%,
    rgba(128,128,128,0.12) 50%,
    rgba(128,128,128,0.06) 100%);
  background-size: 300% 100%;
  animation: svp-shimmer 1.6s ease infinite;
  border-radius: 16px;
}
@keyframes svp-shimmer { 0%{background-position:300% 0} 100%{background-position:-300% 0} }

/* Stagger cards */
.svp-card { animation: svp-card-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.svp-card:nth-child(1){animation-delay:0.03s}
.svp-card:nth-child(2){animation-delay:0.06s}
.svp-card:nth-child(3){animation-delay:0.09s}
.svp-card:nth-child(4){animation-delay:0.12s}
.svp-card:nth-child(5){animation-delay:0.15s}
.svp-card:nth-child(6){animation-delay:0.18s}
.svp-card:nth-child(7){animation-delay:0.21s}
.svp-card:nth-child(8){animation-delay:0.24s}
@keyframes svp-card-in {
  from { opacity:0; transform:translateY(10px) scale(0.98) }
  to   { opacity:1; transform:translateY(0) scale(1) }
}
`;

let _svp_injected = false;
function injectCSS() {
  if (_svp_injected) return;
  const s = document.createElement("style");
  s.textContent = SVP_CSS;
  document.head.appendChild(s);
  _svp_injected = true;
}

/* ── Accent colors per year — savings uses amber/warm palette as base ── */
const YEAR_ACCENTS = [
  { main: "#FFB547", right: "#FF8C6B" }, // amber → coral  (savings color)
  { main: "#00D4AA", right: "#34D399" }, // teal → emerald
  { main: "#7C6BFF", right: "#A78BFA" }, // purple → violet
  { main: "#60CFFF", right: "#7C6BFF" }, // blue → purple
  { main: "#FF6B9D", right: "#A78BFA" }, // pink → violet
];
function yearAccent(year) {
  return YEAR_ACCENTS[(year - 2024) % YEAR_ACCENTS.length] || YEAR_ACCENTS[0];
}

export default function SavingsPage() {
  injectCSS();

  const { t, formatAmount } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [banner, setBanner] = useState(null);

  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await savingAPI.getAll(
        filterYear ? { year: filterYear } : {},
      );
      setItems(res.data || []);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to load", sub: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterYear]);

  const handleModalSuccess = (savedItem) => {
    if (!savedItem) {
      load();
      return;
    }
    if (editDataRef.current) {
      setItems((prev) =>
        prev.map((i) => (i._id === savedItem._id ? savedItem : i)),
      );
      setBanner({ type: "update", title: t("updatedSuccess") });
    } else {
      setItems((prev) => [savedItem, ...prev]);
      setBanner({ type: "success", title: t("addedSuccess") });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await savingAPI.delete(deleteId);
      setBanner({ type: "delete", title: t("deletedSuccess") });
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setBanner({ type: "error", title: "Delete failed", sub: err.message });
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived stats ── */
  const totalUSD = items.reduce((s, i) => s + (i.amountUSD || 0), 0);
  const avgUSD = items.length ? totalUSD / items.length : 0;
  const maxUSD = items.length
    ? Math.max(...items.map((i) => i.amountUSD || 0))
    : 0;

  /* ── Group by year, sort months ── */
  const grouped = items.reduce((acc, item) => {
    const y = item.year || "—";
    if (!acc[y]) acc[y] = [];
    acc[y].push(item);
    return acc;
  }, {});
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
  sortedYears.forEach((y) => {
    grouped[y].sort(
      (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
    );
  });

  return (
    <div className="svp-root">
      {/* ── Header ── */}
      <div className="svp-header">
        <div>
          <div className="svp-eyebrow">Savings Management</div>
          <div className="svp-title">🏦 {t("savings")}</div>
          <div className="svp-subtitle">
            <span className="svp-subtitle-item">
              <span
                className="svp-subtitle-dot"
                style={{ background: "#FFB547" }}
              />
              {t("total")}: {formatAmount(totalUSD)}
            </span>
            <span className="svp-subtitle-item">
              <span
                className="svp-subtitle-dot"
                style={{ background: "#00D4AA" }}
              />
              Avg: {formatAmount(avgUSD)}/mo
            </span>
            <span className="svp-subtitle-item">
              <span
                className="svp-subtitle-dot"
                style={{ background: "#7C6BFF" }}
              />
              {items.length} {items.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{
            // background: "linear-gradient(135deg,#FFB547,#FF8C6B)",
            // boxShadow: "0 4px 16px rgba(255,181,71,0.35)",
            border: "none",
          }}
          onClick={() => {
            setEditData(null);
            setModal(true);
          }}
        >
          + {t("addSaving")}
        </button>
      </div>

      {/* ── Stats band ── */}
      {!loading && items.length > 0 && (
        <div className="svp-stats-band">
          {[
            {
              label: "Total Saved",
              val: formatAmount(totalUSD),
              sub: `across ${items.length} months`,
              color: "#FFB547",
            },
            {
              label: "Monthly Avg",
              val: formatAmount(avgUSD),
              sub: "average per recorded month",
              color: "#00D4AA",
            },
            {
              label: "Best Month",
              val: formatAmount(maxUSD),
              sub: (() => {
                const top = items.find((i) => (i.amountUSD || 0) === maxUSD);
                return top ? `${top.month} ${top.year}` : "—";
              })(),
              color: "#7C6BFF",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card svp-stat-tile"
              style={{ "--svt-c": s.color }}
            >
              <div className="svp-st-label">{s.label}</div>
              <div className="svp-st-val" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="svp-st-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="svp-toolbar">
        <div className="svp-toolbar-left">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="svp-year-select"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option
                key={y}
                value={y}
                style={{ color: "black", fontWeight: "500" }}
              >
                {y}
              </option>
            ))}
          </select>
          {filterYear && (
            <button className="svp-clear-btn" onClick={() => setFilterYear("")}>
              Clear
            </button>
          )}
          {!loading && (
            <span className="svp-count-badge">
              {items.length} {items.length === 1 ? "record" : "records"}
              {filterYear ? ` · ${filterYear}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="svp-grid">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="svp-skel"
                style={{ height: 148, animationDelay: `${i * 0.05}s` }}
              />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="svp-grid">
          <div className="card svp-empty">
            <span className="svp-empty-icon">🏦</span>
            <div className="svp-empty-title">No saving records yet</div>
            <div className="svp-empty-sub">
              Add your first saving record to start tracking your savings
            </div>
          </div>
        </div>
      ) : (
        sortedYears.map((year) => (
          <div key={year}>
            {!filterYear && <div className="svp-year-group-label">{year}</div>}
            <div className="svp-grid">
              {grouped[year].map((item) => {
                const accent = yearAccent(item.year);
                const barPct = maxUSD > 0 ? (item.amountUSD / maxUSD) * 100 : 0;
                return (
                  <div
                    key={item._id}
                    className="card svp-card"
                    style={{
                      "--svc-main": accent.main,
                      "--svc-right": accent.right,
                    }}
                  >
                    <div className="svp-card-glow" />

                    {/* Top: badge + actions */}
                    <div className="svp-card-top">
                      <div
                        className="svp-card-month-badge"
                        style={{
                          background: `${accent.main}14`,
                          border: `1px solid ${accent.main}30`,
                          color: accent.main,
                        }}
                      >
                        {item.month} {item.year}
                      </div>
                      <div className="svp-card-actions">
                        <button
                          className="svp-action-btn"
                          title="Edit"
                          onClick={() => {
                            setEditData(item);
                            setModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="svp-action-btn danger"
                          title="Delete"
                          onClick={() => setDeleteId(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="svp-card-amount">
                      {formatAmount(item.amountUSD, item.amountKHR)}
                    </div>
                    <div className="svp-card-raw">
                      {item.currency === "USD"
                        ? `$${item.amount}`
                        : `${item.amount?.toLocaleString()} ៛`}
                    </div>

                    {/* Proportion bar */}
                    <div style={{ marginTop: 12, marginBottom: 4 }}>
                      <div
                        style={{
                          width: "100%",
                          height: 3,
                          borderRadius: 99,
                          background: "var(--border)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${barPct}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${accent.main}, ${accent.right})`,
                            borderRadius: 99,
                            transition:
                              "width 0.7s cubic-bezier(0.34,1.3,0.64,1)",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 8,
                        color: "var(--text-secondary)",
                        opacity: 0.45,
                        letterSpacing: "0.06em",
                      }}
                    >
                      <span>{barPct.toFixed(0)}% of peak</span>
                      {item.noted && <span>📝 has note</span>}
                    </div>

                    {/* Note */}
                    {item.noted && (
                      <div
                        className="svp-card-note"
                        style={{ borderLeftColor: accent.main }}
                      >
                        {item.noted}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* ── Modals ── */}
      <SalaryModal
        isOpen={modal}
        onClose={() => {
          setModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={handleModalSuccess}
        type="saving"
        apiCall={savingAPI}
      />
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </div>
  );
}
