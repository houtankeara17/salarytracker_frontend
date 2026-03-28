import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .rp *, .rp *::before, .rp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #0c0e1a;
    color: #e2e4f0;
    position: relative; overflow: hidden;
  }

  /* Ambient */
  .rp-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .rp-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
  .rp-orb-1 {
    width: 550px; height: 550px; top: -180px; left: -140px;
    background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
    animation: orbDrift 22s ease-in-out infinite;
  }
  .rp-orb-2 {
    width: 380px; height: 380px; bottom: -100px; right: -80px;
    background: radial-gradient(circle, rgba(129,140,248,0.13) 0%, transparent 70%);
    animation: orbDrift 18s ease-in-out infinite reverse;
  }
  @keyframes orbDrift {
    0%,100% { transform: translate(0,0); }
    40%      { transform: translate(24px,-32px); }
    70%      { transform: translate(-16px,20px); }
  }
  .rp-dots {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(rgba(129,140,248,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Controls — fixed top right */
  .rp-controls {
    position: fixed; top: 24px; right: 24px;
    display: flex; align-items: center; gap: 6px;
    z-index: 10;
  }
  .rp-ctl-btn {
    padding: 5px 11px; border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
    border: 1px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.07);
    color: rgba(129,140,248,0.45);
    cursor: pointer; transition: all 0.18s;
  }
  .rp-ctl-btn:hover { border-color: rgba(129,140,248,0.4); color: #818cf8; background: rgba(99,102,241,0.13); }
  .rp-ctl-btn.on { background: rgba(99,102,241,0.18); border-color: rgba(129,140,248,0.45); color: #a5b4fc; }
  .rp-ctl-icon {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.07);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px; transition: all 0.18s;
  }
  .rp-ctl-icon:hover { border-color: rgba(129,140,248,0.4); background: rgba(99,102,241,0.13); }

  /* Card */
  .rp-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 480px;
    background: rgba(16,18,32,0.85);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 24px;
    padding: 48px 44px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(129,140,248,0.06) inset,
                0 40px 80px rgba(0,0,0,0.45),
                0 0 60px rgba(99,102,241,0.08);
    animation: cardIn 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: none; }
  }
  .rp-card::before {
    content: ''; position: absolute; top: -1px; left: -1px;
    width: 80px; height: 80px;
    border-top: 1px solid rgba(129,140,248,0.35);
    border-left: 1px solid rgba(129,140,248,0.35);
    border-radius: 24px 0 0 0; pointer-events: none;
  }
  .rp-card::after {
    content: ''; position: absolute; bottom: -1px; right: -1px;
    width: 60px; height: 60px;
    border-bottom: 1px solid rgba(99,102,241,0.28);
    border-right: 1px solid rgba(99,102,241,0.28);
    border-radius: 0 0 24px 0; pointer-events: none;
  }

  /* Brand */
  .rp-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
  .rp-gem {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 0 1px rgba(129,140,248,0.25), 0 6px 24px rgba(99,102,241,0.3);
    flex-shrink: 0;
  }
  .rp-brand-name { font-size: 15px; font-weight: 600; color: #e8eaf8; letter-spacing: -0.02em; display: block; }
  .rp-brand-sub { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(129,140,248,0.4); display: block; margin-top: 2px; }

  /* Header */
  .rp-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(129,140,248,0.6); margin-bottom: 14px;
  }
  .rp-tag-gem {
    width: 6px; height: 6px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.18);
    animation: gemPulse 2.4s ease-in-out infinite;
  }
  @keyframes gemPulse {
    0%,100% { box-shadow: 0 0 0 2px rgba(99,102,241,0.18); }
    50%      { box-shadow: 0 0 0 5px rgba(99,102,241,0.05); }
  }

  .rp-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34px; font-weight: 600;
    color: #eceef8; letter-spacing: -0.025em; line-height: 1.08;
    margin-bottom: 8px;
  }
  .rp-title em {
    font-weight: 400; font-style: italic;
    background: linear-gradient(120deg, #6366f1, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rp-sub { font-size: 12px; font-weight: 300; color: rgba(180,184,220,0.42); line-height: 1.7; }

  .rp-sep {
    height: 1px; margin: 24px 0;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2) 35%, rgba(99,102,241,0.2) 65%, transparent);
  }

  /* Fields */
  .rp-field { margin-bottom: 14px; }
  .rp-lbl {
    display: block; font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(129,140,248,0.36); margin-bottom: 8px;
  }
  .rp-row { position: relative; }
  .rp-row input {
    width: 100%; padding: 12px 42px 12px 42px;
    border-radius: 11px; border: 1px solid rgba(99,102,241,0.18);
    background: rgba(99,102,241,0.05); color: #e2e4f0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 400;
    outline: none; transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
    caret-color: #818cf8;
  }
  .rp-row input::placeholder { color: rgba(129,140,248,0.22); font-weight: 300; }
  .rp-row input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.08);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .rp-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity: 0.3; pointer-events: none; }
  .rp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.25; padding: 0; line-height: 1; transition: opacity 0.15s; }
  .rp-eye:hover { opacity: 0.65; }

  /* Strength */
  .rp-strength { margin-top: 7px; }
  .rp-str-track { height: 2px; background: rgba(99,102,241,0.1); border-radius: 99px; overflow: hidden; }
  .rp-str-fill { height: 100%; border-radius: 99px; transition: width 0.4s, background-color 0.4s; }
  .rp-str-label { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 4px; }

  /* Match indicator */
  .rp-match { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 5px; font-weight: 500; }

  /* CTA */
  .rp-cta {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.02em; cursor: pointer;
    box-shadow: 0 4px 24px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
    transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    position: relative; overflow: hidden; margin-top: 6px;
  }
  .rp-cta::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%); border-radius: 12px; }
  .rp-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(99,102,241,0.52), 0 1px 0 rgba(255,255,255,0.12) inset; filter: brightness(1.06); }
  .rp-cta:active:not(:disabled) { transform: none; filter: brightness(0.96); }
  .rp-cta:disabled { opacity: 0.4; cursor: not-allowed; }

  @keyframes rpSpin { to { transform: rotate(360deg); } }
  .rp-spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.28); border-top-color: #fff; border-radius: 50%; animation: rpSpin 0.7s linear infinite; flex-shrink: 0; }

  /* Back link */
  .rp-back {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; margin-top: 22px; padding-top: 20px;
    border-top: 1px solid rgba(99,102,241,0.1);
    font-size: 12px; font-weight: 300; color: rgba(129,140,248,0.4);
    text-decoration: none; transition: color 0.15s;
  }
  .rp-back:hover { color: rgba(129,140,248,0.7); }

  /* ── Light mode ── */
  .rp.light { background: #f4f4ff; color: #1e1f3a; }
  .rp.light .rp-orb-1 { background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); }
  .rp.light .rp-orb-2 { background: radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%); }
  .rp.light .rp-dots { background-image: radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px); }
  .rp.light .rp-card { background: rgba(255,255,255,0.92); border-color: rgba(99,102,241,0.18); box-shadow: 0 0 0 1px rgba(129,140,248,0.05) inset, 0 20px 60px rgba(99,102,241,0.1); }
  .rp.light .rp-card::before { border-color: rgba(99,102,241,0.25); }
  .rp.light .rp-card::after  { border-color: rgba(99,102,241,0.18); }
  .rp.light .rp-brand-name { color: #1e1f3a; }
  .rp.light .rp-brand-sub  { color: rgba(99,102,241,0.42); }
  .rp.light .rp-tag  { color: rgba(99,102,241,0.62); }
  .rp.light .rp-title { color: #1a1c38; }
  .rp.light .rp-sub  { color: rgba(50,52,90,0.5); }
  .rp.light .rp-sep  { background: linear-gradient(90deg, transparent, rgba(99,102,241,0.14) 35%, rgba(99,102,241,0.14) 65%, transparent); }
  .rp.light .rp-lbl  { color: rgba(99,102,241,0.42); }
  .rp.light .rp-row input { background: rgba(255,255,255,0.9); border-color: rgba(99,102,241,0.2); color: #1e1f3a; box-shadow: 0 1px 4px rgba(99,102,241,0.06); }
  .rp.light .rp-row input::placeholder { color: rgba(99,102,241,0.25); }
  .rp.light .rp-row input:focus { border-color: rgba(99,102,241,0.45); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.09); }
  .rp.light .rp-str-track { background: rgba(99,102,241,0.1); }
  .rp.light .rp-back { border-color: rgba(99,102,241,0.12); color: rgba(99,102,241,0.42); }
  .rp.light .rp-back:hover { color: rgba(99,102,241,0.7); }
  .rp.light .rp-ctl-btn { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); color: rgba(99,102,241,0.5); }
  .rp.light .rp-ctl-btn:hover { color: #6366f1; background: rgba(99,102,241,0.12); }
  .rp.light .rp-ctl-btn.on { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: #6366f1; }
  .rp.light .rp-ctl-icon { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); }
  .rp.light .rp-ctl-icon:hover { background: rgba(99,102,241,0.12); }

  @media (max-width: 540px) {
    .rp-card { padding: 36px 24px; border-radius: 20px; margin: 20px 16px; }
    .rp-title { font-size: 28px; }
    .rp-controls { top: 16px; right: 16px; }
  }
`;

// ── Translations ──
const t = {
  en: {
    tag: "Initial setup",
    title: ["Set up your", "account."],
    sub: "Create your private access credentials.",
    nameLabel: "Your name",
    namePh: "Your name",
    emailLabel: "Email",
    emailPh: "you@example.com",
    passLabel: "Password",
    passPh: "••••••••",
    confLabel: "Confirm password",
    confPh: "••••••••",
    cta: "Create account →",
    ctaLoading: "Creating account...",
    backLabel: "← Back to sign in",
    match: { ok: "✓ PASSWORDS MATCH", fail: "✗ PASSWORDS DO NOT MATCH" },
    strength: { weak: "WEAK", fair: "FAIR", good: "GOOD", strong: "STRONG" },
    errFill: "Please fill in all fields",
    errMatch: "Passwords do not match",
    errFailed: "Setup failed",
  },
  kh: {
    tag: "ការដំឡើងដំបូង",
    title: ["ដំឡើង", "គណនីរបស់អ្នក។"],
    sub: "បង្កើតព័ត៌មានចូលប្រើឯកជនរបស់អ្នក។",
    nameLabel: "ឈ្មោះរបស់អ្នក",
    namePh: "ឈ្មោះពេញ",
    emailLabel: "អ៊ីម៉ែល",
    emailPh: "អ្នក@gmail.com",
    passLabel: "ពាក្យសម្ងាត់",
    passPh: "••••••••",
    confLabel: "បញ្ជាក់ពាក្យសម្ងាត់",
    confPh: "••••••••",
    cta: "បង្កើតគណនី →",
    ctaLoading: "កំពុងបង្កើត...",
    backLabel: "← ត្រឡប់ទៅចូល",
    match: {
      ok: "✓ ពាក្យសម្ងាត់ត្រូវគ្នា",
      fail: "✗ ពាក្យសម្ងាត់មិនត្រូវគ្នា",
    },
    strength: { weak: "ខ្សោយ", fair: "មធ្យម", good: "ល្អ", strong: "រឹងមាំ" },
    errFill: "សូមបំពេញព័ត៌មានទាំងអស់",
    errMatch: "ពាក្យសម្ងាត់មិនត្រូវគ្នា",
    errFailed: "ការដំឡើងបានបរាជ័យ",
  },
};

function getStrength(pw, labels) {
  if (!pw) return { pct: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const configs = [
    { pct: 25, label: labels.weak, color: "#e05252" },
    { pct: 50, label: labels.fair, color: "#c08840" },
    { pct: 75, label: labels.good, color: "#6366f1" },
    { pct: 100, label: labels.strong, color: "#818cf8" },
  ];
  return configs[s - 1] || { pct: 0, label: "", color: "transparent" };
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
  const [banner, setBanner] = useState(null);
  const [dark, setDark] = useState(
    () => !document.documentElement.classList.contains("light"),
  );

  const tx = t[language] || t.en;
  const strength = getStrength(form.password, tx.strength);
  const passwordMatch = form.confirm ? form.confirm === form.password : null;

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
      setBanner({ type: "error", title: tx.errFill });
      return;
    }
    if (form.password !== form.confirm) {
      setBanner({ type: "error", title: tx.errMatch });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setBanner({ type: "error", title: err.message || tx.errFailed });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className={`rp${dark ? "" : " light"}`}>
        <div className="rp-ambient">
          <div className="rp-orb rp-orb-1" />
          <div className="rp-orb rp-orb-2" />
        </div>
        <div className="rp-dots" />

        {/* Controls */}
        <div className="rp-controls">
          {[
            ["en", "EN"],
            ["kh", "ខ្មែរ"],
          ].map(([code, label]) => (
            <button
              key={code}
              className={`rp-ctl-btn${language === code ? " on" : ""}`}
              onClick={() => setLanguage(code)}
            >
              {label}
            </button>
          ))}
          <div
            className="rp-ctl-icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {dark ? "☀️" : "🌙"}
          </div>
        </div>

        <div className="rp-card">
          {/* Brand */}
          <div className="rp-brand">
            <div className="rp-gem">💰</div>
            <div>
              <span className="rp-brand-name">MoneyTrack</span>
              <span className="rp-brand-sub">Personal Finance</span>
            </div>
          </div>

          {/* Header */}
          <div className="rp-tag">
            <span className="rp-tag-gem" />
            {tx.tag}
          </div>
          <h1 className="rp-title">
            {tx.title[0]}
            <br />
            <em>{tx.title[1]}</em>
          </h1>
          <p className="rp-sub">{tx.sub}</p>

          <div className="rp-sep" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="rp-field">
              <label className="rp-lbl">{tx.nameLabel}</label>
              <div className="rp-row">
                <span className="rp-ico">👤</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder={tx.namePh}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-lbl">{tx.emailLabel}</label>
              <div className="rp-row">
                <span className="rp-ico">✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder={tx.emailPh}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-lbl">{tx.passLabel}</label>
              <div className="rp-row">
                <span className="rp-ico">🔑</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder={tx.passPh}
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
                  <div className="rp-str-track">
                    <div
                      className="rp-str-fill"
                      style={{
                        width: strength.pct + "%",
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <div
                    className="rp-str-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            <div className="rp-field">
              <label className="rp-lbl">{tx.confLabel}</label>
              <div className="rp-row">
                <span className="rp-ico">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  placeholder={tx.confPh}
                  autoComplete="new-password"
                  style={
                    passwordMatch === false
                      ? {
                          borderColor: "rgba(224,82,82,0.5)",
                          boxShadow: "0 0 0 3px rgba(224,82,82,0.08)",
                        }
                      : passwordMatch === true
                        ? {
                            borderColor: "rgba(129,140,248,0.45)",
                            boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                          }
                        : {}
                  }
                />
              </div>
              {form.confirm && (
                <div
                  className="rp-match"
                  style={{ color: passwordMatch ? "#818cf8" : "#e05252" }}
                >
                  {passwordMatch ? tx.match.ok : tx.match.fail}
                </div>
              )}
            </div>

            <button type="submit" className="rp-cta" disabled={loading}>
              {loading ? (
                <>
                  <span className="rp-spin" />
                  {tx.ctaLoading}
                </>
              ) : (
                tx.cta
              )}
            </button>
          </form>

          <Link to="/login" className="rp-back">
            {tx.backLabel}
          </Link>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
