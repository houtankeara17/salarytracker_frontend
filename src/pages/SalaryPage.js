// src/pages/SalaryPage.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { salaryAPI } from '../utils/api';
import SalaryModal from '../components/modals/SalaryModal';
import DeleteModal from '../components/modals/DeleteModal';
import toast from 'react-hot-toast';

export default function SalaryPage() {
  const { t, formatAmount } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(0); // For prev/next

  const load = async () => {
    setLoading(true);
    try {
      const res = await salaryAPI.getAll(filterYear ? { year: filterYear } : {});
      setItems(res.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterYear]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await salaryAPI.delete(deleteId);
      toast.success(t('deletedSuccess'));
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const totalUSD = items.reduce((s, i) => s + (i.amountUSD || 0), 0);
  const avgUSD = items.length ? totalUSD / items.length : 0;

  // paginate 12 items per "page" (1 year)
  const YEARS = [2024,2025,2026,2027,2028,2029,2030,2031];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>💰 {t('salary')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('total')}: {formatAmount(totalUSD)} | Avg: {formatAmount(avgUSD)}/mo
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModal(true); }}>+ {t('addSalary')}</button>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex gap-3 items-center flex-wrap">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="form-input w-36">
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-secondary py-2 px-3 text-xs" onClick={() => setFilterYear('')}>Clear</button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-4xl mb-3">💰</div>
            <div className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No salary records yet</div>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold badge badge-completed">{item.month} {item.year}</div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost p-1.5 text-sm" onClick={() => { setEditData(item); setModal(true); }}>✏️</button>
                  <button className="btn btn-ghost p-1.5 text-sm" onClick={() => setDeleteId(item._id)}>🗑️</button>
                </div>
              </div>
              <div className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                {formatAmount(item.amountUSD, item.amountKHR)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {item.currency === 'USD' ? `$${item.amount}` : `${item.amount?.toLocaleString()} ៛`}
              </div>
              {item.noted && <div className="text-xs mt-2 p-2 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{item.noted}</div>}
            </div>
          ))
        )}
      </div>

      <SalaryModal isOpen={modal} onClose={() => { setModal(false); setEditData(null); }} editData={editData} onSuccess={load} type="salary" apiCall={salaryAPI} />
      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
