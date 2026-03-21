// src/components/PlanPage.js — Redesigned to match Dashboard v4 design system
// Reusable page for Trips ✈️, Goals 🎯, Givings 🤝, Others 📦
// All logic identical — only UI updated
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import PlanModal from "./modals/PlanModal";
import DeleteModal from "./modals/DeleteModal";
import { formatDate } from "../utils/khmerUtils";
import StatusBanner from "./StatusBanner";

/* ── Status config ── */
const STATUS_COLORS = {
  planned: {
    bg: "rgba(96,207,255,0.1)",
    border: "rgba(96,207,255,0.3)",
    text: "#60CFFF",
  },
  ongoing: {
    bg: "rgba(255,181,71,0.1)",
    border: "rgba(255,181,71,0.3)",
    text: "#FFB547",
  },
  // Completed: electric violet — distinct, premium, clearly not "basic green"
  completed: {
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
    text: "#A78BFA",
  },
  cancelled: {
    bg: "rgba(255,107,157,0.1)",
    border: "rgba(255,107,157,0.3)",
    text: "#FF6B9D",
  },
};

const STATUS_ICONS = {
  planned: "◌",
  ongoing: "⚡",
  completed: "✦",
  cancelled: "✕",
};

/* ── Type accent colors ── */
const TYPE_ACCENTS = {
  trips: {
    main: "#60CFFF",
    soft: "rgba(96,207,255,0.08)",
    label: "Travel Plans",
  },
  goals: {
    main: "#FFB547",
    soft: "rgba(255,181,71,0.08)",
    label: "Financial Goals",
  },
  givings: {
    main: "#00D4AA",
    soft: "rgba(0,212,170,0.08)",
    label: "Contributions",
  },
  others: {
    main: "#A78BFA",
    soft: "rgba(167,139,250,0.08)",
    label: "Other Plans",
  },
};

/* ─────────────────────────────────────────────────────
   Extra CSS
───────────────────────────────────────────────────── */
const PP_CSS = `
.pp-root {
  display: flex; flex-direction: column; gap: 18px;
  animation: pp-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes pp-in {
  from { opacity:0; transform:translateY(12px) }
  to   { opacity:1; transform:translateY(0) }
}

/* ── Header ── */
.pp-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 22px 0 18px; border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 14px;
}
.pp-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.55; margin-bottom: 5px;
}
.pp-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.025em; line-height: 1;
}
.pp-subtitle {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: var(--text-secondary);
  margin-top: 6px; display: flex; gap: 14px; flex-wrap: wrap;
}
.pp-subtitle-item { display: flex; align-items: center; gap: 5px; }
.pp-subtitle-dot  { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

/* ── Stats band ── */
.pp-stats-band {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
}
@media(max-width:900px){ .pp-stats-band{ grid-template-columns:1fr 1fr; } }
@media(max-width:480px){ .pp-stats-band{ grid-template-columns:1fr 1fr; } }

.pp-stat-tile {
  padding: 14px 16px; border-radius: 12px;
  position: relative; overflow: hidden;
  transition: transform .15s;
}
.pp-stat-tile:hover { transform: translateY(-2px); }
.pp-stat-tile::after {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background: var(--pt-c, var(--accent)); opacity: 0.6;
  border-radius: 2px 2px 0 0;
}
.pp-st-label {
  font-family: 'DM Mono', monospace;
  font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.6; margin-bottom: 8px;
}
.pp-st-val {
  font-family: 'DM Mono', monospace;
  font-size: 18px; font-weight: 800;
  color: var(--pt-c, var(--accent)); letter-spacing: -0.03em; line-height: 1;
  margin-bottom: 3px;
}
.pp-st-sub { font-size: 9px; color: var(--text-secondary); opacity: 0.5; }

/* ── Toolbar ── */
.pp-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.pp-filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pp-filter-pill {
  height: 30px; padding: 0 13px;
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  border-radius: 6px; cursor: pointer;
  border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary);
  transition: all .14s;
}
.pp-filter-pill:hover {
  border-color: var(--pf-c, var(--accent));
  color: var(--pf-c, var(--accent));
}
.pp-filter-pill.active {
  background: var(--pf-bg, rgba(99,102,241,0.1));
  border-color: var(--pf-c, var(--accent));
  color: var(--pf-c, var(--accent));
}
.pp-count-badge {
  font-family: 'DM Mono', monospace; font-size: 9px;
  color: var(--text-secondary); opacity: 0.5;
  padding: 2px 8px; border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
}

/* ── Grid ── */
.pp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

/* ── Plan card ── */
.pp-card {
  padding: 0; border-radius: 16px;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform .16s, box-shadow .16s;
}
.pp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.pp-card-accent-bar {
  height: 3px; width: 100%;
  flex-shrink: 0; border-radius: 3px 3px 0 0;
}
.pp-card-body { padding: 14px 16px 14px; flex: 1; display: flex; flex-direction: column; gap: 0; }
.pp-card-glow {
  position: absolute; bottom: -24px; right: -24px;
  width: 90px; height: 90px; border-radius: 50%;
  background: radial-gradient(circle, var(--pc-c, #6366f1) 0%, transparent 70%);
  opacity: 0.07; pointer-events: none; transition: opacity .2s;
}
.pp-card:hover .pp-card-glow { opacity: 0.14; }

/* Card top row */
.pp-card-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 10px; margin-bottom: 10px;
}
.pp-card-title-block { flex: 1; min-width: 0; }
.pp-card-title {
  font-family: 'Syne', sans-serif;
  font-size: 14px; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.01em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 3px;
}
.pp-card-sub {
  font-size: 11px; color: var(--text-secondary); opacity: 0.65;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pp-status-badge {
  font-family: 'DM Mono', monospace;
  font-size: 8px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 3px; flex-shrink: 0;
  border: 1px solid;
  display: flex; align-items: center; gap: 5px;
  white-space: nowrap;
}

/* Amount block */
.pp-amounts {
  display: flex; align-items: stretch; justify-content: space-between;
  margin-bottom: 10px; padding: 9px 11px;
  background: var(--dash-tile-bg, rgba(255,255,255,0.03));
  border-radius: 8px; border: 1px solid var(--border);
  gap: 0;
}
.pp-amt-block { display: flex; flex-direction: column; justify-content: center; }
.pp-amt-block:last-child { text-align: right; }
.pp-amt-label {
  font-family: 'DM Mono', monospace;
  font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.55; margin-bottom: 3px;
}
.pp-amt-val {
  font-family: 'DM Mono', monospace;
  font-size: 13px; font-weight: 800; letter-spacing: -0.02em;
}
.pp-amt-divider {
  width: 1px; background: var(--border); align-self: stretch; flex-shrink: 0; margin: 0 10px;
}

/* Progress */
.pp-progress-section { margin-bottom: 8px; }
.pp-progress-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px;
}
.pp-progress-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-secondary); opacity: 0.5;
}
.pp-progress-pct {
  font-family: 'DM Mono', monospace;
  font-size: 12px; font-weight: 800; letter-spacing: -0.02em;
}
.pp-bar-track {
  width: 100%; height: 4px; border-radius: 99px;
  background: var(--border); overflow: hidden;
}
.pp-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 0.7s cubic-bezier(0.34,1.3,0.64,1);
}

/* Dates */
.pp-dates {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-bottom: 8px;
}
.pp-date-chip {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.04em;
  color: var(--text-secondary); opacity: 0.65;
  padding: 3px 7px; border-radius: 4px;
  background: var(--dash-tile-bg); border: 1px solid var(--border);
  display: flex; align-items: center; gap: 4px;
}

/* Note */
.pp-note {
  font-size: 11px; color: var(--text-secondary); line-height: 1.55;
  padding: 8px 10px; border-radius: 8px;
  border-left: 2px solid var(--pc-c, var(--accent));
  background: var(--dash-tile-bg); margin-bottom: 8px;
}

/* Actions */
.pp-actions {
  display: flex; gap: 6px;
  padding-top: 10px; margin-top: auto;
  border-top: 1px solid var(--border);
}
.pp-edit-btn {
  flex: 1; height: 28px;
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  background: var(--dash-tile-bg); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .14s;
}
.pp-edit-btn:hover {
  border-color: var(--pc-c, var(--accent));
  color: var(--pc-c, var(--accent));
  background: var(--pf-bg, rgba(99,102,241,0.06));
}
.pp-del-btn {
  width: 28px; height: 28px;
  background: var(--dash-tile-bg); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; transition: all .14s;
}
.pp-del-btn:hover {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.3);
  color: #ef4444;
}

/* ── Empty ── */
.pp-empty {
  grid-column: 1/-1; text-align: center; padding: 60px 20px;
  border-radius: 20px;
}
.pp-empty-icon {
  font-size: 38px; opacity: 0.25; margin-bottom: 12px; display: block;
  animation: pp-float 4s ease-in-out infinite;
}
@keyframes pp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.pp-empty-title {
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
  color: var(--text-primary); margin-bottom: 5px;
}
.pp-empty-sub { font-size: 12px; color: var(--text-secondary); opacity: 0.6; }

/* ── Skeleton ── */
.pp-skel {
  border-radius: 16px;
  background: linear-gradient(90deg,
    rgba(128,128,128,0.05) 0%,
    rgba(128,128,128,0.1) 50%,
    rgba(128,128,128,0.05) 100%);
  background-size: 300% 100%;
  animation: pp-shimmer 1.6s ease infinite;
}
@keyframes pp-shimmer { 0%{background-position:300% 0} 100%{background-position:-300% 0} }

/* ── Stagger ── */
.pp-card { animation: pp-card-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.pp-card:nth-child(1){animation-delay:0.03s}
.pp-card:nth-child(2){animation-delay:0.06s}
.pp-card:nth-child(3){animation-delay:0.09s}
.pp-card:nth-child(4){animation-delay:0.12s}
.pp-card:nth-child(5){animation-delay:0.15s}
.pp-card:nth-child(6){animation-delay:0.18s}
@keyframes pp-card-in {
  from { opacity:0; transform:translateY(10px) scale(0.98) }
  to   { opacity:1; transform:translateY(0) scale(1) }
}
`;

let _pp_injected = false;
function injectCSS() {
  if (_pp_injected) return;
  const s = document.createElement("style");
  s.textContent = PP_CSS;
  document.head.appendChild(s);
  _pp_injected = true;
}

export default function PlanPage({ type, icon, apiCall, config }) {
  injectCSS();

  const { t, formatAmount, formatNum, language } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [banner, setBanner] = useState(null);

  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  const load = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await apiCall.getAll(params);
      setItems(res.data || []);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to load", sub: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

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
      await apiCall.delete(deleteId);
      setBanner({ type: "delete", title: t("deletedSuccess") });
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to delete", sub: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const getProgress = (item) => {
    const saved = item.savedAmount ?? item.givenAmount ?? item.paidAmount ?? 0;
    const target = item.targetAmount || 1;
    return Math.min(100, (saved / target) * 100);
  };

  const getSavedField = (item) =>
    item.savedAmount !== undefined
      ? item.savedAmount
      : item.givenAmount !== undefined
        ? item.givenAmount
        : item.paidAmount !== undefined
          ? item.paidAmount
          : 0;

  const toUSD = (item, val) =>
    item.currency === "KHR" ? val / (item.exchangeRate || 4100) : val;

  const statuses = config?.statuses || [
    "planned",
    "ongoing",
    "completed",
    "cancelled",
  ];
  const accent = TYPE_ACCENTS[type] || {
    main: "#7C6BFF",
    soft: "rgba(124,107,255,0.08)",
    label: "Plans",
  };

  /* ── Derived stats ── */
  const totalTarget = items.reduce(
    (s, i) => s + toUSD(i, i.targetAmount || 0),
    0,
  );
  const totalSaved = items.reduce((s, i) => s + toUSD(i, getSavedField(i)), 0);
  const completedCnt = items.filter((i) => i.status === "completed").length;
  const ongoingCnt = items.filter((i) => i.status === "ongoing").length;

  /* ── Status filter pill colors ── */
  const PILL_COLORS = {
    "": { c: "var(--accent, #6366f1)", bg: "rgba(99,102,241,0.08)" },
    planned: { c: "#60CFFF", bg: "rgba(96,207,255,0.08)" },
    ongoing: { c: "#FFB547", bg: "rgba(255,181,71,0.08)" },
    completed: { c: "#00D4AA", bg: "rgba(0,212,170,0.08)" },
    cancelled: { c: "#FF6B9D", bg: "rgba(255,107,157,0.08)" },
  };

  return (
    <div className="pp-root">
      {/* ── Header ── */}
      <div className="pp-header">
        <div>
          <div className="pp-eyebrow">{accent.label}</div>
          <div className="pp-title">
            {icon} {t(type)}
          </div>
          <div className="pp-subtitle">
            <span className="pp-subtitle-item">
              <span
                className="pp-subtitle-dot"
                style={{ background: accent.main }}
              />
              {formatNum(items.length)} {t("items")}
            </span>
            {completedCnt > 0 && (
              <span className="pp-subtitle-item">
                <span
                  className="pp-subtitle-dot"
                  style={{ background: "#00D4AA" }}
                />
                {completedCnt} completed
              </span>
            )}
            {ongoingCnt > 0 && (
              <span className="pp-subtitle-item">
                <span
                  className="pp-subtitle-dot"
                  style={{ background: "#FFB547" }}
                />
                {ongoingCnt} ongoing
              </span>
            )}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditData(null);
            setModal(true);
          }}
        >
          + {t("add")} {t(type)}
        </button>
      </div>

      {/* ── Stats band ── */}
      {!loading && items.length > 0 && (
        <div className="pp-stats-band">
          {[
            {
              label: "Total Target",
              val: formatAmount(totalTarget),
              sub: `across ${items.length} items`,
              color: accent.main,
            },
            {
              label: "Total Saved",
              val: formatAmount(totalSaved),
              sub: `${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% funded`,
              color: "#00D4AA",
            },
            {
              label: "Completed",
              val: completedCnt,
              sub: `of ${items.length} items`,
              color: "#00D4AA",
            },
            {
              label: "In Progress",
              val: ongoingCnt,
              sub: `currently active`,
              color: "#FFB547",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card pp-stat-tile"
              style={{ "--pt-c": s.color }}
            >
              <div className="pp-st-label">{s.label}</div>
              <div className="pp-st-val">
                {typeof s.val === "number" && s.val % 1 === 0 && s.val < 1000
                  ? s.val
                  : s.val}
              </div>
              <div className="pp-st-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="pp-toolbar">
        <div className="pp-filter-pills">
          {["", ...statuses].map((s) => {
            const pc = PILL_COLORS[s] || PILL_COLORS[""];
            return (
              <button
                key={s || "all"}
                className={`pp-filter-pill${filterStatus === s ? " active" : ""}`}
                style={{
                  "--pf-c": pc.c,
                  "--pf-bg": pc.bg,
                }}
                onClick={() => setFilterStatus(s)}
              >
                {s === "" ? "All" : t(s)}
              </button>
            );
          })}
        </div>
        {!loading && (
          <span className="pp-count-badge">
            {items.length} {items.length === 1 ? "item" : "items"}
            {filterStatus ? ` · ${t(filterStatus)}` : ""}
          </span>
        )}
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="pp-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="pp-skel"
                style={{ height: 200, animationDelay: `${i * 0.05}s` }}
              />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="pp-grid">
          <div className="card pp-empty">
            <span className="pp-empty-icon">{icon}</span>
            <div className="pp-empty-title">No {t(type)} yet</div>
            <div className="pp-empty-sub">
              Add your first {t(type).toLowerCase()} to start tracking
            </div>
          </div>
        </div>
      ) : (
        <div className="pp-grid">
          {items.map((item) => {
            const progress = getProgress(item);
            const saved = getSavedField(item);
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.planned;
            const isComplete = item.status === "completed";
            const barColor = isComplete
              ? "linear-gradient(90deg, #A78BFA, #7C6BFF)"
              : `linear-gradient(90deg, ${accent.main}, ${accent.main}99)`;

            return (
              <div
                key={item._id}
                className="card pp-card"
                style={{ "--pc-c": accent.main, "--pf-bg": accent.soft }}
              >
                {/* Top accent bar */}
                <div
                  className="pp-card-accent-bar"
                  style={{
                    background: isComplete
                      ? "linear-gradient(90deg, #A78BFA, #7C6BFF)"
                      : `linear-gradient(90deg, ${accent.main}, ${accent.main}88)`,
                  }}
                />

                <div className="pp-card-glow" />

                <div className="pp-card-body">
                  {/* Title row */}
                  <div className="pp-card-top">
                    <div className="pp-card-title-block">
                      <div className="pp-card-title">{item.title}</div>
                      {(item.destination ||
                        item.description ||
                        item.recipient) && (
                        <div className="pp-card-sub">
                          {item.destination ||
                            item.description ||
                            item.recipient}
                        </div>
                      )}
                    </div>
                    <div
                      className="pp-status-badge"
                      style={{
                        background: sc.bg,
                        borderColor: sc.border,
                        color: sc.text,
                      }}
                    >
                      <span style={{ fontSize: 8 }}>
                        {STATUS_ICONS[item.status]}
                      </span>
                      {t(item.status)}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="pp-amounts">
                    <div className="pp-amt-block">
                      <div className="pp-amt-label">{t("savedAmount")}</div>
                      <div
                        className="pp-amt-val"
                        style={{ color: isComplete ? "#A78BFA" : accent.main }}
                      >
                        {formatAmount(toUSD(item, saved))}
                      </div>
                    </div>
                    <div className="pp-amt-divider" />
                    <div
                      className="pp-amt-block"
                      style={{ textAlign: "right" }}
                    >
                      <div className="pp-amt-label">{t("targetAmount")}</div>
                      <div
                        className="pp-amt-val"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatAmount(toUSD(item, item.targetAmount || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="pp-progress-section">
                    <div className="pp-progress-meta">
                      <span className="pp-progress-label">{t("progress")}</span>
                      <span
                        className="pp-progress-pct"
                        style={{ color: isComplete ? "#A78BFA" : accent.main }}
                      >
                        {formatNum(progress.toFixed(1))}%
                      </span>
                    </div>
                    <div className="pp-bar-track">
                      <div
                        className="pp-bar-fill"
                        style={{ width: `${progress}%`, background: barColor }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  {(item.startDate ||
                    item.targetDate ||
                    item.endDate ||
                    item.date) && (
                    <div className="pp-dates">
                      {item.startDate && (
                        <span className="pp-date-chip">
                          📅 {formatDate(item.startDate, language)}
                        </span>
                      )}
                      {item.endDate && (
                        <span className="pp-date-chip">
                          → {formatDate(item.endDate, language)}
                        </span>
                      )}
                      {item.targetDate && (
                        <span className="pp-date-chip">
                          🎯 {formatDate(item.targetDate, language)}
                        </span>
                      )}
                      {item.date && !item.startDate && (
                        <span className="pp-date-chip">
                          📅 {formatDate(item.date, language)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  {item.noted && <div className="pp-note">{item.noted}</div>}

                  {/* Actions */}
                  <div className="pp-actions">
                    <button
                      className="pp-edit-btn"
                      onClick={() => {
                        setEditData(item);
                        setModal(true);
                      }}
                    >
                      ✏️ {t("edit")}
                    </button>
                    <button
                      className="pp-del-btn"
                      title={t("delete")}
                      onClick={() => setDeleteId(item._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      <PlanModal
        isOpen={modal}
        onClose={() => {
          setModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={handleModalSuccess}
        type={type}
        apiCall={apiCall}
        config={config}
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
