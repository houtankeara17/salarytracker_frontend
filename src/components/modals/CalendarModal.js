// src/components/modals/CalendarModal.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { expenseAPI } from '../../utils/api';
import { formatKhmerDate, toKhmerNum } from '../../utils/khmerUtils';

const VIEWS = ['daily', 'weekly', 'monthly', 'yearly'];

export default function CalendarModal({ isOpen, onClose, initialView = 'monthly' }) {
  const { t, formatAmount, formatNum, language } = useApp();
  const [view, setView] = useState(initialView);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [drillItems, setDrillItems] = useState(null); // items to show in drill-down
  const [drillTitle, setDrillTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDay(null);
      setDrillItems(null);
      loadExpenses();
    }
  }, [isOpen, view, selectedYear, selectedMonth]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      let params = {};
      if (view === 'daily') {
        const d = new Date(selectedYear, selectedMonth, new Date().getDate());
        params = { date: d.toISOString().split('T')[0] };
      } else if (view === 'weekly') {
        const now = new Date();
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6);
        params = { startDate: weekStart.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
      } else if (view === 'monthly') {
        params = { month: selectedMonth + 1, year: selectedYear };
      } else if (view === 'yearly') {
        params = { year: selectedYear };
      }
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getYears = () => {
    const y = [];
    for (let i = 2024; i <= 2031; i++) y.push(i);
    return y;
  };

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  const getExpensesForDay = (day) => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === day;
    });
  };

  const getExpensesForMonth = (month) => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === selectedYear && d.getMonth() === month;
    });
  };

  const getDayTotal = (day) => {
    return getExpensesForDay(day).reduce((s, e) => s + (e.amountUSD || 0), 0);
  };

  const getMonthTotal = (month) => {
    return getExpensesForMonth(month).reduce((s, e) => s + (e.amountUSD || 0), 0);
  };

  const openDrill = (items, title) => {
    setDrillItems(items);
    setDrillTitle(title);
  };

  const closeDrill = () => {
    setDrillItems(null);
    setDrillTitle('');
  };

  const MONTHS_LABEL = language === 'kh'
    ? ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const totalAll = expenses.reduce((s, e) => s + (e.amountUSD || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-2xl" style={{ minHeight: '520px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            📅 {t('expenses')} — {t(view)}
          </h3>
          <button className="btn btn-ghost p-2 text-sm" onClick={onClose}>✕</button>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => { setView(v); setDrillItems(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-primary-500 text-white' : 'btn-secondary'}`}>
              {t(v)}
            </button>
          ))}
        </div>

        {/* Year/Month nav */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-2 items-center">
            <button className="btn btn-secondary py-1.5 px-3 text-xs" onClick={() => setSelectedYear(y => y - 1)}>‹</button>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="form-input py-1.5 text-xs w-24">
              {getYears().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn btn-secondary py-1.5 px-3 text-xs" onClick={() => setSelectedYear(y => y + 1)}>›</button>
          </div>
          {(view === 'monthly' || view === 'daily') && (
            <div className="flex gap-2 items-center">
              <button className="btn btn-secondary py-1.5 px-3 text-xs" onClick={() => setSelectedMonth(m => Math.max(0, m - 1))}>‹</button>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{MONTHS_LABEL[selectedMonth]}</span>
              <button className="btn btn-secondary py-1.5 px-3 text-xs" onClick={() => setSelectedMonth(m => Math.min(11, m + 1))}>›</button>
            </div>
          )}
          <div className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
            {t('total')}: {formatAmount(totalAll)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('loading')}</div>
          ) : drillItems ? (
            // Drill-down view
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button className="btn btn-secondary py-1 px-3 text-xs" onClick={closeDrill}>← {t('back')}</button>
                <span className="font-semibold text-sm">{drillTitle}</span>
              </div>
              {drillItems.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('noExpenses')}</div>
              ) : (
                <div className="space-y-2">
                  {drillItems.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                      <span className="text-xl">{item.categoryEmoji || '💸'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.itemName}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t(item.category)} · {language==='kh' ? toKhmerNum(item.quantity) : item.quantity}x · {t(item.paymentMethod)}</div>
                        {item.noted && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{item.noted}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm" style={{ color: '#0ea5e9' }}>{formatAmount(item.amountUSD, item.amountKHR)}</div>
                        {item.imageQr && <span className="text-xs badge badge-planned">QR</span>}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 rounded-xl font-bold text-sm mt-2" style={{ background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)' }}>
                    <span style={{ color: '#0284c7' }}>{t('total')}</span>
                    <span style={{ color: '#0284c7' }}>{formatAmount(drillItems.reduce((s,i)=>s+(i.amountUSD||0),0))}</span>
                  </div>
                </div>
              )}
            </div>
          ) : view === 'monthly' ? (
            // Month calendar grid
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} className="text-center text-xs font-bold py-1" style={{ color: 'var(--text-secondary)' }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells */}
                {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth() }).map((_, i) => {
                  const day = i + 1;
                  const dayItems = getExpensesForDay(day);
                  const total = getDayTotal(day);
                  const isToday = new Date().getFullYear() === selectedYear && new Date().getMonth() === selectedMonth && new Date().getDate() === day;
                  return (
                    <button key={day} onClick={() => openDrill(dayItems, `${MONTHS_LABEL[selectedMonth]} ${day}`)}
                      className={`cal-day flex-col p-1 ${isToday ? 'today' : ''} ${dayItems.length > 0 ? 'has-data' : ''}`}
                      style={{ minHeight: '48px' }}>
                      <span className="text-xs font-bold">{language==='kh' ? toKhmerNum(day) : day}</span>
                      {total > 0 && <span style={{ fontSize: '9px', color: isToday ? 'rgba(255,255,255,0.8)' : '#0ea5e9' }}>${total.toFixed(0)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === 'yearly' ? (
            // Yearly: Jan–Dec grid
            <div className="grid grid-cols-3 gap-3">
              {MONTHS_LABEL.map((mLabel, mi) => {
                const mItems = getExpensesForMonth(mi);
                const mTotal = getMonthTotal(mi);
                const isCurrentMonth = new Date().getMonth() === mi && new Date().getFullYear() === selectedYear;
                return (
                  <button key={mi} onClick={() => openDrill(mItems, mLabel)}
                    className={`p-4 rounded-2xl text-left transition-all hover:shadow-lg ${isCurrentMonth ? 'ring-2 ring-primary-400' : ''}`}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{mLabel}</div>
                    <div className="font-bold text-base" style={{ color: '#0ea5e9' }}>${mTotal} </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{formatNum(mItems.length)} {t('items')}</div>
                  </button>
                );
              })}
            </div>
          ) : view === 'weekly' ? (
            // Weekly: last 7 days
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                const dayItems = expenses.filter(e => {
                  const ed = new Date(e.date);
                  return ed.toDateString() === d.toDateString();
                });
                const total = dayItems.reduce((s, e) => s + (e.amountUSD || 0), 0);
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <button key={i} onClick={() => openDrill(dayItems, d.toLocaleDateString(language === 'kh' ? 'km-KH' : 'en-US', { weekday:'long', month:'short', day:'numeric' }))}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-md ${isToday ? 'ring-2 ring-primary-400' : ''}`}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {d.toLocaleDateString(language === 'kh' ? 'km-KH' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {isToday && <span className="ml-2 badge badge-planned text-xs">{t('today')}</span>}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatNum(dayItems.length)} {t('items')}</div>
                    </div>
                    <div className="font-bold text-base" style={{ color: total > 0 ? '#0ea5e9' : 'var(--text-secondary)' }}>
                      {formatAmount(total)}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Daily: current day items
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('noExpenses')}</div>
              ) : (
                expenses.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                    <span className="text-xl">{item.categoryEmoji || '💸'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.itemName}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t(item.category)} · {language==='kh' ? toKhmerNum(item.quantity) : item.quantity}x</div>
                    </div>
                    <div className="font-bold text-sm" style={{ color: '#0ea5e9' }}>{formatAmount(item.amountUSD, item.amountKHR)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
