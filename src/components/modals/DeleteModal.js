// src/components/modals/DeleteModal.js
import React from "react";
import { useApp } from "../../context/AppContext";

export default function DeleteModal({ isOpen, onClose, onConfirm, loading }) {
  const { t } = useApp();
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes dmSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dmPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.25); }
          50%       { box-shadow: 0 0 0 10px rgba(248,113,113,0); }
        }
        .dm-cancel:hover {
          background: rgba(255,255,255,0.07) !important;
          color: #aaa !important;
        }
        .dm-confirm:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.45) !important;
          filter: brightness(1.08);
        }
        .dm-confirm:active { transform: translateY(0); }
        .dm-close:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #ccc !important;
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,10,16,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 1000,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#16161e",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "360px",
            overflow: "hidden",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            animation: "dmSlideUp 0.26s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {/* Close button top-right */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "14px 16px 0",
            }}
          >
            <button
              className="dm-close"
              onClick={onClose}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#555",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "8px 28px 28px", textAlign: "center" }}>
            {/* Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                margin: "0 auto 20px",
                animation: "dmPulse 2.5s ease-in-out infinite",
              }}
            >
              🗑️
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#f0f0f5",
                letterSpacing: "-0.3px",
                marginBottom: "8px",
              }}
            >
              {t("deleteConfirm")}
            </div>

            {/* Message */}
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              {t("deleteMessage")}
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "20px",
              }}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="dm-cancel"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#888",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {t("cancel")}
              </button>

              <button
                className="dm-confirm"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "11px",
                  border: "none",
                  background: loading
                    ? "rgba(239,68,68,0.4)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.18s",
                  fontFamily: "inherit",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 14px rgba(239,68,68,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  <>{t("deleteBtn")}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
