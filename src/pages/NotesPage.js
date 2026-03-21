import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

// ── Note API ──────────────────────────────────────────────────
const noteAPI = {
  getAll: () => api.get("/notes"),
  create: (formData) =>
    api.post("/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/notes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
};

// ── Color / label system ──────────────────────────────────────
const COLOR_MAP = {
  yellow: {
    bg: "var(--card-bg)",
    border: "var(--border)",
    accent: "#f59e0b",
    text: "var(--text-primary)",
    tag: "DEFAULT",
    tagBg: "#f59e0b",
  },
  pink: {
    bg: "var(--card-bg)",
    border: "#7c2d1255",
    accent: "#ea580c",
    text: "var(--text-primary)",
    tag: "URGENT",
    tagBg: "#ea580c",
  },
  blue: {
    bg: "var(--card-bg)",
    border: "#1e3a5f88",
    accent: "#3b82f6",
    text: "var(--text-primary)",
    tag: "WORK",
    tagBg: "#3b82f6",
  },
  green: {
    bg: "var(--card-bg)",
    border: "#134e4a88",
    accent: "#10b981",
    text: "var(--text-primary)",
    tag: "DONE",
    tagBg: "#10b981",
  },
  purple: {
    bg: "var(--card-bg)",
    border: "#3b1f6b88",
    accent: "#8b5cf6",
    text: "var(--text-primary)",
    tag: "IDEA",
    tagBg: "#8b5cf6",
  },
  white: {
    bg: "var(--card-bg)",
    border: "#7f1d1d55",
    accent: "#ef4444",
    text: "var(--text-primary)",
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

// ── Inline styles ─────────────────────────────────────────────
const injectStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
    .notes-page * { box-sizing: border-box; }
    .notes-page ::placeholder { color: var(--text-secondary) !important; opacity: 0.5; }

    @keyframes notes-dropIn  { from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes notes-slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes notes-fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes notes-spin    { to{transform:rotate(360deg)} }
    @keyframes notes-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes notes-toastIn { from{transform:translateX(-50%) translateY(10px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
    @keyframes notes-lbIn    { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }

    .note-card {
      border-radius: 8px; padding: 16px; position: relative; cursor: pointer;
      transition: all 0.15s ease; break-inside: avoid; margin-bottom: 10px;
      border: 1px solid var(--border); border-left-width: 3px;
      background: var(--card-bg); box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .note-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

    .tact-btn {
      border-radius: 6px; font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
      font-size: 12px; cursor: pointer; display: flex; align-items: center;
      gap: 6px; transition: all 0.12s; white-space: nowrap; border: 1px solid transparent;
    }
    .tact-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .notes-input {
      width: 100%; background: var(--bg-primary); border: 1px solid var(--border);
      border-radius: 6px; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;
      font-size: 13px; outline: none; padding: 10px 12px; transition: border-color 0.12s; box-sizing: border-box;
    }

    .filter-chip {
      padding: 5px 12px; border-radius: 4px; font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer;
      transition: all 0.1s; display: flex; align-items: center; gap: 5px;
      border: 1px solid var(--border); background: transparent; color: var(--text-secondary);
    }
    .filter-chip:hover { background: var(--bg-primary); color: var(--text-primary); }
    .filter-chip.active { background: var(--bg-primary); }

    .icon-btn {
      width: 26px; height: 26px; border: 1px solid transparent; border-radius: 4px;
      cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;
      transition: all 0.1s; background: transparent; color: var(--text-secondary);
    }
    .icon-btn:hover { border-color: currentColor; }
    .icon-btn.danger:hover { color: #ef4444; }
    .icon-btn.pin:hover    { color: #f59e0b; }
    .icon-btn.edit:hover   { color: var(--text-primary); }

    /* Image thumbnails on card */
    .note-img-thumb {
      width: 52px; height: 52px; object-fit: cover; border-radius: 5px;
      border: 1px solid var(--border); cursor: pointer; transition: all 0.15s;
      flex-shrink: 0;
    }
    .note-img-thumb:hover { transform: scale(1.06); border-color: currentColor; box-shadow: 0 4px 12px rgba(0,0,0,0.18); }

    /* Upload drop zone */
    .img-dropzone {
      border: 1.5px dashed var(--border); border-radius: 6px; padding: 18px 14px;
      text-align: center; cursor: pointer; transition: all 0.15s;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: var(--text-secondary); background: transparent;
    }
    .img-dropzone:hover, .img-dropzone.drag { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.04); }
    .img-dropzone input { display: none; }

    /* Modal image preview */
    .modal-img-preview {
      width: 72px; height: 72px; object-fit: cover; border-radius: 6px;
      border: 1px solid var(--border); flex-shrink: 0; display: block;
    }

    /* Lightbox */
    .lightbox-overlay {
      position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.88);
      backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
      animation: notes-fadeIn 0.15s ease;
    }
    .lightbox-img {
      max-width: min(90vw, 900px); max-height: 85vh; border-radius: 8px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5);
      animation: notes-lbIn 0.2s cubic-bezier(.34,1.2,.64,1);
      object-fit: contain;
    }
    .lightbox-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
      color: #fff; border-radius: 6px; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px; transition: background 0.12s;
    }
    .lightbox-nav:hover { background: rgba(255,255,255,0.15); }
    .lightbox-close {
      position: absolute; top: 20px; right: 20px;
      background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
      color: #fff; border-radius: 6px; width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 14px; transition: background 0.12s;
    }
    .lightbox-close:hover { background: rgba(239,68,68,0.5); }
    .lightbox-counter {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: rgba(255,255,255,0.5); letter-spacing: 0.1em;
    }
  `}</style>
);

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>

      <img
        className="lightbox-img"
        src={images[idx].url}
        alt={`Image ${idx + 1}`}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav"
            style={{ left: 16 }}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ‹
          </button>
          <button
            className="lightbox-nav"
            style={{ right: 16 }}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            ›
          </button>
          <div className="lightbox-counter">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ── Tag badge ─────────────────────────────────────────────────
function TagBadge({ tag, color }) {
  return (
    <span
      style={{
        background: color,
        color: "#000",
        fontSize: "9px",
        fontWeight: 800,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.14em",
        padding: "2px 8px",
        borderRadius: "3px",
        flexShrink: 0,
      }}
    >
      {tag}
    </span>
  );
}

// ── Note card ─────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, onPin, index }) {
  const c = COLOR_MAP[note.color] || COLOR_MAP.yellow;
  const [hover, setHover] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [lightbox, setLightbox] = useState(null); // index into note.images

  const imgs = note.images || [];

  return (
    <>
      <div
        className="note-card"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onEdit(note)}
        style={{
          borderLeftColor: note.pinned
            ? c.accent
            : hover
              ? `${c.accent}88`
              : c.border,
          borderColor: hover ? `${c.accent}55` : "var(--border)",
          opacity: leaving ? 0 : 1,
          transform: leaving
            ? "scale(0.96) translateX(4px)"
            : hover
              ? "translateY(-2px)"
              : "none",
          animation: `notes-dropIn 0.18s ease ${Math.min(index * 0.04, 0.28)}s both`,
        }}
      >
        {/* Tag + actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TagBadge tag={c.tag} color={c.tagBg} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {note.pinned && (
              <span
                style={{
                  color: c.accent,
                  fontSize: "9px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.08em",
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
                transition: "opacity 0.12s",
              }}
            >
              <button
                className="icon-btn pin"
                title={note.pinned ? "Unpin" : "Pin"}
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(note);
                }}
                style={{ color: note.pinned ? c.accent : undefined }}
              >
                {note.pinned ? "◇" : "◆"}
              </button>
              <button
                className="icon-btn edit"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
              >
                ✎
              </button>
              <button
                className="icon-btn danger"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setLeaving(true);
                  setTimeout(() => onDelete(note._id), 200);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        {note.title && (
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              color: "var(--text-primary)",
              marginBottom: 6,
              lineHeight: 1.2,
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
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: "130px",
            overflow: "hidden",
          }}
        >
          {note.content}
        </div>

        {/* Image thumbnails */}
        {imgs.length > 0 && (
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {imgs.map((img, i) => (
              <img
                key={img._id || i}
                src={img.url}
                alt=""
                className="note-img-thumb"
                style={{ borderColor: c.accent + "66" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(i);
                }}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "var(--text-secondary)",
              opacity: 0.6,
              letterSpacing: "0.05em",
            }}
          >
            {timeAgo(note.updatedAt)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {imgs.length > 0 && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: c.accent,
                  opacity: 0.6,
                }}
              >
                ◻ {imgs.length}
              </span>
            )}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: c.accent,
                opacity: 0.55,
              }}
            >
              #{note._id?.slice(-4).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          images={imgs}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

// ── Image upload zone ─────────────────────────────────────────
function ImageUploadZone({
  newFiles,
  setNewFiles,
  existingImages,
  setExistingImages,
  accent,
}) {
  const fileRef = useRef();
  const [drag, setDrag] = useState(false);

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setNewFiles((prev) => [...prev, ...valid].slice(0, 6));
  };

  return (
    <div>
      <label
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "10px",
          color: "var(--text-secondary)",
          letterSpacing: "0.14em",
          display: "block",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        IMAGES ({existingImages.length + newFiles.length}/6)
      </label>

      {/* Existing + new previews */}
      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {existingImages.map((img, i) => (
            <div key={img._id || i} style={{ position: "relative" }}>
              <img src={img.url} alt="" className="modal-img-preview" />
              <button
                onClick={() =>
                  setExistingImages((prev) => prev.filter((_, j) => j !== i))
                }
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  fontSize: 9,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="modal-img-preview"
                style={{ opacity: 0.7 }}
              />
              <button
                onClick={() =>
                  setNewFiles((prev) => prev.filter((_, j) => j !== i))
                }
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  fontSize: 9,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.5)",
                  fontSize: 8,
                  color: "#fff",
                  textAlign: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: "0 0 5px 5px",
                  padding: "1px 0",
                }}
              >
                NEW
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {existingImages.length + newFiles.length < 6 && (
        <div
          className={`img-dropzone ${drag ? "drag" : ""}`}
          style={{ borderColor: drag ? accent : undefined }}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />
          <div style={{ fontSize: 20, marginBottom: 4, opacity: 0.5 }}>◻</div>
          <div>click or drag images here</div>
          <div style={{ opacity: 0.4, fontSize: 10, marginTop: 3 }}>
            jpg · png · gif · webp · max 8mb each
          </div>
        </div>
      )}
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
  const [existingImages, setExistingImages] = useState(note?.images || []);
  const [newFiles, setNewFiles] = useState([]);
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
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      fd.append("color", color);
      // Tell backend which existing images to keep
      fd.append(
        "keepImages",
        JSON.stringify(existingImages.map((img) => img.publicId)),
      );
      newFiles.forEach((f) => fd.append("images", f));

      await onSave(fd);
      onClose();
    } catch (e) {
      setError(`// error: ${e.message}`);
      setSaving(false);
    }
  };

  const c = COLOR_MAP[color];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "notes-fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          border: `1px solid var(--border)`,
          borderTop: `3px solid ${c.accent}`,
          borderRadius: "10px",
          padding: "28px",
          width: "min(600px, 94vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          animation: "notes-slideUp 0.2s ease",
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
                fontSize: "20px",
                fontWeight: 900,
                color: "var(--text-primary)",
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
                color: "var(--text-secondary)",
                opacity: 0.5,
                marginTop: 2,
              }}
            >
              ctrl+enter to save · esc to close
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderRadius: "4px",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{ height: 1, background: "var(--border)", marginBottom: 20 }}
        />

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "10px",
              color: "var(--text-secondary)",
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
            className="notes-input"
            onFocus={(e) => (e.target.style.borderColor = c.accent)}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Content */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "10px",
              color: "var(--text-secondary)",
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
            className="notes-input"
            style={{
              resize: "vertical",
              lineHeight: 1.7,
              borderColor: error ? "#ef4444" : undefined,
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : c.accent)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : "var(--border)")
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

        {/* Image upload */}
        <div style={{ marginBottom: 20 }}>
          <ImageUploadZone
            newFiles={newFiles}
            setNewFiles={setNewFiles}
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            accent={c.accent}
          />
        </div>

        {/* Label picker */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "10px",
              color: "var(--text-secondary)",
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
                    padding: "5px 14px",
                    borderRadius: "4px",
                    border: `1px solid ${active ? cm.accent : "var(--border)"}`,
                    background: active ? `${cm.accent}18` : "transparent",
                    color: active ? cm.accent : "var(--text-secondary)",
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
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: cm.accent,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {cm.tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            className="tact-btn"
            onClick={onClose}
            style={{
              padding: "9px 18px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
            }}
          >
            CANCEL
          </button>
          <button
            className="tact-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "9px 22px",
              background: saving ? `${c.accent}88` : c.accent,
              border: `1px solid ${c.accent}`,
              color: "#000",
              boxShadow: saving ? "none" : `0 4px 14px ${c.accent}44`,
            }}
          >
            {saving ? "SAVING..." : note ? "SAVE CHANGES" : "ADD NOTE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────
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
          color: "var(--text-secondary)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          color: "var(--text-secondary)",
          opacity: 0.4,
          border: "1px solid var(--border)",
          borderRadius: "3px",
          padding: "1px 6px",
        }}
      >
        {count}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
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

  const handleSave = async (formData) => {
    const isEdit = modal && modal._id;
    const res = isEdit
      ? await noteAPI.update(modal._id, formData)
      : await noteAPI.create(formData);
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
    <div
      className="notes-page"
      style={{ minHeight: "100%", paddingBottom: 60 }}
    >
      {injectStyles()}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "#f59e0b",
              letterSpacing: "0.2em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ animation: "notes-blink 1.4s step-end infinite" }}>
              ▶
            </span>
            MONEYTRACK / NOTES
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(40px, 5vw, 60px)",
              fontWeight: 900,
              lineHeight: 0.9,
              color: "var(--text-primary)",
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            MY <span style={{ color: "#f59e0b" }}>NOTES</span>
          </h1>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--text-secondary)",
              opacity: 0.7,
            }}
          >
            <span>
              <span style={{ color: "#f59e0b", opacity: 1 }}>
                {notes.length}
              </span>{" "}
              TOTAL
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>
              <span style={{ color: "#f59e0b", opacity: 1 }}>
                {pinned.length}
              </span>{" "}
              PINNED
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>
              <span style={{ color: "#f59e0b", opacity: 1 }}>
                {unpinned.length}
              </span>{" "}
              OPEN
            </span>
          </div>
        </div>
        <button
          className="tact-btn"
          onClick={() => setModal("new")}
          style={{
            padding: "10px 20px",
            background: "#f59e0b",
            border: "1px solid #f59e0b",
            color: "#000",
            boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> NEW NOTE
        </button>
      </div>

      {/* Search + filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              fontSize: 14,
              opacity: 0.5,
            }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search notes..."
            className="notes-input"
            style={{ paddingLeft: 32 }}
            onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            className={`filter-chip ${filterColor === "all" ? "active" : ""}`}
            onClick={() => setFilterColor("all")}
            style={
              filterColor === "all"
                ? {
                    borderColor: "#f59e0b",
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.08)",
                  }
                : {}
            }
          >
            ALL
          </button>
          {COLORS.map((col) => (
            <button
              key={col}
              className={`filter-chip ${filterColor === col ? "active" : ""}`}
              onClick={() => setFilterColor(filterColor === col ? "all" : col)}
              style={
                filterColor === col
                  ? {
                      borderColor: COLOR_MAP[col].accent,
                      color: COLOR_MAP[col].accent,
                      background: `${COLOR_MAP[col].accent}10`,
                    }
                  : {}
              }
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: COLOR_MAP[col].accent,
                  display: "inline-block",
                }}
              />
              {COLOR_MAP[col].tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 50,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "var(--text-secondary)",
            opacity: 0.5,
          }}
        >
          <span
            style={{
              animation: "notes-spin 0.8s linear infinite",
              display: "inline-block",
            }}
          >
            ⟳
          </span>
          LOADING NOTES...
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ paddingTop: 50 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 52,
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1,
              color: "var(--border)",
              marginBottom: 10,
            }}
          >
            {search ? "NO RESULTS" : "EMPTY"}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "var(--text-secondary)",
              opacity: 0.4,
            }}
          >
            {search
              ? `// no notes matching "${search}"`
              : "// press NEW NOTE to get started"}
          </div>
        </div>
      )}

      {/* Pinned */}
      {!loading && pinned.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionLabel label="◆ PINNED" count={pinned.length} />
          <div style={{ columns: "300px", columnGap: "10px" }}>
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

      {/* Others */}
      {!loading && unpinned.length > 0 && (
        <div>
          <SectionLabel
            label={pinned.length > 0 ? "▸ NOTES" : ""}
            count={unpinned.length}
          />
          <div style={{ columns: "300px", columnGap: "10px" }}>
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

      {/* Modal */}
      {modal && (
        <NoteModal
          note={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card-bg)",
            border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            borderLeft: `3px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            color: toast.type === "error" ? "#ef4444" : "#10b981",
            padding: "10px 20px",
            borderRadius: "6px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 9999,
            whiteSpace: "nowrap",
            animation: "notes-toastIn 0.22s cubic-bezier(.34,1.56,.64,1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
