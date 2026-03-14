// src/components/PlanPage.js - Reusable page for Trips, Goals, Givings, Others
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import PlanModal from "./modals/PlanModal";
import DeleteModal from "./modals/DeleteModal";
import { formatDate } from "../utils/khmerUtils";
import StatusBanner from "./StatusBanner";

const STATUS_MAP = {
  planned: "badge-planned",
  ongoing: "badge-ongoing",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function PlanPage({ type, icon, apiCall, config }) {
  const { t, formatAmount, formatNum, language } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [banner, setBanner] = useState(null);

  // Ref so handleModalSuccess always reads latest editData (avoids stale closure)
  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // ── Fetch from server (only on mount + filter change) ───────────────────
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

  // ── ADD / UPDATE without reload ─────────────────────────────────────────
  const handleModalSuccess = (savedItem) => {
    if (!savedItem) {
      load();
      return;
    }
    if (editDataRef.current) {
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
      await apiCall.delete(deleteId);
      setBanner({ type: "delete", title: t("deletedSuccess") });
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setBanner({ type: "error", title: "Failed to load", sub: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const getProgress = (item) => {
    const saved = item.savedAmount || item.givenAmount || item.paidAmount || 0;
    const target = item.targetAmount || 1;
    return Math.min(100, (saved / target) * 100);
  };

  const getSavedField = (item) => {
    return item.savedAmount !== undefined
      ? item.savedAmount
      : item.givenAmount !== undefined
        ? item.givenAmount
        : item.paidAmount !== undefined
          ? item.paidAmount
          : 0;
  };

  const statuses = config?.statuses || [
    "planned",
    "ongoing",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display font-bold text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            {icon} {t(type)}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatNum(items.length)} {t("items")}
          </p>
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

      {/* Filter by status */}
      <div className="card p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("")}
            className={`btn text-xs py-2 px-4 ${!filterStatus ? "btn-primary" : "btn-secondary"}`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`btn text-xs py-2 px-4 ${filterStatus === s ? "btn-primary" : "btn-secondary"}`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))
        ) : items.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-4xl mb-3">{icon}</div>
            <div
              className="font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              No {t(type)} yet
            </div>
          </div>
        ) : (
          items.map((item) => {
            const progress = getProgress(item);
            const saved = getSavedField(item);
            return (
              <div key={item._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-base truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    {(item.destination ||
                      item.description ||
                      item.recipient) && (
                      <div
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.destination || item.description || item.recipient}
                      </div>
                    )}
                  </div>
                  <span
                    className={`badge ${STATUS_MAP[item.status] || "badge-planned"} ml-2 shrink-0`}
                  >
                    {t(item.status)}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("savedAmount")}
                    </div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: "#10b981" }}
                    >
                      {formatAmount(
                        item.currency === "KHR"
                          ? saved / (item.exchangeRate || 4100)
                          : saved,
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("targetAmount")}
                    </div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatAmount(
                        item.currency === "KHR"
                          ? item.targetAmount / (item.exchangeRate || 4100)
                          : item.targetAmount,
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-1">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                      background:
                        progress >= 100
                          ? "linear-gradient(90deg,#10b981,#34d399)"
                          : undefined,
                    }}
                  />
                </div>
                <div
                  className="text-xs mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatNum(progress.toFixed(1))}% {t("progress")}
                </div>

                {/* Dates */}
                {(item.startDate ||
                  item.targetDate ||
                  item.endDate ||
                  item.date) && (
                  <div
                    className="text-xs mb-3 flex gap-3 flex-wrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.startDate && (
                      <span>📅 {formatDate(item.startDate, language)}</span>
                    )}
                    {item.endDate && (
                      <span>→ {formatDate(item.endDate, language)}</span>
                    )}
                    {item.targetDate && (
                      <span>🎯 {formatDate(item.targetDate, language)}</span>
                    )}
                    {item.date && !item.startDate && (
                      <span>📅 {formatDate(item.date, language)}</span>
                    )}
                  </div>
                )}

                {item.noted && (
                  <div
                    className="text-xs p-2 rounded-lg mb-3"
                    style={{
                      background: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.noted}
                  </div>
                )}

                <div
                  className="flex gap-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <button
                    className="btn btn-secondary flex-1 py-2 text-xs"
                    onClick={() => {
                      setEditData(item);
                      setModal(true);
                    }}
                  >
                    ✏️ {t("edit")}
                  </button>
                  <button
                    className="btn btn-secondary py-2 px-3 text-xs"
                    onClick={() => setDeleteId(item._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── KEY CHANGE: onSuccess={handleModalSuccess} not onSuccess={load} ── */}
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
