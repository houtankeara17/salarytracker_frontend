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

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 480);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 480);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function CalcIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <line x1="8" y1="8" x2="10" y2="8" />
      <line x1="14" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="10" y2="16" />
      <line x1="14" y1="16" x2="16" y2="19" />
      <line x1="14" y1="19" x2="16" y2="16" />
    </svg>
  );
}

export default function FloatingCalculator() {
  const [raw, setRaw] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("calc");
  const [justEvaled, setJustEvaled] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const calcRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setPos({ x: null, y: null });
  }, [isMobile]);

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

  const handleInput = useCallback(
    (val) => {
      const ops = ["+", "-", "×", "÷"];
      const isOp = ops.includes(val);
      setPressedKey(val);
      setTimeout(() => setPressedKey(null), 130);

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
        if (result !== null)
          setHistory((h) =>
            [{ expr: fullExpr + "=", result: resultStr }, ...h].slice(
              0,
              HISTORY_MAX,
            ),
          );
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
      setTimeout(() => setCopied(false), 1800);
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

  const panelStyle = isMobile
    ? { left: 0, right: 0, bottom: 0, top: "auto" }
    : pos.x !== null
      ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
      : { right: 22, bottom: 84 };

  const getBtnType = (v) => {
    if (v === "=") return "eq";
    if (["+", "-", "×", "÷"].includes(v)) return "op";
    if (["C", "+/-", "%"].includes(v)) return "fn";
    if (v === "⌫") return "del";
    return "num";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');

        /* ── FAB ── */
        .cfab {
          position: fixed; right: 22px; bottom: 22px; z-index: 9998;
          width: 50px; height: 50px; border-radius: 14px; border: none; cursor: pointer;
          background: #1a1a1a;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,.22), 0 1px 4px rgba(0,0,0,.12);
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .18s, box-shadow .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .cfab:hover {
          transform: scale(1.08);
          background: #2d2d2d;
          box-shadow: 0 8px 28px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.14);
        }
        .cfab:active { transform: scale(.92); }
        .cfab.copen {
          background: #7dc729;
          color: #1a1a1a;
          box-shadow: 0 6px 20px rgba(125,199,41,.35), 0 2px 6px rgba(0,0,0,.1);
        }

        /* ── Backdrop ── */
        .cbd {
          position: fixed; inset: 0; z-index: 9997;
          background: rgba(220,225,215,.55);
          backdrop-filter: blur(10px);
          animation: cbdIn .2s ease;
        }
        @keyframes cbdIn { from{opacity:0} to{opacity:1} }

        /* ── Panel ── */
        .cpanel {
          position: fixed; z-index: 9999; width: 312px;
          border-radius: 20px; overflow: hidden;
          font-family: 'Inter', sans-serif;
          background: #f5f6f2;
          border: 1px solid rgba(0,0,0,.07);
          box-shadow:
            0 2px 0 rgba(255,255,255,.9) inset,
            0 20px 60px rgba(0,0,0,.14),
            0 4px 16px rgba(0,0,0,.08);
          animation: cUp .26s cubic-bezier(.34,1.56,.64,1);
          display: flex; flex-direction: column;
          max-height: calc(100vh - 44px);
        }
        .cpanel.cmob {
          width: 100%; max-width: 100%;
          border-radius: 20px 20px 0 0;
          max-height: 92vh;
          animation: cSheet .26s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes cUp    { from{opacity:0;transform:scale(.92) translateY(18px)} to{opacity:1;transform:none} }
        @keyframes cSheet { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:none} }

        /* ── Pill ── */
        .cpill {
          display: none; width: 36px; height: 4px; border-radius: 99px;
          background: rgba(0,0,0,.1); margin: 10px auto 0;
        }
        .cpanel.cmob .cpill { display: block; }

        /* ── Header ── */
        .chead {
          display: flex; align-items: center; gap: 10px;
          padding: 15px 16px 12px; cursor: grab; user-select: none;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .cpanel.cmob .chead { cursor: default; }

        .chead-brand {
          font-size: 13px; font-weight: 700; color: #1a1a1a;
          letter-spacing: -.03em; flex: 1;
          display: flex; align-items: center; gap: 6px;
        }
        .chead-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #7dc729;
          box-shadow: 0 0 6px rgba(125,199,41,.6);
        }

        /* Tabs */
        .ctabs { display: flex; gap: 2px; }
        .ctab {
          padding: 5px 11px; border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
          background: transparent; color: rgba(0,0,0,.35);
          transition: background .15s, color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .ctab:hover { background: rgba(0,0,0,.05); color: rgba(0,0,0,.65); }
        .ctab.con {
          background: #1a1a1a; color: #fff;
          border-radius: 8px;
        }

        .cclose {
          width: 26px; height: 26px; border-radius: 8px; border: none;
          background: rgba(0,0,0,.06); color: rgba(0,0,0,.4);
          font-size: 11px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s, color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .cclose:hover { background: rgba(220,50,50,.1); color: #e03535; }

        /* ── Display ── */
        .cdisp {
          margin: 10px 12px 4px;
          padding: 18px 18px 20px;
          border-radius: 14px;
          background: #1a1a1a;
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
          min-height: 110px; justify-content: flex-end;
          position: relative; flex-shrink: 0; overflow: hidden;
        }
        /* lime green glow bottom-right */
        .cdisp::after {
          content: '';
          position: absolute; bottom: -30px; right: -30px;
          width: 130px; height: 130px; border-radius: 50%;
          background: radial-gradient(circle, rgba(125,199,41,.18) 0%, transparent 70%);
          pointer-events: none;
        }
        /* circuit-board subtle lines top */
        .cdisp::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .cexpr {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,.28);
          min-height: 18px; max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl;
          position: relative; z-index: 1;
        }
        .cmain {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(30px, 9vw, 40px); font-weight: 300; line-height: 1.0;
          color: #fff;
          max-width: 100%; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap; direction: rtl;
          cursor: pointer; transition: color .15s;
          letter-spacing: -.03em;
          position: relative; z-index: 1;
        }
        .cpanel.cmob .cmain { font-size: clamp(32px, 10vw, 44px); }
        .cmain:hover { color: #a8e05a; }
        .cmain.cerr  { color: #ff7070; font-size: 22px; }

        .ccopy {
          position: absolute; bottom: 9px; left: 18px;
          font-size: 10px; font-family: 'Inter', sans-serif; font-weight: 400;
          color: rgba(255,255,255,.18); pointer-events: none; transition: color .15s;
          z-index: 1;
        }
        .cmain:hover ~ .ccopy { color: rgba(168,224,90,.5); }
        .ccopy.con { color: #7dc729 !important; }

        /* ── Grid ── */
        .cgrid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 7px; padding: 10px 12px 14px;
        }
        .cpanel.cmob .cgrid { gap: 9px; padding: 10px 14px 24px; }

        /* Base button */
        .cb {
          border: none; cursor: pointer; border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 16px; font-weight: 500;
          display: flex; align-items: center; justify-content: center;
          height: 58px;
          -webkit-tap-highlight-color: transparent;
          transition: transform .12s cubic-bezier(.34,1.56,.64,1), background .12s, box-shadow .12s;
          letter-spacing: -.01em;
          position: relative;
        }
        .cpanel.cmob .cb { height: 64px; font-size: 18px; border-radius: 14px; }

        .cb:hover  { transform: translateY(-1px); }
        .cb:active, .cb.cpressed { transform: scale(.88) !important; }

        /* Number — white card */
        .cb-num {
          background: #ffffff;
          color: #1a1a1a;
          box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.05);
        }
        .cb-num:hover { background: #fafafa; box-shadow: 0 3px 10px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.06); }

        /* Function — light grey */
        .cb-fn {
          background: #eaeee6;
          color: #5a6350;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
        }
        .cb-fn:hover { background: #e2e7de; }

        /* Delete — soft red tint */
        .cb-del {
          background: #fff0f0;
          color: #d94040;
          box-shadow: 0 1px 3px rgba(217,64,64,.08), 0 0 0 1px rgba(217,64,64,.08);
          font-size: 18px;
        }
        .cb-del:hover { background: #ffe4e4; color: #c03030; }

        /* Operator — lime tint */
        .cb-op {
          background: #f0f8e8;
          color: #4a8020;
          box-shadow: 0 1px 3px rgba(74,128,32,.08), 0 0 0 1px rgba(125,199,41,.12);
          font-size: 17px;
        }
        .cb-op:hover { background: #e8f5d8; color: #3d6b1a; }

        /* Equals — Crusoe dark pill */
        .cb-eq {
          background: #1a1a1a;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,.25), 0 1px 4px rgba(0,0,0,.15);
          font-size: 20px; font-weight: 600;
        }
        .cb-eq:hover {
          background: #2d2d2d;
          box-shadow: 0 6px 20px rgba(0,0,0,.3), 0 2px 6px rgba(0,0,0,.15);
          transform: translateY(-1px);
        }
        .cb-eq:active, .cb-eq.cpressed {
          transform: scale(.88) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,.2);
        }

        /* ── History ── */
        .chist {
          flex: 1; overflow-y: auto; padding: 4px 12px 12px;
          scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.1) transparent;
          min-height: 0;
        }
        .chist-hd {
          font-size: 10px; text-transform: uppercase; letter-spacing: .14em;
          color: rgba(0,0,0,.25); font-weight: 600; margin: 8px 0 10px;
        }
        .chist-clear {
          width: 100%; padding: 9px; border-radius: 10px;
          border: 1px solid rgba(217,64,64,.15);
          margin-bottom: 10px;
          background: #fff5f5; color: #d94040;
          font-size: 11px; font-weight: 500; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background .15s;
        }
        .chist-clear:hover { background: #ffe8e8; }

        .chist-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 13px; border-radius: 12px; margin-bottom: 5px;
          background: #fff;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
          cursor: pointer; transition: background .15s, box-shadow .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .chist-row:hover { background: #f8faf4; box-shadow: 0 3px 10px rgba(0,0,0,.07); border-color: rgba(125,199,41,.2); }
        .chist-expr {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: rgba(0,0,0,.3);
          max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .chist-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px; color: #1a1a1a; font-weight: 500;
        }
        .chist-empty {
          font-size: 12px; color: rgba(0,0,0,.2); text-align: center;
          padding: 40px 0; font-family: 'Inter', sans-serif; font-weight: 400;
        }
      `}</style>

      <div>
        {isMobile && open && (
          <div className="cbd" onClick={() => setOpen(false)} />
        )}

        {/* FAB */}
        <button
          className={`cfab${open ? " copen" : ""}`}
          onClick={() => setOpen((o) => !o)}
          title="Calculator"
        >
          <CalcIcon size={20} />
        </button>

        {open && (
          <div
            ref={calcRef}
            className={`cpanel${isMobile ? " cmob" : ""}`}
            style={panelStyle}
          >
            <div className="cpill" />

            {/* Header */}
            <div className="chead" onMouseDown={onMouseDown}>
              <div className="chead-brand">
                <div className="chead-dot" />
                Calculator
              </div>
              <div className="ctabs">
                <button
                  className={`ctab${view === "calc" ? " con" : ""}`}
                  onClick={() => setView("calc")}
                >
                  Keypad
                </button>
                <button
                  className={`ctab${view === "history" ? " con" : ""}`}
                  onClick={() => setView("history")}
                >
                  History{history.length > 0 ? ` · ${history.length}` : ""}
                </button>
              </div>
              <button className="cclose" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {/* History */}
            {view === "history" && (
              <div className="chist">
                <p className="chist-hd">Recent</p>
                {history.length > 0 && (
                  <button
                    className="chist-clear"
                    onClick={() => setHistory([])}
                  >
                    Clear all
                  </button>
                )}
                {history.length === 0 ? (
                  <div className="chist-empty">No calculations yet</div>
                ) : (
                  history.map((h, i) => (
                    <div
                      key={i}
                      className="chist-row"
                      onClick={() => {
                        setRaw(h.result);
                        setExpression("");
                        setJustEvaled(true);
                        setView("calc");
                      }}
                    >
                      <span className="chist-expr">{h.expr}</span>
                      <span className="chist-val">
                        {formatDisplay(h.result)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Calc */}
            {view === "calc" && (
              <>
                <div className="cdisp">
                  <div className="cexpr">{exprLine}</div>
                  <div
                    className={`cmain${raw === "Error" ? " cerr" : ""}`}
                    onClick={copyResult}
                    title="Tap to copy"
                  >
                    {raw === "Error" ? "Error" : formatDisplay(raw)}
                  </div>
                  <div className={`ccopy${copied ? " con" : ""}`}>
                    {copied ? "✓ Copied" : "Tap to copy"}
                  </div>
                </div>

                <div className="cgrid">
                  {buttons.flat().map((v, i) => {
                    const t = getBtnType(v);
                    return (
                      <button
                        key={i}
                        className={`cb cb-${t}${pressedKey === v ? " cpressed" : ""}`}
                        onClick={() => handleInput(v)}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
