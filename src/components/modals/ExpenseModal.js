// src/components/modals/ExpenseModal.js
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { expenseAPI } from "../../utils/api";
import KhmerDateInput from "../KhmerDateInput";
import StatusBanner from "../StatusBanner";

const CATEGORIES = [
  { value: "food", emoji: "🍚" },
  { value: "drink", emoji: "🥤" },
  { value: "fruit", emoji: "🍓" },
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

/* ─────────────────────────────────────────────
   SPENDING LIMIT CONSTANTS
───────────────────────────────────────────── */
const LIMIT_USD = 5;
const LIMIT_KHR = 20000;

const LIMIT_MESSAGES = [
  {
    icon: "⚠️",
    en: "Cannot spend more than $5 or 20,000 ៛",
    kh: "មិនអាចចំណាយលើស $5 ឬ 20,000 រៀលបានទេ",
  },
  {
    icon: "💰",
    en: "Please save your money instead of spending.",
    kh: "សូមរក្សាទុកប្រាក់ជំនួសការចំណាយ",
  },
  {
    icon: "🚫",
    en: "Payment above the limit is blocked.",
    kh: "ការបង់ប្រាក់លើសកំណត់ត្រូវបានបិទ",
  },
  {
    icon: "🌱",
    en: "Spend less to save more.",
    kh: "ចំណាយតិចៗ ដើម្បីរក្សាទុកច្រើនៗ",
  },
  {
    icon: "🔒",
    en: "Overspending is not allowed. Secure your money by saving.",
    kh: "ការចំណាយលើសកំណត់ មិនអនុញ្ញាត។ សូមរក្សាទុកប្រាក់ ដើម្បីមានសុវត្ថិភាព",
  },
  {
    icon: "👉",
    en: "Stop paying too much, start saving today.",
    kh: "បញ្ឈប់ការចំណាយច្រើន ហើយចាប់ផ្តើមរក្សាទុកថ្ងៃនេះ",
  },
  {
    icon: "💡",
    en: "Saving now builds comfort later.",
    kh: "ការរក្សាទុកថ្ងៃនេះ បង្កើតភាពសុខស្រួលនៅពេលក្រោយ",
  },
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
  imageUrl: "",
};

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,10,16,0.88)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  },
  modal: {
    background: "#13131a",
    border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: "22px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "92vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
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
  uploadZone: {
    border: "1.5px dashed rgba(99,102,241,0.3)",
    borderRadius: "12px",
    padding: "16px",
    background: "rgba(99,102,241,0.03)",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    textAlign: "center",
    position: "relative",
  },
  uploadZoneHover: {
    borderColor: "rgba(99,102,241,0.6)",
    background: "rgba(99,102,241,0.07)",
  },
  imagePreviewWrap: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(99,102,241,0.2)",
    background: "#0d0d14",
  },
  imagePreview: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "contain",
    display: "block",
    borderRadius: "11px",
  },
  removeImgBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "26px",
    height: "26px",
    borderRadius: "6px",
    background: "rgba(239,68,68,0.85)",
    border: "none",
    color: "#fff",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    backdropFilter: "blur(4px)",
    transition: "all 0.15s",
  },
};

const extractItem = (res) => {
  if (!res) return null;
  const d = res?.data;
  if (d && typeof d === "object" && d._id) return d;
  if (d?.data?._id) return d.data;
  if (d?.expense?._id) return d.expense;
  if (res?._id) return res;
  return null;
};

/* ── Image Upload Zone Component ── */
function ImageUploadZone({
  label,
  value,
  preview,
  onUpload,
  onRemove,
  accept = "image/*",
  hint = "",
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={S.label}>{label}</div>
      {preview ? (
        <div style={S.imagePreviewWrap}>
          <img src={preview} alt="preview" style={S.imagePreview} />
          <button
            type="button"
            style={S.removeImgBtn}
            onClick={onRemove}
            title="Remove image"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              background: "rgba(99,102,241,0.85)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <div
          style={{ ...S.uploadZone, ...(dragOver ? S.uploadZoneHover : {}) }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span style={{ fontSize: "28px", lineHeight: 1 }}>🖼️</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8" }}>
            Click or drag & drop
          </span>
          {hint && (
            <span style={{ fontSize: "11px", color: "#555" }}>{hint}</span>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPENDING LIMIT MODAL
   - "Cancel / Edit"   → onClose() only  → user goes back to fix the form
   - "I Understand"    → onClose() + onConfirm() → expense saves anyway
───────────────────────────────────────────── */
function SpendingLimitModal({
  isOpen,
  onClose,
  onConfirm,
  amountUSD,
  amountKHR,
}) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setMsgIdx(0);
    setVisible(true);
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % LIMIT_MESSAGES.length);
        setVisible(true);
      }, 220);
    }, 2800);
    return () => clearInterval(iv);
  }, [isOpen]);

  if (!isOpen) return null;
  const msg = LIMIT_MESSAGES[msgIdx];

  const handleCancelEdit = () => {
    // Just close the warning → user is back on the expense form to fix the amount
    onClose();
  };

  const handleUnderstand = () => {
    // Close the warning AND trigger the actual save
    onClose();
    if (onConfirm) onConfirm();
  };

  return (
    <>
      <style>{`
        @keyframes slmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slmScaleIn { from { opacity:0; transform:scale(0.88) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes slmPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes slmShimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 3000,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          animation: "slmFadeIn 0.2s ease",
        }}
        onClick={handleCancelEdit}
      >
        <div
          style={{
            background: "#13131a",
            border: "1px solid rgba(225,29,72,0.25)",
            borderRadius: "22px",
            width: "100%",
            maxWidth: "400px",
            overflow: "hidden",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
            animation: "slmScaleIn 0.28s cubic-bezier(.16,1,.3,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Red header ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #be123c, #e11d48)",
              padding: "22px 22px 18px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                marginBottom: "12px",
                animation: "slmPulse 2s ease-in-out infinite",
              }}
            >
              🚫
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.2px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Spending Limit Exceeded
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.72)",
                marginTop: "3px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ការចំណាយលើសកំណត់
            </div>
            {/* X closes → back to form */}
            <button
              onClick={handleCancelEdit}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                transition: "all 0.15s",
              }}
              onMouseEnter={(ev) =>
                (ev.currentTarget.style.background = "rgba(255,255,255,0.25)")
              }
              onMouseLeave={(ev) =>
                (ev.currentTarget.style.background = "rgba(255,255,255,0.15)")
              }
            >
              ✕
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px 20px" }}>
            {/* Amount entered chip */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "99px",
                background: "rgba(225,29,72,0.1)",
                border: "1px solid rgba(225,29,72,0.25)",
                marginBottom: "12px",
              }}
            >
              <span
                style={{ fontSize: "11px", color: "#f43f5e", fontWeight: 700 }}
              >
                Amount entered:
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#f43f5e",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                ${typeof amountUSD === "number" ? amountUSD.toFixed(2) : "0.00"}
              </span>
              {amountKHR > 0 && (
                <span
                  style={{ fontSize: "11px", color: "#f43f5e", opacity: 0.7 }}
                >
                  / {Math.round(amountKHR).toLocaleString()} ៛
                </span>
              )}
            </div>

            {/* Limit info box */}
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "7px",
                }}
              >
                Daily limit per transaction
              </div>
              <div
                style={{ display: "flex", gap: "18px", alignItems: "center" }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#e8e8f0",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    $5.00
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#555",
                      marginLeft: "4px",
                    }}
                  >
                    USD
                  </span>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#e8e8f0",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    20,000 ៛
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#555",
                      marginLeft: "4px",
                    }}
                  >
                    KHR
                  </span>
                </div>
              </div>
            </div>

            {/* Cycling message card */}
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                minHeight: "80px",
                marginBottom: "14px",
                transition: "opacity 0.2s ease",
                opacity: visible ? 1 : 0,
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "7px",
                  animation: "slmShimmer 5.5s ease-in-out infinite",
                  display: "inline-block",
                }}
              >
                {msg.icon}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fbbf24",
                  lineHeight: 1.5,
                  marginBottom: "5px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {msg.en}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#d97706",
                  lineHeight: 1.5,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {msg.kh}
              </div>
            </div>

            {/* Dot indicators */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                marginBottom: "16px",
              }}
            >
              {LIMIT_MESSAGES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === msgIdx ? "18px" : "6px",
                    height: "6px",
                    borderRadius: "99px",
                    background:
                      i === msgIdx ? "#e11d48" : "rgba(255,255,255,0.12)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* ── Action buttons ── */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              {/* Cancel / Edit → back to form, no save */}
              <button
                onClick={handleCancelEdit}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#aaa",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(ev) =>
                  (ev.currentTarget.style.background = "rgba(255,255,255,0.09)")
                }
                onMouseLeave={(ev) =>
                  (ev.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
              >
                ✏️ Cancel / Edit
              </button>

              {/* I Understand → close warning + save the expense */}
              <button
                onClick={handleUnderstand}
                style={{
                  flex: 2,
                  padding: "11px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #be123c, #e11d48)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 16px rgba(225,29,72,0.35)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.filter = "brightness(1.1)";
                  ev.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.filter = "none";
                  ev.currentTarget.style.transform = "none";
                }}
              >
                I Understand — Save ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────── */
export default function ExpenseModal({ isOpen, onClose, editData, onSuccess }) {
  const { t, language } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [banner, setBanner] = useState(null);

  // Spending limit modal state
  const [limitModal, setLimitModal] = useState(false);
  const [limitAmounts, setLimitAmounts] = useState({ usd: 0, khr: 0 });

  // Keep editData in a ref so executeSave always sees the latest value
  const editDataRef = useRef(editData);
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

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
        imageUrl: editData.imageUrl || "",
      });
      setQrPreview(editData.imageQr || null);
      setImgPreview(editData.imageUrl || null);
    } else {
      setForm(defaultForm);
      setQrPreview(null);
      setImgPreview(null);
    }
  }, [editData, isOpen]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

  /* ── Spending limit check — returns true if limit exceeded ── */
  const checkSpendingLimit = (currentForm) => {
    const f = currentForm || form;
    const amt = Number(f.amount) || 0;
    const qty = Number(f.quantity) || 1;
    const total = amt * qty;
    const rate = Number(f.exchangeRate) || 4100;

    let amountUSD = 0;
    let amountKHR = 0;

    if (f.currency === "USD") {
      amountUSD = total;
      amountKHR = total * rate;
    } else {
      amountKHR = total;
      amountUSD = total / rate;
    }

    if (amountUSD > LIMIT_USD || amountKHR > LIMIT_KHR) {
      setLimitAmounts({ usd: amountUSD, khr: amountKHR });
      setLimitModal(true);
      return true; // blocked — show warning
    }
    return false; // within limit — proceed
  };

  /* ── Core API save logic — called either directly or after "I Understand" ── */
  const executeSave = async () => {
    setLoading(true);
    try {
      const currentEditData = editDataRef.current;
      if (currentEditData) {
        const res = await expenseAPI.update(currentEditData._id, form);
        const saved = extractItem(res) || { ...currentEditData, ...form };
        onSuccess(saved);
      } else {
        const res = await expenseAPI.create(form);
        onSuccess(extractItem(res));
      }
      onClose();
    } catch (err) {
      setBanner({ type: "error", title: "Failed", sub: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit handler ── */
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setBanner({ type: "error", title: error });
      return;
    }

    // If over limit → show warning; executeSave is passed as onConfirm
    // so clicking "I Understand" will complete the save.
    if (checkSpendingLimit()) return;

    // Within limit → save immediately
    await executeSave();
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
        .em-upload-zone:hover { border-color: rgba(99,102,241,0.55) !important; background: rgba(99,102,241,0.07) !important; }
      `}</style>

      <div style={S.overlay} onClick={onClose}>
        <div style={S.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={S.header}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={S.iconWrap}>💸</div>
              <div>
                <div style={S.title}>
                  {editData ? t("edit") : t("addNew")} {t("expenses")}
                </div>
                <div style={S.subtitle}>
                  {editData ? "Update your record" : "Track your spending"}
                </div>
              </div>
            </div>
            <button
              className="em-close-btn"
              style={S.closeBtn}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="em-body" style={S.body}>
            {/* Date + Item Name */}
            <div style={S.row}>
              <div>
                <div style={S.label}>
                  {t("date")} <span style={S.req}>*</span>
                </div>
                <KhmerDateInput
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{ ...S.input }}
                  className="em-input"
                />
              </div>
              <div>
                <div style={S.label}>
                  {t("itemName")} <span style={S.req}>*</span>
                </div>
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  className="em-input"
                  style={S.input}
                  placeholder={
                    language === "kh" ? "ឈ្មោះទំនិញ..." : "What did you buy?"
                  }
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div style={S.label}>
                {t("category")} <span style={S.req}>*</span>
              </div>
              <div style={S.catGrid}>
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
              <div style={S.label}>
                {t("amount")} <span style={S.req}>*</span>
              </div>
              <div style={S.row}>
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
                    style={{ ...S.input, paddingLeft: "28px" }}
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

              {/* Amount preview */}
              <div style={S.amountPreview}>
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

              {/* Spending limit hint */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "6px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <span style={{ fontSize: "12px" }}>⚠️</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#d97706",
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Limit: $5.00 / 20,000 ៛ per transaction
                </span>
              </div>
            </div>

            {/* Exchange Rate — KHR only */}
            {form.currency === "KHR" && (
              <div>
                <div style={S.label}>
                  {t("exchangeRate")} <span style={S.req}>*</span>
                </div>
                <input
                  type="number"
                  name="exchangeRate"
                  value={form.exchangeRate}
                  onChange={handleChange}
                  className="em-input"
                  style={S.input}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <div style={S.label}>
                {t("quantity")} <span style={S.req}>*</span>
              </div>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="em-input"
                style={S.input}
              />
            </div>

            {/* Payment Method */}
            <div>
              <div style={S.label}>
                {t("paymentMethod")} <span style={S.req}>*</span>
              </div>
              <div style={S.payGrid}>
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

            {/* Item Photo */}
            <ImageUploadZone
              label="📷 Item Photo / Receipt (optional)"
              value={form.imageUrl}
              preview={imgPreview}
              hint="Upload a receipt or product photo"
              onUpload={(dataUri) => {
                setForm((p) => ({ ...p, imageUrl: dataUri }));
                setImgPreview(dataUri);
              }}
              onRemove={() => {
                setForm((p) => ({ ...p, imageUrl: "" }));
                setImgPreview(null);
              }}
            />

            {/* QR Upload — only when payment = qr */}
            {form.paymentMethod === "qr" && (
              <ImageUploadZone
                label={
                  <>
                    {t("qrImage")} <span style={S.req}>*</span>
                  </>
                }
                value={form.imageQr}
                preview={qrPreview}
                hint="Upload your QR payment screenshot"
                onUpload={(dataUri) => {
                  setForm((p) => ({ ...p, imageQr: dataUri }));
                  setQrPreview(dataUri);
                }}
                onRemove={() => {
                  setForm((p) => ({ ...p, imageQr: "" }));
                  setQrPreview(null);
                }}
              />
            )}

            {/* Notes */}
            <div>
              <div style={S.label}>{t("notes")}</div>
              <textarea
                name="noted"
                value={form.noted}
                onChange={handleChange}
                className="em-input"
                style={{ ...S.input, resize: "none", minHeight: "70px" }}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <button
              className="em-cancel-btn"
              style={S.cancelBtn}
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="em-submit-btn"
              style={S.submitBtn}
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

      {banner && (
        <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
      )}

      {/* Spending Limit Modal
          onClose     → user clicked "Cancel / Edit" → back to form, no save
          onConfirm   → user clicked "I Understand"  → save the expense anyway */}
      <SpendingLimitModal
        isOpen={limitModal}
        onClose={() => setLimitModal(false)}
        onConfirm={executeSave}
        amountUSD={limitAmounts.usd}
        amountKHR={limitAmounts.khr}
      />
    </>
  );
}
