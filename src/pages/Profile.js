import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatusBanner from "../components/StatusBanner";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  .profile-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Mesh background */
  .profile-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 60% at 80% 80%, rgba(236,72,153,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Grain overlay */
  .profile-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.4;
  }

  .profile-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 860px;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }

  @media (max-width: 700px) {
    .profile-layout {
      grid-template-columns: 1fr;
    }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── LEFT PANEL ── */
  .panel-left {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
  }

  .panel-left::before {
    content: '';
    position: absolute;
    top: -60px; left: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .avatar-wrap {
    position: relative;
    margin-top: 0.5rem;
  }

  .avatar-ring {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #6366f1, #ec4899, #06b6d4);
    box-shadow: 0 0 40px rgba(99,102,241,0.35);
    cursor: zoom-in;
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .avatar-ring:hover {
    box-shadow: 0 0 55px rgba(99,102,241,0.55);
    transform: scale(1.04);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #0a0a0f;
    display: block;
  }

  .avatar-edit-btn {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: 2px solid #0a0a0f;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 10px rgba(99,102,241,0.5);
  }

  .avatar-edit-btn:hover {
    transform: scale(1.12);
    box-shadow: 0 4px 16px rgba(99,102,241,0.7);
  }

  .user-display-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    color: #f0f0ff;
    text-align: center;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .user-email {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.35);
    text-align: center;
    margin-top: -0.75rem;
    letter-spacing: 0.01em;
  }

  .info-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.65rem 0.85rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
  }

  .info-icon {
    font-size: 14px;
    flex-shrink: 0;
    opacity: 0.75;
  }

  .info-content {
    min-width: 0;
  }

  .info-val {
    font-size: 0.82rem;
    color: #e0e0f0;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-key {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-top: 1px;
  }

  .joined-text {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.28);
    margin-top: 0.25rem;
    text-align: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
  }

  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6ee7b7;
    box-shadow: 0 0 6px #6ee7b7;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ── RIGHT PANEL ── */
  .panel-right {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 1.75rem 2rem;
    backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.5rem;
  }

  .section-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .icon-indigo {
    background: rgba(99,102,241,0.18);
    border: 1px solid rgba(99,102,241,0.3);
  }

  .icon-pink {
    background: rgba(236,72,153,0.15);
    border: 1px solid rgba(236,72,153,0.25);
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #f0f0ff;
    letter-spacing: -0.01em;
  }

  .section-sub {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    margin-top: 1px;
  }

  /* Form fields */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .field-label {
    font-size: 0.72rem;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    color: #f0f0ff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .field-input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .field-input:focus {
    border-color: rgba(99,102,241,0.55);
    background: rgba(99,102,241,0.06);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .pw-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 500px) {
    .pw-row { grid-template-columns: 1fr; }
  }

  /* Buttons */
  .btn-primary {
    width: 100%;
    padding: 0.85rem 1.25rem;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #fff;
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    margin-top: 0.25rem;
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(99,102,241,0.5);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .btn-secondary-profile {
    width: 100%;
    padding: 0.85rem 1.25rem;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    transition: transform 0.18s, background 0.18s, box-shadow 0.18s, opacity 0.18s;
    background: rgba(236,72,153,0.1);
    border: 1px solid rgba(236,72,153,0.3);
    color: #f9a8d4;
    margin-top: 0.80rem;
  }

  .btn-secondary-profile:hover:not(:disabled) {
    transform: translateY(-2px);
    background: rgba(236,72,153,0.18);
    box-shadow: 0 6px 20px rgba(236,72,153,0.25);
  }

  .btn-secondary-profile:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Accent line on section cards */
  .accent-line {
    position: absolute;
    top: 0; left: 2rem;
    width: 60px; height: 2px;
    border-radius: 0 0 4px 4px;
  }

  .accent-indigo { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
  .accent-pink   { background: linear-gradient(90deg, #ec4899, #f43f5e); }

  /* Loading shimmer */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .btn-loading-text {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── LIGHTBOX ── */
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: lbFadeIn 0.22s ease both;
    cursor: zoom-out;
  }

  @keyframes lbFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .lightbox-inner {
    position: relative;
    animation: lbPopIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  @keyframes lbPopIn {
    from { opacity: 0; transform: scale(0.78); }
    to   { opacity: 1; transform: scale(1); }
  }

  .lightbox-img {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255,255,255,0.1);
    box-shadow:
      0 0 0 1px rgba(99,102,241,0.5),
      0 0 60px rgba(99,102,241,0.25),
      0 30px 80px rgba(0,0,0,0.7);
    display: block;
  }

  @media (max-width: 400px) {
    .lightbox-img { width: 220px; height: 220px; }
  }

  .lightbox-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: rgba(255,255,255,0.85);
    letter-spacing: -0.01em;
    text-align: center;
  }

  .lightbox-close {
    position: absolute;
    top: -10px; right: -10px;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.7);
    font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, transform 0.18s;
    line-height: 1;
  }

  .lightbox-close:hover {
    background: rgba(236,72,153,0.4);
    color: #fff;
    transform: scale(1.12);
  }
`;

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setBanner({ type: "error", title: "Name is required" });
      return;
    }
    try {
      setLoading(true);
      await updateProfile({ name, avatar });
      setBanner({ type: "success", title: "Profile updated successfully" });
    } catch {
      setBanner({ type: "error", title: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setBanner({ type: "error", title: "Please fill both password fields" });
      return;
    }
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setBanner({ type: "success", title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setBanner({
        type: "error",
        title: err?.response?.data?.message || "Current password is incorrect",
      });
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc =
    avatarPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=6366f1&color=fff`;

  return (
    <>
      <style>{styles}</style>
      <div className="profile-root">
        <div className="profile-layout">
          {/* ── LEFT: Identity panel ── */}
          <div className="panel-left">
            <div className="avatar-wrap">
              <div
                className="avatar-ring"
                onClick={() => setLightboxOpen(true)}
                title="View photo"
              >
                <img src={avatarSrc} alt="avatar" className="avatar-img" />
              </div>
              <label
                className="avatar-edit-btn"
                title="Change photo"
                onClick={(e) => e.stopPropagation()}
              >
                ✏️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  hidden
                />
              </label>
            </div>

            <div className="user-display-name">{name || "Your Name"}</div>
            <div className="user-email">
              {user?.email || "user@example.com"}
            </div>

            <div className="badge">
              <span className="badge-dot" />
              Active Member
            </div>

            <div className="info-list">
              <div className="info-row">
                <span className="info-icon">✉️</span>
                <div className="info-content">
                  <div className="info-val">{user?.email || "—"}</div>
                  <div className="info-key">Email</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">🌐</span>
                <div className="info-content">
                  <div className="info-val">
                    {user?.language?.toUpperCase() || "EN"}
                  </div>
                  <div className="info-key">Language</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">💱</span>
                <div className="info-content">
                  <div className="info-val">
                    {user?.currency || "USD"} ·{" "}
                    {user?.exchangeRate?.toLocaleString() || "—"}
                  </div>
                  <div className="info-key">Currency · Rate</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">🎨</span>
                <div className="info-content">
                  <div
                    className="info-val"
                    style={{ textTransform: "capitalize" }}
                  >
                    {user?.theme || "system"}
                  </div>
                  <div className="info-key">Theme</div>
                </div>
              </div>
            </div>

            {user?.createdAt && (
              <div className="joined-text">
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Forms ── */}
          <div className="panel-right">
            {/* Profile info */}
            <div className="section-card">
              <div className="accent-line accent-indigo" />
              <div className="section-header">
                <div className="section-icon icon-indigo">👤</div>
                <div>
                  <div className="section-title">Personal Info</div>
                  <div className="section-sub">
                    Update your display name & avatar
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <button
                className="btn-secondary-profile"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-text">
                    <span className="spinner" /> Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {/* Password */}
            <div className="section-card">
              <div className="accent-line accent-pink" />
              <div className="section-header">
                <div className="section-icon icon-pink">🔒</div>
                <div>
                  <div className="section-title">Change Password</div>
                  <div className="section-sub">Keep your account secure</div>
                </div>
              </div>

              <div className="pw-row">
                <div className="field-group">
                  <label className="field-label">Current Password</label>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">New Password</label>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn-secondary-profile"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-text">
                    <span className="spinner" /> Changing…
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxOpen(false)}
              title="Close"
            >
              ✕
            </button>
            <img src={avatarSrc} alt="Profile" className="lightbox-img" />
            {name && <div className="lightbox-name">{name}</div>}
          </div>
        </div>
      )}

      <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />
    </>
  );
}
