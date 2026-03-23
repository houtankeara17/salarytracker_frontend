// src/pages/BonusPage.js — mirrors SalaryPage design system
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { bonusAPI } from "../utils/api";
import BonusModal from "../components/modals/BonusModal";
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

const BONUS_TYPES = [
  "Performance",
  "Annual",
  "Holiday",
  "Project",
  "Referral",
  "Other",
];

const BONUS_TYPE_ICONS = {
  Performance: "🏆",
  Annual: "📅",
  Holiday: "🎄",
  Project: "🚀",
  Referral: "🤝",
  Other: "🎁",
};

/* ── Extra CSS ── */
const BP_CSS = `
.bp-root {
  display:flex; flex-direction:column; gap:20px;
  animation: bp-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes bp-in {
  from { opacity:0; transform:translateY(12px) }
  to   { opacity:1; transform:translateY(0) }
}

/* Header */
.bp-header {
  display:flex; align-items:flex-end; justify-content:space-between;
  padding:22px 0 18px; border-bottom:1px solid var(--border);
  flex-wrap:wrap; gap:14px;
}
.bp-eyebrow {
  font-family:'DM Mono',monospace;
  font-size:9px; letter-spacing:0.2em; text-transform:uppercase;
  color:var(--text-secondary); opacity:0.55; margin-bottom:5px;
}
.bp-title {
  font-family:'Syne',sans-serif;
  font-size:26px; font-weight:800;
  color:var(--text-primary); letter-spacing:-0.025em; line-height:1;
}
.bp-subtitle {
  font-family:'DM Mono',monospace;
  font-size:10px; color:var(--text-secondary);
  margin-top:6px; display:flex; gap:14px; flex-wrap:wrap;
}
.bp-subtitle-item { display:flex; align-items:center; gap:5px; }
.bp-subtitle-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

/* Stats band */
.bp-stats-band {
  display:grid; grid-template-columns:repeat(3,1fr); gap:10px;
}
@media(max-width:640px){ .bp-stats-band{ grid-template-columns:1fr; } }
.bp-stat-tile {
  padding:16px 18px; border-radius:14px;
  position:relative; overflow:hidden;
  transition:transform .15s;
}
.bp-stat-tile:hover { transform:translateY(-2px); }
.bp-stat-tile::after {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background:var(--st-c, #f59e0b); opacity:0.6; border-radius:2px 2px 0 0;
}
.bp-st-label {
  font-family:'DM Mono',monospace;
  font-size:8px; letter-spacing:0.16em; text-transform:uppercase;
  color:var(--text-secondary); opacity:0.65; margin-bottom:10px;
  display:flex; align-items:center; gap:6px;
}
.bp-st-label::before { content:''; width:16px; height:1px; background:var(--st-c,#f59e0b); opacity:0.5; }
.bp-st-val {
  font-family:'DM Mono',monospace;
  font-size:22px; font-weight:800;
  color:var(--text-primary); letter-spacing:-0.03em; line-height:1;
  margin-bottom:4px;
}
.bp-st-sub { font-size:10px; color:var(--text-secondary); opacity:0.6; }

/* Toolbar */
.bp-toolbar {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:10px;
}
.bp-toolbar-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.bp-year-select {
  height:32px; padding:0 10px;
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.04em;
  background:var(--dash-tile-bg,rgba(255,255,255,0.04));
  border:1px solid var(--border); border-radius:8px;
  color:var(--text-primary); cursor:pointer; transition:border-color .14s;
  appearance:none; -webkit-appearance:none;
  padding-right:28px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23f59e0b'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 10px center;
}
.bp-year-select:focus { outline:none; border-color:#f59e0b; }
.bp-clear-btn {
  height:32px; padding:0 12px;
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.1em; text-transform:uppercase;
  background:transparent; border:1px solid var(--border);
  border-radius:8px; color:var(--text-secondary); cursor:pointer;
  transition:border-color .14s, color .14s;
}
.bp-clear-btn:hover { border-color:#f59e0b; color:var(--text-primary); }
.bp-count-badge {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.08em;
  color:var(--text-secondary); opacity:0.55;
  padding:2px 8px; border-radius:4px;
  border:1px solid var(--border);
  background:var(--dash-tile-bg,rgba(255,255,255,0.03));
}

/* Type filter pills */
.bp-type-pills { display:flex; gap:6px; flex-wrap:wrap; }
.bp-type-pill {
  height:28px; padding:0 10px;
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.06em;
  border-radius:6px; cursor:pointer; transition:all .14s;
  display:flex; align-items:center; gap:5px;
  font-weight:600;
}

/* Grid */
.bp-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:10px;
}

/* Card */
.bp-card {
  padding:18px 20px; border-radius:16px;
  position:relative; overflow:hidden;
  transition:transform .16s, box-shadow .16s;
  display:flex; flex-direction:column; gap:0;
}
.bp-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
.bp-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg, var(--bc-main,#f59e0b), var(--bc-right,#fbbf24));
  border-radius:3px 3px 0 0;
}
.bp-card-glow {
  position:absolute; bottom:-30px; right:-30px;
  width:100px; height:100px; border-radius:50%;
  background:radial-gradient(circle, var(--bc-main,#f59e0b) 0%, transparent 70%);
  opacity:0.06; pointer-events:none; transition:opacity .2s;
}
.bp-card:hover .bp-card-glow { opacity:0.12; }

.bp-card-top {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:14px;
}
.bp-card-month-badge {
  font-family:'DM Mono',monospace;
  font-size:9px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
  padding:3px 9px; border-radius:4px;
}
.bp-card-type-chip {
  font-size:10px; font-weight:600;
  padding:2px 8px; border-radius:20px;
  display:inline-flex; align-items:center; gap:4px;
  margin-bottom:8px;
}
.bp-card-actions {
  display:flex; gap:4px; opacity:0; transition:opacity .15s;
}
.bp-card:hover .bp-card-actions { opacity:1; }
.bp-action-btn {
  width:26px; height:26px; border-radius:6px;
  background:var(--dash-tile-bg,rgba(255,255,255,0.04));
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:12px; cursor:pointer;
  transition:background .14s, border-color .14s, transform .12s;
}
.bp-action-btn:hover { background:var(--border); border-color:var(--border); transform:scale(1.08); }
.bp-action-btn.danger:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); }

.bp-card-amount {
  font-family:'DM Mono',monospace;
  font-size:24px; font-weight:800;
  color:var(--text-primary); letter-spacing:-0.04em; line-height:1;
  margin-bottom:5px;
}
.bp-card-raw { font-family:'DM Mono',monospace; font-size:11px; color:var(--text-secondary); opacity:0.55; }
.bp-card-note {
  margin-top:12px; padding:8px 10px;
  border-radius:8px; border-left:2px solid var(--bc-main,#f59e0b);
  background:var(--dash-tile-bg,rgba(255,255,255,0.03));
  font-size:11px; color:var(--text-secondary); line-height:1.5;
}

/* Year group */
.bp-year-group-label {
  display:flex; align-items:center; gap:10px;
  font-family:'DM Mono',monospace;
  font-size:9px; letter-spacing:0.18em; text-transform:uppercase;
  color:var(--text-secondary); opacity:0.5;
  margin-bottom:8px; margin-top:4px;
}
.bp-year-group-label::after { content:''; flex:1; height:1px; background:var(--border); }

/* Empty */
.bp-empty {
  grid-column:1/-1; text-align:center; padding:60px 20px; border-radius:20px;
}
.bp-empty-icon {
  font-size:36px; opacity:0.25; margin-bottom:12px; display:block;
  animation:bp-float 4s ease-in-out infinite;
}
@keyframes bp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.bp-empty-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:5px; }
.bp-empty-sub { font-size:12px; color:var(--text-secondary); opacity:0.6; }

/* Skeleton */
.bp-skel {
  background:linear-gradient(90deg,rgba(128,128,128,0.06) 0%,rgba(128,128,128,0.12) 50%,rgba(128,128,128,0.06) 100%);
  background-size:300% 100%;
  animation:bp-shimmer 1.6s ease infinite;
  border-radius:16px;
}
@keyframes bp-shimmer { 0%{background-position:300% 0} 100%{background-position:-300% 0} }

/* Card stagger */
.bp-card { animation:bp-card-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.bp-card:nth-child(1){animation-delay:0.03s}
.bp-card:nth-child(2){animation-delay:0.06s}
.bp-card:nth-child(3){animation-delay:0.09s}
.bp-card:nth-child(4){animation-delay:0.12s}
.bp-card:nth-child(5){animation-delay:0.15s}
.bp-card:nth-child(6){animation-delay:0.18s}
.bp-card:nth-child(7){animation-delay:0.21s}
.bp-card:nth-child(8){animation-delay:0.24s}
@keyframes bp-card-in {
  from { opacity:0; transform:translateY(10px) scale(0.98) }
  to   { opacity:1; transform:translateY(0) scale(1) }
}
`;

/* Bonus type → accent color */
const TYPE_COLORS = {
  Performance: { main: "#f59e0b", right: "#fbbf24" },
  Annual: { main: "#6366f1", right: "#818cf8" },
  Holiday: { main: "#ec4899", right: "#f472b6" },
  Project: { main: "#00D4AA", right: "#34d399" },
  Referral: { main: "#60CFFF", right: "#7dd3fc" },
  Other: { main: "#94a3b8", right: "#cbd5e1" },
};

/* Year accent (same cycle as SalaryPage) */
const YEAR_ACCENTS = [
  { main: "#7C6BFF", right: "#A78BFA" },
  { main: "#00D4AA", right: "#34D399" },
  { main: "#FFB547", right: "#FF8C6B" },
  { main: "#60CFFF", right: "#7C6BFF" },
  { main: "#FF6B9D", right: "#A78BFA" },
];
function yearAccent(year) {
  return YEAR_ACCENTS[(year - 2024) % YEAR_ACCENTS.length] || YEAR_ACCENTS[0];
}

let _bp_injected = false;
function injectCSS() {
  if (_bp_injected) return;
  const s = document.createElement("style");
  s.textContent = BP_CSS;
  document.head.appendChild(s);
  _bp_injected = true;
}

export default function BonusPage() {
  injectCSS();

  const { t, formatAmount } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState("");
  const [banner, setBanner] = useState(null);

  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterYear) params.year = filterYear;
      if (filterType) params.bonusType = filterType;
      const res = await bonusAPI.getAll(params);
      setItems(res.data || []);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to load", sub: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterYear, filterType]);

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
      await bonusAPI.delete(deleteId);
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

  /* ── Group by year ── */
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
    <div className="bp-root">
      {/* ── Header ── */}
      <div className="bp-header">
        <div>
          <div className="bp-eyebrow">Bonus Management</div>
          <div className="bp-title">🎁 Bonus</div>
          <div className="bp-subtitle">
            <span className="bp-subtitle-item">
              <span
                className="bp-subtitle-dot"
                style={{ background: "#f59e0b" }}
              />
              {t("total")}: {formatAmount(totalUSD)}
            </span>
            <span className="bp-subtitle-item">
              <span
                className="bp-subtitle-dot"
                style={{ background: "#00D4AA" }}
              />
              Avg: {formatAmount(avgUSD)}/bonus
            </span>
            <span className="bp-subtitle-item">
              <span
                className="bp-subtitle-dot"
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
          + Add Bonus
        </button>
      </div>

      {/* ── Stats band ── */}
      {!loading && items.length > 0 && (
        <div className="bp-stats-band">
          {[
            {
              label: "Total Bonuses",
              val: formatAmount(totalUSD),
              sub: `across ${items.length} entries`,
              color: "#f59e0b",
            },
            {
              label: "Average Bonus",
              val: formatAmount(avgUSD),
              sub: "average per bonus entry",
              color: "#00D4AA",
            },
            {
              label: "Highest Bonus",
              val: formatAmount(maxUSD),
              sub: (() => {
                const top = items.find((i) => (i.amountUSD || 0) === maxUSD);
                return top
                  ? `${top.month} ${top.year} · ${top.bonusType}`
                  : "—";
              })(),
              color: "#FF6B9D",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card bp-stat-tile"
              style={{ "--st-c": s.color }}
            >
              <div className="bp-st-label">{s.label}</div>
              <div className="bp-st-val" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="bp-st-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bp-toolbar">
        <div className="bp-toolbar-left">
          {/* Year filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bp-year-select"
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
            <button className="bp-clear-btn" onClick={() => setFilterYear("")}>
              Clear
            </button>
          )}
          {!loading && (
            <span className="bp-count-badge">
              {items.length} {items.length === 1 ? "record" : "records"}
              {filterYear ? ` · ${filterYear}` : ""}
            </span>
          )}
        </div>

        {/* Bonus type pills */}
        <div className="bp-type-pills">
          {BONUS_TYPES.map((bt) => {
            const c = TYPE_COLORS[bt];
            const active = filterType === bt;
            return (
              <button
                key={bt}
                className="bp-type-pill"
                onClick={() => setFilterType(active ? "" : bt)}
                style={{
                  border: active
                    ? `1px solid ${c.main}`
                    : "1px solid var(--border)",
                  background: active ? `${c.main}18` : "rgba(255,255,255,0.03)",
                  color: active ? c.main : "var(--text-secondary)",
                }}
              >
                {BONUS_TYPE_ICONS[bt]} {bt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="bp-grid">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bp-skel"
                style={{ height: 156, animationDelay: `${i * 0.05}s` }}
              />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bp-grid">
          <div className="card bp-empty">
            <span className="bp-empty-icon">🎁</span>
            <div className="bp-empty-title">No bonus records yet</div>
            <div className="bp-empty-sub">
              Add your first bonus to start tracking your extra income
            </div>
          </div>
        </div>
      ) : (
        sortedYears.map((year) => (
          <div key={year}>
            {!filterYear && <div className="bp-year-group-label">{year}</div>}
            <div className="bp-grid">
              {grouped[year].map((item) => {
                const tc = TYPE_COLORS[item.bonusType] || TYPE_COLORS.Other;
                const ya = yearAccent(item.year);
                const accent = tc; // use type color as primary accent
                const barPct = maxUSD > 0 ? (item.amountUSD / maxUSD) * 100 : 0;

                return (
                  <div
                    key={item._id}
                    className="card bp-card"
                    style={{
                      "--bc-main": accent.main,
                      "--bc-right": accent.right,
                    }}
                  >
                    <div className="bp-card-glow" />

                    {/* Top row */}
                    <div className="bp-card-top">
                      <div
                        className="bp-card-month-badge"
                        style={{
                          background: `${accent.main}14`,
                          borderColor: `${accent.main}30`,
                          border: `1px solid ${accent.main}30`,
                          color: accent.main,
                        }}
                      >
                        {item.month} {item.year}
                      </div>
                      <div className="bp-card-actions">
                        <button
                          className="bp-action-btn"
                          title="Edit"
                          onClick={() => {
                            setEditData(item);
                            setModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="bp-action-btn danger"
                          title="Delete"
                          onClick={() => setDeleteId(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Bonus type chip */}
                    <div
                      className="bp-card-type-chip"
                      style={{
                        background: `${accent.main}18`,
                        border: `1px solid ${accent.main}30`,
                        color: accent.main,
                      }}
                    >
                      {BONUS_TYPE_ICONS[item.bonusType]} {item.bonusType}
                    </div>

                    {/* Amount */}
                    <div className="bp-card-amount">
                      {formatAmount(item.amountUSD, item.amountKHR)}
                    </div>
                    <div className="bp-card-raw">
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
                        className="bp-card-note"
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
      <BonusModal
        isOpen={modal}
        onClose={() => {
          setModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={handleModalSuccess}
        apiCall={bonusAPI}
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
