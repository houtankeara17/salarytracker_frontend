// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../locales/translations';
import { toKhmerNum } from '../utils/khmerUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('mt_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('mt_theme') || 'system');
  const [currency, setCurrency] = useState(() => localStorage.getItem('mt_currency') || 'USD');
  const [exchangeRate] = useState(4100);

  const t = (key) => {
    const lang = translations[language] || translations.en;
    return lang[key] || translations.en[key] || key;
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); }
    else if (theme === 'light') { root.classList.remove('dark'); }
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
    localStorage.setItem('mt_theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('mt_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('mt_currency', currency); }, [currency]);

  /**
   * Format amount with correct currency + Khmer digits if language is KH
   */
  const formatAmount = (usd, khr, rate = exchangeRate) => {
    const isKH = language === 'kh';
    if (currency === 'KHR') {
      const val = khr || (usd * rate);
      const rounded = Math.round(val || 0);
      const formatted = rounded.toLocaleString();
      return (isKH ? toKhmerNum(formatted) : formatted) + ' ៛';
    }
    const val = Number(usd || 0).toFixed(2);
    const [int, dec] = val.split('.');
    const formattedInt = Number(int).toLocaleString();
    return '$' + (isKH ? toKhmerNum(formattedInt) + '.' + toKhmerNum(dec) : formattedInt + '.' + dec);
  };

  /**
   * Format plain number (Khmer digits if language is KH)
   */
  const formatNum = (n) => {
    const str = Number(n || 0).toLocaleString();
    return language === 'kh' ? toKhmerNum(str) : str;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, currency, setCurrency, exchangeRate, t, formatAmount, formatNum, toKhmerNum }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
