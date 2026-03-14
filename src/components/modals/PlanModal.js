// src/components/modals/PlanModal.js
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import StatusBanner from "../StatusBanner";
import KhmerDateInput from "../KhmerDateInput";

const defaultForm = {
  title: "",
  description: "",
  destination: "",
  targetAmount: "",
  savedAmount: 0,
  givenAmount: 0,
  paidAmount: 0,
  currency: "USD",
  exchangeRate: 4100,
  status: "planned",
  startDate: "",
  endDate: "",
  targetDate: "",
  date: new Date().toISOString().split("T")[0],
  recipient: "",
  noted: "",
};

const STATUS_CONFIG = {
  planned: {
    color: "#818cf8",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.35)",
    icon: "📋",
  },
  ongoing: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    icon: "⚡",
  },
  completed: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.35)",
    icon: "✅",
  },
  cancelled: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.35)",
    icon: "✕",
  },
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,10,16,0.85)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  },
  modal: {
    background: "#16161e",
    border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    animation: "pmSlideUp 0.28s cubic-bezier(.16,1,.3,1)",
  },
  header: {
    padding: "20px 24px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  iconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
    flexShrink: 0,
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f0f0f5",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: "11px",
    color: "#6366f1",
    fontWeight: 500,
    marginTop: "1px",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#888",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  req: { color: "#6366f1", fontSize: "13px", lineHeight: 1 },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#e8e8f0",
    transition: "all 0.15s",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  progressBar: {
    height: "5px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginTop: "10px",
  },
  footer: {
    padding: "16px 24px 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#888",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  submitBtn: {
    flex: 2,
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
  },
};

// Tries every known API response shape to extract the saved item
const extractItem = (res) => {
  if (!res) return null;
  const d = res?.data;
  if (d && typeof d === "object" && d._id) return d;
  if (d?.data?._id) return d.data;
  if (d?.plan?._id) return d.plan;
  if (d?.travel?._id) return d.travel;
  if (d?.goal?._id) return d.goal;
  if (d?.giving?._id) return d.giving;
  if (d?.other?._id) return d.other;
  if (d?.debt?._id) return d.debt;
  if (d?.loan?._id) return d.loan;
  if (res?._id) return res;
  return null;
};

export default function PlanModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
  type,
  apiCall,
  config,
}) {
  const { t } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // ✅ banner state

  const showBanner = (type, title, sub) => setBanner({ type, title, sub }); // ✅ helper

  // Reset form and clear banner whenever modal opens or editData changes
  useEffect(() => {
    if (editData) {
      setForm({
        ...defaultForm,
        ...editData,
        startDate: editData.startDate
          ? new Date(editData.startDate).toISOString().split("T")[0]
          : "",
        endDate: editData.endDate
          ? new Date(editData.endDate).toISOString().split("T")[0]
          : "",
        targetDate: editData.targetDate
          ? new Date(editData.targetDate).toISOString().split("T")[0]
          : "",
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : defaultForm.date,
      });
    } else {
      setForm(defaultForm);
    }
    setBanner(null); // ✅ clear old banner on reopen
  }, [editData, isOpen]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.targetAmount) {
      showBanner(
        "error",
        "Missing required fields",
        "Title and target amount are required",
      );
      return;
    }
    setLoading(true);
    showBanner("loading", "Saving your plan...", "Please wait a moment");
    try {
      if (editData) {
        const res = await apiCall.update(editData._id, form);
        const saved = extractItem(res) || { ...editData, ...form };
        showBanner(
          "update",
          t("updatedSuccess"),
          "Your changes have been saved",
        );
        setTimeout(() => {
          onSuccess(saved);
          onClose();
        }, 1200);
      } else {
        const res = await apiCall.create(form);
        showBanner(
          "success",
          t("addedSuccess"),
          "Your new plan has been saved",
        );
        setTimeout(() => {
          onSuccess(extractItem(res));
          onClose();
        }, 1200);
      }
    } catch (err) {
      showBanner("error", "Something went wrong", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statuses = config?.statuses || [
    "planned",
    "ongoing",
    "completed",
    "cancelled",
  ];
  const progressKey = config?.progressFieldKey || "savedAmount";
  const progressLabel = config?.progressField
    ? t(config.progressField)
    : t("savedAmount");
  const progressVal = Number(form[progressKey]) || 0;
  const targetVal = Number(form.targetAmount) || 0;
  const progressPct =
    targetVal > 0 ? Math.min(100, (progressVal / targetVal) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes pmSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pm-input:focus {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(99,102,241,0.06) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
        .pm-input::placeholder { color: #444; }
        .pm-input option { background: #1e1e28; color: #e8e8f0; }
        .pm-close:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.3) !important; color: #ef4444 !important; }
        .pm-cancel:hover { background: rgba(255,255,255,0.07) !important; color: #aaa !important; }
        .pm-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.5) !important; filter: brightness(1.08); }
        .pm-submit:active { transform: translateY(0); }
        .pm-status-btn {
          flex: 1; padding: 8px 4px; border-radius: 10px; font-size: 10.5px;
          font-weight: 600; cursor: pointer; transition: all 0.15s;
          font-family: inherit; display: flex; flex-direction: column;
          align-items: center; gap: 3px;
        }
        .pm-curr-btn {
          flex: 1; padding: 10px; border-radius: 10px; font-size: 12px;
          font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .pm-body::-webkit-scrollbar { width: 4px; }
        .pm-body::-webkit-scrollbar-track { background: transparent; }
        .pm-body::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconWrap}>{config?.icon || "📋"}</div>
              <div>
                <div style={styles.title}>
                  {editData ? t("edit") : t("add")} {t(type)}
                </div>
                <div style={styles.subtitle}>Plan & track progress</div>
              </div>
            </div>
            <button
              className="pm-close"
              style={styles.closeBtn}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="pm-body" style={styles.body}>
            {/* ✅ StatusBanner — always first child */}
            <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />

            {/* Title */}
            <div>
              <div style={styles.label}>
                {t("title")} <span style={styles.req}>*</span>
              </div>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="pm-input"
                style={styles.input}
                placeholder="Enter a title..."
              />
            </div>

            {/* Description */}
            {config?.hasDescription && (
              <div>
                <div style={styles.label}>{t("description")}</div>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                  placeholder="Brief description..."
                />
              </div>
            )}

            {/* Destination */}
            {config?.hasDestination && (
              <div>
                <div style={styles.label}>{t("destination")}</div>
                <input
                  type="text"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                  placeholder="Where to?"
                />
              </div>
            )}

            {/* Recipient */}
            {config?.hasRecipient && (
              <div>
                <div style={styles.label}>{t("recipient")}</div>
                <input
                  type="text"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                  placeholder="Recipient name..."
                />
              </div>
            )}

            {/* Target Amount + Progress Field */}
            <div>
              <div style={styles.label}>
                {t("targetAmount")} <span style={styles.req}>*</span>
              </div>
              <div style={styles.row}>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "13px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#6366f1",
                      pointerEvents: "none",
                    }}
                  >
                    {form.currency === "USD" ? "$" : "៛"}
                  </span>
                  <input
                    type="number"
                    name="targetAmount"
                    value={form.targetAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pm-input"
                    style={{ ...styles.input, paddingLeft: "28px" }}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "13px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#34d399",
                      pointerEvents: "none",
                    }}
                  >
                    {form.currency === "USD" ? "$" : "៛"}
                  </span>
                  <input
                    type="number"
                    name={progressKey}
                    value={form[progressKey]}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pm-input"
                    style={{ ...styles.input, paddingLeft: "28px" }}
                    placeholder={progressLabel}
                  />
                </div>
              </div>
              {targetVal > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        fontWeight: 500,
                      }}
                    >
                      {progressLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#818cf8",
                        fontWeight: 700,
                      }}
                    >
                      {progressPct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, #6366f1, #818cf8)",
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Currency */}
            <div>
              <div style={styles.label}>{t("currency")}</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["USD", "KHR"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="pm-curr-btn"
                    onClick={() => setForm((p) => ({ ...p, currency: c }))}
                    style={{
                      border:
                        form.currency === c
                          ? "1px solid #6366f1"
                          : "1px solid rgba(255,255,255,0.08)",
                      background:
                        form.currency === c
                          ? "rgba(99,102,241,0.14)"
                          : "rgba(255,255,255,0.03)",
                      color: form.currency === c ? "#818cf8" : "#666",
                      boxShadow:
                        form.currency === c
                          ? "0 0 0 1px rgba(99,102,241,0.25)"
                          : "none",
                    }}
                  >
                    {c === "USD" ? "$ USD" : "៛ KHR"}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            {form.currency === "KHR" && (
              <div>
                <div style={styles.label}>
                  {t("exchangeRate")} <span style={styles.req}>*</span>
                </div>
                <input
                  type="number"
                  name="exchangeRate"
                  value={form.exchangeRate}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                />
              </div>
            )}

            {/* Status */}
            <div>
              <div style={styles.label}>{t("status")}</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {statuses.map((s) => {
                  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.planned;
                  const active = form.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className="pm-status-btn"
                      onClick={() => setForm((p) => ({ ...p, status: s }))}
                      style={{
                        border: active
                          ? `1px solid ${cfg.border}`
                          : "1px solid rgba(255,255,255,0.06)",
                        background: active ? cfg.bg : "rgba(255,255,255,0.03)",
                        color: active ? cfg.color : "#555",
                        boxShadow: active ? `0 0 0 1px ${cfg.border}` : "none",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
                      <span style={{ textTransform: "capitalize" }}>
                        {t(s)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            {config?.hasDateRange && (
              <div style={styles.row}>
                <div>
                  <div style={styles.label}>{t("startDate")}</div>
                  <KhmerDateInput
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="pm-input"
                    style={styles.input}
                  />
                </div>
                <div>
                  <div style={styles.label}>{t("endDate")}</div>
                  <KhmerDateInput
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="pm-input"
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {/* Target Date */}
            {config?.hasTargetDate && (
              <div>
                <div style={styles.label}>{t("targetDate")}</div>
                <KhmerDateInput
                  name="targetDate"
                  value={form.targetDate}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                />
              </div>
            )}

            {/* Date */}
            {config?.hasDate && (
              <div>
                <div style={styles.label}>{t("date")}</div>
                <KhmerDateInput
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="pm-input"
                  style={styles.input}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <div style={styles.label}>{t("notes")}</div>
              <textarea
                name="noted"
                value={form.noted}
                onChange={handleChange}
                className="pm-input"
                style={{ ...styles.input, resize: "none", minHeight: "70px" }}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              className="pm-cancel"
              style={styles.cancelBtn}
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="pm-submit"
              style={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? t("loading")
                : editData
                  ? `${t("update")} →`
                  : `${t("add")} →`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
