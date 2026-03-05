// src/components/modals/SalaryModal.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const defaultForm = { month: MONTHS_EN[new Date().getMonth()], year: new Date().getFullYear(), amount: '', currency: 'USD', exchangeRate: 4100, noted: '' };

export default function SalaryModal({ isOpen, onClose, editData, onSuccess, type = 'salary', apiCall }) {
  const { t } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({ month: editData.month, year: editData.year, amount: editData.amount, currency: editData.currency || 'USD', exchangeRate: editData.exchangeRate || 4100, noted: editData.noted || '' });
    } else {
      setForm(defaultForm);
    }
  }, [editData, isOpen]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.amount) { toast.error('Amount is required'); return; }
    setLoading(true);
    try {
      if (editData) {
        await apiCall.update(editData._id, form);
        toast.success(t('updatedSuccess'));
      } else {
        await apiCall.create(form);
        toast.success(t('addedSuccess'));
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
  const icon = type === 'salary' ? '💰' : '🏦';
  const label = type === 'salary' ? t('salary') : t('savings');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {editData ? t('edit') : t('add')} {label}
            </h3>
          </div>
          <button className="btn btn-ghost p-2" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t('month')}</label>
              <select name="month" value={form.month} onChange={handleChange} className="form-input">
                {MONTHS_EN.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">{t('year')}</label>
              <select name="year" value={form.year} onChange={handleChange} className="form-input">
                {[2024,2025,2026,2027,2028,2029,2030,2031].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t('amount')} *</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange}
                min="0" step="0.01" className="form-input" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">{t('currency')}</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="form-input">
                <option value="USD">$ USD</option>
                <option value="KHR">៛ KHR</option>
              </select>
            </div>
          </div>

          {form.currency === 'KHR' && (
            <div>
              <label className="form-label">{t('exchangeRate')}</label>
              <input type="number" name="exchangeRate" value={form.exchangeRate} onChange={handleChange} className="form-input" />
            </div>
          )}

          <div>
            <label className="form-label">{t('notes')}</label>
            <textarea name="noted" value={form.noted} onChange={handleChange} className="form-input resize-none" rows={2} />
          </div>
        </div>

        <div className="flex gap-3 p-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary flex-1" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? t('loading') : (editData ? t('update') : t('add'))}
          </button>
        </div>
      </div>
    </div>
  );
}
