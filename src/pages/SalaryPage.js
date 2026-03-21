// src/pages/SalaryPage.js — Redesigned to match Dashboard v4 design system
// Uses globals.css tokens + same Syne/DM Mono/DM Sans font stack
// All logic identical to original — only UI updated
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { salaryAPI } from "../utils/api";
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

/* ── Extra CSS (layered on globals.css) ── */
const SP_CSS = `
/* ── SalaryPage root ── */
.sp-root {
  display: flex; flex-direction: column; gap: 20px;
  animation: sp-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes sp-in {
  from { opacity:0; transform:translateY(12px) }
  to   { opacity:1; transform:translateY(0) }
}

/* ── Header ── */
.sp-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 22px 0 18px; border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 14px;
}
.sp-header-left {}
.sp-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.55; margin-bottom: 5px;
}
.sp-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.025em; line-height: 1;
}
.sp-subtitle {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: var(--text-secondary);
  margin-top: 6px; display: flex; gap: 14px; flex-wrap: wrap;
}
.sp-subtitle-item { display: flex; align-items: center; gap: 5px; }
.sp-subtitle-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent, #6366f1); flex-shrink: 0;
}

/* ── Stats band ── */
.sp-stats-band {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
@media(max-width:640px){ .sp-stats-band{ grid-template-columns:1fr; } }
.sp-stat-tile {
  padding: 16px 18px; border-radius: 14px;
  position: relative; overflow: hidden;
  transition: transform .15s;
}
.sp-stat-tile:hover { transform: translateY(-2px); }
.sp-stat-tile::after {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background: var(--st-c, var(--accent)); opacity: 0.6; border-radius: 2px 2px 0 0;
}
.sp-st-label {
  font-family: 'DM Mono', monospace;
  font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.65; margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.sp-st-label::before {
  content:''; width:16px; height:1px; background: var(--st-c, var(--accent)); opacity: 0.5;
}
.sp-st-val {
  font-family: 'DM Mono', monospace;
  font-size: 22px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.03em; line-height: 1;
  margin-bottom: 4px;
}
.sp-st-sub { font-size: 10px; color: var(--text-secondary); opacity: 0.6; }

/* ── Toolbar ── */
.sp-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.sp-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sp-year-select {
  height: 32px; padding: 0 10px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.04em;
  background: var(--dash-tile-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-primary);
   cursor: pointer;
  transition: border-color .14s;
  appearance: none; -webkit-appearance: none;
  padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236366f1'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.sp-year-select:focus { outline: none; border-color: var(--accent, #6366f1); }
.sp-clear-btn {
  height: 32px; padding: 0 12px;
  font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase;
  background: transparent; border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-secondary); cursor: pointer;
  transition: border-color .14s, color .14s;
}
.sp-clear-btn:hover { border-color: var(--accent, #6366f1); color: var(--text-primary); }
.sp-count-badge {
  font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.08em;
  color: var(--text-secondary); opacity: 0.55;
  padding: 2px 8px; border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
}

/* ── Grid ── */
.sp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

/* ── Salary card ── */
.sp-card {
  padding: 18px 20px; border-radius: 16px;
  position: relative; overflow: hidden;
  transition: transform .16s, box-shadow .16s;
  display: flex; flex-direction: column; gap: 0;
}
.sp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.sp-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg, var(--accent, #6366f1), var(--sc-right, #818cf8));
  border-radius: 3px 3px 0 0;
}
/* Subtle glow orb */
.sp-card-glow {
  position: absolute; bottom: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle, var(--accent, #6366f1) 0%, transparent 70%);
  opacity: 0.06; pointer-events: none; transition: opacity .2s;
}
.sp-card:hover .sp-card-glow { opacity: 0.12; }

.sp-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.sp-card-month-badge {
  font-family: 'DM Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 9px; border-radius: 4px;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  color: var(--accent, #818cf8);
}
.sp-card-actions {
  display: flex; gap: 4px; opacity: 0; transition: opacity .15s;
}
.sp-card:hover .sp-card-actions { opacity: 1; }
.sp-action-btn {
  width: 26px; height: 26px; border-radius: 6px;
  background: var(--dash-tile-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; cursor: pointer;
  transition: background .14s, border-color .14s, transform .12s;
}
.sp-action-btn:hover {
  background: var(--border); border-color: var(--border);
  transform: scale(1.08);
}
.sp-action-btn.danger:hover {
  background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3);
}

.sp-card-amount {
  font-family: 'DM Mono', monospace;
  font-size: 24px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.04em; line-height: 1;
  margin-bottom: 5px;
}
.sp-card-raw {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: var(--text-secondary); opacity: 0.55;
}
.sp-card-note {
  margin-top: 12px; padding: 8px 10px;
  border-radius: 8px; border-left: 2px solid var(--accent, #6366f1);
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
  font-size: 11px; color: var(--text-secondary);
  line-height: 1.5;
}
.sp-card-divider {
  height: 1px; background: var(--border); margin: 12px 0; opacity: 0.6;
}

/* ── Year section label ── */
.sp-year-group-label {
  display: flex; align-items: center; gap: 10px;
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.5;
  margin-bottom: 8px; margin-top: 4px;
}
.sp-year-group-label::after {
  content:''; flex:1; height:1px; background:var(--border);
}

/* ── Empty state ── */
.sp-empty {
  grid-column: 1 / -1;
  text-align: center; padding: 60px 20px;
  border-radius: 20px;
}
.sp-empty-icon {
  font-size: 36px; opacity: 0.25; margin-bottom: 12px; display: block;
  animation: sp-float 4s ease-in-out infinite;
}
@keyframes sp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.sp-empty-title {
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
  color: var(--text-primary); margin-bottom: 5px;
}
.sp-empty-sub { font-size: 12px; color: var(--text-secondary); opacity: 0.6; }

/* Skeleton pulse */
.sp-skel {
  background: linear-gradient(90deg,
    rgba(128,128,128,0.06) 0%,
    rgba(128,128,128,0.12) 50%,
    rgba(128,128,128,0.06) 100%);
  background-size: 300% 100%;
  animation: sp-shimmer 1.6s ease infinite;
  border-radius: 16px;
}
@keyframes sp-shimmer { 0%{background-position:300% 0} 100%{background-position:-300% 0} }

/* ── Stagger cards ── */
.sp-card { animation: sp-card-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.sp-card:nth-child(1){animation-delay:0.03s}
.sp-card:nth-child(2){animation-delay:0.06s}
.sp-card:nth-child(3){animation-delay:0.09s}
.sp-card:nth-child(4){animation-delay:0.12s}
.sp-card:nth-child(5){animation-delay:0.15s}
.sp-card:nth-child(6){animation-delay:0.18s}
.sp-card:nth-child(7){animation-delay:0.21s}
.sp-card:nth-child(8){animation-delay:0.24s}
@keyframes sp-card-in {
  from { opacity:0; transform:translateY(10px) scale(0.98) }
  to   { opacity:1; transform:translateY(0) scale(1) }
}
`;

let _sp_injected = false;
function injectCSS() {
  if (_sp_injected) return;
  const s = document.createElement("style");
  s.textContent = SP_CSS;
  document.head.appendChild(s);
  _sp_injected = true;
}

/* ── Accent colors per year (cycles through palette) ── */
const YEAR_ACCENTS = [
  { main: "#7C6BFF", right: "#A78BFA" }, // purple
  { main: "#00D4AA", right: "#34D399" }, // teal
  { main: "#FFB547", right: "#FF8C6B" }, // amber→orange
  { main: "#60CFFF", right: "#7C6BFF" }, // blue→purple
  { main: "#FF6B9D", right: "#A78BFA" }, // pink→violet
];
function yearAccent(year) {
  return YEAR_ACCENTS[(year - 2024) % YEAR_ACCENTS.length] || YEAR_ACCENTS[0];
}

export default function SalaryPage() {
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
      const res = await salaryAPI.getAll(
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
    const isEdit = !!editDataRef.current;
    if (isEdit) {
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
      await salaryAPI.delete(deleteId);
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

  /* ── Group items by year for section labels ── */
  const grouped = items.reduce((acc, item) => {
    const y = item.year || "—";
    if (!acc[y]) acc[y] = [];
    acc[y].push(item);
    return acc;
  }, {});
  // Sort years descending, months in order within each year
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
  sortedYears.forEach((y) => {
    grouped[y].sort(
      (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
    );
  });

  return (
    <div className="sp-root">
      {/* ── Header ── */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-eyebrow">Income Management</div>
          <div className="sp-title">💰 {t("salary")}</div>
          <div className="sp-subtitle">
            <span className="sp-subtitle-item">
              <span
                className="sp-subtitle-dot"
                style={{ background: "#00D4AA" }}
              />
              {t("total")}: {formatAmount(totalUSD)}
            </span>
            <span className="sp-subtitle-item">
              <span
                className="sp-subtitle-dot"
                style={{ background: "#FFB547" }}
              />
              Avg: {formatAmount(avgUSD)}/mo
            </span>
            <span className="sp-subtitle-item">
              <span
                className="sp-subtitle-dot"
                style={{ background: "#7C6BFF" }}
              />
              {items.length} {items.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditData(null);
            setModal(true);
          }}
        >
          + {t("addSalary")}
        </button>
      </div>

      {/* ── Stats band ── */}
      {!loading && items.length > 0 && (
        <div className="sp-stats-band">
          {[
            {
              label: "Total Earned",
              val: formatAmount(totalUSD),
              sub: `across ${items.length} months`,
              color: "#7C6BFF",
            },
            {
              label: "Monthly Avg",
              val: formatAmount(avgUSD),
              sub: "average per recorded month",
              color: "#00D4AA",
            },
            {
              label: "Highest Month",
              val: formatAmount(maxUSD),
              sub: (() => {
                const top = items.find((i) => (i.amountUSD || 0) === maxUSD);
                return top ? `${top.month} ${top.year}` : "—";
              })(),
              color: "#FFB547",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card sp-stat-tile"
              style={{ "--st-c": s.color }}
            >
              <div className="sp-st-label">{s.label}</div>
              <div className="sp-st-val" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="sp-st-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="sp-toolbar">
        <div className="sp-toolbar-left">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="sp-year-select "
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
            <button className="sp-clear-btn" onClick={() => setFilterYear("")}>
              Clear
            </button>
          )}
          {!loading && (
            <span className="sp-count-badge">
              {items.length} {items.length === 1 ? "record" : "records"}
              {filterYear ? ` · ${filterYear}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="sp-grid">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="sp-skel"
                style={{ height: 148, animationDelay: `${i * 0.05}s` }}
              />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="sp-grid">
          <div className="card sp-empty">
            <span className="sp-empty-icon">💰</span>
            <div className="sp-empty-title">No salary records yet</div>
            <div className="sp-empty-sub">
              Add your first salary record to start tracking your income
            </div>
          </div>
        </div>
      ) : (
        /* Grouped by year */
        sortedYears.map((year) => (
          <div key={year}>
            {/* Year section header — only show if not filtered to single year */}
            {!filterYear && <div className="sp-year-group-label">{year}</div>}
            <div className="sp-grid">
              {grouped[year].map((item) => {
                const accent = yearAccent(item.year);
                const barPct = maxUSD > 0 ? (item.amountUSD / maxUSD) * 100 : 0;
                return (
                  <div
                    key={item._id}
                    className="card sp-card"
                    style={{ "--sc-right": accent.right }}
                  >
                    <div className="sp-card-glow" />

                    {/* Top row: badge + actions */}
                    <div className="sp-card-top">
                      <div
                        className="sp-card-month-badge"
                        style={{
                          background: `${accent.main}14`,
                          borderColor: `${accent.main}30`,
                          color: accent.main,
                        }}
                      >
                        {item.month} {item.year}
                      </div>
                      <div className="sp-card-actions">
                        <button
                          className="sp-action-btn"
                          title="Edit"
                          onClick={() => {
                            setEditData(item);
                            setModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="sp-action-btn danger"
                          title="Delete"
                          onClick={() => setDeleteId(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="sp-card-amount">
                      {formatAmount(item.amountUSD, item.amountKHR)}
                    </div>
                    <div className="sp-card-raw">
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
                        className="sp-card-note"
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
        type="salary"
        apiCall={salaryAPI}
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
