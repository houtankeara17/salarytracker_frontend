import { useState, useEffect, useRef, useCallback } from "react";

const HISTORY_MAX = 20;

function calcEvaluate(expr) {
  try {
    const safe = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, "");
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + safe + ")")();
    if (!isFinite(result) || isNaN(result)) return null;
    return parseFloat(result.toPrecision(10));
  } catch {
    return null;
  }
}

function formatDisplay(raw) {
  if (raw === "Error") return "Error";
  const endsWithDot = raw.endsWith(".");
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  if (Number.isInteger(num) && !endsWithDot) return num.toLocaleString("en-US");
  const dotIdx = raw.indexOf(".");
  const intStr = raw.slice(0, dotIdx === -1 ? undefined : dotIdx);
  const decStr = dotIdx !== -1 ? raw.slice(dotIdx + 1) : "";
  const formattedInt = parseInt(intStr || "0", 10).toLocaleString("en-US");
  if (endsWithDot) return formattedInt + ".";
  if (decStr) return formattedInt + "." + decStr;
  return formattedInt;
}

// detect small screen
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 480);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 480);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function FloatingCalculator() {
  const [raw, setRaw] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("calc"); // "calc" | "history"
  const [justEvaled, setJustEvaled] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const calcRef = useRef(null);
  const isMobile = useIsMobile();

  // Reset position when switching mobile/desktop
  useEffect(() => {
    setPos({ x: null, y: null });
  }, [isMobile]);

  // ── Drag (desktop only) ───────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (isMobile || e.target.closest("button")) return;
    setDragging(true);
    const rect = calcRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (pos.x ?? rect.left),
      y: e.clientY - (pos.y ?? rect.top),
    };
    e.preventDefault();
  };
  useEffect(() => {
    if (!dragging) return;
    const move = (e) =>
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging]);

  // ── Input handler ─────────────────────────────────────────────────────────
  const handleInput = useCallback(
    (val) => {
      const ops = ["+", "-", "×", "÷"];
      const isOp = ops.includes(val);

      if (val === "C") {
        setRaw("0");
        setExpression("");
        setJustEvaled(false);
        return;
      }
      if (val === "⌫") {
        if (justEvaled) {
          setRaw("0");
          setExpression("");
          setJustEvaled(false);
          return;
        }
        setRaw((r) => {
          const n = r.slice(0, -1);
          return n === "" || n === "-" ? "0" : n;
        });
        return;
      }
      if (val === "=") {
        const fullExpr = expression + raw;
        const result = calcEvaluate(fullExpr);
        const resultStr = result !== null ? String(result) : "Error";
        if (result !== null) {
          setHistory((h) =>
            [{ expr: fullExpr + "=", result: resultStr }, ...h].slice(
              0,
              HISTORY_MAX,
            ),
          );
        }
        setExpression(fullExpr + "=");
        setRaw(resultStr);
        setJustEvaled(true);
        return;
      }
      if (val === "%") {
        const n = parseFloat(raw);
        if (!isNaN(n)) setRaw(String(n / 100));
        return;
      }
      if (val === "+/-") {
        setRaw((r) =>
          r.startsWith("-") ? r.slice(1) : r === "0" ? "0" : "-" + r,
        );
        return;
      }
      if (isOp) {
        if (justEvaled) {
          setExpression(raw + val);
          setRaw("0");
          setJustEvaled(false);
          return;
        }
        if (expression && ops.includes(expression.slice(-1))) {
          setExpression(expression.slice(0, -1) + val);
          return;
        }
        setExpression(expression + raw + val);
        setRaw("0");
        return;
      }
      if (justEvaled) {
        setExpression("");
        setRaw(val === "." ? "0." : val);
        setJustEvaled(false);
        return;
      }
      if (val === "." && raw.includes(".")) return;
      setRaw((r) => (r === "0" && val !== "." ? val : r + val));
    },
    [raw, expression, justEvaled],
  );

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      const map = {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        ".": ".",
        "+": "+",
        "-": "-",
        "*": "×",
        "/": "÷",
        "%": "%",
        Enter: "=",
        "=": "=",
        Backspace: "⌫",
        Escape: "C",
      };
      if (map[e.key]) {
        e.preventDefault();
        handleInput(map[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleInput]);

  const copyResult = () => {
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const exprLine = justEvaled ? expression : expression || "\u00A0";

  const buttons = [
    ["C", "+/-", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["⌫", "0", ".", "="],
  ];

  const btnClass = (v) => {
    if (v === "=") return "cb cb-eq";
    if (["+", "-", "×", "÷"].includes(v)) return "cb cb-op";
    if (["C", "+/-", "%"].includes(v)) return "cb cb-fn";
    if (v === "⌫") return "cb cb-del";
    return "cb cb-num";
  };

  // Panel position: on mobile → bottom sheet anchored to viewport
  // On desktop → floating near FAB, or dragged
  const panelStyle = isMobile
    ? {
        left: 0,
        right: 0,
        bottom: 0,
        top: "auto",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        width: "100%",
        maxWidth: "100%",
      }
    : pos.x !== null
      ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
      : { right: 24, bottom: 88 };

  // Mobile overlay backdrop
  const showBackdrop = isMobile && open;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

        .cw * { box-sizing: border-box; }

        /* ── FAB ── */
        .c-fab {
          position: fixed; right: 16px; bottom: 16px; z-index: 9998;
          width: 50px; height: 50px; border-radius: 15px; border: none; cursor: pointer;
          background: linear-gradient(145deg, #f59e0b 0%, #ef4444 100%);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          box-shadow: 0 6px 20px rgba(245,158,11,.45), 0 2px 6px rgba(0,0,0,.35);
          transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .c-fab:hover  { transform: scale(1.1) rotate(-8deg); box-shadow: 0 10px 30px rgba(245,158,11,.6); }
        .c-fab:active { transform: scale(.91); }

        /* ── Backdrop (mobile) ── */
        .c-backdrop {
          position: fixed; inset: 0; z-index: 9997;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(2px);
          animation: bdIn .18s ease;
        }
        @keyframes bdIn { from{opacity:0} to{opacity:1} }

        /* ── Panel ── */
        .c-panel {
          position: fixed; z-index: 9999;
          width: 284px;
          border-radius: 24px; overflow: hidden;
          font-family: 'Outfit', sans-serif;
          background: #16161d;
          box-shadow: 0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.09);
          animation: cUp .22s cubic-bezier(.34,1.56,.64,1);
          display: flex; flex-direction: column;
          max-height: calc(100vh - 32px);
        }
        /* Mobile bottom-sheet override */
        .c-panel.is-mobile {
          width: 100%; max-width: 100%;
          border-radius: 24px 24px 0 0;
          max-height: 92vh;
          animation: cSheet .24s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes cUp    { from{opacity:0;transform:scale(.84) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cSheet { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }

        /* ── Header ── */
        .c-head {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 14px 8px; cursor: grab; flex-shrink: 0;
        }
        .c-panel.is-mobile .c-head { cursor: default; padding: 16px 18px 8px; }
        .c-head:active { cursor: grabbing; }

        /* Mobile drag pill */
        .c-pill {
          display: none; width: 36px; height: 4px; border-radius: 2px;
          background: rgba(255,255,255,.15); margin: 0 auto 4px;
        }
        .c-panel.is-mobile .c-pill { display: block; }

        .c-head-title {
          flex: 1; font-size: 11px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* Tab switcher */
        .c-tabs { display: flex; gap: 4px; }
        .c-tab {
          padding: 4px 10px; border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600;
          transition: background .15s, color .15s;
          background: rgba(255,255,255,.06); color: #4b5563;
          -webkit-tap-highlight-color: transparent;
        }
        .c-tab.active { background: rgba(245,158,11,.18); color: #f59e0b; }

        .c-icon-btn {
          width: 26px; height: 26px; border-radius: 8px; border: none;
          background: rgba(255,255,255,.07); color: #4b5563; font-size: 13px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background .15s, color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .c-icon-btn:hover { background: rgba(255,255,255,.14); color: #d1d5db; }

        /* ── History view ── */
        .c-hist-view {
          flex: 1; overflow-y: auto; padding: 4px 12px 12px;
          scrollbar-width: thin; scrollbar-color: #2d3748 transparent;
          min-height: 0;
        }
        .c-hist-hd {
          font-size: 10px; text-transform: uppercase; letter-spacing: .12em;
          color: #2d3748; font-weight: 700; margin: 6px 0 8px; padding: 0 2px;
        }
        .c-hist-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 12px; border-radius: 12px; margin-bottom: 4px;
          background: #111118; cursor: pointer; transition: background .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .c-hist-row:hover, .c-hist-row:active { background: #1e1e2e; }
        .c-hist-expr { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #374151; max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .c-hist-val  { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #f59e0b; font-weight: 500; }
        .c-hist-empty { font-size: 12px; color: #1e293b; text-align: center; padding: 32px 0; }
        .c-hist-clear {
          margin: 4px 0 8px; width: 100%; padding: 7px; border-radius: 10px; border: none;
          background: rgba(239,68,68,.08); color: #ef4444; font-size: 11px; font-weight: 600;
          font-family: 'Outfit', sans-serif; cursor: pointer; transition: background .15s;
        }
        .c-hist-clear:hover { background: rgba(239,68,68,.15); }

        /* ── Calc view ── */
        .c-calc-view { flex-shrink: 0; }

        .c-display {
          padding: 2px 16px 14px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
          min-height: 80px; justify-content: flex-end; position: relative;
        }
        .c-panel.is-mobile .c-display { padding: 2px 20px 14px; min-height: 86px; }

        .c-expr {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #2d3a4a; min-height: 17px;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; direction: rtl;
        }
        .c-main {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 400; line-height: 1.1; color: #f1f5f9;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; direction: rtl;
          cursor: pointer; transition: color .12s;
          /* Responsive font size */
          font-size: clamp(26px, 9vw, 36px);
        }
        .c-panel.is-mobile .c-main { font-size: clamp(28px, 10vw, 40px); }
        .c-main:hover { color: #fbbf24; }
        .c-main.is-error { color: #f87171; font-size: 22px; }
        .c-copy-tip {
          position: absolute; bottom: 4px; left: 16px;
          font-size: 10px; font-family: 'Outfit', sans-serif;
          color: #1e293b; transition: color .2s; pointer-events: none;
        }
        .c-main:hover ~ .c-copy-tip { color: #f59e0b; }
        .c-copy-tip.on { color: #4ade80 !important; }

        .c-sep { height: 1px; background: rgba(255,255,255,.05); margin: 0 12px 2px; }

        /* ── Button grid ── */
        .c-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 6px; padding: 8px 10px 12px;
        }
        .c-panel.is-mobile .c-grid { gap: 8px; padding: 8px 12px 20px; }

        .cb {
          border: none; cursor: pointer; border-radius: 14px;
          font-size: 16px; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center;
          transition: transform .1s;
          position: relative; overflow: hidden;
          height: 54px;
          -webkit-tap-highlight-color: transparent;
        }
        /* Mobile: taller buttons */
        .c-panel.is-mobile .cb { height: 62px; font-size: 18px; border-radius: 16px; }

        .cb::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: rgba(255,255,255,.0); transition: background .15s;
        }
        .cb:hover::after  { background: rgba(255,255,255,.10); }
        .cb:active        { transform: scale(.88); }

        .cb-num {
          background: #222230; color: #e2e8f0;
          box-shadow: 0 3px 0 #0b0b14, inset 0 1px 0 rgba(255,255,255,.06);
        }
        .cb-fn {
          background: #1b2438; color: #7c8fa8;
          box-shadow: 0 3px 0 #0a0f1c, inset 0 1px 0 rgba(255,255,255,.05);
        }
        .cb-del {
          background: #2b1616; color: #f87171; font-size: 18px;
          box-shadow: 0 3px 0 #150b0b, inset 0 1px 0 rgba(255,100,100,.07);
        }
        .cb-op {
          background: linear-gradient(160deg, #b45309 0%, #78350f 100%);
          color: #fde68a; font-size: 18px;
          box-shadow: 0 3px 0 #3d1a02, inset 0 1px 0 rgba(253,230,138,.12);
        }
        .cb-eq {
          background: linear-gradient(150deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%);
          color: #1c0a00; font-size: 20px; font-weight: 700;
          box-shadow: 0 4px 18px rgba(251,191,36,.45), 0 3px 0 #7c2d12, inset 0 1px 0 rgba(255,255,200,.25);
        }
        .cb-eq:hover { filter: brightness(1.08); }
      `}</style>

      <div className="cw">
        {/* Backdrop on mobile */}
        {showBackdrop && (
          <div className="c-backdrop" onClick={() => setOpen(false)} />
        )}

        {/* FAB */}
        <button
          className="c-fab"
          onClick={() => setOpen((o) => !o)}
          title="Calculator"
        >
          🧮
        </button>

        {/* Panel */}
        {open && (
          <div
            ref={calcRef}
            className={`c-panel${isMobile ? " is-mobile" : ""}`}
            style={panelStyle}
          >
            {/* Drag pill (mobile) */}
            <div className="c-pill" />

            {/* Header */}
            <div className="c-head" onMouseDown={onMouseDown}>
              <span className="c-head-title">Calculator</span>
              {/* Tab switcher */}
              <div className="c-tabs">
                <button
                  className={`c-tab${view === "calc" ? " active" : ""}`}
                  onClick={() => setView("calc")}
                >
                  🔢 Calc
                </button>
                <button
                  className={`c-tab${view === "history" ? " active" : ""}`}
                  onClick={() => setView("history")}
                >
                  📋 {history.length > 0 ? history.length : ""}
                </button>
              </div>
              <button className="c-icon-btn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {/* ── History view ── */}
            {view === "history" && (
              <div className="c-hist-view">
                <p className="c-hist-hd">Calculation History</p>
                {history.length > 0 && (
                  <button
                    className="c-hist-clear"
                    onClick={() => setHistory([])}
                  >
                    🗑 Clear history
                  </button>
                )}
                {history.length === 0 ? (
                  <div className="c-hist-empty">No calculations yet</div>
                ) : (
                  history.map((h, i) => (
                    <div
                      key={i}
                      className="c-hist-row"
                      onClick={() => {
                        setRaw(h.result);
                        setExpression("");
                        setJustEvaled(true);
                        setView("calc");
                      }}
                    >
                      <span className="c-hist-expr">{h.expr}</span>
                      <span className="c-hist-val">
                        {formatDisplay(h.result)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Calc view ── */}
            {view === "calc" && (
              <div className="c-calc-view">
                {/* Display */}
                <div className="c-display">
                  <div className="c-expr">{exprLine}</div>
                  <div
                    className={`c-main${raw === "Error" ? " is-error" : ""}`}
                    onClick={copyResult}
                    title="Tap to copy"
                  >
                    {raw === "Error" ? "Error" : formatDisplay(raw)}
                  </div>
                  <div className={`c-copy-tip${copied ? " on" : ""}`}>
                    {copied ? "✓ Copied!" : "tap to copy"}
                  </div>
                </div>

                <div className="c-sep" />

                {/* Buttons */}
                <div className="c-grid">
                  {buttons.flat().map((v, i) => (
                    <button
                      key={i}
                      className={btnClass(v)}
                      onClick={() => handleInput(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
