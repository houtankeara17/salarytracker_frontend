// src/components/layout/Layout.js
// ✅ FloatingCalculator added — it persists across ALL pages
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/khmerUtils";
import FloatingCalculator from "../FloatingCalculator"; // 👈 import

const navItems = [
  { path: "/dashboard", icon: "📊", key: "dashboard" },
  { path: "/expenses", icon: "💸", key: "expenses" },
  { path: "/salary", icon: "💰", key: "salary" },
  { path: "/savings", icon: "🏦", key: "savings" },
  { path: "/trips", icon: "✈️", key: "trips" },
  { path: "/goals", icon: "🎯", key: "goals" },
  { path: "/givings", icon: "🤝", key: "givings" },
  { path: "/others", icon: "📦", key: "others" },
  { path: "/notes", icon: "📝", key: "notes" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, theme, setTheme, language, setLanguage, currency, setCurrency } =
    useApp();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-primary)" }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--card-bg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="p-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b0764)" }}
          >
            💰
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-display font-bold text-base truncate"
              style={{ color: "var(--text-primary)" }}
            >
              MoneyTrack
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {user?.name || "User"}
            </div>
          </div>
          <button
            className="ml-auto lg:hidden btn btn-ghost p-1"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="truncate">{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings bottom */}
        <div
          className="p-4 space-y-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Theme */}
          <div>
            <div className="form-label mb-1.5">{t("theme")}</div>
            <div className="flex gap-1">
              {["light", "dark", "system"].map((m) => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === m ? "dash-add-btn text-white" : "btn-secondary"
                  }`}
                >
                  {m === "light" ? "☀️" : m === "dark" ? "🌙" : "⚙️"}
                </button>
              ))}
            </div>
          </div>
          {/* Language */}
          <div>
            <div className="form-label mb-1.5">{t("language")}</div>
            <div className="flex gap-1">
              {[
                ["en", "🇺🇸 EN"],
                ["kh", "🇰🇭 ខ្មែរ"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === code
                      ? "dash-add-btn text-white"
                      : "btn-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Currency */}
          <div>
            <div className="form-label mb-1.5">{t("currency")}</div>
            <div className="flex gap-1">
              {[
                ["USD", "$ USD"],
                ["KHR", "៛ KHR"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currency === code
                      ? "dash-add-btn text-white"
                      : "btn-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Logout */}
          <button
            className="btn btn-secondary w-full justify-center text-xs py-2 mt-1"
            onClick={logout}
          >
            🚪 {t("logout")}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{
            background: "var(--card-bg)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            className="lg:hidden btn btn-ghost p-2 text-xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {formatDate(new Date(), language, "full")}
            </div>
          </div>
          {/* User badge */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl transition"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#3b0764)",
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span
                  className="hidden sm:block text-xs font-semibold truncate max-w-24"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.name}
                </span>
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg p-2 space-y-1 z-50"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <NavLink
                    to="/profile"
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setShowMenu(false)}
                  >
                    👤 Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </div>

      {/* ── Floating Calculator — persists across ALL pages 🧮 ── */}
      <FloatingCalculator />
    </div>
  );
}
