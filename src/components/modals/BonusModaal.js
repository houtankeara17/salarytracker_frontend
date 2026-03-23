// src/components/modals/BonusModal.js
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import StatusBanner from "../StatusBanner";

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

const defaultForm = {
  month: MONTHS_EN[new Date().getMonth()],
  year: new Date().getFullYear(),
  amount: "",
  currency: "USD",
  exchangeRate: 4100,
  bonusType: "Performance",
  noted: "",
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
    border: "1px solid rgba(251,191,36,0.18)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "460px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    animation: "bmSlideUp 0.28s cubic-bezier(.16,1,.3,1)",
  },
  header: {
    padding: "20px 24px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  iconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
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
    color: "#f59e0b",
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
  req: { color: "#f59e0b", fontSize: "13px", lineHeight: 1 },
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
    appearance: "none",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  amountPreview: {
    background: "rgba(245,158,11,0.07)",
    border: "1px solid rgba(245,158,11,0.15)",
    borderRadius: "10px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  footer: {
    padding: "16px 24px 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    gap: "10px",
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
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
  },
};

const extractItem = (res) => {
  if (!res) return null;
  const d = res?.data;
  if (d && typeof d === "object" && d._id) return d;
  if (d?.data?._id) return d.data;
  if (d?.bonus?._id) return d.bonus;
  if (res?._id) return res;
  return null;
};

export default function BonusModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
  apiCall,
}) {
  const { t } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (editData) {
      setForm({
        month: editData.month,
        year: editData.year,
        amount: editData.amount,
        currency: editData.currency || "USD",
        exchangeRate: editData.exchangeRate || 4100,
        bonusType: editData.bonusType || "Performance",
        noted: editData.noted || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editData, isOpen]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.amount) {
      setBanner({ type: "error", title: "Amount is required" });
      return;
    }
    setLoading(true);
    try {
      if (editData) {
        const res = await apiCall.update(editData._id, form);
        setBanner({ type: "update", title: t("updatedSuccess") });
        const saved = extractItem(res) || { ...editData, ...form };
        onSuccess(saved);
      } else {
        const res = await apiCall.create(form);
        setBanner({ type: "success", title: t("addedSuccess") });
        const saved = extractItem(res);
        onSuccess(saved);
      }
      onClose();
    } catch (err) {
      setBanner({
        type: "error",
        title: "Something went wrong",
        sub: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPreview = () => {
    const amt = Number(form.amount) || 0;
    if (form.currency === "USD") return `$${amt.toFixed(2)}`;
    const rate = Number(form.exchangeRate) || 4100;
    return `៛${Math.round(amt).toLocaleString()} (~$${(amt / rate).toFixed(2)})`;
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes bmSlideUp {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .bm-input:focus {
          border-color: rgba(245,158,11,0.5) !important;
          background: rgba(245,158,11,0.06) !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important;
        }
        .bm-input::placeholder { color: #444; }
        .bm-input option { background: #1e1e28; color: #e8e8f0; }
        .bm-close:hover  { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.3) !important; color: #ef4444 !important; }
        .bm-cancel:hover { background: rgba(255,255,255,0.07) !important; color: #aaa !important; }
        .bm-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.5) !important; filter: brightness(1.08); }
        .bm-submit:active { transform: translateY(0); }
        .bm-curr-btn { flex:1; padding:10px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        .bm-type-btn {
          flex:1; padding:8px 6px; border-radius:10px; font-size:11px; font-weight:600;
          cursor:pointer; transition:all 0.15s; font-family:inherit;
          display:flex; flex-direction:column; align-items:center; gap:3px;
        }
        .bm-type-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconWrap}>🎁</div>
              <div>
                <div style={styles.title}>
                  {editData ? t("edit") : t("add")} Bonus
                </div>
                <div style={styles.subtitle}>Record your bonus income</div>
              </div>
            </div>
            <button
              className="bm-close"
              style={styles.closeBtn}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={styles.body}>
            {/* Month + Year */}
            <div style={styles.row}>
              <div>
                <div style={styles.label}>{t("month")}</div>
                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="bm-input"
                  style={styles.input}
                >
                  {MONTHS_EN.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={styles.label}>{t("year")}</div>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="bm-input"
                  style={styles.input}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bonus Type */}
            <div>
              <div style={styles.label}>
                Bonus Type <span style={styles.req}>*</span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {BONUS_TYPES.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    className="bm-type-btn"
                    onClick={() => setForm((p) => ({ ...p, bonusType: bt }))}
                    style={{
                      border:
                        form.bonusType === bt
                          ? "1px solid #f59e0b"
                          : "1px solid rgba(255,255,255,0.08)",
                      background:
                        form.bonusType === bt
                          ? "rgba(245,158,11,0.14)"
                          : "rgba(255,255,255,0.03)",
                      color: form.bonusType === bt ? "#fbbf24" : "#666",
                      boxShadow:
                        form.bonusType === bt
                          ? "0 0 0 1px rgba(245,158,11,0.25)"
                          : "none",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>
                      {BONUS_TYPE_ICONS[bt]}
                    </span>
                    <span>{bt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + Currency */}
            <div>
              <div style={styles.label}>
                {t("amount")} <span style={styles.req}>*</span>
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
                      color: "#f59e0b",
                      pointerEvents: "none",
                    }}
                  >
                    {form.currency === "USD" ? "$" : "៛"}
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="bm-input"
                    style={{ ...styles.input, paddingLeft: "28px" }}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["USD", "KHR"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="bm-curr-btn"
                      onClick={() => setForm((p) => ({ ...p, currency: c }))}
                      style={{
                        border:
                          form.currency === c
                            ? "1px solid #f59e0b"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          form.currency === c
                            ? "rgba(245,158,11,0.14)"
                            : "rgba(255,255,255,0.03)",
                        color: form.currency === c ? "#fbbf24" : "#666",
                        boxShadow:
                          form.currency === c
                            ? "0 0 0 1px rgba(245,158,11,0.25)"
                            : "none",
                      }}
                    >
                      {c === "USD" ? "$ USD" : "៛ KHR"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.amountPreview}>
                <span
                  style={{ fontSize: "11px", color: "#666", fontWeight: 500 }}
                >
                  Amount Preview
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#fbbf24",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {totalPreview()}
                </span>
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
                  className="bm-input"
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
                className="bm-input"
                style={{ ...styles.input, resize: "none", minHeight: "70px" }}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              className="bm-cancel"
              style={styles.cancelBtn}
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="bm-submit"
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

      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
