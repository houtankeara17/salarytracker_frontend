import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap');

  .lx-root *, .lx-root *::before, .lx-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  .lx-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Jost', sans-serif;
    background: #0a0a0a;
    position: relative;
    overflow: hidden;
  }

  /* ── full-bleed background texture ── */
  .lx-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 900px 700px at 15% 50%, rgba(99,102,241,0.09) 0%, transparent 60%),
      radial-gradient(ellipse 600px 600px at 90% 80%, rgba(129,140,248,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 400px 300px at 70% 10%, rgba(99,102,241,0.05) 0%, transparent 55%);
  }

  /* thin horizontal rule lines for texture */
  .lx-lines {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.012) 0px,
      rgba(255,255,255,0.012) 1px,
      transparent 1px,
      transparent 80px
    );
  }

  /* ── LEFT: big editorial typography ── */
  .lx-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 64px 52px 72px;
    position: relative; z-index: 1;
  }

  .lx-logo {
    display: flex; align-items: center; gap: 12px;
  }
  .lx-logo-mark {
    width: 36px; height: 36px;
    border: 1px solid rgba(99,102,241,0.5);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    position: relative;
  }
  .lx-logo-mark::after {
    content: '';
    position: absolute; inset: 3px;
    border-radius: 5px;
    background: rgba(99,102,241,0.08);
  }
  .lx-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 18px;
    color: rgba(245,238,220,0.9);
    letter-spacing: 0.5px;
  }

  .lx-hero {}
  .lx-hero-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase;
    color: #818cf8;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 24px;
  }
  .lx-hero-label::before {
    content: '';
    display: block; width: 32px; height: 1px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
  }

  .lx-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: clamp(52px, 6vw, 88px);
    line-height: 0.95;
    color: rgba(245,238,220,0.95);
    letter-spacing: -2px;
    margin-bottom: 32px;
  }
  .lx-hero-title em {
    font-style: italic;
    color: #818cf8;
    font-weight: 300;
  }
  .lx-hero-title strong {
    font-weight: 700;
    display: block;
  }

  .lx-hero-desc {
    font-size: 14px; font-weight: 300;
    color: rgba(245,238,220,0.35);
    line-height: 1.8; max-width: 320px;
  }

  .lx-left-footer {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; color: rgba(245,238,220,0.18);
    font-weight: 400;
  }
  .lx-left-footer span { color: rgba(245,238,220,0.12); }

  /* ── RIGHT: form panel ── */
  .lx-right {
    width: 480px; flex-shrink: 0;
    min-height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 60px 72px 60px 60px;
    position: relative; z-index: 1;
    border-left: 1px solid rgba(255,255,255,0.04);
  }
  .lx-right::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.015);
    pointer-events: none;
  }

  /* lang */
  .lx-lang { display: flex; gap: 6px; margin-bottom: 48px; justify-content: flex-end; }
  .lx-lang-btn {
    padding: 4px 11px; border-radius: 4px;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.5px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: rgba(255,255,255,0.3);
    cursor: pointer; transition: all 0.18s;
    font-family: 'Jost', sans-serif;
  }
  .lx-lang-btn:hover { border-color: rgba(99,102,241,0.4); color: rgba(129,140,248,0.8); }
  .lx-lang-btn.on {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.45);
    color: #818cf8;
  }

  /* form heading */
  .lx-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 32px;
    color: rgba(245,238,220,0.92);
    letter-spacing: -0.3px; margin-bottom: 6px;
  }
  .lx-form-sub {
    font-size: 13px; font-weight: 300;
    color: rgba(245,238,220,0.32);
    margin-bottom: 40px;
  }

  /* underline input */
  .lx-field { position: relative; margin-bottom: 28px; }
  .lx-field input {
    width: 100%; padding: 10px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    color: rgba(245,238,220,0.9);
    font-size: 15px; font-family: 'Jost', sans-serif;
    font-weight: 400; outline: none;
    transition: border-color 0.2s;
    caret-color: #818cf8;
  }
  .lx-field input::placeholder { color: transparent; }
  .lx-field input:focus { border-bottom-color: #818cf8; }

  .lx-field label {
    position: absolute; left: 0; top: 10px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    color: rgba(245,238,220,0.28);
    pointer-events: none; transition: all 0.2s;
  }
  .lx-field input:focus + label,
  .lx-field input:not(:placeholder-shown) + label {
    top: -14px; font-size: 9.5px; letter-spacing: 2.5px;
    color: #818cf8;
  }

  /* underline glow on focus */
  .lx-field::after {
    content: '';
    position: absolute; bottom: 0; left: 0;
    width: 0; height: 1px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .lx-field:focus-within::after { width: 100%; }

  .lx-eye {
    position: absolute; right: 0; top: 8px;
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: rgba(245,238,220,0.25);
    transition: color 0.18s;
  }
  .lx-eye:hover { color: rgba(245,238,220,0.6); }

  /* remember */
  .lx-check { display: flex; align-items: center; gap: 9px; margin-bottom: 36px; }
  .lx-check-box {
    width: 15px; height: 15px; flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 3px; cursor: pointer;
    accent-color: #818cf8;
  }
  .lx-check label { font-size: 12px; font-weight: 400; color: rgba(245,238,220,0.32); cursor: pointer; user-select: none; }

  /* submit */
  .lx-btn {
    width: 100%; padding: 15px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: #fff;
    font-family: 'Jost', sans-serif;
    font-weight: 600; font-size: 12px;
    letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    position: relative; overflow: hidden;
  }
  .lx-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  }
  .lx-btn:active:not(:disabled) { transform: translateY(0); }
  .lx-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .lx-btn-inner { position: relative; z-index: 1; }

  /* divider */
  .lx-divider {
    display: flex; align-items: center; gap: 16px;
    margin: 28px 0;
  }
  .lx-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .lx-divider-txt { font-size: 10px; letter-spacing: 2px; color: rgba(245,238,220,0.2); text-transform: uppercase; }

  /* social */
  .lx-socials { display: flex; gap: 10px; }
  .lx-social {
    flex: 1; padding: 11px 8px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    background: transparent;
    color: rgba(245,238,220,0.4);
    font-size: 12px; font-weight: 500;
    font-family: 'Jost', sans-serif;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .lx-social:hover {
    border-color: rgba(99,102,241,0.3);
    color: rgba(245,238,220,0.75);
    background: rgba(99,102,241,0.06);
  }

  /* footer */
  .lx-form-footer {
    margin-top: 32px; text-align: center;
    font-size: 12.5px; color: rgba(245,238,220,0.25);
  }
  .lx-form-footer a {
    color: #818cf8; text-decoration: none; font-weight: 500;
    transition: color 0.18s;
  }
  .lx-form-footer a:hover { color: #a5b4fc; }

  @keyframes lx-spin { to { transform: rotate(360deg); } }
  .lx-spinner {
    display: inline-block; width: 12px; height: 12px;
    border: 1.5px solid rgba(99,102,241,0.3);
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: lx-spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }

  @media (max-width: 900px) {
    .lx-root { flex-direction: column; }
    .lx-left { padding: 44px 32px 40px; }
    .lx-hero-title { font-size: 52px; }
    .lx-right { width: 100%; min-height: auto; padding: 40px 32px 60px; border-left: none; border-top: 1px solid rgba(255,255,255,0.04); }
    .lx-lang { justify-content: flex-start; }
  }
`;

const GIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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
  const kh = language === "kh";

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
        title: kh
          ? "ចុះឈ្មោះដោយជោគជ័យ! សូមចូលប្រើប្រាស់"
          : "Registered! Please sign in",
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

  return (
    <>
      <style>{css}</style>
      <div className="lx-root">
        <div className="lx-bg" />
        <div className="lx-lines" />

        {/* ── LEFT ── */}
        <div className="lx-left">
          <div className="lx-logo">
            <div className="lx-logo-mark">💰</div>
            <span className="lx-logo-name">MoneyTrack</span>
          </div>

          <div className="lx-hero">
            <div className="lx-hero-label">
              {kh ? "ហិរញ្ញវត្ថុ" : "Personal Finance"}
            </div>
            <h1 className="lx-hero-title">
              {kh ? (
                <>
                  គ្រប់
                  <br />
                  <em>គ្រង</em>
                  <br />
                  <strong>ប្រាក់</strong>
                </>
              ) : (
                <>
                  Your
                  <br />
                  <em>wealth,</em>
                  <br />
                  <strong>refined.</strong>
                </>
              )}
            </h1>
            <p className="lx-hero-desc">
              {kh
                ? "តាមដានចំណូលចំណាយ ត្រួតពិនិត្យថវិការបស់អ្នក និងឈានទៅរកសេរីភាពហិរញ្ញវត្ថុ"
                : "Elegant financial tracking for those who believe that knowing where every dollar goes is the foundation of true freedom."}
            </p>
          </div>

          <div className="lx-left-footer">
            <span>© 2025 MoneyTrack</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="lx-right">
          <div className="lx-lang">
            {[
              ["en", "EN"],
              ["kh", "ខ្មែរ"],
            ].map(([c, l]) => (
              <button
                key={c}
                className={`lx-lang-btn${language === c ? " on" : ""}`}
                onClick={() => setLanguage(c)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="lx-form-title">
            {kh ? "ចូលប្រើប្រាស់" : "Sign in"}
          </div>
          <p className="lx-form-sub">
            {kh
              ? "ចូលប្រើប្រាស់គណនីរបស់អ្នក"
              : "Welcome back — your dashboard awaits"}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="lx-field">
              <input
                type="email"
                id="lx-email"
                placeholder="e"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                autoComplete="email"
              />
              <label htmlFor="lx-email">
                {kh ? "អ៊ីម៉ែល" : "Email address"}
              </label>
            </div>

            <div className="lx-field">
              <input
                type={showPass ? "text" : "password"}
                id="lx-pass"
                placeholder="p"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                autoComplete="current-password"
              />
              <label htmlFor="lx-pass">
                {kh ? "ពាក្យសម្ងាត់" : "Password"}
              </label>
              <button
                type="button"
                className="lx-eye"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="lx-check">
              <input
                type="checkbox"
                className="lx-check-box"
                id="lx-rem"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="lx-rem">
                {kh ? "ចងចាំខ្ញុំ" : "Keep me signed in"}
              </label>
            </div>

            <button type="submit" className="lx-btn" disabled={loading}>
              <span className="lx-btn-inner">
                {loading ? (
                  <>
                    <span className="lx-spinner" />
                    {kh ? "កំពុងចូល..." : "Signing in..."}
                  </>
                ) : kh ? (
                  "ចូលប្រើប្រាស់"
                ) : (
                  "Sign in"
                )}
              </span>
            </button>
          </form>

          <div className="lx-divider">
            <div className="lx-divider-line" />
            <span className="lx-divider-txt">{kh ? "ឬ" : "or"}</span>
            <div className="lx-divider-line" />
          </div>

          <div className="lx-socials">
            <button className="lx-social">
              <GIcon /> Google
            </button>
            <button className="lx-social">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.929.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="lx-form-footer">
            {kh ? "មិនទាន់មានគណនី?" : "No account yet?"}{" "}
            <Link to="/register">
              {kh ? "ចុះឈ្មោះឥតគិតថ្លៃ" : "Create one for free"}
            </Link>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
