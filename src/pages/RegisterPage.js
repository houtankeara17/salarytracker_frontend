import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  .rp *, .rp *::before, .rp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Shell ── */
  .rp {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Sora', sans-serif;
    background: #0b1120;
    color: #c8d8e8;
  }

  /* ── Left — Form ── */
  .rp-left {
    display: flex; align-items: center; justify-content: center;
    padding: 52px 56px;
    background: #0b1120;
    position: relative;
  }
  .rp-left::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent 8%, rgba(94,212,204,0.1) 35%, rgba(94,212,204,0.1) 65%, transparent 92%);
  }

  .rp-form-wrap {
    width: 100%; max-width: 370px;
    animation: slideIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: none; }
  }

  /* Controls */
  .rp-controls {
    position: absolute; top: 28px; left: 28px;
    display: flex; align-items: center; gap: 6px;
  }
  .rp-ctl-btn {
    padding: 5px 10px; border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    border: 1px solid rgba(94,212,204,0.15);
    background: rgba(94,212,204,0.04);
    color: rgba(140,190,188,0.55);
    cursor: pointer; transition: all 0.2s;
  }
  .rp-ctl-btn:hover, .rp-ctl-btn.on { border-color: rgba(94,212,204,0.35); color: #5dd4c8; background: rgba(94,212,204,0.08); }
  .rp-ctl-icon {
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid rgba(94,212,204,0.15);
    background: rgba(94,212,204,0.04);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; cursor: pointer; transition: all 0.2s;
  }
  .rp-ctl-icon:hover { border-color: rgba(94,212,204,0.35); background: rgba(94,212,204,0.08); }

  /* Brand */
  .rp-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
  .rp-brand-mark {
    width: 40px; height: 40px;
    background: #0b1a1a;
    border: 1px solid rgba(94,212,204,0.28);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .rp-brand-name { font-size: 15px; font-weight: 600; color: #e0edec; letter-spacing: -0.02em; display: block; }
  .rp-brand-tag { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(94,212,204,0.45); display: block; margin-top: 2px; }

  /* Form header */
  .rp-form-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(94,212,204,0.65);
    margin-bottom: 14px;
  }
  .rp-tag-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: linear-gradient(135deg, #3bb8ad, #5dd4c8);
    box-shadow: 0 0 0 2px rgba(59,184,173,0.18);
    animation: rTagPulse 2.4s ease-in-out infinite;
  }
  @keyframes rTagPulse {
    0%,100%{box-shadow:0 0 0 2px rgba(59,184,173,0.18);}
    50%{box-shadow:0 0 0 5px rgba(59,184,173,0.05);}
  }

  .rp-form-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 32px; font-weight: 400; color: #d8ecea;
    letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 7px;
  }
  .rp-form-title em { font-style: italic; color: #5dd4c8; }
  .rp-form-sub { font-size: 12px; font-weight: 300; color: rgba(140,185,183,0.48); line-height: 1.7; margin-bottom: 0; }

  .rp-hr {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,212,204,0.1) 30%, rgba(94,212,204,0.1) 70%, transparent);
    margin: 22px 0;
  }

  /* Fields */
  .rp-field { margin-bottom: 13px; }
  .rp-field-label {
    display: block; font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(140,185,183,0.38); margin-bottom: 7px;
  }
  .rp-input-row { position: relative; }
  .rp-input-row input {
    width: 100%; padding: 11px 42px 11px 42px;
    border-radius: 10px; border: 1px solid rgba(94,212,204,0.1);
    background: rgba(94,212,204,0.03); color: #d8ecea;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 400;
    outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    caret-color: #5dd4c8;
  }
  .rp-input-row input::placeholder { color: rgba(140,185,183,0.27); font-weight: 300; }
  .rp-input-row input:focus {
    border-color: rgba(94,212,204,0.33);
    background: rgba(94,212,204,0.05);
    box-shadow: 0 0 0 3px rgba(94,212,204,0.07);
  }
  .rp-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 12px; opacity: 0.27; pointer-events: none; }
  .rp-eye { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.24; padding: 0; line-height: 1; transition: opacity 0.15s; color: #5dd4c8; }
  .rp-eye:hover { opacity: 0.62; }

  /* Password strength */
  .rp-strength { margin-top: 7px; }
  .rp-strength-track { height: 2px; background: rgba(94,212,204,0.1); border-radius: 99px; overflow: hidden; }
  .rp-strength-fill { height: 100%; border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1), background-color 0.4s; }
  .rp-strength-label { font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 4px; }

  /* Terms */
  .rp-terms { display: flex; align-items: flex-start; gap: 9px; margin: 14px 0 18px; }
  .rp-terms input[type="checkbox"] { width: 13px; height: 13px; margin-top: 2px; accent-color: #3bb8ad; cursor: pointer; flex-shrink: 0; }
  .rp-terms label { font-size: 11px; font-weight: 300; color: rgba(140,185,183,0.42); line-height: 1.6; cursor: pointer; }
  .rp-terms label a { color: #5dd4c8; font-weight: 500; text-decoration: none; }
  .rp-terms label a:hover { text-decoration: underline; }

  /* Button */
  .rp-btn {
    width: 100%; padding: 13px; border: none; border-radius: 10px;
    background: #0c2e2b; border: 1px solid rgba(94,212,204,0.3);
    color: #6de8df;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
    letter-spacing: 0.03em; cursor: pointer;
    transition: background 0.22s, border-color 0.22s, transform 0.15s, box-shadow 0.22s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
  }
  .rp-btn:hover:not(:disabled) { background: #0e3834; border-color: rgba(94,212,204,0.48); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,184,173,0.16); }
  .rp-btn:active:not(:disabled) { transform: none; }
  .rp-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .rp-spinner { width: 13px; height: 13px; border: 1.5px solid rgba(94,212,204,0.22); border-top-color: #5dd4c8; border-radius: 50%; animation: spin 0.7s linear infinite; }

  .rp-footer { margin-top: 18px; text-align: center; font-size: 12px; font-weight: 300; color: rgba(140,185,183,0.38); }
  .rp-footer a { color: #5dd4c8; font-weight: 500; text-decoration: none; }
  .rp-footer a:hover { color: #8ee8e2; }

  .rp-strip { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 26px; padding-top: 16px; border-top: 1px solid rgba(94,212,204,0.07); }
  .rp-strip-dash { width: 14px; height: 1px; background: rgba(94,212,204,0.15); }
  .rp-strip-txt { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.16em; color: rgba(140,185,183,0.2); text-transform: uppercase; }

  /* ── Right — Visual ── */
  .rp-right {
    position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 52px 56px; overflow: hidden;
    background: #0d1425;
  }

  .rp-canvas { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .rp-blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.17; }
  .rp-blob-1 { width: 480px; height: 480px; top: -100px; right: -100px; background: #0e7e72; animation: blobDrift 20s ease-in-out infinite; }
  .rp-blob-2 { width: 300px; height: 300px; bottom: 20px; left: -60px; background: #1a9c8e; opacity: 0.12; animation: blobDrift 17s ease-in-out infinite reverse; }
  .rp-blob-3 { width: 180px; height: 180px; top: 40%; right: 25%; background: #5dd4c8; opacity: 0.07; animation: blobDrift 13s ease-in-out infinite 2s; }
  @keyframes blobDrift {
    0%,100%{transform:translate(0,0);}
    33%{transform:translate(-18px,22px);}
    66%{transform:translate(14px,-16px);}
  }

  .rp-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(94,212,204,0.11) 1px, transparent 1px);
    background-size: 36px 36px; opacity: 0.55;
  }
  .rp-scan {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,212,204,0.12) 40%, rgba(94,212,204,0.12) 60%, transparent);
    top: 48%;
  }

  .rp-right-inner {
    position: relative; z-index: 2;
    display: flex; flex-direction: column; height: 100%; justify-content: space-between;
  }

  /* Visual header */
  .rp-visual-head { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:none;} }

  .rp-visual-label {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(94,212,204,0.55); margin-bottom: 20px;
  }
  .rp-visual-line { width: 24px; height: 1px; background: rgba(94,212,204,0.35); }

  .rp-visual-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 48px; font-weight: 400; font-style: italic;
    color: #ddeae9; line-height: 1.06; letter-spacing: -0.01em; margin-bottom: 18px;
  }
  .rp-visual-title em {
    font-style: normal; color: #5dd4c8;
  }
  .rp-visual-desc { font-size: 13px; font-weight: 300; color: rgba(180,210,208,0.5); line-height: 1.8; max-width: 290px; }

  /* Benefit cards */
  .rp-benefits { display: flex; flex-direction: column; gap: 10px; animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
  .rp-benefit {
    background: rgba(94,212,204,0.04);
    border: 1px solid rgba(94,212,204,0.1);
    border-radius: 12px; padding: 13px 15px;
    display: flex; align-items: center; gap: 12px;
    transition: background 0.22s, border-color 0.22s;
  }
  .rp-benefit:hover { background: rgba(94,212,204,0.07); border-color: rgba(94,212,204,0.18); }
  .rp-benefit-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .rp-benefit-title { font-size: 12px; font-weight: 500; color: #b8d8d6; margin-bottom: 1px; }
  .rp-benefit-sub { font-size: 11px; font-weight: 300; color: rgba(140,185,183,0.45); }

  /* Trust row */
  .rp-trust { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
  .rp-trust-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(140,185,183,0.28); margin-bottom: 10px; }
  .rp-avatars { display: flex; align-items: center; }
  .rp-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    border: 2px solid rgba(94,212,204,0.12);
    background: rgba(94,212,204,0.06);
    font-size: 11px; display: flex; align-items: center; justify-content: center;
  }
  .rp-avatar + .rp-avatar { margin-left: -6px; }
  .rp-trust-count { font-size: 11px; font-weight: 300; color: rgba(140,185,183,0.4); margin-left: 10px; }
  .rp-trust-count strong { font-weight: 500; color: rgba(180,210,208,0.65); }

  /* ── Light Mode ── */
  .rp.light { background: #f0fafa; color: #1a3535; }
  .rp.light .rp-left { background: #f8fffe; }
  .rp.light .rp-left::after { background: linear-gradient(180deg, transparent 8%, rgba(13,110,100,0.12) 35%, rgba(13,110,100,0.12) 65%, transparent 92%); }
  .rp.light .rp-brand-mark { background: #d0f0ed; border-color: rgba(13,110,100,0.25); }
  .rp.light .rp-brand-name { color: #0a2a28; }
  .rp.light .rp-brand-tag { color: rgba(13,110,100,0.5); }
  .rp.light .rp-form-tag { color: rgba(13,110,100,0.7); }
  .rp.light .rp-tag-dot { background: linear-gradient(135deg, #0b8f85, #1abfb3); box-shadow: 0 0 0 2px rgba(11,143,133,0.15); }
  .rp.light .rp-form-title { color: #0d2e2c; }
  .rp.light .rp-form-title em { color: #0b8f85; }
  .rp.light .rp-form-sub { color: rgba(30,70,68,0.5); }
  .rp.light .rp-hr { background: linear-gradient(90deg, transparent, rgba(13,110,100,0.1) 30%, rgba(13,110,100,0.1) 70%, transparent); }
  .rp.light .rp-field-label { color: rgba(30,70,68,0.45); }
  .rp.light .rp-input-row input { background: rgba(255,255,255,0.85); border-color: rgba(13,110,100,0.17); color: #0d2e2c; }
  .rp.light .rp-input-row input::placeholder { color: rgba(30,70,68,0.3); }
  .rp.light .rp-input-row input:focus { border-color: rgba(13,110,100,0.4); background: #fff; box-shadow: 0 0 0 3px rgba(13,110,100,0.07); }
  .rp.light .rp-terms label { color: rgba(30,70,68,0.5); }
  .rp.light .rp-terms label a { color: #0b8f85; }
  .rp.light .rp-btn { background: #d2f0ec; border-color: rgba(13,110,100,0.38); color: #0a5550; }
  .rp.light .rp-btn:hover:not(:disabled) { background: #bce8e3; box-shadow: 0 6px 24px rgba(13,110,100,0.14); }
  .rp.light .rp-footer { color: rgba(30,70,68,0.42); }
  .rp.light .rp-footer a { color: #0b8f85; }
  .rp.light .rp-strip { border-color: rgba(13,110,100,0.1); }
  .rp.light .rp-strip-txt { color: rgba(30,70,68,0.28); }
  .rp.light .rp-strip-dash { background: rgba(13,110,100,0.2); }
  .rp.light .rp-ctl-btn { border-color: rgba(13,110,100,0.17); background: rgba(13,110,100,0.04); color: rgba(30,70,68,0.5); }
  .rp.light .rp-ctl-btn:hover, .rp.light .rp-ctl-btn.on { border-color: rgba(13,110,100,0.38); color: #0b8f85; background: rgba(13,110,100,0.08); }
  .rp.light .rp-ctl-icon { border-color: rgba(13,110,100,0.17); background: rgba(13,110,100,0.04); }
  .rp.light .rp-right { background: #e6f7f5; }
  .rp.light .rp-blob-1 { opacity: 0.2; background: #2abfb3; }
  .rp.light .rp-blob-2 { opacity: 0.13; background: #0e9e92; }
  .rp.light .rp-grid { opacity: 0.3; background-image: radial-gradient(circle, rgba(13,110,100,0.14) 1px, transparent 1px); }
  .rp.light .rp-visual-label { color: rgba(13,110,100,0.6); }
  .rp.light .rp-visual-line { background: rgba(13,110,100,0.35); }
  .rp.light .rp-visual-title { color: #0d2e2c; }
  .rp.light .rp-visual-title em { color: #0b8f85; }
  .rp.light .rp-visual-desc { color: rgba(30,70,68,0.52); }
  .rp.light .rp-benefit { background: rgba(13,110,100,0.04); border-color: rgba(13,110,100,0.12); }
  .rp.light .rp-benefit:hover { background: rgba(13,110,100,0.07); border-color: rgba(13,110,100,0.2); }
  .rp.light .rp-benefit-title { color: #1a4542; }
  .rp.light .rp-benefit-sub { color: rgba(30,70,68,0.45); }
  .rp.light .rp-trust-label { color: rgba(30,70,68,0.3); }
  .rp.light .rp-trust-count { color: rgba(30,70,68,0.42); }
  .rp.light .rp-trust-count strong { color: rgba(0,60,56,0.68); }
  .rp.light .rp-avatar { background: rgba(13,110,100,0.08); border-color: rgba(13,110,100,0.14); }

  /* Responsive */
  @media (max-width: 860px) {
    .rp { grid-template-columns: 1fr; }
    .rp-right { display: none; }
    .rp-left { min-height: 100vh; padding: 36px 24px; }
    .rp-left::after { display: none; }
    .rp-controls { top: 18px; left: 18px; }
  }
  @media (max-width: 480px) {
    .rp-left { padding: 28px 18px; }
    .rp-form-title { font-size: 26px; }
  }
`;

function getStrength(pw) {
  if (!pw) return { pct: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { pct: 25, label: "WEAK", color: "#e05252" },
    { pct: 50, label: "FAIR", color: "#d4914d" },
    { pct: 75, label: "GOOD", color: "#4da8d4" },
    { pct: 100, label: "STRONG", color: "#3bb8ad" },
  ];
  return levels[score - 1] || { pct: 0, label: "", color: "transparent" };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [banner, setBanner] = useState(null);
  const [dark, setDark] = useState(
    () => !document.documentElement.classList.contains("light"),
  );
  const kh = language === "kh";
  const strength = getStrength(form.password);

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

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setBanner({
        type: "error",
        title: kh ? "សូមបំពេញព័ត៌មានទាំងអស់" : "Please fill in all fields",
      });
      return;
    }
    if (form.password !== form.confirm) {
      setBanner({
        type: "error",
        title: kh ? "ពាក្យសម្ងាត់មិនត្រូវគ្នា" : "Passwords do not match",
      });
      return;
    }
    if (!agreed) {
      setBanner({
        type: "error",
        title: kh ? "សូមយល់ព្រមលើលក្ខខណ្ឌ" : "Please agree to the terms",
      });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setBanner({
        type: "error",
        title:
          err.message || (kh ? "ការចុះឈ្មោះបានបរាជ័យ" : "Registration failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = kh
    ? [
        {
          icon: "📊",
          bg: "rgba(59,184,173,0.1)",
          title: "តាមដានចំណាយ",
          sub: "ដឹងថាលុយទៅណា",
        },
        {
          icon: "🎯",
          bg: "rgba(77,168,212,0.1)",
          title: "ផែនការហិរញ្ញវត្ថុ",
          sub: "ធ្វើឱ្យគោលដៅជាក់ស្ដែង",
        },
        {
          icon: "🔒",
          bg: "rgba(94,212,204,0.08)",
          title: "ទិន្នន័យមានសុវត្ថិភាព",
          sub: "ការអ៊ិនគ្រីបពេញលេញ",
        },
      ]
    : [
        {
          icon: "📊",
          bg: "rgba(59,184,173,0.1)",
          title: "Smart Tracking",
          sub: "Know where every dollar goes",
        },
        {
          icon: "🎯",
          bg: "rgba(77,168,212,0.1)",
          title: "Goal Budgeting",
          sub: "Financial dreams made real",
        },
        {
          icon: "🔒",
          bg: "rgba(94,212,204,0.08)",
          title: "Bank-grade Security",
          sub: "Always encrypted, always yours",
        },
      ];

  return (
    <>
      <style>{css}</style>
      <div className={`rp${dark ? "" : " light"}`}>
        {/* LEFT FORM */}
        <div className="rp-left">
          <div className="rp-controls">
            {[
              ["en", "EN"],
              ["kh", "ខ្មែរ"],
            ].map(([c, l]) => (
              <button
                key={c}
                className={`rp-ctl-btn${language === c ? " on" : ""}`}
                onClick={() => setLanguage(c)}
              >
                {l}
              </button>
            ))}
            <div className="rp-ctl-icon" onClick={toggleTheme}>
              {dark ? "☀️" : "🌙"}
            </div>
          </div>

          <div className="rp-form-wrap">
            <div className="rp-brand">
              <div className="rp-brand-mark">💰</div>
              <div>
                <span className="rp-brand-name">MoneyTrack</span>
                <span className="rp-brand-tag">Personal Finance</span>
              </div>
            </div>

            <div className="rp-form-tag">
              <span className="rp-tag-dot" />
              {kh ? "ចុះឈ្មោះ" : "Create account"}
            </div>
            <h1 className="rp-form-title">
              {kh ? (
                <>
                  ចាប់ផ្ដើម
                  <br />
                  <em>ការធ្វើដំណើរ</em>
                </>
              ) : (
                <>
                  Start your
                  <br />
                  <em>journey.</em>
                </>
              )}
            </h1>
            <p className="rp-form-sub">
              {kh
                ? "បង្កើតគណនីឥតគិតថ្លៃ ហើយចាប់ផ្ដើមតាមដានហិរញ្ញវត្ថុ"
                : "Join thousands managing their finances smarter."}
            </p>

            <div className="rp-hr" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="rp-field">
                <label className="rp-field-label">
                  {kh ? "ឈ្មោះ" : "Full name"}
                </label>
                <div className="rp-input-row">
                  <span className="rp-ico">👤</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder={kh ? "ឈ្មោះពេញ" : "Your full name"}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="rp-field">
                <label className="rp-field-label">
                  {kh ? "អ៊ីម៉ែល" : "Email address"}
                </label>
                <div className="rp-input-row">
                  <span className="rp-ico">✉️</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder={kh ? "អ្នក@gmail.com" : "you@example.com"}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="rp-field">
                <label className="rp-field-label">
                  {kh ? "ពាក្យសម្ងាត់" : "Password"}
                </label>
                <div className="rp-input-row">
                  <span className="rp-ico">🔑</span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="rp-eye"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {form.password && (
                  <div className="rp-strength">
                    <div className="rp-strength-track">
                      <div
                        className="rp-strength-fill"
                        style={{
                          width: strength.pct + "%",
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <div
                      className="rp-strength-label"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </div>
                  </div>
                )}
              </div>

              <div className="rp-field">
                <label className="rp-field-label">
                  {kh ? "បញ្ជាក់ពាក្យសម្ងាត់" : "Confirm password"}
                </label>
                <div className="rp-input-row">
                  <span className="rp-ico">🔒</span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={
                      form.confirm && form.confirm !== form.password
                        ? {
                            borderColor: "rgba(224,82,82,0.45)",
                            boxShadow: "0 0 0 3px rgba(224,82,82,0.08)",
                          }
                        : form.confirm && form.confirm === form.password
                          ? {
                              borderColor: "rgba(59,184,173,0.45)",
                              boxShadow: "0 0 0 3px rgba(59,184,173,0.08)",
                            }
                          : {}
                    }
                  />
                </div>
              </div>

              <div className="rp-terms">
                <input
                  type="checkbox"
                  id="rp-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="rp-terms">
                  {kh ? (
                    <>
                      ខ្ញុំយល់ព្រមនឹង <a href="#">លក្ខខណ្ឌ</a> និង{" "}
                      <a href="#">គោលការណ៍ឯកជនភាព</a>
                    </>
                  ) : (
                    <>
                      I agree to the <a href="#">Terms of Service</a> and{" "}
                      <a href="#">Privacy Policy</a>
                    </>
                  )}
                </label>
              </div>

              <button type="submit" className="rp-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="rp-spinner" />
                    {kh ? "កំពុងបង្កើត..." : "Creating account..."}
                  </>
                ) : kh ? (
                  "បង្កើតគណនី →"
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            <div className="rp-footer">
              {kh ? "មានគណនីហើយ?" : "Already have an account?"}{" "}
              <Link to="/login">{kh ? "ចូលប្រើប្រាស់" : "Sign in"}</Link>
            </div>

            <div className="rp-strip">
              <div className="rp-strip-dash" />
              <span className="rp-strip-txt">MoneyTrack · v2.0 · 2025</span>
              <div className="rp-strip-dash" />
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="rp-right">
          <div className="rp-canvas">
            <div className="rp-blob rp-blob-1" />
            <div className="rp-blob rp-blob-2" />
            <div className="rp-blob rp-blob-3" />
            <div className="rp-grid" />
            <div className="rp-scan" />
          </div>

          <div className="rp-right-inner">
            <div className="rp-visual-head">
              <div className="rp-visual-label">
                <div className="rp-visual-line" />
                {kh ? "ហេតុអ្វីត្រូវចូលរួម" : "Why join us"}
              </div>
              <h2 className="rp-visual-title">
                {kh ? (
                  <>
                    ជីវិត
                    <br />
                    <em>ហិរញ្ញវត្ថុ</em>
                    <br />
                    ល្អប្រសើរ
                  </>
                ) : (
                  <>
                    A better
                    <br />
                    <em>financial</em>
                    <br />
                    future.
                  </>
                )}
              </h2>
              <p className="rp-visual-desc">
                {kh
                  ? "ចូលរួមជាមួយអ្នកប្រើជាង ១០,០០០ នាក់ ដែលស្គាល់ហិរញ្ញវត្ថុប្រចាំថ្ងៃ"
                  : "Join over 10,000 people who've taken calm control of their finances."}
              </p>
            </div>

            <div className="rp-benefits">
              {benefits.map((b) => (
                <div className="rp-benefit" key={b.title}>
                  <div className="rp-benefit-icon" style={{ background: b.bg }}>
                    {b.icon}
                  </div>
                  <div>
                    <div className="rp-benefit-title">{b.title}</div>
                    <div className="rp-benefit-sub">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rp-trust">
              <div className="rp-trust-label">
                {kh ? "ជឿទុកចិត្តដោយ" : "Trusted by"}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="rp-avatars">
                  {["😊", "🙂", "😄", "🤩", "😎"].map((e, i) => (
                    <div
                      className="rp-avatar"
                      key={i}
                      style={{ zIndex: 5 - i }}
                    >
                      {e}
                    </div>
                  ))}
                </div>
                <span className="rp-trust-count">
                  <strong>10,000+</strong> {kh ? "អ្នកប្រើ" : "happy users"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
