// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StatusBanner from "../components/StatusBanner";

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
  const [banner, setBanner] = useState(null); // ✅ banner state

  const kh = language === "kh";

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
          ? "ពាក្យសម្ងាត់ត្រូវតែមានចំនួន ៦ ឬច្រើនជាង"
          : "Password must be at least 6 characters",
      });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login", { state: { justRegistered: true } }); // ← was navigate("/dashboard")
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
                background: "linear-gradient(135deg,#10b981,#059669)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}
            >
              🌱
            </div>
            <h1
              className="font-display font-bold text-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              {kh ? "ចុះឈ្មោះ" : "Create Account"}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {kh
                ? "ចាប់ផ្ដើមតាមដានប្រាក់កំហុសរបស់អ្នក"
                : "Start tracking your money today"}
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
              <label className="form-label">{kh ? "ឈ្មោះ" : "Full Name"}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="form-input"
                placeholder={kh ? "ឈ្មោះរបស់អ្នក..." : "Your name..."}
              />
            </div>
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
                  placeholder={kh ? "ពាក្យសម្ងាត់..." : "Min 6 characters..."}
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
            <div>
              <label className="form-label">
                {kh ? "បញ្ជាក់ពាក្យសម្ងាត់" : "Confirm Password"}
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={form.confirm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirm: e.target.value }))
                }
                className="form-input"
                placeholder={kh ? "បញ្ជាក់ម្ដងទៀត..." : "Confirm password..."}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full justify-center py-3 text-base"
              disabled={loading}
            >
              {loading
                ? kh
                  ? "កំពុងចុះឈ្មោះ..."
                  : "Creating account..."
                : kh
                  ? "ចុះឈ្មោះ"
                  : "Create Account"}
            </button>
          </form>

          <div
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {kh ? "មានគណនីហើយ?" : "Already have an account?"}{" "}
            <Link
              to="/login"
              className="font-bold"
              style={{ color: "#6366f1" }}
            >
              {kh ? "ចូលប្រើប្រាស់" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </div>
  );
}
