// src/components/modals/ExpenseModal.js
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { expenseAPI } from "../../utils/api";
import KhmerDateInput from "../KhmerDateInput";
import StatusBanner from "../StatusBanner";

const CATEGORIES = [
  { value: "food", emoji: "🍚" },
  { value: "Drink", emoji: "🥤" },
  { value: "Fruit", emoji: "🍓" },
  { value: "transport", emoji: "🚗" },
  { value: "clothing", emoji: "👕" },
  { value: "health", emoji: "💊" },
  { value: "entertainment", emoji: "🎮" },
  { value: "education", emoji: "📚" },
  { value: "utilities", emoji: "💡" },
  { value: "shopping", emoji: "🛍️" },
  { value: "other", emoji: "💸" },
];

const PAYMENT_METHODS = [
  { value: "cash", icon: "💵" },
  { value: "qr", icon: "📱" },
  { value: "card", icon: "💳" },
  { value: "transfer", icon: "🏦" },
];

const defaultForm = {
  itemName: "",
  category: "food",
  quantity: 1,
  date: new Date().toISOString().split("T")[0],
  amount: "",
  currency: "USD",
  exchangeRate: 4100,
  paymentMethod: "cash",
  noted: "",
  imageQr: "",
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
    animation: "emSlideUp 0.28s cubic-bezier(.16,1,.3,1)",
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
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
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
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  payGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  amountPreview: {
    background: "rgba(99,102,241,0.07)",
    border: "1px solid rgba(99,102,241,0.15)",
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
    letterSpacing: "0.1px",
  },
};

// Tries every known API response shape to extract the saved item
const extractItem = (res) => {
  if (!res) return null;
  const d = res?.data;
  if (d && typeof d === "object" && d._id) return d; // res.data is the item
  if (d?.data?._id) return d.data; // res.data.data
  if (d?.expense?._id) return d.expense; // res.data.expense
  if (res?._id) return res; // res itself
  return null;
};

export default function ExpenseModal({ isOpen, onClose, editData, onSuccess }) {
  const { t, language } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [banner, setBanner] = useState(null); // ← add

  useEffect(() => {
    if (editData) {
      setForm({
        itemName: editData.itemName || "",
        category: editData.category || "food",
        quantity: editData.quantity || 1,
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : defaultForm.date,
        amount: editData.amount || "",
        currency: editData.currency || "USD",
        exchangeRate: editData.exchangeRate || 4100,
        paymentMethod: editData.paymentMethod || "cash",
        noted: editData.noted || "",
        imageQr: editData.imageQr || "",
      });
      if (editData.imageQr) setQrPreview(editData.imageQr);
    } else {
      setForm(defaultForm);
      setQrPreview(null);
    }
  }, [editData, isOpen]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageQr: reader.result }));
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!form.itemName.trim()) return "Item name is required";
    if (!form.date) return "Date is required";
    if (!form.category) return "Category is required";
    if (!form.amount || Number(form.amount) <= 0)
      return "Amount must be greater than 0";
    if (!form.quantity || Number(form.quantity) <= 0)
      return "Quantity must be greater than 0";
    if (!form.currency) return "Currency is required";
    if (
      form.currency === "KHR" &&
      (!form.exchangeRate || Number(form.exchangeRate) <= 0)
    )
      return "Exchange rate is required for KHR";
    if (!form.paymentMethod) return "Payment method is required";
    if (form.paymentMethod === "qr" && !form.imageQr)
      return "QR image is required for QR payment";
    return null;
  };

  // ── FIXED: capture res and pass saved item to onSuccess ─────────────────
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setBanner({ type: "error", title: error });
      return;
    }
    setLoading(true);
    try {
      if (editData) {
        const res = await expenseAPI.update(editData._id, form);
        const saved = extractItem(res) || { ...editData, ...form };
        onSuccess(saved); // ← parent handles the banner
      } else {
        const res = await expenseAPI.create(form);
        onSuccess(extractItem(res)); // ← parent handles the banner
      }
      onClose();
    } catch (err) {
      setBanner({ type: "error", title: "Failed", sub: err.message });
    } finally {
      setLoading(false);
    }
  };

  const totalPreview = () => {
    const amt = Number(form.amount) || 0;
    const qty = Number(form.quantity) || 1;
    const total = amt * qty;
    if (form.currency === "USD") return `$${total.toFixed(2)}`;
    const rate = Number(form.exchangeRate) || 4100;
    return `៛${Math.round(total).toLocaleString()} (~$${(total / rate).toFixed(2)})`;
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes emSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .em-input:focus {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(99,102,241,0.06) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
        .em-input::placeholder { color: #444; }
        .em-cat-btn:hover { border-color: rgba(99,102,241,0.3) !important; background: rgba(99,102,241,0.06) !important; }
        .em-pay-btn:hover { border-color: rgba(99,102,241,0.3) !important; color: #888 !important; }
        .em-cancel-btn:hover { background: rgba(255,255,255,0.07) !important; color: #aaa !important; }
        .em-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.5) !important; filter: brightness(1.08); }
        .em-close-btn:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.3) !important; color: #ef4444 !important; }
        .em-body::-webkit-scrollbar { width: 4px; }
        .em-body::-webkit-scrollbar-track { background: transparent; }
        .em-body::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconWrap}>💸</div>
              <div>
                <div style={styles.title}>
                  {editData ? t("edit") : t("addNew")} {t("expenses")}
                </div>
                <div style={styles.subtitle}>
                  {editData ? "Update your record" : "Track your spending"}
                </div>
              </div>
            </div>
            <button
              className="em-close-btn"
              style={styles.closeBtn}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="em-body" style={styles.body}>
            {/* Date + Item Name */}
            <div style={styles.row}>
              <div>
                <div style={styles.label}>
                  {t("date")} <span style={styles.req}>*</span>
                </div>
                <KhmerDateInput
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{ ...styles.input }}
                  className="em-input"
                />
              </div>
              <div>
                <div style={styles.label}>
                  {t("itemName")} <span style={styles.req}>*</span>
                </div>
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  className="em-input"
                  style={styles.input}
                  placeholder={
                    language === "kh" ? "ឈ្មោះទំនិញ..." : "What did you buy?"
                  }
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div style={styles.label}>
                {t("category")} <span style={styles.req}>*</span>
              </div>
              <div style={styles.catGrid}>
                {CATEGORIES.map((cat) => {
                  const active = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      className="em-cat-btn"
                      onClick={() =>
                        setForm((p) => ({ ...p, category: cat.value }))
                      }
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        padding: "10px 6px 8px",
                        borderRadius: "12px",
                        border: active
                          ? "1px solid #6366f1"
                          : "1px solid rgba(255,255,255,0.06)",
                        background: active
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        position: "relative",
                        boxShadow: active
                          ? "0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                          : "none",
                      }}
                    >
                      {active && (
                        <span
                          style={{
                            position: "absolute",
                            top: 3,
                            right: 5,
                            fontSize: "8px",
                            color: "#818cf8",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                      <span style={{ fontSize: "18px", lineHeight: 1 }}>
                        {cat.emoji}
                      </span>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: 600,
                          color: active ? "#818cf8" : "#666",
                          textTransform: "capitalize",
                        }}
                      >
                        {t(cat.value)}
                      </span>
                    </button>
                  );
                })}
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
                      color: "#6366f1",
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
                    className="em-input"
                    style={{ ...styles.input, paddingLeft: "28px" }}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["USD", "KHR"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, currency: c }))}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border:
                          form.currency === c
                            ? "1px solid #6366f1"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          form.currency === c
                            ? "rgba(99,102,241,0.14)"
                            : "rgba(255,255,255,0.03)",
                        color: form.currency === c ? "#818cf8" : "#666",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
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
              <div style={styles.amountPreview}>
                <span
                  style={{ fontSize: "11px", color: "#666", fontWeight: 500 }}
                >
                  Total Preview
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#818cf8",
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
                  className="em-input"
                  style={styles.input}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <div style={styles.label}>
                {t("quantity")} <span style={styles.req}>*</span>
              </div>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="em-input"
                style={styles.input}
              />
            </div>

            {/* Payment Method */}
            <div>
              <div style={styles.label}>
                {t("paymentMethod")} <span style={styles.req}>*</span>
              </div>
              <div style={styles.payGrid}>
                {PAYMENT_METHODS.map((m) => {
                  const active = form.paymentMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      className="em-pay-btn"
                      onClick={() =>
                        setForm((p) => ({ ...p, paymentMethod: m.value }))
                      }
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5px",
                        padding: "10px 4px 8px",
                        borderRadius: "10px",
                        border: active
                          ? "1px solid #6366f1"
                          : "1px solid rgba(255,255,255,0.06)",
                        background: active
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(255,255,255,0.03)",
                        color: active ? "#818cf8" : "#555",
                        fontSize: "10px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                        textTransform: "capitalize",
                        boxShadow: active
                          ? "0 0 0 1px rgba(99,102,241,0.25)"
                          : "none",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{m.icon}</span>
                      {t(m.value)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QR Upload */}
            {form.paymentMethod === "qr" && (
              <div>
                <div style={styles.label}>
                  {t("qrImage")} <span style={styles.req}>*</span>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="em-input"
                    style={{
                      ...styles.input,
                      padding: "8px 14px",
                      fontSize: "12px",
                      flex: 1,
                    }}
                  />
                  {qrPreview && (
                    <img
                      src={qrPreview}
                      alt="QR"
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "10px",
                        objectFit: "cover",
                        border: "1px solid rgba(99,102,241,0.3)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div style={styles.label}>{t("notes")}</div>
              <textarea
                name="noted"
                value={form.noted}
                onChange={handleChange}
                className="em-input"
                style={{ ...styles.input, resize: "none", minHeight: "70px" }}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              className="em-cancel-btn"
              style={styles.cancelBtn}
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="em-submit-btn"
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
