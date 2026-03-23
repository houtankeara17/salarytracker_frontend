// src/components/layout/Layout.js
// ✨ Modern sidebar redesign — dark glass, editorial typography, fluid micro-interactions
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/khmerUtils";
import FloatingCalculator from "../FloatingCalculator";
import StatusBanner from "../StatusBanner";
import { useNavigate } from "react-router-dom";

const navItems = [
  { path: "/dashboard", icon: "📊", key: "dashboard", color: "#7C6BFF" },
  { path: "/expenses", icon: "💸", key: "expenses", color: "#FF6B9D" },
  { path: "/salary", icon: "💰", key: "salary", color: "#00D4AA" },
  { path: "/bonus", icon: "🎁", key: "bonus", color: "#f59e0b" },
  { path: "/savings", icon: "🏦", key: "savings", color: "#FFB547" },
  { path: "/trips", icon: "✈️", key: "trips", color: "#60CFFF" },
  { path: "/goals", icon: "🎯", key: "goals", color: "#FF8C6B" },
  { path: "/givings", icon: "🤝", key: "givings", color: "#A78BFA" },
  { path: "/others", icon: "📦", key: "others", color: "#94A3B8" },
  { path: "/notes", icon: "📝", key: "notes", color: "#34D399" },
];

const SIDEBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&display=swap');

:root {
  --sb-bg:          #09090F;
  --sb-surface:     #111118;
  --sb-surface-2:   #16161F;
  --sb-border:      rgba(255,255,255,0.07);
  --sb-border-md:   rgba(255,255,255,0.12);
  --sb-text-1:      #EEEEFF;
  --sb-text-2:      #7E7A9A;
  --sb-text-3:      #3A384A;
  --sb-accent:      #7C6BFF;
  --sb-accent-soft: rgba(124,107,255,0.1);
  --sb-accent-glow: rgba(124,107,255,0.2);
  --sb-font-ui:     'Syne', system-ui, sans-serif;
  --sb-font-display:'Fraunces', Georgia, serif;
  --sb-font-mono:   'DM Mono', monospace;
  --sb-radius:      14px;
  --sb-radius-sm:   9px;
  --sb-transition:  0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Sidebar shell ── */
.sb-shell {
  width: 240px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
  border-right: 1px solid var(--sb-border);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  overflow: hidden;
  font-family: var(--sb-font-ui);
  z-index: 50;
}

/* Push main content right on desktop */
@media (min-width: 1024px) {
  .sb-main-wrapper {
    margin-left: 240px;
  }
}

/* Ambient orb */
.sb-shell::before {
  content: '';
  position: absolute;
  top: -100px; left: -80px;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(124,107,255,0.07) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}

/* ── Logo area ── */
.sb-logo {
  padding: 20px 18px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--sb-border);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.sb-logo-mark {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #7C6BFF 0%, #3B0764 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(124,107,255,0.35);
  transition: transform var(--sb-transition), box-shadow var(--sb-transition);
}
.sb-logo-mark:hover {
  transform: scale(1.06) rotate(-3deg);
  box-shadow: 0 6px 24px rgba(124,107,255,0.5);
}
.sb-logo-name {
  font-family: var(--sb-font-display);
  font-size: 17px; font-weight: 400;
  font-style: italic;
  color: var(--sb-text-1);
  line-height: 1;
  letter-spacing: -0.01em;
}
.sb-logo-user {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--sb-text-3);
  margin-top: 3px;
  text-transform: uppercase;
  font-family: var(--sb-font-ui);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-close-btn {
  margin-left: auto;
  width: 28px; height: 28px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--sb-border);
  color: var(--sb-text-2);
  cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--sb-transition);
}
.sb-close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: var(--sb-text-1);
  transform: rotate(90deg);
}
@media (min-width: 1024px) {
  .sb-close-btn { display: none; }
}

/* ── Nav section label ── */
.sb-section-label {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--sb-text-3);
  padding: 14px 18px 6px;
  font-family: var(--sb-font-ui);
}

/* ── Nav items ── */
.sb-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  position: relative; z-index: 1;
}
.sb-nav::-webkit-scrollbar { width: 0; }

.sb-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px;
  border-radius: var(--sb-radius-sm);
  text-decoration: none;
  cursor: pointer;
  position: relative; overflow: hidden;
  transition: all var(--sb-transition);
  margin-bottom: 1px;
  border: 1px solid transparent;
}
.sb-link::before {
  content: '';
  position: absolute; inset: 0;
  background: var(--link-color, var(--sb-accent));
  opacity: 0;
  transition: opacity var(--sb-transition);
  border-radius: var(--sb-radius-sm);
}
.sb-link:hover::before { opacity: 0.07; }
.sb-link:hover {
  border-color: var(--sb-border);
}
.sb-link.active {
  background: var(--sb-accent-soft);
  border-color: rgba(124,107,255,0.2);
}
.sb-link.active::before { opacity: 0; }

/* Active left pip */
.sb-link.active::after {
  content: '';
  position: absolute; left: 0; top: 25%; bottom: 25%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: var(--link-color, var(--sb-accent));
  box-shadow: 0 0 8px var(--link-color, var(--sb-accent));
}

.sb-link-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--sb-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
  transition: all var(--sb-transition);
}
.sb-link:hover .sb-link-icon {
  background: rgba(255,255,255,0.07);
  border-color: var(--sb-border-md);
  transform: scale(1.08);
}
.sb-link.active .sb-link-icon {
  background: var(--sb-accent-soft);
  border-color: rgba(124,107,255,0.25);
  box-shadow: 0 0 10px var(--sb-accent-glow);
}
.sb-link-label {
  font-size: 12px; font-weight: 600;
  color: var(--sb-text-2);
  letter-spacing: 0.01em;
  transition: color var(--sb-transition);
  white-space: nowrap;
}
.sb-link:hover .sb-link-label { color: var(--sb-text-1); }
.sb-link.active .sb-link-label { color: var(--sb-text-1); }

/* Stagger entrance */
.sb-link { animation: sb-in 0.3s ease both; }
.sb-link:nth-child(1)  { animation-delay: 0.04s }
.sb-link:nth-child(2)  { animation-delay: 0.07s }
.sb-link:nth-child(3)  { animation-delay: 0.10s }
.sb-link:nth-child(4)  { animation-delay: 0.13s }
.sb-link:nth-child(5)  { animation-delay: 0.16s }
.sb-link:nth-child(6)  { animation-delay: 0.19s }
.sb-link:nth-child(7)  { animation-delay: 0.22s }
.sb-link:nth-child(8)  { animation-delay: 0.25s }
.sb-link:nth-child(9)  { animation-delay: 0.28s }
@keyframes sb-in {
  from { opacity: 0; transform: translateX(-10px) }
  to   { opacity: 1; transform: translateX(0) }
}

/* ── Settings panel ── */
.sb-footer {
  padding: 12px 12px 16px;
  border-top: 1px solid var(--sb-border);
  position: relative; z-index: 1;
  flex-shrink: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.sb-setting-group {
  display: flex; flex-direction: column; gap: 5px;
}
.sb-setting-label {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--sb-text-3);
  padding-left: 2px;
}
.sb-pill-group {
  display: flex; gap: 3px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--sb-border);
  border-radius: var(--sb-radius-sm);
  padding: 3px;
}
.sb-pill {
  flex: 1; padding: 5px 4px;
  border-radius: 6px;
  font-size: 10px; font-weight: 700;
  cursor: pointer; transition: all var(--sb-transition);
  border: none; background: transparent;
  color: var(--sb-text-3);
  font-family: var(--sb-font-ui);
  white-space: nowrap; text-align: center;
}
.sb-pill:hover { color: var(--sb-text-2); background: rgba(255,255,255,0.04); }
.sb-pill.on {
  background: var(--sb-accent-soft);
  color: var(--sb-text-1);
  border: 1px solid rgba(124,107,255,0.25);
  box-shadow: 0 0 8px var(--sb-accent-glow);
}

/* Logout */
.sb-logout {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 8px 12px;
  border-radius: var(--sb-radius-sm);
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--sb-border);
  color: var(--sb-text-2);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer; transition: all var(--sb-transition);
  font-family: var(--sb-font-ui);
}
.sb-logout:hover {
  background: rgba(255,80,80,0.08);
  border-color: rgba(255,80,80,0.2);
  color: #FF7070;
}

/* ── Topbar ── */
.sb-topbar {
  height: 56px;
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 30;
}
.sb-topbar-date {
  font-size: 11px; color: var(--text-secondary);
  font-family: var(--sb-font-mono);
  letter-spacing: 0.02em;
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sb-hamburger {
  width: 34px; height: 34px;
  border-radius: 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--sb-transition);
}
.sb-hamburger:hover {
  background: rgba(255,255,255,0.08);
  color: var(--text-primary);
}
@media (min-width: 1024px) {
  .sb-hamburger { display: none; }
}

/* User badge */
.sb-user-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 10px 5px 5px;
  border-radius: 40px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--sb-transition);
}
.sb-user-btn:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.12);
}
.sb-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C6BFF, #3B0764);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  flex-shrink: 0; overflow: hidden;
}
.sb-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sb-user-name {
  font-size: 11px; font-weight: 700;
  color: var(--text-primary);
  max-width: 80px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  font-family: var(--sb-font-ui);
}

/* Dropdown */
.sb-dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  width: 160px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--sb-radius);
  box-shadow: 0 16px 48px rgba(0,0,0,0.3);
  padding: 6px;
  z-index: 50;
  animation: sb-drop 0.18s cubic-bezier(0.22,1,0.36,1);
}
@keyframes sb-drop {
  from { opacity: 0; transform: translateY(-8px) scale(0.97) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}
.sb-drop-item {
  display: block; width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px; font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer; border: none; background: none; text-align: left;
  font-family: var(--sb-font-ui);
  transition: background var(--sb-transition);
}
.sb-drop-item:hover { background: rgba(255,255,255,0.06); }
.sb-drop-divider {
  height: 1px; background: var(--border); margin: 4px 0;
}

/* Mobile overlay */
.sb-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
  z-index: 40;
  animation: sb-fade 0.2s ease;
}
@keyframes sb-fade { from { opacity: 0 } to { opacity: 1 } }
`;

let _sb_css = false;
function injectSBCSS() {
  if (_sb_css) return;
  const s = document.createElement("style");
  s.textContent = SIDEBAR_CSS;
  document.head.appendChild(s);
  _sb_css = true;
}

export default function Layout({ children }) {
  injectSBCSS();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, theme, setTheme, language, setLanguage, currency, setCurrency } =
    useApp();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setShowMenu(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sb-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className={`sb-shell transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">💰</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-logo-name">MoneyTrack</div>
            <div className="sb-logo-user">{user?.name || "User"}</div>
          </div>
          <button
            className="sb-close-btn lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sb-link${isActive ? " active" : ""}`
              }
              style={{ "--link-color": item.color }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="sb-link-icon">{item.icon}</div>
              <span className="sb-link-label">{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer settings */}
        <div className="sb-footer">
          {/* Theme */}
          <div className="sb-setting-group">
            <div className="sb-setting-label">{t("theme")}</div>
            <div className="sb-pill-group">
              {[
                ["light", "☀️"],
                ["dark", "🌙"],
                ["system", "⚙️"],
              ].map(([m, icon]) => (
                <button
                  key={m}
                  className={`sb-pill${theme === m ? " on" : ""}`}
                  onClick={() => setTheme(m)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="sb-setting-group">
            <div className="sb-setting-label">{t("language")}</div>
            <div className="sb-pill-group">
              {[
                ["en", "🇺🇸 EN"],
                ["kh", "🇰🇭 ខ្មែរ"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  className={`sb-pill${language === code ? " on" : ""}`}
                  onClick={() => setLanguage(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="sb-setting-group">
            <div className="sb-setting-label">{t("currency")}</div>
            <div className="sb-pill-group">
              {[
                ["USD", "$ USD"],
                ["KHR", "៛ KHR"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  className={`sb-pill${currency === code ? " on" : ""}`}
                  onClick={() => setCurrency(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button className="sb-logout" onClick={() => logout(navigate)}>
            <span>🚪</span>
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div className="sb-main-wrapper flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sb-topbar">
          <button
            className="sb-hamburger lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="sb-topbar-date flex-1 min-w-0">
            {formatDate(new Date(), language, "full")}
          </div>

          {/* User badge */}
          {user && (
            <div style={{ position: "relative" }}>
              <button
                className="sb-user-btn"
                onClick={() => setShowMenu((v) => !v)}
              >
                <div className="sb-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <span className="sb-user-name hidden sm:block">
                  {user.name}
                </span>
              </button>

              {showMenu && (
                <div className="sb-dropdown">
                  <NavLink
                    to="/profile"
                    className="sb-drop-item"
                    onClick={() => setShowMenu(false)}
                  >
                    👤 Profile
                  </NavLink>
                  <div className="sb-drop-divider" />
                  <button
                    className="sb-drop-item"
                    onClick={() => {
                      logout(navigate);
                      setShowMenu(false);
                    }}
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

      <FloatingCalculator />
      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </div>
  );
}
