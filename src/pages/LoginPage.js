import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

export default function LoginPage() {
  const { login } = useAuth();
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // ✅ added
  const [banner, setBanner] = useState(null); // ✅ banner state
  const location = useLocation();
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
      console.log("handleSubmit called");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, rememberMe);
      navigate("/dashboard", { state: { justLoggedIn: true } }); // ← pass state
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}
        />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="flex justify-end mb-4 gap-2">
          {[
            ["en", "🇺🇸 EN"],
            ["kh", "🇰🇭 ខ្មែរ"],
          ].map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`btn py-1.5 px-3 text-xs ${language === code ? "btn-primary" : "btn-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
              }}
            >
              💰
            </div>
            <h1
              className="font-display font-bold text-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              MoneyTrack
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {kh ? "ចូលប្រើប្រាស់គណនីរបស់អ្នក" : "Sign in to your account"}
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="form-label">{kh ? "អ៊ីម៉ែល" : "Email"}</label>
              <input
                type="email" // ← was type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="form-input"
                placeholder={kh ? "អ៊ីម៉ែលរបស់អ្នក..." : "your@email.com"}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">
                {kh ? "ពាក្យសម្ងាត់" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="form-input pr-10"
                  placeholder={kh ? "ពាក្យសម្ងាត់..." : "Password..."}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ✅ Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 cursor-pointer rounded"
                style={{ accentColor: "#6366f1" }}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm cursor-pointer select-none"
                style={{ color: "var(--text-secondary)" }}
              >
                {kh ? "ចងចាំខ្ញុំ" : "Remember me"}
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center py-3 text-base"
              disabled={loading}
            >
              {loading
                ? kh
                  ? "កំពុងចូល..."
                  : "Signing in..."
                : kh
                  ? "ចូលប្រើប្រាស់"
                  : "Sign In"}
            </button>
          </form>

          <div
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {kh ? "មិនទាន់មានគណនី?" : "Don't have an account?"}{" "}
            <Link
              to="/register"
              className="font-bold"
              style={{ color: "#6366f1" }}
            >
              {kh ? "ចុះឈ្មោះ" : "Register"}
            </Link>
          </div>
        </div>
      </div>
      {/* ✅ Status Banner */}
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </div>
  );
}
