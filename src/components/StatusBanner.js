// src/components/StatusBanner.js
import React, { useEffect } from "react";

const THEMES = {
  success: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.28)",
  },
  update: {
    color: "#818cf8",
    bg: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.28)",
  },
  delete: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.25)",
  },
  error: {
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.25)",
  },
  loading: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.07)",
    border: "rgba(148,163,184,0.18)",
  },
};

function BannerIcon({ type, color }) {
  const th = THEMES[type] || THEMES.success;
  const ring = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: th.bg,
    border: `1px solid ${th.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  if (type === "success")
    return (
      <div style={ring}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8.5L6.5 12L13 5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );

  if (type === "update")
    return (
      <div style={ring}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8C2 8 4 4 8 4C10.5 4 12.5 5.5 13.5 7.5M14 8C14 8 12 12 8 12C5.5 12 3.5 10.5 2.5 8.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M11.5 7.5L13.5 7.5L13.5 5.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );

  if (type === "delete")
    return (
      <div style={ring}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 4h10M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 7v5M10 7v5M4 4l.8 9.1a.5.5 0 00.5.45h5.4a.5.5 0 00.5-.45L12 4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );

  if (type === "loading")
    return (
      <div style={ring}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="5.5"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="2"
          />
          <path
            d="M8 2.5A5.5 5.5 0 0113.5 8"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 8 8"
              to="360 8 8"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    );

  // error / fallback
  return (
    <div style={ring}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.8" />
        <path
          d="M8 5V8.5M8 11H8.01"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function StatusBanner({ banner, onDismiss }) {
  useEffect(() => {
    if (!banner) return;
    if (banner.type === "loading" || banner.type === "error") return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;

  const th = THEMES[banner.type] || THEMES.success;

  return (
    <>
      <style>{`
        @keyframes bannerIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
      `}</style>
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: th.bg,
          border: `1px solid ${th.border}`,
          borderRadius: "12px",
          padding: "13px 14px",
          animation: "bannerIn 0.25s cubic-bezier(.16,1,.3,1)",
          minWidth: "280px",
          maxWidth: "480px",
          width: "max-content",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        <BannerIcon type={banner.type} color={th.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: th.color }}>
            {banner.title}
          </div>
          {banner.sub && (
            <div
              style={{
                fontSize: "11px",
                color: th.color,
                opacity: 0.65,
                marginTop: "2px",
              }}
            >
              {banner.sub}
            </div>
          )}
        </div>
        {banner.type !== "loading" && (
          <button
            onClick={onDismiss}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              border: "none",
              background: th.bg,
              color: th.color,
              fontSize: "11px",
              cursor: "pointer",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
}
