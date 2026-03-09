// src/pages/ExpensesPage.js
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { expenseAPI } from "../utils/api";
import ExpenseModal from "../components/modals/ExpenseModal";
import DeleteModal from "../components/modals/DeleteModal";
import toast from "react-hot-toast";
import { formatDate } from "../utils/khmerUtils";

const CATEGORIES = [
  "food",
  "Drink",
  "Fruit",
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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 30, "All"];

// ── View toggle icons ──────────────────────────────────────────────────────────
const IconTable = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="1"
      width="14"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".9"
    />
    <rect
      x="1"
      y="6"
      width="6"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".7"
    />
    <rect
      x="9"
      y="6"
      width="6"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".7"
    />
    <rect
      x="1"
      y="11"
      width="6"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".5"
    />
    <rect
      x="9"
      y="11"
      width="6"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".5"
    />
  </svg>
);
const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="1"
      width="6"
      height="6"
      rx="1.5"
      fill="currentColor"
      opacity=".9"
    />
    <rect
      x="9"
      y="1"
      width="6"
      height="6"
      rx="1.5"
      fill="currentColor"
      opacity=".9"
    />
    <rect
      x="1"
      y="9"
      width="6"
      height="6"
      rx="1.5"
      fill="currentColor"
      opacity=".6"
    />
    <rect
      x="9"
      y="9"
      width="6"
      height="6"
      rx="1.5"
      fill="currentColor"
      opacity=".6"
    />
  </svg>
);
const IconRow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="2"
      width="14"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".9"
    />
    <rect
      x="1"
      y="7"
      width="14"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".7"
    />
    <rect
      x="1"
      y="12"
      width="14"
      height="3"
      rx="1"
      fill="currentColor"
      opacity=".5"
    />
  </svg>
);

const VIEW_MODES = [
  { key: "table", label: "Table", Icon: IconTable },
  { key: "box", label: "Box", Icon: IconBox },
  { key: "row", label: "Row", Icon: IconRow },
];

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
  const [viewMode, setViewMode] = useState("table");

  // ── Pagination state ────────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(10); // number | "All"
  const [currentPage, setCurrentPage] = useState(1);

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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filterCat, filterMonth, filterYear]);

  // Reset to page 1 whenever filters / search / pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCat, filterMonth, filterYear, search, pageSize]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseAPI.delete(deleteId);
      toast.success(t("deletedSuccess"));
      setDeleteId(null);
      loadExpenses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = expenses.filter(
    (e) => !search || e.itemName?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalUSD = filtered.reduce((s, e) => s + (e.amountUSD || 0), 0);

  // ── Pagination logic ────────────────────────────────────────────────────────
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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (safePage <= 4) {
      pages.push(1, 2, 3, 4, 5, "…", totalPages);
    } else if (safePage >= totalPages - 3) {
      pages.push(
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages);
    }
    return pages;
  };

  // ── Shared action buttons ──────────────────────────────────────────────────
  const ActionBtns = ({ e }) => (
    <div className="flex gap-1">
      <button
        className="btn btn-ghost p-2 text-sm"
        onClick={() => {
          setEditData(e);
          setAddModal(true);
        }}
        title={t("edit")}
      >
        ✏️
      </button>
      <button
        className="btn btn-ghost p-2 text-sm"
        onClick={() => setDeleteId(e._id)}
        title={t("delete")}
      >
        🗑️
      </button>
    </div>
  );

  // ── TABLE VIEW ─────────────────────────────────────────────────────────────
  const TableView = () => (
    <div className="overflow-x-auto">
      <table
        className="w-full"
        style={{
          borderCollapse: "collapse",
          border: "1px solid var(--border)",
        }}
      >
        <thead>
          <tr style={{ background: "var(--bg-primary)" }}>
            {[
              "",
              t("itemName"),
              t("category"),
              t("amount"),
              t("date"),
              t("paymentMethod"),
              t("quantity"),
              "",
            ].map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((e, idx) => (
            <tr
              key={e._id}
              className="transition-colors"
              style={{
                background: idx % 2 === 0 ? "transparent" : "var(--bg-primary)",
              }}
              onMouseEnter={(ev) => (ev.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(ev) => (ev.currentTarget.style.opacity = "1")}
            >
              <td
                className="px-4 py-3 text-xl"
                style={{ border: "1px solid var(--border)" }}
              >
                {e.categoryEmoji}
              </td>
              <td
                className="px-4 py-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <div
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {e.itemName}
                </div>
                {e.noted && (
                  <div
                    className="text-xs mt-0.5 truncate max-w-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {e.noted}
                  </div>
                )}
              </td>
              <td
                className="px-4 py-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <span className="badge badge-planned">{t(e.category)}</span>
              </td>
              <td
                className="px-4 py-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="font-bold text-sm" style={{ color: "#0ea5e9" }}>
                  {formatAmount(e.amountUSD, e.amountKHR)}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {e.currency === "KHR"
                    ? `${e.amount?.toLocaleString()} ៛`
                    : `$${e.amount}`}
                </div>
              </td>
              <td
                className="px-4 py-3 text-sm"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(e.date, language, "medium")}
              </td>
              <td
                className="px-4 py-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <span
                  className={`badge ${e.paymentMethod === "qr" ? "badge-completed" : "badge-planned"}`}
                >
                  {e.paymentMethod === "qr"
                    ? "📱"
                    : e.paymentMethod === "cash"
                      ? "💵"
                      : e.paymentMethod === "card"
                        ? "💳"
                        : "🔄"}{" "}
                  {t(e.paymentMethod)}
                </span>
                {e.imageQr && (
                  <div className="mt-1">
                    <img
                      src={e.imageQr}
                      alt="QR"
                      className="w-8 h-8 rounded object-cover"
                    />
                  </div>
                )}
              </td>
              <td
                className="px-4 py-3 text-sm text-center"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {e.quantity}
              </td>
              <td
                className="px-4 py-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <ActionBtns e={e} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── BOX / CARD VIEW ────────────────────────────────────────────────────────
  const BoxView = () => (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {paginated.map((e) => (
        <div
          key={e._id}
          className="rounded-xl overflow-hidden transition-all duration-200"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.transform = "translateY(-2px)";
            ev.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.transform = "translateY(0)";
            ev.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          }}
        >
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
            }}
          />
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{e.categoryEmoji}</span>
                <span className="badge badge-planned text-xs">
                  {t(e.category)}
                </span>
              </div>
              <ActionBtns e={e} />
            </div>
            <div
              className="font-bold text-sm mb-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {e.itemName}
            </div>
            {e.noted && (
              <div
                className="text-xs mb-2 line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {e.noted}
              </div>
            )}
            <div
              style={{ borderTop: "1px solid var(--border)", margin: "10px 0" }}
            />
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("amount")}
              </span>
              <div className="text-right">
                <div className="font-bold text-sm" style={{ color: "#0ea5e9" }}>
                  {formatAmount(e.amountUSD, e.amountKHR)}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {e.currency === "KHR"
                    ? `${e.amount?.toLocaleString()} ៛`
                    : `$${e.amount}`}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <span
                  className={`badge text-xs ${e.paymentMethod === "qr" ? "badge-completed" : "badge-planned"}`}
                >
                  {e.paymentMethod === "qr"
                    ? "📱"
                    : e.paymentMethod === "cash"
                      ? "💵"
                      : e.paymentMethod === "card"
                        ? "💳"
                        : "🔄"}{" "}
                  {t(e.paymentMethod)}
                </span>
                {e.quantity > 1 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ×{e.quantity}
                  </span>
                )}
              </div>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(e.date, language, "medium")}
              </span>
            </div>
            {e.imageQr && (
              <img
                src={e.imageQr}
                alt="QR"
                className="w-10 h-10 rounded mt-2 object-cover"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── ROW VIEW ───────────────────────────────────────────────────────────────
  const RowView = () => (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      {paginated.map((e) => (
        <div
          key={e._id}
          className="flex items-center gap-4 px-5 py-3.5 transition-colors"
          style={{ borderBottom: "1px solid var(--border)" }}
          onMouseEnter={(ev) =>
            (ev.currentTarget.style.background = "var(--bg-primary)")
          }
          onMouseLeave={(ev) =>
            (ev.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: "3px",
              height: "36px",
              borderRadius: "2px",
              background: "linear-gradient(180deg, #0ea5e9, #38bdf8)",
              flexShrink: 0,
            }}
          />
          <span className="text-xl flex-shrink-0 w-8 text-center">
            {e.categoryEmoji}
          </span>
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {e.itemName}
            </div>
            {e.noted && (
              <div
                className="text-xs truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {e.noted}
              </div>
            )}
          </div>
          <span className="badge badge-planned text-xs hidden sm:inline-flex flex-shrink-0">
            {t(e.category)}
          </span>
          <span
            className={`badge text-xs hidden md:inline-flex flex-shrink-0 ${e.paymentMethod === "qr" ? "badge-completed" : "badge-planned"}`}
          >
            {e.paymentMethod === "qr"
              ? "📱"
              : e.paymentMethod === "cash"
                ? "💵"
                : e.paymentMethod === "card"
                  ? "💳"
                  : "🔄"}{" "}
            {t(e.paymentMethod)}
          </span>
          {e.quantity > 1 && (
            <span
              className="text-xs flex-shrink-0 hidden lg:block"
              style={{ color: "var(--text-secondary)" }}
            >
              ×{e.quantity}
            </span>
          )}
          <span
            className="text-xs flex-shrink-0 hidden sm:block w-24 text-right"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatDate(e.date, language, "medium")}
          </span>
          <div className="flex-shrink-0 text-right w-24">
            <div className="font-bold text-sm" style={{ color: "#0ea5e9" }}>
              {formatAmount(e.amountUSD, e.amountKHR)}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {e.currency === "KHR"
                ? `${e.amount?.toLocaleString()} ៛`
                : `$${e.amount}`}
            </div>
          </div>
          <div className="flex-shrink-0">
            <ActionBtns e={e} />
          </div>
        </div>
      ))}
    </div>
  );

  // ── PAGINATION BAR ─────────────────────────────────────────────────────────
  const PaginationBar = () => {
    if (totalItems === 0) return null;

    const rangeStart = isAll ? 1 : startIdx + 1;
    const rangeEnd = isAll ? totalItems : endIdx;

    return (
      <div
        className="flex items-center justify-between flex-wrap gap-3 px-4 py-3"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-primary)",
        }}
      >
        {/* Left: showing X–Y of Z + page size selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Showing{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {rangeStart}–{rangeEnd}
            </strong>{" "}
            of{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {totalItems}
            </strong>
          </span>

          {/* Per-page selector */}
          <div className="flex items-center gap-1">
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Show:
            </span>
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => {
                const active = pageSize === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setPageSize(opt);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "3px 9px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: active ? "700" : "500",
                      transition: "all 0.15s ease",
                      color: active ? "#fff" : "var(--text-secondary)",
                      background: active
                        ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                        : "transparent",
                      boxShadow: active
                        ? "0 2px 6px rgba(14,165,233,0.3)"
                        : "none",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Prev / page numbers / Next */}
        {!isAll && totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={goPrev}
              disabled={safePage === 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "5px 10px",
                borderRadius: "7px",
                border: "1px solid var(--border)",
                cursor: safePage === 1 ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "500",
                background: "var(--bg-secondary)",
                color:
                  safePage === 1
                    ? "var(--text-secondary)"
                    : "var(--text-primary)",
                opacity: safePage === 1 ? 0.4 : 1,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(ev) => {
                if (safePage !== 1)
                  ev.currentTarget.style.borderColor = "#0ea5e9";
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
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
                  onClick={() => goTo(p)}
                  style={{
                    minWidth: "32px",
                    padding: "5px 8px",
                    borderRadius: "7px",
                    border: safePage === p ? "none" : "1px solid var(--border)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: safePage === p ? "700" : "500",
                    transition: "all 0.15s ease",
                    color: safePage === p ? "#fff" : "var(--text-primary)",
                    background:
                      safePage === p
                        ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                        : "var(--bg-secondary)",
                    boxShadow:
                      safePage === p
                        ? "0 2px 8px rgba(14,165,233,0.35)"
                        : "none",
                  }}
                  onMouseEnter={(ev) => {
                    if (safePage !== p)
                      ev.currentTarget.style.borderColor = "#0ea5e9";
                  }}
                  onMouseLeave={(ev) => {
                    if (safePage !== p)
                      ev.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              onClick={goNext}
              disabled={safePage === totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "5px 10px",
                borderRadius: "7px",
                border: "1px solid var(--border)",
                cursor: safePage === totalPages ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "500",
                background: "var(--bg-secondary)",
                color:
                  safePage === totalPages
                    ? "var(--text-secondary)"
                    : "var(--text-primary)",
                opacity: safePage === totalPages ? 0.4 : 1,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(ev) => {
                if (safePage !== totalPages)
                  ev.currentTarget.style.borderColor = "#0ea5e9";
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display font-bold text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            💸 {t("expenses")}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("total")}: {formatAmount(totalUSD)} ·{" "}
            {formatNum(filtered.length)} {t("items")}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditData(null);
            setAddModal(true);
          }}
        >
          + {t("addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="form-input"
          >
            <option value="">{t("allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="form-input"
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
            className="form-input"
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

      {/* Main card with view toggle header */}
      <div className="card overflow-hidden">
        {/* ── View toggle bar ── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-primary)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatNum(filtered.length)} {t("items")}
          </span>

          <div
            className="flex items-center gap-0.5 p-1 rounded-lg"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {VIEW_MODES.map(({ key, label, Icon }) => {
              const active = viewMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  title={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: active ? "700" : "500",
                    transition: "all 0.18s ease",
                    color: active ? "#fff" : "var(--text-secondary)",
                    background: active
                      ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                      : "transparent",
                    boxShadow: active
                      ? "0 2px 8px rgba(14,165,233,0.35)"
                      : "none",
                  }}
                >
                  <Icon />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content area ── */}
        {loading ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <div
              className="font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("noExpenses")}
            </div>
          </div>
        ) : (
          <>
            {viewMode === "table" && <TableView />}
            {viewMode === "box" && <BoxView />}
            {viewMode === "row" && <RowView />}
            <PaginationBar />
          </>
        )}
      </div>

      <ExpenseModal
        isOpen={addModal}
        onClose={() => {
          setAddModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={loadExpenses}
      />
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
