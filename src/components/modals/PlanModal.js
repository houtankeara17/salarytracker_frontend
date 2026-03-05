// src/components/modals/PlanModal.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import KhmerDateInput from '../KhmerDateInput';

const defaultForm = { title: '', description: '', destination: '', targetAmount: '', savedAmount: 0, givenAmount: 0, paidAmount: 0, currency: 'USD', exchangeRate: 4100, status: 'planned', startDate: '', endDate: '', targetDate: '', date: new Date().toISOString().split('T')[0], recipient: '', noted: '' };

export default function PlanModal({ isOpen, onClose, editData, onSuccess, type, apiCall, config }) {
  const { t } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        ...defaultForm,
        ...editData,
        startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
        endDate: editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '',
        targetDate: editData.targetDate ? new Date(editData.targetDate).toISOString().split('T')[0] : '',
        date: editData.date ? new Date(editData.date).toISOString().split('T')[0] : defaultForm.date,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editData, isOpen]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.targetAmount) { toast.error('Title and target amount are required'); return; }
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

  const statuses = config?.statuses || ['planned', 'ongoing', 'completed', 'cancelled'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config?.icon || '📋'}</span>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {editData ? t('edit') : t('add')} {t(type)}
            </h3>
          </div>
          <button className="btn btn-ghost p-2" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="form-label">{t('title')} *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="form-input" />
          </div>

          {config?.hasDescription && (
            <div>
              <label className="form-label">{t('description')}</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} className="form-input" />
            </div>
          )}

          {config?.hasDestination && (
            <div>
              <label className="form-label">{t('destination')}</label>
              <input type="text" name="destination" value={form.destination} onChange={handleChange} className="form-input" />
            </div>
          )}

          {config?.hasRecipient && (
            <div>
              <label className="form-label">{t('recipient')}</label>
              <input type="text" name="recipient" value={form.recipient} onChange={handleChange} className="form-input" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t('targetAmount')} *</label>
              <input type="number" name="targetAmount" value={form.targetAmount} onChange={handleChange} min="0" step="0.01" className="form-input" />
            </div>
            <div>
              <label className="form-label">{config?.progressField ? t(config.progressField) : t('savedAmount')}</label>
              <input type="number" name={config?.progressFieldKey || 'savedAmount'} value={form[config?.progressFieldKey || 'savedAmount']} onChange={handleChange} min="0" step="0.01" className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">{t('currency')}</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="form-input">
                <option value="USD">$ USD</option>
                <option value="KHR">៛ KHR</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t('status')}</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-input">
                {statuses.map(s => <option key={s} value={s}>{t(s)}</option>)}
              </select>
            </div>
          </div>

          {config?.hasDateRange && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">{t('startDate')}</label>
                <KhmerDateInput name="startDate" value={form.startDate} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">{t('endDate')}</label>
                <KhmerDateInput name="endDate" value={form.endDate} onChange={handleChange} />
              </div>
            </div>
          )}

          {config?.hasTargetDate && (
            <div>
              <label className="form-label">{t('targetDate')}</label>
              <KhmerDateInput name="targetDate" value={form.targetDate} onChange={handleChange} />
            </div>
          )}

          {config?.hasDate && (
            <div>
              <label className="form-label">{t('date')}</label>
              <KhmerDateInput name="date" value={form.date} onChange={handleChange} />
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
