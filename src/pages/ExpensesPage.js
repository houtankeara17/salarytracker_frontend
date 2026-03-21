// src/pages/ExpensesPage.js
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { expenseAPI } from "../utils/api";
import ExpenseModal from "../components/modals/ExpenseModal";
import DeleteModal from "../components/modals/DeleteModal";
import StatusBanner from "../components/StatusBanner";
import { formatDate } from "../utils/khmerUtils";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const CATEGORIES = [
  "food",
  "drink",
  "fruit",
  "transport",
  "clothing",
  "health",
  "entertainment",
  "education",
  "utilities",
  "shopping",
  "other",
];
const MONTHS_EN = [
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
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, "All"];

const CAT_META = {
  food: {
    emoji: "🍚",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.10)",
    border: "rgba(22,163,74,0.22)",
  },
  drink: {
    emoji: "🧋",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.22)",
  },
  fruit: {
    emoji: "🍎",
    color: "#ea580c",
    bg: "rgba(234,88,12,0.10)",
    border: "rgba(234,88,12,0.22)",
  },
  transport: {
    emoji: "🚗",
    color: "#ca8a04",
    bg: "rgba(202,138,4,0.10)",
    border: "rgba(202,138,4,0.22)",
  },
  clothing: {
    emoji: "👕",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.10)",
    border: "rgba(8,145,178,0.22)",
  },
  health: {
    emoji: "💊",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.10)",
    border: "rgba(225,29,72,0.22)",
  },
  entertainment: {
    emoji: "🎮",
    color: "#6d28d9",
    bg: "rgba(109,40,217,0.10)",
    border: "rgba(109,40,217,0.22)",
  },
  education: {
    emoji: "📚",
    color: "#1d4ed8",
    bg: "rgba(29,78,216,0.10)",
    border: "rgba(29,78,216,0.22)",
  },
  utilities: {
    emoji: "⚡",
    color: "#d97706",
    bg: "rgba(217,119,6,0.10)",
    border: "rgba(217,119,6,0.22)",
  },
  shopping: {
    emoji: "🛍",
    color: "#db2777",
    bg: "rgba(219,39,119,0.10)",
    border: "rgba(219,39,119,0.22)",
  },
  other: {
    emoji: "📦",
    color: "#64748b",
    bg: "rgba(100,116,139,0.10)",
    border: "rgba(100,116,139,0.22)",
  },
};

const PAY_META = {
  cash: {
    icon: "💵",
    label: "Cash",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.09)",
  },
  qr: {
    icon: "📱",
    label: "QR Pay",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.09)",
  },
  card: {
    icon: "💳",
    label: "Card",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.09)",
  },
  transfer: {
    icon: "🔄",
    label: "Transfer",
    color: "#ca8a04",
    bg: "rgba(202,138,4,0.09)",
  },
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const IcBox = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1"
      y="1"
      width="5.5"
      height="5.5"
      rx="1.5"
      fill="currentColor"
      opacity={active ? "1" : "0.7"}
    />
    <rect
      x="8.5"
      y="1"
      width="5.5"
      height="5.5"
      rx="1.5"
      fill="currentColor"
      opacity={active ? "1" : "0.7"}
    />
    <rect
      x="1"
      y="8.5"
      width="5.5"
      height="5.5"
      rx="1.5"
      fill="currentColor"
      opacity={active ? "0.6" : "0.4"}
    />
    <rect
      x="8.5"
      y="8.5"
      width="5.5"
      height="5.5"
      rx="1.5"
      fill="currentColor"
      opacity={active ? "0.6" : "0.4"}
    />
  </svg>
);
const IcTable = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1"
      y="1"
      width="13"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "1" : "0.7"}
    />
    <rect
      x="1"
      y="6"
      width="5.5"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.8" : "0.5"}
    />
    <rect
      x="8.5"
      y="6"
      width="5.5"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.8" : "0.5"}
    />
    <rect
      x="1"
      y="11"
      width="5.5"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.5" : "0.35"}
    />
    <rect
      x="8.5"
      y="11"
      width="5.5"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.5" : "0.35"}
    />
  </svg>
);
const IcRow = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1"
      y="2"
      width="13"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "1" : "0.7"}
    />
    <rect
      x="1"
      y="7"
      width="13"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.7" : "0.5"}
    />
    <rect
      x="1"
      y="12"
      width="13"
      height="3"
      rx="1"
      fill="currentColor"
      opacity={active ? "0.4" : "0.3"}
    />
  </svg>
);
const IcPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <line
      x1="6.5"
      y1="1.5"
      x2="6.5"
      y2="11.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="1.5"
      y1="6.5"
      x2="11.5"
      y2="6.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IcSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <line
      x1="9.5"
      y1="9.5"
      x2="12.5"
      y2="12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "lbFadeIn 0.2s ease",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>
      <img
        src={src}
        alt="expense"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          borderRadius: "16px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          objectFit: "contain",
          animation: "lbScaleIn 0.22s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   INLINE STYLES
───────────────────────────────────────────── */
const S = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "epFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    color: "var(--text-primary)",
    lineHeight: 1.1,
  },
  hsub: { fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "13px",
    fontFamily: "'DM Sans',sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
    transition: "transform 0.15s,box-shadow 0.15s",
  },
  statBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
  },
  statCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },
  statVal: {
    fontFamily: "'DM Mono',monospace",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1,
  },
  statSub: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginTop: "4px",
  },
  filterPanel: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "14px 16px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "10px",
  },
  searchWrap: { position: "relative" },
  searchIcon: {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-secondary)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "9px 13px 9px 34px",
    borderRadius: "10px",
    border: "1.5px solid var(--border)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s,box-shadow 0.2s",
  },
  select: {
    width: "100%",
    padding: "9px 13px",
    borderRadius: "10px",
    border: "1.5px solid var(--border)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
    cursor: "pointer",
  },
  mainCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "18px",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-primary)",
  },
  toolbarLeft: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontFamily: "'DM Sans',sans-serif",
  },
  viewToggle: {
    display: "flex",
    gap: "2px",
    padding: "3px",
    background: "var(--bg-primary)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
  },
  viewBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 12px",
    borderRadius: "7px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: active ? 700 : 500,
    fontFamily: "'DM Sans',sans-serif",
    color: active ? "#fff" : "var(--text-secondary)",
    background: active
      ? "linear-gradient(135deg,#6366f1,#4f46e5)"
      : "transparent",
    boxShadow: active ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
    transition: "all 0.15s",
  }),
  empty: { padding: "56px 16px", textAlign: "center" },
  pgBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "11px 16px",
    borderTop: "1px solid var(--border)",
    background: "var(--bg-primary)",
  },
  pgInfo: { fontSize: "12px", color: "var(--text-secondary)" },
  pgBtns: { display: "flex", gap: "3px" },
  pgBtn: (active, disabled) => ({
    minWidth: "32px",
    padding: "5px 9px",
    borderRadius: "7px",
    cursor: disabled ? "not-allowed" : "pointer",
    border: active ? "none" : "1px solid var(--border)",
    background: active
      ? "linear-gradient(135deg,#6366f1,#4f46e5)"
      : "var(--bg-primary)",
    color: active
      ? "#fff"
      : disabled
        ? "var(--text-secondary)"
        : "var(--text-primary)",
    fontSize: "12px",
    fontWeight: active ? 700 : 500,
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.15s",
    boxShadow: active ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
    fontFamily: "'DM Sans',sans-serif",
  }),
  sizeRow: { display: "flex", alignItems: "center", gap: "5px" },
  sizeLabel: { fontSize: "11px", color: "var(--text-secondary)" },
  sizeBtn: (active) => ({
    padding: "3px 9px",
    borderRadius: "6px",
    cursor: "pointer",
    border: active ? "none" : "1px solid var(--border)",
    background: active ? "#6366f1" : "transparent",
    color: active ? "#fff" : "var(--text-secondary)",
    fontSize: "11px",
    fontWeight: active ? 700 : 500,
    transition: "all 0.15s",
    fontFamily: "'DM Sans',sans-serif",
  }),

  /* BOX VIEW */
  boxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
    gap: "14px",
    padding: "16px",
  },
  boxCard: {
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    transition: "transform 0.18s,box-shadow 0.18s,border-color 0.18s",
    cursor: "default",
  },
  boxAccent: (color) => ({
    height: "3px",
    background: `linear-gradient(90deg,${color},${color}88)`,
  }),
  boxBody: { padding: "13px 14px" },
  boxTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  boxEmojiWrap: (bg, border) => ({
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: bg,
    border: `1px solid ${border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  }),
  boxName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  boxNote: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
    marginBottom: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  boxDivider: { borderTop: "1px solid var(--border)", margin: "10px 0" },
  boxAmountVal: {
    fontFamily: "'DM Mono',monospace",
    fontSize: "16px",
    fontWeight: 700,
    color: "#6366f1",
  },
  boxAmountSub: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    marginTop: "1px",
  },
  boxFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    flexWrap: "wrap",
    gap: "5px",
  },
  boxDate: { fontSize: "11px", color: "var(--text-secondary)" },

  /* TABLE VIEW */
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-primary)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 14px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  },
  tdName: { fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" },
  tdNote: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
  tdAmount: {
    fontFamily: "'DM Mono',monospace",
    fontSize: "13px",
    fontWeight: 700,
    color: "#6366f1",
  },
  tdAmountSub: { fontSize: "11px", color: "var(--text-secondary)" },

  /* ROW VIEW */
  rowItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    transition: "background 0.15s",
  },
  rowStripe: (color) => ({
    width: "3px",
    height: "36px",
    borderRadius: "2px",
    background: `linear-gradient(180deg,${color},${color}66)`,
    flexShrink: 0,
  }),
  rowEmoji: {
    fontSize: "20px",
    width: "28px",
    textAlign: "center",
    flexShrink: 0,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowNote: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowAmount: {
    fontFamily: "'DM Mono',monospace",
    fontSize: "14px",
    fontWeight: 700,
    color: "#6366f1",
    textAlign: "right",
  },
  rowAmountSub: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    textAlign: "right",
  },
  rowDate: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    minWidth: "76px",
    textAlign: "right",
  },
};

/* ─────────────────────────────────────────────
   SHARED SMALL COMPONENTS
───────────────────────────────────────────── */
function CatBadge({ cat }) {
  const m = CAT_META[cat] || CAT_META.other;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 9px",
        borderRadius: "99px",
        background: m.bg,
        border: `1px solid ${m.border}`,
        fontSize: "11px",
        fontWeight: 700,
        color: m.color,
        fontFamily: "'DM Sans',sans-serif",
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {m.emoji} {cat}
    </span>
  );
}

function PayBadge({ method }) {
  const m = PAY_META[method] || PAY_META.cash;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 9px",
        borderRadius: "99px",
        background: m.bg,
        fontSize: "11px",
        fontWeight: 700,
        color: m.color,
        fontFamily: "'DM Sans',sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {m.icon} {m.label}
    </span>
  );
}

function ActionBtns({ e, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[
        { icon: "✏️", label: "Edit", fn: () => onEdit(e) },
        { icon: "🗑️", label: "Delete", fn: () => onDelete(e._id) },
      ].map(({ icon, label, fn }) => (
        <button
          key={label}
          title={label}
          onClick={fn}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: "7px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            transition: "background 0.12s",
          }}
          onMouseEnter={(ev) =>
            (ev.currentTarget.style.background = "var(--bg-primary)")
          }
          onMouseLeave={(ev) => (ev.currentTarget.style.background = "none")}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

/* Tiny clickable image thumbnail */
function ImgThumb({ src, onOpen, size = 40 }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      onClick={(e) => {
        e.stopPropagation();
        onOpen(src);
      }}
      title="View image"
      style={{
        width: size,
        height: size,
        borderRadius: "8px",
        objectFit: "cover",
        border: "1px solid rgba(99,102,241,0.25)",
        cursor: "zoom-in",
        flexShrink: 0,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = "scale(1.06)";
        ev.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = "scale(1)";
        ev.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

/* StatCard */
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...S.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statVal, color: accent }}>{value}</div>
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ExpensesPage() {
  const { t, formatAmount, formatNum, language } = useApp();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("box");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [banner, setBanner] = useState(null);
  const [lightbox, setLightbox] = useState(null); // ← image lightbox

  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  /* ── Fetch ── */
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      if (filterMonth && filterYear) {
        params.month = filterMonth;
        params.year = filterYear;
      } else if (filterYear) params.year = filterYear;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data || []);
    } catch (err) {
      setBanner({ type: "error", title: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filterCat, filterMonth, filterYear]);
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCat, filterMonth, filterYear, search, pageSize]);

  /* ── CRUD ── */
  const handleModalSuccess = (savedItem) => {
    if (!savedItem) {
      loadExpenses();
      return;
    }
    if (editDataRef.current) {
      setExpenses((prev) =>
        prev.map((e) => (e._id === savedItem._id ? savedItem : e)),
      );
      setBanner({ type: "update", title: t("updatedSuccess") });
    } else {
      setExpenses((prev) => [savedItem, ...prev]);
      setCurrentPage(1);
      setBanner({ type: "success", title: t("addedSuccess") });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseAPI.delete(deleteId);
      setBanner({ type: "success", title: t("deletedSuccess") });
      setExpenses((prev) => prev.filter((e) => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to delete", sub: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (e) => {
    setEditData(e);
    setAddModal(true);
  };

  /* ── Filtering + pagination ── */
  const filtered = expenses.filter(
    (e) => !search || e.itemName?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalUSD = filtered.reduce((s, e) => s + (e.amountUSD || 0), 0);
  const maxItem = filtered.reduce(
    (a, b) => (b.amountUSD > a.amountUSD ? b : a),
    { amountUSD: 0 },
  );
  const avgUSD = filtered.length ? totalUSD / filtered.length : 0;
  const topCatMap = {};
  filtered.forEach((e) => {
    topCatMap[e.category] = (topCatMap[e.category] || 0) + (e.amountUSD || 0);
  });
  const topCat = Object.entries(topCatMap).sort((a, b) => b[1] - a[1])[0];

  const isAll = pageSize === "All";
  const totalItems = filtered.length;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = isAll ? 0 : (safePage - 1) * pageSize;
  const endIdx = isAll ? totalItems : Math.min(startIdx + pageSize, totalItems);
  const paginated = filtered.slice(startIdx, endIdx);

  const goTo = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  const goPrev = () => goTo(safePage - 1);
  const goNext = () => goTo(safePage + 1);

  const getPageNums = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (safePage <= 4) pages.push(1, 2, 3, 4, 5, "…", totalPages);
    else if (safePage >= totalPages - 3)
      pages.push(
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    else
      pages.push(1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages);
    return pages;
  };

  /* ── BOX VIEW ── */
  const BoxView = () => (
    <div style={S.boxGrid}>
      {paginated.map((e) => {
        const cm = CAT_META[e.category] || CAT_META.other;
        const displayImg = e.imageUrl || null; // main photo
        const qrImg = e.imageQr || null; // QR receipt
        const hasImg = !!(displayImg || qrImg);

        return (
          <div
            key={e._id}
            style={S.boxCard}
            onMouseEnter={(ev) => {
              ev.currentTarget.style.transform = "translateY(-3px)";
              ev.currentTarget.style.boxShadow = `0 10px 32px rgba(0,0,0,0.18), 0 0 0 1px ${cm.border}`;
              ev.currentTarget.style.borderColor = cm.border;
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.transform = "none";
              ev.currentTarget.style.boxShadow = "none";
              ev.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {/* ── CARD HEADER: image OR decorative banner ── */}
            {hasImg ? (
              /* ── HAS IMAGE: photo banner ── */
              <div
                style={{
                  position: "relative",
                  height: "118px",
                  overflow: "hidden",
                  background: "#0d0d14",
                }}
              >
                <img
                  src={displayImg || qrImg}
                  alt={e.itemName}
                  onClick={() => setLightbox(displayImg || qrImg)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    cursor: "zoom-in",
                    transition: "transform 0.32s ease",
                  }}
                  onMouseEnter={(ev) =>
                    (ev.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(ev) =>
                    (ev.currentTarget.style.transform = "scale(1)")
                  }
                />
                {/* dark gradient fade into card body */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)",
                    pointerEvents: "none",
                  }}
                />
                {/* view chip */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "7px",
                    right: "8px",
                    padding: "2px 8px",
                    borderRadius: "5px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(6px)",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                    cursor: "zoom-in",
                    pointerEvents: "none",
                  }}
                >
                  🔍 View
                </span>
                {/* if both imageUrl AND imageQr exist, show QR thumb in corner */}
                {displayImg && qrImg && (
                  <img
                    src={qrImg}
                    alt="QR"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setLightbox(qrImg);
                    }}
                    title="View QR receipt"
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      width: "34px",
                      height: "34px",
                      borderRadius: "7px",
                      objectFit: "cover",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      cursor: "zoom-in",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  />
                )}
              </div>
            ) : (
              /* ── NO IMAGE: rich decorative header ── */
              <div
                style={{
                  position: "relative",
                  height: "88px",
                  overflow: "hidden",
                  background: `linear-gradient(135deg, ${cm.color}22 0%, ${cm.color}0d 60%, transparent 100%)`,
                  borderBottom: `1px solid ${cm.border}`,
                }}
              >
                {/* SVG pattern — subtle dot grid */}
                <svg
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", inset: 0, opacity: 0.18 }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id={`dot-${e._id}`}
                      x="0"
                      y="0"
                      width="16"
                      height="16"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1.2" fill={cm.color} />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill={`url(#dot-${e._id})`}
                  />
                </svg>

                {/* large faded emoji as watermark */}
                <span
                  style={{
                    position: "absolute",
                    right: "-8px",
                    bottom: "-10px",
                    fontSize: "72px",
                    lineHeight: 1,
                    opacity: 0.13,
                    userSelect: "none",
                    pointerEvents: "none",
                    filter: "saturate(0.6)",
                  }}
                >
                  {cm.emoji}
                </span>

                {/* top-left: category pill */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 10px",
                      borderRadius: "99px",
                      background: `${cm.color}22`,
                      border: `1px solid ${cm.color}44`,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: cm.color,
                    }}
                  >
                    {cm.emoji}{" "}
                    <span style={{ textTransform: "capitalize" }}>
                      {e.category}
                    </span>
                  </span>
                </div>

                {/* bottom-left: payment method */}
                <div
                  style={{ position: "absolute", bottom: "10px", left: "12px" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.28)",
                      backdropFilter: "blur(6px)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {PAY_META[e.paymentMethod]?.icon}{" "}
                    {PAY_META[e.paymentMethod]?.label}
                  </span>
                </div>

                {/* top-right: action buttons */}
                <div style={{ position: "absolute", top: "6px", right: "6px" }}>
                  <ActionBtns e={e} onEdit={openEdit} onDelete={setDeleteId} />
                </div>
              </div>
            )}

            {/* colored accent line */}
            <div
              style={{
                height: "2px",
                background: `linear-gradient(90deg,${cm.color},${cm.color}44,transparent)`,
              }}
            />

            {/* ── CARD BODY ── */}
            <div style={{ padding: "12px 14px 14px" }}>
              {/* top row: emoji icon + actions (only shown when has image — no-image cards have actions in header) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "9px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      ...S.boxEmojiWrap(cm.bg, cm.border),
                      width: "32px",
                      height: "32px",
                      fontSize: "16px",
                    }}
                  >
                    {cm.emoji}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{ ...S.boxName, marginBottom: 0 }}
                      title={e.itemName}
                    >
                      {e.itemName}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                        marginTop: "1px",
                      }}
                    >
                      qty {e.quantity ?? 1} ·{" "}
                      {formatDate(e.date, language, "short")}
                    </div>
                  </div>
                </div>
                {/* action buttons only for image cards (no-image has them in the header) */}
                {hasImg && (
                  <ActionBtns e={e} onEdit={openEdit} onDelete={setDeleteId} />
                )}
              </div>

              {/* notes */}
              {e.noted && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.4,
                    marginBottom: "10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {e.noted}
                </div>
              )}

              <div
                style={{
                  borderTop: `1px solid var(--border)`,
                  margin: "10px 0 8px",
                }}
              />

              {/* amount row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "17px",
                      fontWeight: 700,
                      color: cm.color,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {formatAmount(e.amountUSD, e.amountKHR)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                      marginTop: "1px",
                    }}
                  >
                    {e.currency === "KHR"
                      ? `${e.amount?.toLocaleString()} ៛`
                      : `$${e.amount}`}
                  </div>
                </div>

                {/* for image cards: show pay+date; for no-image cards: just date (pay is already in header) */}
                {hasImg ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                    }}
                  >
                    <PayBadge method={e.paymentMethod} />
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {formatDate(e.date, language, "medium")}
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      textAlign: "right",
                    }}
                  >
                    {formatDate(e.date, language, "medium")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ── TABLE VIEW ── */
  const TableView = () => (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            {[
              "",
              t("itemName"),
              "Photo",
              t("category"),
              t("amount"),
              t("date"),
              t("paymentMethod"),
              t("quantity"),
              "",
            ].map((h, i) => (
              <th key={i} style={S.th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((e, idx) => {
            const cm = CAT_META[e.category] || CAT_META.other;
            return (
              <tr
                key={e._id}
                style={{
                  background:
                    idx % 2 === 0 ? "transparent" : "var(--bg-primary)",
                }}
                onMouseEnter={(ev) =>
                  (ev.currentTarget.style.background = `${cm.bg}`)
                }
                onMouseLeave={(ev) =>
                  (ev.currentTarget.style.background =
                    idx % 2 === 0 ? "transparent" : "var(--bg-primary)")
                }
              >
                <td style={{ ...S.td, fontSize: "20px", width: "44px" }}>
                  {cm.emoji}
                </td>
                <td style={S.td}>
                  <div style={S.tdName}>{e.itemName}</div>
                  {e.noted && <div style={S.tdNote}>{e.noted}</div>}
                </td>
                {/* ── IMAGE COLUMN ── */}
                <td style={{ ...S.td, width: "56px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    {e.imageUrl && (
                      <ImgThumb
                        src={e.imageUrl}
                        onOpen={setLightbox}
                        size={36}
                      />
                    )}
                    {e.imageQr && (
                      <ImgThumb
                        src={e.imageQr}
                        onOpen={setLightbox}
                        size={36}
                      />
                    )}
                    {!e.imageUrl && !e.imageQr && (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "11px",
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>
                </td>
                <td style={S.td}>
                  <CatBadge cat={e.category} />
                </td>
                <td style={S.td}>
                  <div style={S.tdAmount}>
                    {formatAmount(e.amountUSD, e.amountKHR)}
                  </div>
                  <div style={S.tdAmountSub}>
                    {e.currency === "KHR"
                      ? `${e.amount?.toLocaleString()} ៛`
                      : `$${e.amount}`}
                  </div>
                </td>
                <td
                  style={{
                    ...S.td,
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {formatDate(e.date, language, "medium")}
                </td>
                <td style={S.td}>
                  <PayBadge method={e.paymentMethod} />
                </td>
                <td
                  style={{
                    ...S.td,
                    textAlign: "center",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {e.quantity ?? 1}
                </td>
                <td style={S.td}>
                  <ActionBtns e={e} onEdit={openEdit} onDelete={setDeleteId} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  /* ── ROW VIEW ── */
  const RowView = () => (
    <div>
      {paginated.map((e) => {
        const cm = CAT_META[e.category] || CAT_META.other;
        return (
          <div
            key={e._id}
            style={S.rowItem}
            onMouseEnter={(ev) =>
              (ev.currentTarget.style.background = "var(--bg-primary)")
            }
            onMouseLeave={(ev) =>
              (ev.currentTarget.style.background = "transparent")
            }
          >
            <div style={S.rowStripe(cm.color)} />
            {/* thumbnail replaces emoji if image exists */}
            {e.imageUrl || e.imageQr ? (
              <ImgThumb
                src={e.imageUrl || e.imageQr}
                onOpen={setLightbox}
                size={38}
              />
            ) : (
              <span style={S.rowEmoji}>{cm.emoji}</span>
            )}
            <div style={S.rowBody}>
              <div style={S.rowName}>{e.itemName}</div>
              {e.noted && <div style={S.rowNote}>{e.noted}</div>}
            </div>
            <div className="hide-sm">
              <CatBadge cat={e.category} />
            </div>
            <div className="hide-md">
              <PayBadge method={e.paymentMethod} />
            </div>
            <div style={S.rowDate} className="hide-sm">
              {formatDate(e.date, language, "medium")}
            </div>
            {/* show both thumbs if both images exist */}
            {e.imageUrl && e.imageQr && (
              <ImgThumb src={e.imageQr} onOpen={setLightbox} size={32} />
            )}
            <div
              style={{ flexShrink: 0, textAlign: "right", minWidth: "72px" }}
            >
              <div style={S.rowAmount}>
                {formatAmount(e.amountUSD, e.amountKHR)}
              </div>
              <div style={S.rowAmountSub}>
                {e.currency === "KHR"
                  ? `${e.amount?.toLocaleString()} ៛`
                  : `$${e.amount}`}
              </div>
            </div>
            <ActionBtns e={e} onEdit={openEdit} onDelete={setDeleteId} />
          </div>
        );
      })}
    </div>
  );

  /* ── PAGINATION ── */
  const PaginationBar = () => {
    if (totalItems === 0) return null;
    const rangeStart = isAll ? 1 : startIdx + 1;
    const rangeEnd = isAll ? totalItems : endIdx;
    return (
      <div style={S.pgBar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={S.pgInfo}>
            Showing{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {rangeStart}–{rangeEnd}
            </strong>{" "}
            of{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {totalItems}
            </strong>
          </span>
          <div style={S.sizeRow}>
            <span style={S.sizeLabel}>Show:</span>
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt}
                style={S.sizeBtn(pageSize === opt)}
                onClick={() => {
                  setPageSize(opt);
                  setCurrentPage(1);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        {!isAll && totalPages > 1 && (
          <div style={S.pgBtns}>
            <button
              style={S.pgBtn(false, safePage === 1)}
              onClick={goPrev}
              disabled={safePage === 1}
            >
              ← Prev
            </button>
            {getPageNums().map((p, i) =>
              p === "…" ? (
                <span
                  key={`e${i}`}
                  style={{
                    padding: "5px 4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  style={S.pgBtn(safePage === p, false)}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              style={S.pgBtn(false, safePage === totalPages)}
              onClick={goNext}
              disabled={safePage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        @keyframes epFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes lbFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes lbScaleIn { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }
        .ep-add-btn:hover { transform:translateY(-2px) !important; box-shadow:0 8px 28px rgba(99,102,241,0.45) !important; }
        @media (max-width:900px)  { .ep-stat-bar { grid-template-columns:repeat(2,1fr) !important; } .ep-filter-grid { grid-template-columns:1fr 1fr !important; } .ep-box-grid { grid-template-columns:repeat(auto-fill,minmax(180px,1fr)) !important; } }
        @media (max-width:580px)  { .ep-filter-grid { grid-template-columns:1fr !important; } .ep-box-grid { grid-template-columns:1fr 1fr !important; } .hide-sm { display:none !important; } }
        @media (max-width:400px)  { .ep-box-grid { grid-template-columns:1fr !important; } .hide-md { display:none !important; } }
      `}</style>

      <div style={S.page}>
        {/* HEADER */}
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>💸 {t("expenses")}</h1>
            <p style={S.hsub}>
              {t("total")}: {formatAmount(totalUSD)} ·{" "}
              {formatNum(filtered.length)} {t("items")}
            </p>
          </div>
          <button
            className="ep-add-btn"
            style={S.addBtn}
            onClick={() => {
              setEditData(null);
              setAddModal(true);
            }}
          >
            <IcPlus /> {t("addNew")}
          </button>
        </div>

        {/* STAT BAR */}
        <div className="ep-stat-bar" style={S.statBar}>
          <StatCard
            label="Total spent"
            value={formatAmount(totalUSD)}
            sub={`${filtered.length} transactions`}
            accent="#6366f1"
          />
          <StatCard
            label="Largest item"
            value={formatAmount(maxItem.amountUSD)}
            sub={maxItem.itemName || "—"}
            accent="#f59e0b"
          />
          <StatCard
            label="Average spend"
            value={filtered.length ? formatAmount(avgUSD) : "—"}
            sub="per transaction"
            accent="#10b981"
          />
          <StatCard
            label="Top category"
            value={
              topCat
                ? `${CAT_META[topCat[0]]?.emoji || "📦"} ${topCat[0]}`
                : "—"
            }
            sub={topCat ? formatAmount(topCat[1]) : "—"}
            accent={
              topCat ? CAT_META[topCat[0]]?.color || "#64748b" : "#64748b"
            }
          />
        </div>

        {/* FILTERS */}
        <div style={S.filterPanel}>
          <div className="ep-filter-grid" style={S.filterGrid}>
            <div style={S.searchWrap}>
              <span style={S.searchIcon}>
                <IcSearch />
              </span>
              <input
                type="text"
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={S.searchInput}
                onFocus={(ev) => {
                  ev.target.style.borderColor = "#6366f1";
                  ev.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={(ev) => {
                  ev.target.style.borderColor = "var(--border)";
                  ev.target.style.boxShadow = "none";
                }}
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              style={S.select}
            >
              <option value="">{t("allCategories")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_META[c]?.emoji} {t(c)}
                </option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={S.select}
            >
              <option value="">{t("allMonths")}</option>
              {MONTHS_EN.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={S.select}
            >
              <option value="">All Years</option>
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN CARD */}
        <div style={S.mainCard}>
          <div style={S.toolbar}>
            <span style={S.toolbarLeft}>
              <strong style={{ color: "var(--text-primary)" }}>
                {formatNum(filtered.length)}
              </strong>{" "}
              {t("items")}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={S.sizeRow}>
                <span style={S.sizeLabel}>Show:</span>
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    style={S.sizeBtn(pageSize === opt)}
                    onClick={() => {
                      setPageSize(opt);
                      setCurrentPage(1);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div style={S.viewToggle}>
                {[
                  { key: "box", label: "Box", Icon: IcBox },
                  { key: "table", label: "Table", Icon: IcTable },
                  { key: "row", label: "Row", Icon: IcRow },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    style={S.viewBtn(viewMode === key)}
                    onClick={() => setViewMode(key)}
                    title={label}
                  >
                    <Icon active={viewMode === key} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "56px 16px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              {t("loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🧾</div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                {t("noExpenses")}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Try adjusting your filters
              </div>
            </div>
          ) : (
            <>
              {viewMode === "box" && <BoxView />}
              {viewMode === "table" && <TableView />}
              {viewMode === "row" && <RowView />}
              <PaginationBar />
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      <ExpenseModal
        isOpen={addModal}
        onClose={() => {
          setAddModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={handleModalSuccess}
      />
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />

      {/* LIGHTBOX */}
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
