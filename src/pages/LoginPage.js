import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Shell ── */
  .lp {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Sora', sans-serif;
    background: #0b1120;
    color: #c8d8e8;
  }

  /* ── Left — Calm Visual ── */
  .lp-left {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 56px;
    overflow: hidden;
    background: #0d1425;
  }

  /* Soft watercolor-like background blobs */
  .lp-canvas {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .lp-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.18;
  }
  .lp-blob-1 {
    width: 420px; height: 420px;
    top: -80px; left: -80px;
    background: #0e7e72;
    animation: blobDrift 18s ease-in-out infinite;
  }
  .lp-blob-2 {
    width: 320px; height: 320px;
    bottom: 40px; right: -60px;
    background: #1a9c8e;
    opacity: 0.13;
    animation: blobDrift 22s ease-in-out infinite reverse;
  }
  .lp-blob-3 {
    width: 200px; height: 200px;
    top: 50%; left: 40%;
    background: #5dd4c8;
    opacity: 0.08;
    animation: blobDrift 15s ease-in-out infinite 3s;
  }
  @keyframes blobDrift {
    0%, 100% { transform: translate(0, 0); }
    33%       { transform: translate(20px, -30px); }
    66%       { transform: translate(-15px, 20px); }
  }

  /* Subtle dot grid */
  .lp-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(94,212,204,0.12) 1px, transparent 1px);
    background-size: 36px 36px;
    opacity: 0.6;
  }

  /* Horizontal scan line — barely visible */
  .lp-scan {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,212,204,0.15) 40%, rgba(94,212,204,0.15) 60%, transparent);
    top: 38%;
  }

  .lp-left-inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  /* Brand */
  .lp-brand { display: flex; align-items: center; gap: 13px; }
  .lp-brand-mark {
    width: 42px; height: 42px;
    background: #0b1a1a;
    border: 1px solid rgba(94,212,204,0.3);
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .lp-brand-name {
    font-size: 16px; font-weight: 600;
    color: #e8f4f3;
    letter-spacing: -0.02em;
    display: block;
  }
  .lp-brand-tag {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(94,212,204,0.5);
    display: block; margin-top: 2px;
  }

  /* Hero */
  .lp-hero { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: none; }
  }

  .lp-label {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(94,212,204,0.6);
    margin-bottom: 22px;
  }
  .lp-label-line {
    width: 24px; height: 1px;
    background: rgba(94,212,204,0.4);
  }

  .lp-headline {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 50px; font-weight: 400; font-style: italic;
    color: #ddeae9;
    line-height: 1.06;
    letter-spacing: -0.01em;
    margin-bottom: 22px;
  }
  .lp-headline em {
    font-style: normal;
    color: #5dd4c8;
  }

  .lp-desc {
    font-size: 13px; font-weight: 300;
    color: rgba(180,210,208,0.55);
    line-height: 1.8;
    max-width: 300px;
  }

  /* Feature list */
  .lp-features { display: flex; flex-direction: column; gap: 14px; }
  .lp-feature {
    display: flex; align-items: center; gap: 13px;
  }
  .lp-feature-icon {
    width: 34px; height: 34px; flex-shrink: 0;
    border-radius: 10px;
    background: rgba(94,212,204,0.07);
    border: 1px solid rgba(94,212,204,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }
  .lp-feature-text { font-size: 13px; font-weight: 400; color: rgba(180,210,208,0.55); }
  .lp-feature-title { font-size: 13px; font-weight: 500; color: #b8d8d6; display: block; }

  /* Stats */
  .lp-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both;
  }
  .lp-stat {
    background: rgba(94,212,204,0.04);
    border: 1px solid rgba(94,212,204,0.1);
    border-radius: 12px;
    padding: 14px 16px;
  }
  .lp-stat-num {
    font-family: 'DM Mono', monospace;
    font-size: 19px; font-weight: 500;
    color: #8ee8e0;
    line-height: 1; margin-bottom: 5px;
  }
  .lp-stat-lbl {
    font-size: 10px; font-weight: 300;
    color: rgba(140,190,188,0.45);
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── Right — Form ── */
  .lp-right {
    display: flex; align-items: center; justify-content: center;
    padding: 52px 56px;
    background: #0b1120;
    position: relative;
  }
  .lp-right::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent 8%, rgba(94,212,204,0.1) 35%, rgba(94,212,204,0.1) 65%, transparent 92%);
  }

  .lp-form-wrap {
    width: 100%; max-width: 360px;
    animation: slideIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: none; }
  }

  /* Controls */
  .lp-controls {
    position: absolute; top: 28px; right: 28px;
    display: flex; align-items: center; gap: 6px;
  }
  .lp-ctl-btn {
    padding: 5px 10px; border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    border: 1px solid rgba(94,212,204,0.15);
    background: rgba(94,212,204,0.04);
    color: rgba(140,190,188,0.55);
    cursor: pointer; transition: all 0.2s;
  }
  .lp-ctl-btn:hover, .lp-ctl-btn.on {
    border-color: rgba(94,212,204,0.35);
    color: #5dd4c8;
    background: rgba(94,212,204,0.08);
  }
  .lp-ctl-icon {
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid rgba(94,212,204,0.15);
    background: rgba(94,212,204,0.04);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; cursor: pointer; transition: all 0.2s;
  }
  .lp-ctl-icon:hover { border-color: rgba(94,212,204,0.35); background: rgba(94,212,204,0.08); }

  /* Form head */
  .lp-form-head { margin-bottom: 32px; }
  .lp-status-dot {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
    color: #3bb8ad;
    margin-bottom: 16px;
  }
  .lp-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #3bb8ad;
    box-shadow: 0 0 0 3px rgba(59,184,173,0.2);
    animation: dotPulse 2.4s ease-in-out infinite;
  }
  @keyframes dotPulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(59,184,173,0.2); }
    50%       { box-shadow: 0 0 0 6px rgba(59,184,173,0.06); }
  }

  .lp-form-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 34px; font-weight: 400;
    color: #d8ecea;
    letter-spacing: -0.02em; line-height: 1.1;
    margin-bottom: 8px;
  }
  .lp-form-title em {
    font-style: italic;
    color: #5dd4c8;
  }
  .lp-form-sub {
    font-size: 12px; font-weight: 300;
    color: rgba(140,185,183,0.5);
    line-height: 1.7;
  }

  .lp-hr {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,212,204,0.12) 30%, rgba(94,212,204,0.12) 70%, transparent);
    margin: 26px 0;
  }

  /* Fields */
  .lp-field { margin-bottom: 16px; }
  .lp-field-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 500;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(140,185,183,0.4);
    margin-bottom: 8px;
  }
  .lp-input-row { position: relative; }
  .lp-input-row input {
    width: 100%;
    padding: 12px 42px 12px 42px;
    border-radius: 10px;
    border: 1px solid rgba(94,212,204,0.1);
    background: rgba(94,212,204,0.03);
    color: #d8ecea;
    font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    caret-color: #5dd4c8;
  }
  .lp-input-row input::placeholder { color: rgba(140,185,183,0.28); font-weight: 300; }
  .lp-input-row input:focus {
    border-color: rgba(94,212,204,0.35);
    background: rgba(94,212,204,0.05);
    box-shadow: 0 0 0 3px rgba(94,212,204,0.07);
  }
  .lp-ico {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 13px; opacity: 0.28; pointer-events: none;
  }
  .lp-eye {
    position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 12px; opacity: 0.25; padding: 0; line-height: 1;
    transition: opacity 0.15s; color: #5dd4c8;
  }
  .lp-eye:hover { opacity: 0.65; }

  /* Meta row */
  .lp-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 22px;
  }
  .lp-check { display: flex; align-items: center; gap: 8px; }
  .lp-check input[type="checkbox"] {
    width: 13px; height: 13px;
    accent-color: #3bb8ad; cursor: pointer;
  }
  .lp-check label {
    font-size: 11px; font-weight: 300;
    color: rgba(140,185,183,0.45);
    cursor: pointer; user-select: none;
  }

  /* Submit */
  .lp-btn {
    width: 100%; padding: 13px;
    border: none; border-radius: 10px;
    background: #0c2e2b;
    border: 1px solid rgba(94,212,204,0.3);
    color: #6de8df;
    font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 0.22s, border-color 0.22s, transform 0.15s, box-shadow 0.22s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    position: relative; overflow: hidden;
  }
  .lp-btn:hover:not(:disabled) {
    background: #0e3834;
    border-color: rgba(94,212,204,0.5);
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(59,184,173,0.18);
  }
  .lp-btn:active:not(:disabled) { transform: none; }
  .lp-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .lp-spinner {
    width: 13px; height: 13px;
    border: 1.5px solid rgba(94,212,204,0.25);
    border-top-color: #5dd4c8;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Footer */
  .lp-form-footer {
    margin-top: 22px; text-align: center;
    font-size: 12px; font-weight: 300;
    color: rgba(140,185,183,0.38);
  }
  .lp-form-footer a {
    color: #5dd4c8; font-weight: 500;
    text-decoration: none; transition: color 0.15s;
  }
  .lp-form-footer a:hover { color: #8ee8e2; }

  .lp-strip {
    display: flex; align-items: center; justify-content: center;
    gap: 9px; margin-top: 28px; padding-top: 18px;
    border-top: 1px solid rgba(94,212,204,0.07);
  }
  .lp-strip-dash { width: 14px; height: 1px; background: rgba(94,212,204,0.15); }
  .lp-strip-txt {
    font-family: 'DM Mono', monospace;
    font-size: 8px; letter-spacing: 0.16em;
    color: rgba(140,185,183,0.22);
    text-transform: uppercase;
  }

  /* ── Light Mode ── */
  .lp.light {
    background: #f0fafa;
    color: #1a3535;
  }
  .lp.light .lp-left { background: #e6f7f5; }
  .lp.light .lp-blob-1 { opacity: 0.22; background: #2abfb3; }
  .lp.light .lp-blob-2 { opacity: 0.14; background: #0e9e92; }
  .lp.light .lp-blob-3 { opacity: 0.10; }
  .lp.light .lp-grid { opacity: 0.35; background-image: radial-gradient(circle, rgba(13,110,100,0.15) 1px, transparent 1px); }
  .lp.light .lp-scan { background: linear-gradient(90deg, transparent, rgba(13,110,100,0.08) 40%, rgba(13,110,100,0.08) 60%, transparent); }
  .lp.light .lp-brand-mark { background: #d0f0ed; border-color: rgba(13,110,100,0.25); }
  .lp.light .lp-brand-name { color: #0a2a28; }
  .lp.light .lp-brand-tag { color: rgba(13,110,100,0.55); }
  .lp.light .lp-label { color: rgba(13,110,100,0.65); }
  .lp.light .lp-label-line { background: rgba(13,110,100,0.4); }
  .lp.light .lp-headline { color: #0d2e2c; }
  .lp.light .lp-headline em { color: #0b8f85; }
  .lp.light .lp-desc { color: rgba(30,70,68,0.55); }
  .lp.light .lp-feature-icon { background: rgba(13,110,100,0.07); border-color: rgba(13,110,100,0.18); }
  .lp.light .lp-feature-title { color: #1a4542; }
  .lp.light .lp-feature-text { color: rgba(30,70,68,0.5); }
  .lp.light .lp-stat { background: rgba(13,110,100,0.05); border-color: rgba(13,110,100,0.15); }
  .lp.light .lp-stat-num { color: #0b8f85; }
  .lp.light .lp-stat-lbl { color: rgba(30,70,68,0.42); }
  .lp.light .lp-right { background: #f8fffe; }
  .lp.light .lp-right::before { background: linear-gradient(180deg, transparent 8%, rgba(13,110,100,0.12) 35%, rgba(13,110,100,0.12) 65%, transparent 92%); }
  .lp.light .lp-status-dot { color: #0b8f85; }
  .lp.light .lp-dot { background: #0b8f85; box-shadow: 0 0 0 3px rgba(11,143,133,0.18); }
  .lp.light .lp-form-title { color: #0d2e2c; }
  .lp.light .lp-form-title em { color: #0b8f85; }
  .lp.light .lp-form-sub { color: rgba(30,70,68,0.5); }
  .lp.light .lp-hr { background: linear-gradient(90deg, transparent, rgba(13,110,100,0.12) 30%, rgba(13,110,100,0.12) 70%, transparent); }
  .lp.light .lp-field-label { color: rgba(30,70,68,0.45); }
  .lp.light .lp-input-row input { background: rgba(255,255,255,0.8); border-color: rgba(13,110,100,0.18); color: #0d2e2c; box-shadow: 0 1px 4px rgba(13,110,100,0.06); }
  .lp.light .lp-input-row input::placeholder { color: rgba(30,70,68,0.3); }
  .lp.light .lp-input-row input:focus { border-color: rgba(13,110,100,0.4); background: #fff; box-shadow: 0 0 0 3px rgba(13,110,100,0.08); }
  .lp.light .lp-check label { color: rgba(30,70,68,0.5); }
  .lp.light .lp-btn { background: #d2f0ec; border-color: rgba(13,110,100,0.4); color: #0a5550; }
  .lp.light .lp-btn:hover:not(:disabled) { background: #bce8e3; box-shadow: 0 6px 24px rgba(13,110,100,0.15); }
  .lp.light .lp-form-footer { color: rgba(30,70,68,0.42); }
  .lp.light .lp-form-footer a { color: #0b8f85; }
  .lp.light .lp-strip { border-color: rgba(13,110,100,0.1); }
  .lp.light .lp-strip-txt { color: rgba(30,70,68,0.28); }
  .lp.light .lp-strip-dash { background: rgba(13,110,100,0.2); }
  .lp.light .lp-ctl-btn { border-color: rgba(13,110,100,0.18); background: rgba(13,110,100,0.04); color: rgba(30,70,68,0.5); }
  .lp.light .lp-ctl-btn:hover, .lp.light .lp-ctl-btn.on { border-color: rgba(13,110,100,0.38); color: #0b8f85; background: rgba(13,110,100,0.08); }
  .lp.light .lp-ctl-icon { border-color: rgba(13,110,100,0.18); background: rgba(13,110,100,0.04); }
  .lp.light .lp-ctl-icon:hover { border-color: rgba(13,110,100,0.38); background: rgba(13,110,100,0.08); }

  /* Responsive */
  @media (max-width: 860px) {
    .lp { grid-template-columns: 1fr; }
    .lp-left { display: none; }
    .lp-right { min-height: 100vh; padding: 36px 24px; }
    .lp-right::before { display: none; }
    .lp-controls { top: 18px; right: 18px; }
  }
  @media (max-width: 480px) {
    .lp-right { padding: 28px 18px; }
    .lp-form-title { font-size: 28px; }
  }
`;

export default function LoginPage() {
  const { login } = useAuth();
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [banner, setBanner] = useState(null);
  const [dark, setDark] = useState(
    () => !document.documentElement.classList.contains("light"),
  );
  const kh = language === "kh";

  const toggleTheme = () => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("light");
      root.classList.remove("dark");
      setDark(false);
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      setDark(true);
    }
  };

  useEffect(() => {
    if (location.state?.justLoggedOut) {
      setBanner({
        type: "success",
        title: kh ? "អ្នកបានចេញរួចហើយ" : "Logged out successfully",
      });
      window.history.replaceState({}, "");
    }
    if (location.state?.justRegistered) {
      setBanner({
        type: "success",
        title: kh ? "ចុះឈ្មោះដោយជោគជ័យ!" : "Registered! Please sign in",
      });
      window.history.replaceState({}, "");
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setBanner({
        type: "error",
        title: kh
          ? "សូមបំពេញអ៊ីម៉ែល និងពាក្យសម្ងាត់"
          : "Please fill in email and password",
      });
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, rememberMe);
      navigate("/dashboard", { state: { justLoggedIn: true } });
    } catch (err) {
      setBanner({
        type: "error",
        title:
          err.message || (kh ? "ព័ត៌មានមិនត្រឹមត្រូវ" : "Invalid credentials"),
      });
    } finally {
      setLoading(false);
    }
  };

  const features = kh
    ? [
        { icon: "📈", title: "តាមដានចំណូល", sub: "ចំណូល និងចំណាយ" },
        { icon: "🎯", title: "ផែនការហិរញ្ញវត្ថុ", sub: "គ្រប់គ្រងគោលដៅ" },
        { icon: "🔍", title: "ការវិភាគ", sub: "របាយការណ៍លម្អិត" },
      ]
    : [
        { icon: "📈", title: "Income & Expenses", sub: "Real-time tracking" },
        { icon: "🎯", title: "Budget Planning", sub: "Goal-based finance" },
        { icon: "🔍", title: "Deep Analytics", sub: "Insightful reports" },
      ];

  return (
    <>
      <style>{css}</style>
      <div className={`lp${dark ? "" : " light"}`}>
        {/* LEFT VISUAL */}
        <div className="lp-left">
          <div className="lp-canvas">
            <div className="lp-blob lp-blob-1" />
            <div className="lp-blob lp-blob-2" />
            <div className="lp-blob lp-blob-3" />
            <div className="lp-grid" />
            <div className="lp-scan" />
          </div>

          <div className="lp-left-inner">
            <div className="lp-brand">
              <div className="lp-brand-mark">💰</div>
              <div>
                <span className="lp-brand-name">MoneyTrack</span>
                <span className="lp-brand-tag">Personal Finance</span>
              </div>
            </div>

            <div className="lp-hero">
              <div className="lp-label">
                <div className="lp-label-line" />
                {kh ? "ហិរញ្ញវត្ថុឆ្លាតវៃ" : "Calm finance"}
              </div>
              <h2 className="lp-headline">
                {kh ? (
                  <>
                    គ្រប់គ្រង
                    <br />
                    <em>លុយរបស់</em>
                    <br />
                    អ្នក
                  </>
                ) : (
                  <>
                    Your money,
                    <br />
                    <em>finally</em>
                    <br />
                    in order.
                  </>
                )}
              </h2>
              <p className="lp-desc">
                {kh
                  ? "ប្រព័ន្ធដ៏ស្ងប់ស្ងាត់ សម្រាប់ការគ្រប់គ្រងហិរញ្ញវត្ថុប្រចាំថ្ងៃ"
                  : "A calm, focused space to track spending and grow your savings."}
              </p>

              <div className="lp-features" style={{ marginTop: 32 }}>
                {features.map((f) => (
                  <div className="lp-feature" key={f.title}>
                    <div className="lp-feature-icon">{f.icon}</div>
                    <div>
                      <span className="lp-feature-title">{f.title}</span>
                      <span className="lp-feature-text">{f.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-stats">
              {[
                { num: "10K+", label: kh ? "អ្នកប្រើ" : "Users" },
                { num: "$2M+", label: kh ? "តាមដាន" : "Tracked" },
                { num: "99.9%", label: kh ? "ដំណើរការ" : "Uptime" },
              ].map((s) => (
                <div className="lp-stat" key={s.label}>
                  <div className="lp-stat-num">{s.num}</div>
                  <div className="lp-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="lp-right">
          <div className="lp-controls">
            {[
              ["en", "EN"],
              ["kh", "ខ្មែរ"],
            ].map(([c, l]) => (
              <button
                key={c}
                className={`lp-ctl-btn${language === c ? " on" : ""}`}
                onClick={() => setLanguage(c)}
              >
                {l}
              </button>
            ))}
            <div
              className="lp-ctl-icon"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </div>
          </div>

          <div className="lp-form-wrap">
            <div className="lp-form-head">
              <div className="lp-status-dot">
                <span className="lp-dot" />
                {kh ? "ចូលប្រើប្រាស់" : "Secure access"}
              </div>
              <h1 className="lp-form-title">
                {kh ? (
                  <>
                    ស្វាគមន៍
                    <br />
                    <em>មកវិញ</em>
                  </>
                ) : (
                  <>
                    Welcome
                    <br />
                    <em>back.</em>
                  </>
                )}
              </h1>
              <p className="lp-form-sub">
                {kh
                  ? "ចូលដើម្បីបន្តតាមដានហិរញ្ញវត្ថុ"
                  : "Sign in to continue your financial journey"}
              </p>
            </div>

            <div className="lp-hr" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="lp-field">
                <label className="lp-field-label">
                  {kh ? "អ៊ីម៉ែល" : "Email address"}
                </label>
                <div className="lp-input-row">
                  <span className="lp-ico">✉️</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    autoComplete="email"
                    placeholder={kh ? "អ្នក@gmail.com" : "you@example.com"}
                  />
                </div>
              </div>

              <div className="lp-field">
                <label className="lp-field-label">
                  {kh ? "ពាក្យសម្ងាត់" : "Password"}
                </label>
                <div className="lp-input-row">
                  <span className="lp-ico">🔑</span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="lp-meta">
                <div className="lp-check">
                  <input
                    type="checkbox"
                    id="lp-rem"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="lp-rem">
                    {kh ? "ចងចាំខ្ញុំ" : "Keep me signed in"}
                  </label>
                </div>
              </div>

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="lp-spinner" />
                    {kh ? "កំពុងចូល..." : "Signing in..."}
                  </>
                ) : kh ? (
                  "ចូលប្រើប្រាស់ →"
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <div className="lp-form-footer" style={{ marginTop: 18 }}>
              {kh ? "មិនទាន់មានគណនី?" : "No account yet?"}{" "}
              <Link to="/register">{kh ? "ចុះឈ្មោះ" : "Create one free"}</Link>
            </div>

            <div className="lp-strip">
              <div className="lp-strip-dash" />
              <span className="lp-strip-txt">MoneyTrack · v2.0 · 2025</span>
              <div className="lp-strip-dash" />
            </div>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
