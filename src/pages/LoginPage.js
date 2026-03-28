import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .sp *, .sp *::before, .sp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sp {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #0c0e1a;
    color: #e2e4f0;
    position: relative;
    overflow: hidden;
  }

  /* Ambient orbs */
  .sp-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .sp-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
  .sp-orb-1 {
    width: 600px; height: 600px; top: -200px; left: -160px;
    background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
    animation: orbFloat 20s ease-in-out infinite;
  }
  .sp-orb-2 {
    width: 400px; height: 400px; bottom: -100px; right: -80px;
    background: radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 70%);
    animation: orbFloat 26s ease-in-out infinite reverse;
  }
  .sp-orb-3 {
    width: 240px; height: 240px; top: 55%; left: 52%;
    background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%);
    animation: orbFloat 16s ease-in-out infinite 4s;
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(28px,-36px) scale(1.05); }
    70%      { transform: translate(-18px,22px) scale(0.97); }
  }

  .sp-dots {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(rgba(129,140,248,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* ── Left deco panel ── */
  .sp-deco {
    flex: 1; position: relative; z-index: 1;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 52px 60px;
    border-right: 1px solid rgba(99,102,241,0.15);
    overflow: hidden;
  }
  .sp-deco::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 160px; height: 160px;
    border-top: 1px solid rgba(129,140,248,0.22);
    border-left: 1px solid rgba(129,140,248,0.22);
    border-radius: 0 0 60px 0; pointer-events: none;
  }
  .sp-deco::after {
    content: ''; position: absolute; bottom: 0; right: 0;
    width: 120px; height: 120px;
    border-bottom: 1px solid rgba(99,102,241,0.18);
    border-right: 1px solid rgba(99,102,241,0.18);
    border-radius: 60px 0 0 0; pointer-events: none;
  }
  .sp-deco-inner {
    display: flex; flex-direction: column;
    height: 100%; justify-content: space-between;
  }

  /* Brand */
  .sp-brand {
    display: flex; align-items: center; gap: 14px;
    animation: riseIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.05s both;
  }
  @keyframes riseIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  .sp-gem {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 0 1px rgba(129,140,248,0.28), 0 8px 32px rgba(99,102,241,0.35);
    flex-shrink: 0;
  }
  .sp-brand-name { font-size: 17px; font-weight: 600; color: #e8eaf8; letter-spacing: -0.025em; display: block; }
  .sp-brand-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(129,140,248,0.42); display: block; margin-top: 2px;
  }

  /* Hero */
  .sp-hero { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both; }

  .sp-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(129,140,248,0.55); margin-bottom: 24px;
  }
  .sp-eyebrow::before {
    content: ''; display: inline-block;
    width: 18px; height: 1px;
    background: linear-gradient(90deg, #818cf8, transparent);
  }

  .sp-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 54px; font-weight: 600;
    color: #eceef8; line-height: 1.05;
    letter-spacing: -0.02em; margin-bottom: 22px;
  }
  .sp-title span {
    font-style: italic; font-weight: 400;
    background: linear-gradient(120deg, #6366f1 0%, #818cf8 55%, #a5b4fc 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sp-desc {
    font-size: 13px; font-weight: 300;
    color: rgba(180,184,220,0.48);
    line-height: 1.85; max-width: 300px;
  }

  /* Chips */
  .sp-chips {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 34px;
    animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s both;
  }
  .sp-chip {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 15px;
    background: rgba(99,102,241,0.06);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 12px;
    transition: border-color 0.25s, background 0.25s;
  }
  .sp-chip:hover { border-color: rgba(129,140,248,0.32); background: rgba(99,102,241,0.1); }
  .sp-chip-icon {
    width: 30px; height: 30px; flex-shrink: 0;
    border-radius: 9px; background: rgba(99,102,241,0.16);
    display: flex; align-items: center; justify-content: center; font-size: 13px;
  }
  .sp-chip-title { font-size: 12px; font-weight: 500; color: #c4c6e8; display: block; }
  .sp-chip-text { font-size: 11px; font-weight: 300; color: rgba(180,184,220,0.5); }

  /* Deco footer */
  .sp-deco-foot { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
  .sp-mono-bar {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em;
    color: rgba(129,140,248,0.22); text-transform: uppercase;
    display: flex; align-items: center; gap: 12px;
  }
  .sp-mono-bar::before, .sp-mono-bar::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.18));
  }
  .sp-mono-bar::after { background: linear-gradient(90deg, rgba(99,102,241,0.18), transparent); }

  /* ── Gate (right panel) ── */
  .sp-gate {
    width: 460px; flex-shrink: 0; position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 52px 52px;
  }
  .sp-gate-wrap {
    width: 100%;
    animation: gateIn 0.75s cubic-bezier(0.16,1,0.3,1) 0.2s both;
  }
  @keyframes gateIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: none; }
  }

  /* Controls row — top right of gate panel */
  .sp-controls {
    position: absolute; top: 28px; right: 28px;
    display: flex; align-items: center; gap: 6px;
    z-index: 2;
  }
  .sp-ctl-btn {
    padding: 5px 11px; border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
    border: 1px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.07);
    color: rgba(129,140,248,0.45);
    cursor: pointer; transition: all 0.18s;
  }
  .sp-ctl-btn:hover { border-color: rgba(129,140,248,0.4); color: #818cf8; background: rgba(99,102,241,0.13); }
  .sp-ctl-btn.on { background: rgba(99,102,241,0.18); border-color: rgba(129,140,248,0.45); color: #a5b4fc; }
  .sp-ctl-icon {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.07);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px; transition: all 0.18s;
  }
  .sp-ctl-icon:hover { border-color: rgba(129,140,248,0.4); background: rgba(99,102,241,0.13); }

  .sp-gate-head { margin-bottom: 32px; }
  .sp-signal {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(129,140,248,0.65); margin-bottom: 18px;
  }
  .sp-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 0 2px rgba(129,140,248,0.2);
    animation: pulse 2.6s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 2px rgba(129,140,248,0.2); }
    50%      { box-shadow: 0 0 0 6px rgba(129,140,248,0.05); }
  }

  .sp-gate-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 38px; font-weight: 600;
    color: #eceef8; letter-spacing: -0.025em; line-height: 1.08;
    margin-bottom: 8px;
  }
  .sp-gate-title em {
    font-weight: 400; font-style: italic;
    background: linear-gradient(120deg, #6366f1, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sp-gate-sub { font-size: 12px; font-weight: 300; color: rgba(180,184,220,0.45); line-height: 1.7; }

  .sp-sep {
    height: 1px; margin: 28px 0;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2) 35%, rgba(99,102,241,0.2) 65%, transparent);
  }

  /* Fields */
  .sp-field { margin-bottom: 16px; }
  .sp-lbl {
    display: block; font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(129,140,248,0.36); margin-bottom: 8px;
  }
  .sp-row { position: relative; }
  .sp-row input {
    width: 100%; padding: 13px 44px 13px 44px;
    border-radius: 12px; border: 1px solid rgba(99,102,241,0.18);
    background: rgba(99,102,241,0.05); color: #e2e4f0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 400;
    outline: none; transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
    caret-color: #818cf8;
  }
  .sp-row input::placeholder { color: rgba(129,140,248,0.22); font-weight: 300; }
  .sp-row input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.08);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .sp-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity: 0.3; pointer-events: none; }
  .sp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 13px; opacity: 0.25; padding: 0; line-height: 1; transition: opacity 0.15s; }
  .sp-eye:hover { opacity: 0.65; }

  .sp-meta { display: flex; align-items: center; margin-bottom: 24px; }
  .sp-chk { display: flex; align-items: center; gap: 8px; }
  .sp-chk input[type="checkbox"] { width: 13px; height: 13px; accent-color: #6366f1; cursor: pointer; }
  .sp-chk label { font-size: 11px; font-weight: 300; color: rgba(129,140,248,0.38); cursor: pointer; user-select: none; }

  /* CTA */
  .sp-cta {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.02em; cursor: pointer;
    box-shadow: 0 4px 24px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
    transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    position: relative; overflow: hidden;
  }
  .sp-cta::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%); border-radius: 12px; }
  .sp-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(99,102,241,0.52), 0 1px 0 rgba(255,255,255,0.12) inset; filter: brightness(1.06); }
  .sp-cta:active:not(:disabled) { transform: none; filter: brightness(0.96); }
  .sp-cta:disabled { opacity: 0.4; cursor: not-allowed; }

  @keyframes spSpin { to { transform: rotate(360deg); } }
  .sp-spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.28); border-top-color: #fff; border-radius: 50%; animation: spSpin 0.7s linear infinite; flex-shrink: 0; }

  .sp-stamp {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; margin-top: 30px; padding-top: 20px;
    border-top: 1px solid rgba(99,102,241,0.1);
  }
  .sp-stamp-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(129,140,248,0.2); }
  .sp-stamp-txt { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.18em; color: rgba(129,140,248,0.2); text-transform: uppercase; }

  /* ── Light mode ── */
  .sp.light { background: #f4f4ff; color: #1e1f3a; }
  .sp.light .sp-orb-1 { background: radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%); }
  .sp.light .sp-orb-2 { background: radial-gradient(circle, rgba(129,140,248,0.09) 0%, transparent 70%); }
  .sp.light .sp-dots { background-image: radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px); }
  .sp.light .sp-deco { border-right-color: rgba(99,102,241,0.14); }
  .sp.light .sp-deco::before { border-color: rgba(99,102,241,0.18); }
  .sp.light .sp-deco::after { border-color: rgba(99,102,241,0.14); }
  .sp.light .sp-brand-name { color: #1e1f3a; }
  .sp.light .sp-brand-sub { color: rgba(99,102,241,0.45); }
  .sp.light .sp-eyebrow { color: rgba(99,102,241,0.55); }
  .sp.light .sp-title { color: #1a1c38; }
  .sp.light .sp-desc { color: rgba(50,52,90,0.55); }
  .sp.light .sp-chip { background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.15); }
  .sp.light .sp-chip:hover { background: rgba(99,102,241,0.09); border-color: rgba(99,102,241,0.3); }
  .sp.light .sp-chip-title { color: #2a2d60; }
  .sp.light .sp-chip-text { color: rgba(50,52,90,0.55); }
  .sp.light .sp-mono-bar { color: rgba(99,102,241,0.25); }
  .sp.light .sp-signal { color: rgba(99,102,241,0.6); }
  .sp.light .sp-gate-title { color: #1a1c38; }
  .sp.light .sp-gate-sub { color: rgba(50,52,90,0.52); }
  .sp.light .sp-sep { background: linear-gradient(90deg, transparent, rgba(99,102,241,0.14) 35%, rgba(99,102,241,0.14) 65%, transparent); }
  .sp.light .sp-lbl { color: rgba(99,102,241,0.42); }
  .sp.light .sp-row input { background: rgba(255,255,255,0.9); border-color: rgba(99,102,241,0.2); color: #1e1f3a; box-shadow: 0 1px 4px rgba(99,102,241,0.06); }
  .sp.light .sp-row input::placeholder { color: rgba(99,102,241,0.25); }
  .sp.light .sp-row input:focus { border-color: rgba(99,102,241,0.45); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.09); }
  .sp.light .sp-chk label { color: rgba(50,52,90,0.5); }
  .sp.light .sp-stamp { border-color: rgba(99,102,241,0.12); }
  .sp.light .sp-stamp-txt { color: rgba(99,102,241,0.22); }
  .sp.light .sp-ctl-btn { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); color: rgba(99,102,241,0.5); }
  .sp.light .sp-ctl-btn:hover { color: #6366f1; background: rgba(99,102,241,0.12); }
  .sp.light .sp-ctl-btn.on { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: #6366f1; }
  .sp.light .sp-ctl-icon { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); }
  .sp.light .sp-ctl-icon:hover { background: rgba(99,102,241,0.12); }

  /* Responsive */
  @media (max-width: 900px) {
    .sp { flex-direction: column; }
    .sp-deco { display: none; }
    .sp-gate { width: 100%; min-height: 100vh; padding: 36px 24px; }
    .sp-controls { top: 20px; right: 20px; }
  }
  @media (max-width: 480px) {
    .sp-gate { padding: 28px 18px; }
    .sp-gate-title { font-size: 30px; }
  }
`;

// ── Translations ──
const t = {
  en: {
    eyebrow: "Your private dashboard",
    heroTitle: ["One place", "for ", "all your", " finances."],
    heroDesc:
      "A private, personal space to track spending, plan budgets, and understand where your money goes.",
    chips: [
      { title: "Expense Tracking", text: "Every dollar, accounted for" },
      { title: "Budget Goals", text: "Plan and stay on track" },
      { title: "Analytics", text: "Deep financial insights" },
    ],
    footerMono: "MoneyTrack · private · v2.0",
    signal: "Private access",
    gateTitle: ["Welcome", "back."],
    gateSub: "Your personal finance dashboard awaits.",
    emailLabel: "Email",
    passLabel: "Password",
    remember: "Keep me signed in",
    cta: "Enter dashboard →",
    ctaLoading: "Signing in...",
    stamp: "MoneyTrack · private use only · v2.0",
    errFill: "Please fill in all fields",
    errDenied: "Access denied",
    loggedOut: "Session ended",
    emailPh: "you@example.com",
    passPh: "••••••••",
  },
  kh: {
    eyebrow: "ផ្ទាំងគ្រប់គ្រងឯកជន",
    heroTitle: ["មួយកន្លែង", "សម្រាប់ ", "ហិរញ្ញវត្ថុ", "របស់អ្នក។"],
    heroDesc: "ទំហំឯកជន សម្រាប់តាមដានចំណាយ គ្រោងថវិកា និងយល់ដឹងពីលុយរបស់អ្នក។",
    chips: [
      { title: "តាមដានចំណាយ", text: "ដូឡារគ្រប់ច្បាប់" },
      { title: "គោលដៅថវិកា", text: "គ្រោងការ និងតាមដាន" },
      { title: "ការវិភាគ", text: "ការយល់ដឹងហិរញ្ញវត្ថុ" },
    ],
    footerMono: "MoneyTrack · ឯកជន · v2.0",
    signal: "ចូលប្រើប្រាស់ឯកជន",
    gateTitle: ["ស្វាគមន៍", "មកវិញ។"],
    gateSub: "ផ្ទាំងគ្រប់គ្រងហិរញ្ញវត្ថុឯកជនរបស់អ្នករង់ចាំ។",
    emailLabel: "អ៊ីម៉ែល",
    passLabel: "ពាក្យសម្ងាត់",
    remember: "រក្សាការចូល",
    cta: "ចូលផ្ទាំងគ្រប់គ្រង →",
    ctaLoading: "កំពុងចូល...",
    stamp: "MoneyTrack · ប្រើប្រាស់ឯកជន · v2.0",
    errFill: "សូមបំពេញព័ត៌មានទាំងអស់",
    errDenied: "ការចូលប្រើត្រូវបានបដិសេធ",
    loggedOut: "វគ្គបានបញ្ចប់",
    emailPh: "អ្នក@gmail.com",
    passPh: "••••••••",
  },
};

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

  const tx = t[language] || t.en;

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
      setBanner({ type: "success", title: tx.loggedOut });
      window.history.replaceState({}, "");
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setBanner({ type: "error", title: tx.errFill });
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, rememberMe);
      navigate("/dashboard", { state: { justLoggedIn: true } });
    } catch (err) {
      setBanner({ type: "error", title: err.message || tx.errDenied });
    } finally {
      setLoading(false);
    }
  };

  const chipIcons = ["📊", "🎯", "🔍"];

  return (
    <>
      <style>{css}</style>
      <div className={`sp${dark ? "" : " light"}`}>
        <div className="sp-ambient">
          <div className="sp-orb sp-orb-1" />
          <div className="sp-orb sp-orb-2" />
          <div className="sp-orb sp-orb-3" />
        </div>
        <div className="sp-dots" />

        {/* ── LEFT DECO ── */}
        <div className="sp-deco">
          <div className="sp-deco-inner">
            <div className="sp-brand">
              <div className="sp-gem">💰</div>
              <div>
                <span className="sp-brand-name">MoneyTrack</span>
                <span className="sp-brand-sub">Personal Finance</span>
              </div>
            </div>

            <div className="sp-hero">
              <div className="sp-eyebrow">{tx.eyebrow}</div>
              <h2 className="sp-title">
                {tx.heroTitle[0]}
                <br />
                {tx.heroTitle[1]}
                <span>{tx.heroTitle[2]}</span>
                <br />
                {tx.heroTitle[3]}
              </h2>
              <p className="sp-desc">{tx.heroDesc}</p>

              <div className="sp-chips">
                {tx.chips.map((c, i) => (
                  <div className="sp-chip" key={i}>
                    <div className="sp-chip-icon">{chipIcons[i]}</div>
                    <div>
                      <span className="sp-chip-title">{c.title}</span>
                      <span className="sp-chip-text">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sp-deco-foot">
              <div className="sp-mono-bar">{tx.footerMono}</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT GATE ── */}
        <div className="sp-gate">
          {/* Controls: language + theme */}
          <div className="sp-controls">
            {[
              ["en", "EN"],
              ["kh", "ខ្មែរ"],
            ].map(([code, label]) => (
              <button
                key={code}
                className={`sp-ctl-btn${language === code ? " on" : ""}`}
                onClick={() => setLanguage(code)}
              >
                {label}
              </button>
            ))}
            <div
              className="sp-ctl-icon"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </div>
          </div>

          <div className="sp-gate-wrap">
            <div className="sp-gate-head">
              <div className="sp-signal">
                <span className="sp-pulse" />
                {tx.signal}
              </div>
              <h1 className="sp-gate-title">
                {tx.gateTitle[0]}
                <br />
                <em>{tx.gateTitle[1]}</em>
              </h1>
              <p className="sp-gate-sub">{tx.gateSub}</p>
            </div>

            <div className="sp-sep" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="sp-field">
                <label className="sp-lbl">{tx.emailLabel}</label>
                <div className="sp-row">
                  <span className="sp-ico">✉️</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    autoComplete="email"
                    placeholder={tx.emailPh}
                  />
                </div>
              </div>

              <div className="sp-field">
                <label className="sp-lbl">{tx.passLabel}</label>
                <div className="sp-row">
                  <span className="sp-ico">🔑</span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    autoComplete="current-password"
                    placeholder={tx.passPh}
                  />
                  <button
                    type="button"
                    className="sp-eye"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="sp-meta">
                <div className="sp-chk">
                  <input
                    type="checkbox"
                    id="sp-rem"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="sp-rem">{tx.remember}</label>
                </div>
              </div>

              <button type="submit" className="sp-cta" disabled={loading}>
                {loading ? (
                  <>
                    <span className="sp-spin" />
                    {tx.ctaLoading}
                  </>
                ) : (
                  tx.cta
                )}
              </button>
            </form>

            <div className="sp-stamp">
              <div className="sp-stamp-dot" />
              <span className="sp-stamp-txt">{tx.stamp}</span>
              <div className="sp-stamp-dot" />
            </div>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
