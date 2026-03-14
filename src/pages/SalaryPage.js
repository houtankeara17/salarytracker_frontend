// src/pages/SalaryPage.js
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { salaryAPI } from "../utils/api";
import SalaryModal from "../components/modals/SalaryModal";
import DeleteModal from "../components/modals/DeleteModal";
import StatusBanner from "../components/StatusBanner";

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];

export default function SalaryPage() {
  const { t, formatAmount } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [banner, setBanner] = useState(null);

  // Keep a ref to editData so handleModalSuccess always reads the latest value
  // (avoids stale closure issue)
  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // ── Fetch from server (only on mount + filter change) ───────────────────
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

  // ── ADD / UPDATE without reload ─────────────────────────────────────────
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
      setBanner({ type: "update", title: t("updatedSuccess") }); // ← add
    } else {
      setItems((prev) => [savedItem, ...prev]);
      setBanner({ type: "success", title: t("addedSuccess") }); // ← add
    }
  };

  // ── DELETE without reload ───────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await salaryAPI.delete(deleteId);
      setBanner({ type: "delete", title: t("deletedSuccess") }); // ← was toast.success
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setBanner({ type: "error", title: "Delete failed", sub: err.message }); // ← was toast.error
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived stats (recalculate from local state) ────────────────────────
  const totalUSD = items.reduce((s, i) => s + (i.amountUSD || 0), 0);
  const avgUSD = items.length ? totalUSD / items.length : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display font-bold text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            💰 {t("salary")}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("total")}: {formatAmount(totalUSD)} | Avg: {formatAmount(avgUSD)}
            /mo
          </p>
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

      {/* ── Filter ── */}
      <div className="card p-4">
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="form-input w-36"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            className="btn btn-secondary py-2 px-3 text-xs"
            onClick={() => setFilterYear("")}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))
        ) : items.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-4xl mb-3">💰</div>
            <div
              className="font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              No salary records yet
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold badge badge-completed">
                  {item.month} {item.year}
                </div>
                <div className="flex gap-1">
                  <button
                    className="btn btn-ghost p-1.5 text-sm"
                    onClick={() => {
                      setEditData(item);
                      setModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-ghost p-1.5 text-sm"
                    onClick={() => setDeleteId(item._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div
                className="font-display font-bold text-2xl mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {formatAmount(item.amountUSD, item.amountKHR)}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.currency === "USD"
                  ? `$${item.amount}`
                  : `${item.amount?.toLocaleString()} ៛`}
              </div>
              {item.noted && (
                <div
                  className="text-xs mt-2 p-2 rounded-lg"
                  style={{
                    background: "var(--bg-primary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {item.noted}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
