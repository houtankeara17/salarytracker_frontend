// src/components/modals/DeleteModal.js
import React from 'react';
import { useApp } from '../../context/AppContext';

export default function DeleteModal({ isOpen, onClose, onConfirm, loading }) {
  const { t } = useApp();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
            🗑️
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('deleteConfirm')}</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('deleteMessage')}</p>
          <div className="flex gap-3 justify-center">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? '...' : t('deleteBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
