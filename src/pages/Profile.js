import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast.error("Name is required");
      return;
    }
    try {
      setLoading(true);
      await updateProfile({ name, avatar });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Single handleChangePassword using context method
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill both password fields");
      return;
    }
    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Current password is incorrect",
      );
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
          style={{ background: "linear-gradient(135deg,#0ea5e9,#38bdf8)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}
        />
      </div>

      <div className="w-full max-w-xl animate-slide-up relative">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
                boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
              }}
            >
              👤
            </div>
            <h1
              className="font-display font-bold text-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              Profile Settings
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Manage your personal information
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={
                  avatarPreview || "https://ui-avatars.com/api/?name=" + name
                }
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-primary-500 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition">
                ✏️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <button
            className="btn btn-primary w-full justify-center py-3 text-base mt-6"
            onClick={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? "Updating..." : "💾 Update Profile"}
          </button>

          <div className="border-t pt-8 mt-8 space-y-4">
            <h3 className="font-semibold text-lg text-center">
              🔒 Change Password
            </h3>

            <input
              type="password"
              placeholder="Current Password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              className="btn btn-secondary w-full justify-center py-3 text-base"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
