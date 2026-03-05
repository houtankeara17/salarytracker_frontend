// src/utils/khmerUtils.js

// Khmer digit map
const KH_DIGITS = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];

/**
 * Convert ASCII digits to Khmer digits
 * @param {number|string} num
 * @returns {string}
 */
export const toKhmerNum = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, d => KH_DIGITS[parseInt(d)]);
};

/**
 * Convert Khmer digits back to ASCII digits
 * @param {string} str
 * @returns {string}
 */
export const fromKhmerNum = (str) => {
  if (!str) return str;
  return String(str).replace(/[០-៩]/g, d => KH_DIGITS.indexOf(d).toString());
};

/**
 * Format a number (USD amount) in Khmer style
 */
export const formatKhmerAmount = (amount, currency = 'USD', rate = 4100) => {
  if (currency === 'KHR') {
    const val = Math.round(amount);
    return toKhmerNum(val.toLocaleString()) + ' ៛';
  }
  const parts = Number(amount || 0).toFixed(2).split('.');
  return '$' + toKhmerNum(parts[0]) + '.' + toKhmerNum(parts[1]);
};

/**
 * Khmer month names
 */
export const KH_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

export const KH_MONTHS_SHORT = [
  'មករា','កុម្ភ','មីនា','មេសា','ឧសភ','មិថ','កក្ក','សីហ','កញ្ញ','តុលា','វិច្ឆ','ធ្នូ'
];

export const KH_WEEKDAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
export const KH_WEEKDAYS_SHORT = ['អា', 'ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'ស'];

/**
 * Format a Date in Khmer locale
 * @param {Date|string} date
 * @param {'full'|'long'|'medium'|'short'} format
 */
export const formatKhmerDate = (date, format = 'medium') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';

  const day   = toKhmerNum(d.getDate());
  const month = KH_MONTHS[d.getMonth()];
  const year  = toKhmerNum(d.getFullYear());
  const weekday = KH_WEEKDAYS[d.getDay()];

  switch (format) {
    case 'full':   return `ថ្ងៃ${weekday} ទី${day} ${month} ឆ្នាំ${year}`;
    case 'long':   return `ទី${day} ${month} ឆ្នាំ${year}`;
    case 'medium': return `${day} ${month} ${year}`;
    case 'short':  return `${day}/${toKhmerNum(d.getMonth()+1)}/${year}`;
    default:       return `${day} ${month} ${year}`;
  }
};

/**
 * Format date for display based on language
 */
export const formatDate = (date, language = 'en', format = 'medium') => {
  if (!date) return '';
  if (language === 'kh') return formatKhmerDate(date, format);
  const d = new Date(date);
  if (isNaN(d)) return '';
  const opts = {
    full:   { weekday:'long', year:'numeric', month:'long', day:'numeric' },
    long:   { year:'numeric', month:'long', day:'numeric' },
    medium: { year:'numeric', month:'short', day:'2-digit' },
    short:  { year:'numeric', month:'2-digit', day:'2-digit' },
  };
  return d.toLocaleDateString('en-US', opts[format] || opts.medium);
};

/**
 * KhmerDatePicker input — converts HTML date value display
 * The <input type="date"> always stores YYYY-MM-DD internally
 * but we can show a custom Khmer label next to it.
 */
export const parseInputDate = (value) => {
  // value is "YYYY-MM-DD" from <input type="date">
  if (!value) return null;
  return new Date(value + 'T00:00:00');
};

export default { toKhmerNum, fromKhmerNum, formatKhmerAmount, formatKhmerDate, formatDate, KH_MONTHS, KH_MONTHS_SHORT, KH_WEEKDAYS, KH_WEEKDAYS_SHORT };
