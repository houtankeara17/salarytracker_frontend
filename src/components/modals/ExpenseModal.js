// src/components/modals/ExpenseModal.js
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { expenseAPI } from "../../utils/api";
import toast from "react-hot-toast";
import KhmerDateInput from "../KhmerDateInput";

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

const PAYMENT_METHODS = ["cash", "qr", "card", "transfer"];

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

export default function ExpenseModal({ isOpen, onClose, editData, onSuccess }) {
  const { t, language } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);

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

  // ✅ VALIDATION FUNCTION
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

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      if (editData) {
        await expenseAPI.update(editData._id, form);
        toast.success(t("updatedSuccess"));
      } else {
        await expenseAPI.create(form);
        toast.success(t("addedSuccess"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="font-display font-bold text-lg">
            {editData ? t("edit") : t("addNew")} {t("expenses")}
          </h3>
          <button className="btn btn-ghost p-2" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Date */}
          <div>
            <label className="form-label">{t("date")} *</label>
            <KhmerDateInput
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="form-label">{t("itemName")} *</label>
            <input
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              className="form-input"
              placeholder={
                language === "kh" ? "ឈ្មោះទំនិញ..." : "What did you buy?"
              }
            />
          </div>

          {/* Category */}
          <div>
            <label className="form-label">{t("category")} *</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, category: cat.value }))
                  }
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-xs font-semibold ${
                    form.category === cat.value
                      ? "ring-2 ring-primary-500"
                      : "btn-secondary"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span style={{ fontSize: "10px" }}>{t(cat.value)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t("amount")} *</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">{t("currency")} *</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="form-input"
              >
                <option value="USD">$ USD</option>
                <option value="KHR">៛ KHR</option>
              </select>
            </div>
          </div>

          {/* Exchange Rate */}
          {form.currency === "KHR" && (
            <div>
              <label className="form-label">{t("exchangeRate")} *</label>
              <input
                type="number"
                name="exchangeRate"
                value={form.exchangeRate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          )}

          {/* Quantity & Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t("quantity")} *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">{t("paymentMethod")} *</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="form-input"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {t(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QR Upload */}
          {form.paymentMethod === "qr" && (
            <div>
              <label className="form-label">{t("qrImage")} *</label>
              <div className="flex gap-3 items-start">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="form-input py-2 text-xs"
                />
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="QR"
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="form-label">{t("notes")}</label>
            <textarea
              name="noted"
              value={form.noted}
              onChange={handleChange}
              className="form-input resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            {t("cancel")}
          </button>

          <button
            className="btn btn-primary flex-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t("loading") : editData ? t("update") : t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}
