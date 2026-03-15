import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap');

  .rx-root *, .rx-root *::before, .rx-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  .rx-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Jost', sans-serif;
    background: #0a0a0a;
    position: relative;
    overflow: hidden;
  }

  .rx-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 900px 700px at 85% 50%, rgba(99,102,241,0.09) 0%, transparent 60%),
      radial-gradient(ellipse 500px 500px at 10% 80%, rgba(129,140,248,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 400px 300px at 30% 10%, rgba(99,102,241,0.05) 0%, transparent 55%);
  }

  .rx-lines {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.012) 0px,
      rgba(255,255,255,0.012) 1px,
      transparent 1px,
      transparent 80px
    );
  }

  /* ── LEFT: form panel ── */
  .rx-left {
    width: 500px; flex-shrink: 0;
    min-height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 60px 60px 60px 72px;
    position: relative; z-index: 1;
    border-right: 1px solid rgba(255,255,255,0.04);
  }
  .rx-left::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.015);
    pointer-events: none;
  }

  /* lang */
  .rx-lang { display: flex; gap: 6px; margin-bottom: 44px; }
  .rx-lang-btn {
    padding: 4px 11px; border-radius: 4px;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.5px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: rgba(255,255,255,0.3);
    cursor: pointer; transition: all 0.18s;
    font-family: 'Jost', sans-serif;
  }
  .rx-lang-btn:hover { border-color: rgba(99,102,241,0.4); color: rgba(129,140,248,0.8); }
  .rx-lang-btn.on {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.45);
    color: #818cf8;
  }

  .rx-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 32px;
    color: rgba(245,238,220,0.92);
    letter-spacing: -0.3px; margin-bottom: 6px;
  }
  .rx-form-sub {
    font-size: 13px; font-weight: 300;
    color: rgba(245,238,220,0.3);
    margin-bottom: 36px;
  }

  /* two-col row */
  .rx-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  /* underline input */
  .rx-field { position: relative; margin-bottom: 28px; }
  .rx-field.no-mb { margin-bottom: 0; }
  .rx-field input {
    width: 100%; padding: 10px 32px 10px 0;
    background: transparent; border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    color: rgba(245,238,220,0.9);
    font-size: 15px; font-family: 'Jost', sans-serif;
    font-weight: 400; outline: none;
    transition: border-color 0.2s;
    caret-color: #C5A04C;
  }
  .rx-field input::placeholder { color: transparent; }
  .rx-field input:focus { border-bottom-color: #6366f1; }

  .rx-field label {
    position: absolute; left: 0; top: 10px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    color: rgba(245,238,220,0.25);
    pointer-events: none; transition: all 0.2s;
  }
  .rx-field input:focus + label,
  .rx-field input:not(:placeholder-shown) + label {
    top: -14px; font-size: 9.5px; letter-spacing: 2.5px;
    color: #818cf8;
  }

  .rx-field::after {
    content: '';
    position: absolute; bottom: 0; left: 0;
    width: 0; height: 1px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .rx-field:focus-within::after { width: 100%; }

  .rx-eye {
    position: absolute; right: 0; top: 8px;
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: rgba(245,238,220,0.22);
    transition: color 0.18s;
  }
  .rx-eye:hover { color: rgba(245,238,220,0.55); }

  /* strength */
  .rx-strength { display: flex; gap: 5px; margin: -16px 0 24px; }
  .rx-sb { height: 2px; flex: 1; border-radius: 1px; background: rgba(255,255,255,0.07); transition: background 0.3s; }

  /* submit */
  .rx-btn {
    width: 100%; padding: 15px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: #fff;
    font-family: 'Jost', sans-serif;
    font-weight: 600; font-size: 12px;
    letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    position: relative; overflow: hidden;
    margin-top: 8px;
  }
  .rx-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  }
  .rx-btn:active:not(:disabled) { transform: translateY(0); }
  .rx-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .rx-btn-inner { position: relative; z-index: 1; }

  .rx-form-footer {
    margin-top: 28px; text-align: center;
    font-size: 12.5px; color: rgba(245,238,220,0.25);
  }
  .rx-form-footer a {
    color: #818cf8; text-decoration: none; font-weight: 500;
    transition: color 0.18s;
  }
  .rx-form-footer a:hover { color: #a5b4fc; }

  @keyframes rx-spin { to { transform: rotate(360deg); } }
  .rx-spinner {
    display: inline-block; width: 12px; height: 12px;
    border: 1.5px solid rgba(129,140,248,0.3);
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: rx-spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }

  /* ── RIGHT: editorial panel ── */
  .rx-right {
    flex: 1;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 52px 72px 52px 64px;
    position: relative; z-index: 1;
  }

  .rx-logo { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
  .rx-logo-mark {
    width: 36px; height: 36px;
    border: 1px solid rgba(99,102,241,0.5);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; position: relative;
  }
  .rx-logo-mark::after {
    content: ''; position: absolute; inset: 3px;
    border-radius: 5px; background: rgba(99,102,241,0.08);
  }
  .rx-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 18px;
    color: rgba(245,238,220,0.9); letter-spacing: 0.5px;
  }

  .rx-hero {}
  .rx-hero-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase;
    color: #818cf8;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 24px; justify-content: flex-end;
  }
  .rx-hero-label::after {
    content: ''; display: block; width: 32px; height: 1px; background: #818cf8;
  }

  .rx-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: clamp(48px, 5.5vw, 80px);
    line-height: 0.95;
    color: rgba(245,238,220,0.92);
    letter-spacing: -2px;
    margin-bottom: 32px;
    text-align: right;
  }
  .rx-hero-title em { font-style: italic; color: #818cf8; font-weight: 300; }
  .rx-hero-title strong { font-weight: 700; display: block; }

  .rx-hero-desc {
    font-size: 14px; font-weight: 300;
    color: rgba(245,238,220,0.32);
    line-height: 1.8; max-width: 300px;
    text-align: right; margin-left: auto;
  }

  /* feature pills */
  .rx-features { display: flex; flex-direction: column; gap: 14px; align-items: flex-end; }
  .rx-feature {
    display: flex; align-items: center; gap: 12px;
  }
  .rx-feature-icon {
    width: 28px; height: 28px;
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    background: rgba(99,102,241,0.07);
  }
  .rx-feature-txt {
    font-size: 12.5px; font-weight: 400;
    color: rgba(245,238,220,0.32);
  }

  .rx-right-footer {
    display: flex; align-items: center; gap: 8px; justify-content: flex-end;
    font-size: 11px; color: rgba(245,238,220,0.18);
  }
  .rx-right-footer span { color: rgba(245,238,220,0.1); }

  @media (max-width: 960px) {
    .rx-root { flex-direction: column-reverse; }
    .rx-left { width: 100%; min-height: auto; padding: 40px 32px 52px; border-right: none; border-top: 1px solid rgba(255,255,255,0.04); }
    .rx-right { padding: 44px 32px 40px; }
    .rx-hero-title, .rx-hero-desc, .rx-hero-label, .rx-features { text-align: left; justify-content: flex-start; margin-left: 0; }
    .rx-hero-label { justify-content: flex-start; }
    .rx-hero-label::after { display: none; }
    .rx-hero-label::before { content: ''; display: block; width: 32px; height: 1px; background: #818cf8; }
    .rx-logo { justify-content: flex-start; }
    .rx-features { align-items: flex-start; }
    .rx-row { grid-template-columns: 1fr; gap: 0; }
    .rx-row .rx-field.no-mb { margin-bottom: 28px; }
  }
`;

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 4) s = 1;
  if (pw.length >= 6) s = 2;
  if (pw.length >= 8 && /[A-Z]/.test(pw)) s = 3;
  if (s >= 3 && /[0-9!@#$%]/.test(pw)) s = 4;
  return s;
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
  const kh = language === "kh";

  const s = getStrength(form.password);
  const sbColor = s <= 1 ? "#b45c5c" : s <= 2 ? "#b8963c" : "#C5A04C";

  const features = kh
    ? [
        ["📊", "ការវិភាគចំណាយភ្លាមៗ"],
        ["🎯", "គ្រប់គ្រងថវិការប្រចាំខែ"],
        ["🔒", "ទិន្នន័យរបស់អ្នកត្រូវបានការពារ"],
      ]
    : [
        ["📊", "Real-time spending analytics"],
        ["🎯", "Monthly budget management"],
        ["🔒", "Your data, always encrypted"],
      ];

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
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
    if (form.password.length < 6) {
      setBanner({
        type: "error",
        title: kh
          ? "ពាក្យសម្ងាត់ត្រូវតែមាន ៦ តួឬច្រើន"
          : "Password must be at least 6 characters",
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
          err.message || (kh ? "ការចុះឈ្មោះបរាជ័យ" : "Registration failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="rx-root">
        <div className="rx-bg" />
        <div className="rx-lines" />

        {/* ── LEFT: FORM ── */}
        <div className="rx-left">
          <div className="rx-lang">
            {[
              ["en", "EN"],
              ["kh", "ខ្មែរ"],
            ].map(([c, l]) => (
              <button
                key={c}
                className={`rx-lang-btn${language === c ? " on" : ""}`}
                onClick={() => setLanguage(c)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="rx-form-title">
            {kh ? "បង្កើតគណនី" : "Create account"}
          </div>
          <p className="rx-form-sub">
            {kh
              ? "ចាប់ផ្ដើមតាមដានប្រាក់របស់អ្នកថ្ងៃនេះ"
              : "Begin your journey to financial clarity"}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="rx-row" style={{ marginBottom: 28 }}>
              <div className="rx-field no-mb">
                <input
                  type="text"
                  id="rx-name"
                  placeholder="n"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <label htmlFor="rx-name">{kh ? "ឈ្មោះ" : "Full name"}</label>
              </div>
              <div className="rx-field no-mb">
                <input
                  type="email"
                  id="rx-email"
                  placeholder="e"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <label htmlFor="rx-email">{kh ? "អ៊ីម៉ែល" : "Email"}</label>
              </div>
            </div>

            <div className="rx-field">
              <input
                type={showPass ? "text" : "password"}
                id="rx-pass"
                placeholder="p"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <label htmlFor="rx-pass">
                {kh ? "ពាក្យសម្ងាត់" : "Password"}
              </label>
              <button
                type="button"
                className="rx-eye"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            {form.password && (
              <div className="rx-strength">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rx-sb"
                    style={{ background: i <= s ? sbColor : "" }}
                  />
                ))}
              </div>
            )}

            <div className="rx-field">
              <input
                type={showPass ? "text" : "password"}
                id="rx-conf"
                placeholder="c"
                value={form.confirm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirm: e.target.value }))
                }
              />
              <label htmlFor="rx-conf">
                {kh ? "បញ្ជាក់ពាក្យសម្ងាត់" : "Confirm password"}
              </label>
            </div>

            <button type="submit" className="rx-btn" disabled={loading}>
              <span className="rx-btn-inner">
                {loading ? (
                  <>
                    <span className="rx-spinner" />
                    {kh ? "កំពុងចុះឈ្មោះ..." : "Creating account..."}
                  </>
                ) : kh ? (
                  "ចុះឈ្មោះ"
                ) : (
                  "Create account"
                )}
              </span>
            </button>
          </form>

          <div className="rx-form-footer">
            {kh ? "មានគណនីហើយ?" : "Already have an account?"}{" "}
            <Link to="/login">{kh ? "ចូលប្រើប្រាស់" : "Sign in"}</Link>
          </div>
        </div>

        {/* ── RIGHT: EDITORIAL ── */}
        <div className="rx-right">
          <div className="rx-logo">
            <span className="rx-logo-name">MoneyTrack</span>
            <div className="rx-logo-mark">💰</div>
          </div>

          <div className="rx-hero">
            <div className="rx-hero-label">
              {kh ? "ហិរញ្ញវត្ថុ" : "Personal Finance"}
            </div>
            <h1 className="rx-hero-title">
              {kh ? (
                <>
                  <em>ចាប់ផ្ដើម</em>
                  <br />
                  <strong>ថ្ងៃនេះ</strong>
                </>
              ) : (
                <>
                  <em>Begin</em>
                  <br />
                  <strong>today.</strong>
                </>
              )}
            </h1>
            <p className="rx-hero-desc">
              {kh
                ? "ទីកន្លែងតែមួយគត់ដើម្បីតាមដានចំណូល និងចំណាយរបស់អ្នក"
                : "Your personal space to track income, expenses, and stay on top of every dollar."}
            </p>
          </div>

          <div className="rx-features">
            {features.map(([icon, txt]) => (
              <div className="rx-feature" key={txt}>
                <span className="rx-feature-txt">{txt}</span>
                <div className="rx-feature-icon">{icon}</div>
              </div>
            ))}
          </div>

          <div className="rx-right-footer">
            <span>© 2025 MoneyTrack</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
