import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

// ── Note API ──────────────────────────────────────────────────
const noteAPI = {
  getAll: () => api.get("/notes"),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
};

// ── Color / label system — dark & tactical ────────────────────
// Keys match backend enum: yellow | blue | green | pink | purple | white
const COLOR_MAP = {
  yellow: {
    bg: "#111111",
    border: "#2a2a2a",
    accent: "#f59e0b",
    text: "#e5e5e5",
    tag: "DEFAULT",
    tagBg: "#f59e0b",
  },
  pink: {
    bg: "#130800",
    border: "#7c2d12",
    accent: "#ea580c",
    text: "#fed7aa",
    tag: "URGENT",
    tagBg: "#ea580c",
  },
  blue: {
    bg: "#0a1628",
    border: "#1e3a5f",
    accent: "#3b82f6",
    text: "#bfdbfe",
    tag: "WORK",
    tagBg: "#3b82f6",
  },
  green: {
    bg: "#061210",
    border: "#134e4a",
    accent: "#10b981",
    text: "#a7f3d0",
    tag: "DONE",
    tagBg: "#10b981",
  },
  purple: {
    bg: "#12101a",
    border: "#3b1f6b",
    accent: "#8b5cf6",
    text: "#ddd6fe",
    tag: "IDEA",
    tagBg: "#8b5cf6",
  },
  white: {
    bg: "#130a0a",
    border: "#7f1d1d",
    accent: "#ef4444",
    text: "#fecaca",
    tag: "RISK",
    tagBg: "#ef4444",
  },
};
const COLORS = Object.keys(COLOR_MAP);

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "JUST NOW";
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  return `${Math.floor(diff / 86400)}D AGO`;
}

// ── Grid background ───────────────────────────────────────────
function Background() {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 0, background: "#080808" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -300,
          left: -300,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes dropIn  { from{transform:translateY(-10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideUp { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{transform:translateX(-50%) translateY(12px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.18) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0d0d; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input, textarea, button { font-family: inherit; }
      `}</style>
    </div>
  );
}

// ── Primary / ghost / danger button ──────────────────────────
function TactBtn({ label, icon, onClick, variant = "ghost", disabled }) {
  const [h, setH] = useState(false);
  const s =
    {
      primary: {
        bg: h ? "#d97706" : "#f59e0b",
        border: "#f59e0b",
        color: "#000",
      },
      ghost: {
        bg: h ? "rgba(255,255,255,0.06)" : "transparent",
        border: h ? "#444" : "#2a2a2a",
        color: h ? "#ccc" : "#666",
      },
      danger: {
        bg: h ? "rgba(239,68,68,0.12)" : "transparent",
        border: h ? "#ef4444" : "#2a2a2a",
        color: h ? "#ef4444" : "#666",
      },
    }[variant] || {};
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        borderRadius: "4px",
        padding: label ? "9px 18px" : "8px 10px",
        fontSize: "12px",
        fontWeight: 800,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 7,
        transition: "all 0.1s",
        opacity: disabled ? 0.4 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── Small icon button for cards ───────────────────────────────
function IconBtn({ icon, title, onClick, danger }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h
          ? danger
            ? "rgba(239,68,68,0.1)"
            : "rgba(245,158,11,0.08)"
          : "transparent",
        border: `1px solid ${h ? (danger ? "#ef444488" : "#f59e0b88") : "transparent"}`,
        borderRadius: "3px",
        width: 26,
        height: 26,
        cursor: "pointer",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.1s",
        color: h ? (danger ? "#ef4444" : "#f59e0b") : "#444",
      }}
    >
      {icon}
    </button>
  );
}

// ── Note card ─────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, onPin, index }) {
  const c = COLOR_MAP[note.color] || COLOR_MAP.yellow;
  const [hover, setHover] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onEdit(note)}
      style={{
        background: c.bg,
        border: `1px solid ${hover ? c.accent + "88" : c.border}`,
        borderLeft: `3px solid ${note.pinned ? c.accent : hover ? c.accent + "88" : c.border}`,
        borderRadius: "6px",
        padding: "16px",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.1s ease",
        transform: leaving ? "scale(0.95) translateX(6px)" : "scale(1)",
        opacity: leaving ? 0 : 1,
        boxShadow: hover
          ? `0 0 0 1px ${c.accent}18, 0 8px 28px rgba(0,0,0,0.5)`
          : "0 2px 8px rgba(0,0,0,0.35)",
        breakInside: "avoid",
        marginBottom: "10px",
        animation: `dropIn 0.18s ease ${Math.min(index * 0.035, 0.3)}s both`,
      }}
    >
      {/* Tag + actions row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            background: c.tagBg,
            color: "#000",
            fontSize: "9px",
            fontWeight: 800,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.14em",
            padding: "2px 8px",
            borderRadius: "2px",
          }}
        >
          {c.tag}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {note.pinned && (
            <span
              style={{
                color: c.accent,
                fontSize: "9px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              ◆ PINNED
            </span>
          )}
          <div
            style={{
              display: "flex",
              gap: 2,
              opacity: hover ? 1 : 0,
              transition: "opacity 0.1s",
            }}
          >
            <IconBtn
              icon={note.pinned ? "◇" : "◆"}
              title={note.pinned ? "Unpin" : "Pin"}
              onClick={() => onPin(note)}
            />
            <IconBtn icon="✎" title="Edit" onClick={() => onEdit(note)} />
            <IconBtn
              icon="✕"
              title="Delete"
              onClick={() => {
                setLeaving(true);
                setTimeout(() => onDelete(note._id), 220);
              }}
              danger
            />
          </div>
        </div>
      </div>

      {/* Title */}
      {note.title && (
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            color: "#f5f5f5",
            marginBottom: 6,
            lineHeight: 1.15,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {note.title}
        </div>
      )}

      {/* Body */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: c.text,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          opacity: 0.7,
          maxHeight: "135px",
          overflow: "hidden",
        }}
      >
        {note.content}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "10px",
            color: "#383838",
            letterSpacing: "0.06em",
          }}
        >
          {timeAgo(note.updatedAt)}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "10px",
            color: c.accent,
            opacity: 0.5,
          }}
        >
          #{note._id?.slice(-4).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function NoteModal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState(note?.color || "yellow");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const contentRef = useRef();

  useEffect(() => {
    setTimeout(() => contentRef.current?.focus(), 80);
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      setError("// content cannot be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ title: title.trim(), content: content.trim(), color });
      onClose();
    } catch (e) {
      setError(`// error: ${e.message}`);
      setSaving(false);
    }
  };

  const c = COLOR_MAP[color];

  const fieldStyle = {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #222",
    borderRadius: "4px",
    color: "#e5e5e5",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    outline: "none",
    padding: "10px 12px",
    transition: "border-color 0.1s",
    boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d0d",
          border: `1px solid ${c.accent}44`,
          borderTop: `2px solid ${c.accent}`,
          borderRadius: "8px",
          padding: "28px",
          width: "min(560px, 94vw)",
          boxShadow: `0 0 80px rgba(0,0,0,0.9), 0 0 0 1px #181818`,
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "22px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {note ? "// EDIT NOTE" : "// NEW NOTE"}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: "#383838",
                marginTop: 3,
              }}
            >
              ctrl+enter to save · esc to close
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #222",
              color: "#444",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "3px",
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ height: 1, background: "#181818", marginBottom: 20 }} />

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "10px",
              color: "#444",
              letterSpacing: "0.14em",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            TITLE (OPTIONAL)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="// enter title..."
            style={fieldStyle}
            onFocus={(e) => (e.target.style.borderColor = c.accent)}
            onBlur={(e) => (e.target.style.borderColor = "#222")}
          />
        </div>

        {/* Content */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "10px",
              color: "#444",
              letterSpacing: "0.14em",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            CONTENT *
          </label>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder="// write your note here..."
            rows={7}
            style={{
              ...fieldStyle,
              resize: "vertical",
              lineHeight: 1.7,
              border: `1px solid ${error ? "#ef4444" : "#222"}`,
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : c.accent)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : "#222")
            }
          />
          {error && (
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "11px",
                color: "#ef4444",
                marginTop: 6,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Label picker */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "10px",
              color: "#444",
              letterSpacing: "0.14em",
              display: "block",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            LABEL
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COLORS.map((col) => {
              const cm = COLOR_MAP[col];
              const active = color === col;
              return (
                <button
                  key={col}
                  onClick={() => setColor(col)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "3px",
                    border: `1px solid ${active ? cm.accent : "#222"}`,
                    background: active ? `${cm.accent}15` : "transparent",
                    color: active ? cm.accent : "#555",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {cm.tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <TactBtn label="CANCEL" onClick={onClose} variant="ghost" />
          <TactBtn
            label={saving ? "SAVING..." : note ? "SAVE CHANGES" : "ADD NOTE"}
            onClick={handleSave}
            variant="primary"
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────
function FilterChip({ label, color, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 12px",
        borderRadius: "3px",
        border: `1px solid ${active ? color || "#f59e0b" : h ? "#383838" : "#1e1e1e"}`,
        background: active ? `${color || "#f59e0b"}12` : "transparent",
        color: active ? color || "#f59e0b" : h ? "#999" : "#444",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "all 0.1s",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {color && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "1px",
            background: color,
            display: "inline-block",
          }}
        />
      )}
      {label}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ label, count }) {
  if (!label) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "11px",
          fontWeight: 800,
          color: "#383838",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          color: "#2a2a2a",
          border: "1px solid #1e1e1e",
          borderRadius: "2px",
          padding: "1px 6px",
        }}
      >
        {count}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#181818" }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterColor, setFilterColor] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await noteAPI.getAll();
        setNotes(res.data || []);
      } catch (e) {
        showToast(e.message || "FAILED TO LOAD", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (payload) => {
    const isEdit = modal && modal._id;
    const res = isEdit
      ? await noteAPI.update(modal._id, payload)
      : await noteAPI.create(payload);
    const saved = res.data;
    if (isEdit) {
      setNotes((n) => n.map((x) => (x._id === saved._id ? saved : x)));
      showToast("NOTE UPDATED");
    } else {
      setNotes((n) => [saved, ...n]);
      showToast("NOTE CREATED");
    }
  };

  const handleDelete = async (id) => {
    try {
      await noteAPI.delete(id);
      setNotes((n) => n.filter((x) => x._id !== id));
      showToast("NOTE DELETED");
    } catch (e) {
      showToast(e.message || "DELETE FAILED", "error");
    }
  };

  const handlePin = async (note) => {
    try {
      const res = await noteAPI.togglePin(note._id);
      setNotes((n) => n.map((x) => (x._id === res.data._id ? res.data : x)));
    } catch (e) {
      showToast(e.message || "PIN FAILED", "error");
    }
  };

  const filtered = notes
    .filter((n) => {
      const q = search.toLowerCase();
      return (
        (n.title + " " + n.content).toLowerCase().includes(q) &&
        (filterColor === "all" || n.color === filterColor)
      );
    })
    .sort(
      (a, b) =>
        b.pinned - a.pinned || new Date(b.updatedAt) - new Date(a.updatedAt),
    );

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <Background />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          padding: "36px 28px 100px",
          maxWidth: "1140px",
          margin: "0 auto",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: "1px solid #181818",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: "#f59e0b",
                letterSpacing: "0.22em",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ animation: "blink 1.4s step-end infinite" }}>
                ▶
              </span>
              MONEYTRACK / NOTES
            </div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(52px, 8vw, 80px)",
                fontWeight: 900,
                lineHeight: 0.88,
                color: "#fff",
                margin: "0 0 14px",
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              MY
              <br />
              <span
                style={{ color: "#f59e0b", WebkitTextStroke: "1px #f59e0b" }}
              >
                NOTES
              </span>
            </h1>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                color: "#383838",
              }}
            >
              <span>
                <span style={{ color: "#f59e0b" }}>{notes.length}</span> TOTAL
              </span>
              <span style={{ color: "#1e1e1e" }}>|</span>
              <span>
                <span style={{ color: "#f59e0b" }}>{pinned.length}</span> PINNED
              </span>
              <span style={{ color: "#1e1e1e" }}>|</span>
              <span>
                <span style={{ color: "#f59e0b" }}>{unpinned.length}</span> OPEN
              </span>
            </div>
          </div>

          <TactBtn
            icon="+"
            label="NEW NOTE"
            onClick={() => setModal("new")}
            variant="primary"
          />
        </div>

        {/* ── Search + filters ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                color: "#383838",
              }}
            >
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search notes..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 30px",
                background: "#0a0a0a",
                border: "1px solid #1e1e1e",
                borderRadius: "4px",
                color: "#e5e5e5",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.1s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
              onBlur={(e) => (e.target.style.borderColor = "#1e1e1e")}
            />
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <FilterChip
              label="ALL"
              active={filterColor === "all"}
              onClick={() => setFilterColor("all")}
            />
            {COLORS.map((col) => (
              <FilterChip
                key={col}
                label={COLOR_MAP[col].tag}
                color={COLOR_MAP[col].accent}
                active={filterColor === col}
                onClick={() =>
                  setFilterColor(filterColor === col ? "all" : col)
                }
              />
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#383838",
              paddingTop: 60,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            <div style={{ animation: "spin 0.8s linear infinite" }}>⟳</div>
            LOADING NOTES...
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && filtered.length === 0 && (
          <div style={{ paddingTop: 60 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 56,
                fontWeight: 900,
                color: "#181818",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {search ? "NO RESULTS" : "EMPTY"}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 12,
                color: "#2a2a2a",
              }}
            >
              {search
                ? `// no notes matching "${search}"`
                : "// press NEW NOTE to get started"}
            </div>
          </div>
        )}

        {/* ── Pinned ── */}
        {!loading && pinned.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="◆ PINNED" count={pinned.length} />
            <div style={{ columns: "320px", columnGap: "10px" }}>
              {pinned.map((note, i) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  index={i}
                  onEdit={setModal}
                  onDelete={handleDelete}
                  onPin={handlePin}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Others ── */}
        {!loading && unpinned.length > 0 && (
          <div>
            <SectionLabel
              label={pinned.length > 0 ? "▸ NOTES" : ""}
              count={unpinned.length}
            />
            <div style={{ columns: "320px", columnGap: "10px" }}>
              {unpinned.map((note, i) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  index={i + pinned.length}
                  onEdit={setModal}
                  onDelete={handleDelete}
                  onPin={handlePin}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <NoteModal
          note={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "error" ? "#120000" : "#001208",
            border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            borderLeft: `3px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            color: toast.type === "error" ? "#ef4444" : "#10b981",
            padding: "10px 20px",
            borderRadius: "4px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
            zIndex: 200,
            whiteSpace: "nowrap",
            animation: "toastIn 0.22s cubic-bezier(.34,1.56,.64,1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
