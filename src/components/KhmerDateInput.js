// src/components/KhmerDateInput.js
// A date input that shows Khmer date text when language is KH
import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatKhmerDate, parseInputDate } from '../utils/khmerUtils';

/**
 * Props:
 *  value       - "YYYY-MM-DD" string
 *  onChange    - (e) => void  (native change event, e.target.value = "YYYY-MM-DD")
 *  name        - input name
 *  className   - extra classes
 *  min/max     - optional date limits
 *  required    - bool
 */
export default function KhmerDateInput({ value, onChange, name, className = '', min, max, required }) {
  const { language } = useApp();
  const inputRef = useRef();

  const khLabel = value
    ? formatKhmerDate(parseInputDate(value), 'long')
    : 'ជ្រើសរើសកាលបរិច្ឆេទ';

  if (language !== 'kh') {
    return (
      <input
        type="date"
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`form-input ${className}`}
        min={min}
        max={max}
        required={required}
      />
    );
  }

  return (
    <div className="relative">
      {/* Invisible native date input for browser UI */}
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value || ''}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        style={{ fontSize: 0 }}
      />
      {/* Khmer display overlay */}
      <div
        className={`form-input flex items-center justify-between cursor-pointer ${className}`}
        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'Nunito, sans-serif' }}>
          {khLabel}
        </span>
        <span className="text-lg">📅</span>
      </div>
    </div>
  );
}
