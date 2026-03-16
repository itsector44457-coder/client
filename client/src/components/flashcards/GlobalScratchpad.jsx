import { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Trash2,
  Download,
  X,
  Save,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";

const STORAGE_KEY = "skillvault_scratchpad_v2";
const PEN_SIZES = [
  { label: "S", size: 2 },
  { label: "M", size: 5 },
  { label: "L", size: 10 },
];
const COLORS = [
  "#1e293b",
  "#6366f1",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ffffff",
];
const CANVAS_W = 5000;
const CANVAS_H = 5000;

function ToolBtn({ children, active, onClick, disabled, title, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        disabled
          ? "text-slate-200 cursor-not-allowed"
          : danger
            ? "text-rose-400 hover:bg-rose-50 hover:text-rose-600"
            : active
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function GlobalScratchpad() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPtRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const isPanRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const toolRef = useRef("pen");
  const colorRef = useRef("#1e293b");
  const sizeRef = useRef(3);

  const [isOpen, setIsOpen] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1e293b");
  const [penSize, setPenSize] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasWork, setHasWork] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    sizeRef.current = penSize;
  }, [penSize]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setHasWork(true);
  }, []);

  const drawGrid = (ctx) => {
    ctx.save();
    ctx.fillStyle = "#cbd5e1";
    for (let x = 24; x < CANVAS_W; x += 24)
      for (let y = 24; y < CANVAS_H; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.restore();
  };

  const applyTransform = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.style.transform = `translate(${-offsetRef.current.x}px,${-offsetRef.current.y}px) scale(${zoomRef.current})`;
    c.style.transformOrigin = "0 0";
  }, []);

  const s2c = useCallback(
    (sx, sy) => ({
      x: (sx + offsetRef.current.x) / zoomRef.current,
      y: (sy + offsetRef.current.y) / zoomRef.current,
    }),
    [],
  );

  const getSP = (e) => {
    const r = containerRef.current.getBoundingClientRect();
    return e.touches
      ? { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
      : { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = CANVAS_W;
      c.height = CANVAS_H;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      drawGrid(ctx);
      const sv = localStorage.getItem(STORAGE_KEY);
      if (sv) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setHasWork(true);
        };
        img.src = sv;
      }
      const con = containerRef.current;
      if (con) {
        offsetRef.current = {
          x: CANVAS_W / 2 - con.clientWidth / 2,
          y: CANVAS_H / 2 - con.clientHeight / 2,
        };
        applyTransform();
      }
    }, 60);
    return () => clearTimeout(t);
  }, [isOpen, applyTransform]);

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const nz = Math.min(
        4,
        Math.max(0.2, zoomRef.current + (e.deltaY > 0 ? -0.1 : 0.1)),
      );
      zoomRef.current = nz;
      setZoom(nz);
      applyTransform();
    },
    [applyTransform],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen, onWheel]);

  const saveSnap = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    historyRef.current.push(c.toDataURL());
    if (historyRef.current.length > 25) historyRef.current.shift();
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setHasWork(true);
  }, []);

  const stroke = useCallback((from, to) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    if (toolRef.current === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = sizeRef.current * 8;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  const onDown = useCallback(
    (e) => {
      e.preventDefault();
      const sp = getSP(e);
      if (toolRef.current === "pan" || e.button === 1) {
        isPanRef.current = true;
        panStartRef.current = {
          x: sp.x + offsetRef.current.x,
          y: sp.y + offsetRef.current.y,
        };
        return;
      }
      saveSnap();
      isDrawingRef.current = true;
      const cp = s2c(sp.x, sp.y);
      lastPtRef.current = cp;
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.arc(
        cp.x,
        cp.y,
        toolRef.current === "eraser"
          ? sizeRef.current * 4
          : sizeRef.current / 2,
        0,
        Math.PI * 2,
      );
      ctx.globalCompositeOperation =
        toolRef.current === "eraser" ? "destination-out" : "source-over";
      ctx.fillStyle =
        toolRef.current === "eraser" ? "rgba(0,0,0,1)" : colorRef.current;
      ctx.fill();
    },
    [saveSnap, s2c],
  );

  const onMove = useCallback(
    (e) => {
      e.preventDefault();
      const sp = getSP(e);
      if (isPanRef.current) {
        const mX = Math.max(
          0,
          CANVAS_W * zoomRef.current -
            (containerRef.current?.clientWidth || 800),
        );
        const mY = Math.max(
          0,
          CANVAS_H * zoomRef.current -
            (containerRef.current?.clientHeight || 600),
        );
        offsetRef.current = {
          x: Math.max(0, Math.min(mX, panStartRef.current.x - sp.x)),
          y: Math.max(0, Math.min(mY, panStartRef.current.y - sp.y)),
        };
        applyTransform();
        return;
      }
      if (!isDrawingRef.current) return;
      const cp = s2c(sp.x, sp.y);
      stroke(lastPtRef.current, cp);
      lastPtRef.current = cp;
    },
    [applyTransform, s2c, stroke],
  );

  const onUp = useCallback(() => {
    isDrawingRef.current = false;
    isPanRef.current = false;
    lastPtRef.current = null;
  }, []);

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    redoRef.current.push(c.toDataURL());
    const prev = historyRef.current.pop();
    setCanRedo(true);
    setCanUndo(historyRef.current.length > 0);
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
  }, []);

  const redo = useCallback(() => {
    if (!redoRef.current.length) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const nxt = redoRef.current.pop();
    historyRef.current.push(c.toDataURL());
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nxt;
  }, []);

  const clear = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    saveSnap();
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawGrid(ctx);
    localStorage.removeItem(STORAGE_KEY);
    setHasWork(false);
  }, [saveSnap]);

  const save = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    localStorage.setItem(STORAGE_KEY, c.toDataURL());
    setSaved(true);
    setHasWork(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const download = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const d = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    let x1 = CANVAS_W,
      y1 = CANVAS_H,
      x2 = 0,
      y2 = 0;
    for (let y = 0; y < CANVAS_H; y++)
      for (let x = 0; x < CANVAS_W; x++) {
        if (d.data[(y * CANVAS_W + x) * 4 + 3] > 10) {
          if (x < x1) x1 = x;
          if (x > x2) x2 = x;
          if (y < y1) y1 = y;
          if (y > y2) y2 = y;
        }
      }
    const pad = 40;
    x1 = Math.max(0, x1 - pad);
    y1 = Math.max(0, y1 - pad);
    x2 = Math.min(CANVAS_W, x2 + pad);
    y2 = Math.min(CANVAS_H, y2 + pad);
    const w = x2 - x1 || CANVAS_W,
      h = y2 - y1 || CANVAS_H;
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tc = tmp.getContext("2d");
    tc.fillStyle = "#fff";
    tc.fillRect(0, 0, w, h);
    tc.drawImage(c, x1, y1, w, h, 0, 0, w, h);
    const a = document.createElement("a");
    a.download = `scratchpad-${new Date().toISOString().split("T")[0]}.png`;
    a.href = tmp.toDataURL();
    a.click();
  }, []);

  const zoomIn = useCallback(() => {
    const nz = Math.min(4, zoomRef.current + 0.2);
    zoomRef.current = nz;
    setZoom(nz);
    applyTransform();
  }, [applyTransform]);
  const zoomOut = useCallback(() => {
    const nz = Math.max(0.2, zoomRef.current - 0.2);
    zoomRef.current = nz;
    setZoom(nz);
    applyTransform();
  }, [applyTransform]);
  const resetView = useCallback(() => {
    zoomRef.current = 1;
    setZoom(1);
    const con = containerRef.current;
    if (con)
      offsetRef.current = {
        x: CANVAS_W / 2 - con.clientWidth / 2,
        y: CANVAS_H / 2 - con.clientHeight / 2,
      };
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    const h = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "p") setTool("pen");
      if (e.key === "e") setTool("eraser");
      if (e.key === "h") setTool("pan");
      if (e.key === "=" || e.key === "+") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, save, undo, redo, zoomIn, zoomOut, resetView]);

  const cursor =
    tool === "pan" ? "grab" : tool === "eraser" ? "cell" : "crosshair";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Open Scratchpad"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-[300] shadow-xl transition-all duration-200 active:scale-90 hover:scale-105 flex items-center justify-center rounded-2xl"
        style={{
          width: "52px",
          height: "52px",
          background: hasWork ? "#6366f1" : "#fff",
          border: hasWork ? "none" : "2px solid #e2e8f0",
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Pencil size={20} style={{ color: hasWork ? "#fff" : "#64748b" }} />
          {hasWork && (
            <span
              style={{
                width: "6px",
                height: "6px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 0.8,
                display: "block",
              }}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[500] flex flex-col"
          style={{ background: "#f1f5f9" }}
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-100 flex-wrap shrink-0 shadow-sm">
            <div className="flex items-center gap-2 mr-1">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Pencil size={14} className="text-white" />
              </div>
              <span className="text-sm font-black text-slate-800 uppercase italic hidden sm:block">
                Scratchpad
              </span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
                ∞ infinite
              </span>
            </div>
            <div className="w-px h-5 bg-slate-100 hidden sm:block" />
            <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5">
              <ToolBtn
                active={tool === "pen"}
                onClick={() => setTool("pen")}
                title="Pen (P)"
              >
                <Pencil size={14} />
              </ToolBtn>
              <ToolBtn
                active={tool === "eraser"}
                onClick={() => setTool("eraser")}
                title="Eraser (E)"
              >
                <Eraser size={14} />
              </ToolBtn>
              <ToolBtn
                active={tool === "pan"}
                onClick={() => setTool("pan")}
                title="Pan (H)"
              >
                <Move size={14} />
              </ToolBtn>
            </div>
            <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5">
              {PEN_SIZES.map((ps) => (
                <button
                  key={ps.label}
                  onClick={() => setPenSize(ps.size)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${penSize === ps.size ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white"}`}
                >
                  {ps.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 items-center">
              {COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    setColor(hex);
                    setTool("pen");
                  }}
                  className={`rounded-full transition-all border-2 ${color === hex && tool === "pen" ? "scale-125 border-indigo-500" : "border-slate-200 hover:scale-110"}`}
                  style={{ background: hex, width: "17px", height: "17px" }}
                />
              ))}
            </div>
            <div className="w-px h-5 bg-slate-100" />
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5">
              <ToolBtn onClick={zoomOut} title="Zoom Out (-)">
                <ZoomOut size={13} />
              </ToolBtn>
              <button
                onClick={resetView}
                className="px-2 h-7 text-[10px] font-black text-slate-500 hover:text-indigo-600 min-w-[44px] rounded-lg hover:bg-white transition-all"
              >
                {Math.round(zoom * 100)}%
              </button>
              <ToolBtn onClick={zoomIn} title="Zoom In (+)">
                <ZoomIn size={13} />
              </ToolBtn>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <ToolBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
              </ToolBtn>
              <ToolBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 7v6h-6" />
                  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                </svg>
              </ToolBtn>
            </div>
            <div className="w-px h-5 bg-slate-100" />
            <button
              onClick={save}
              title="Save (Ctrl+S)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${saved ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {saved ? (
                <>
                  <CheckCircle size={13} /> Saved!
                </>
              ) : (
                <>
                  <Save size={13} /> Save
                </>
              )}
            </button>
            <ToolBtn onClick={download} title="Download PNG">
              <Download size={14} />
            </ToolBtn>
            <ToolBtn onClick={clear} danger title="Clear All">
              <Trash2 size={14} />
            </ToolBtn>
            <div className="w-px h-5 bg-slate-100" />
            <button
              onClick={() => setIsOpen(false)}
              title="Close (Esc)"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative select-none"
            style={{ cursor }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          >
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transformOrigin: "0 0",
                boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              }}
            />
            {!hasWork && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3 z-10">
                <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Pencil size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400 italic">
                  Infinite canvas — draw anywhere!
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Scroll to zoom · H to pan · P to draw
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border-t border-slate-100 px-4 py-1.5 flex items-center gap-3 flex-wrap shrink-0">
            {[
              ["P", "Pen"],
              ["E", "Eraser"],
              ["H", "Pan"],
              ["Scroll", "Zoom"],
              ["Ctrl+Z", "Undo"],
              ["Ctrl+S", "Save"],
              ["0", "Reset View"],
              ["Esc", "Close"],
            ].map(([k, l]) => (
              <span
                key={k}
                className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1"
              >
                <kbd className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-400 font-mono text-[9px]">
                  {k}
                </kbd>
                {l}
              </span>
            ))}
            <div className="flex-1" />
            <span className="text-[9px] font-black text-slate-300 uppercase">
              {CANVAS_W}×{CANVAS_H}px · {Math.round(zoom * 100)}%
            </span>
            {hasWork && (
              <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                Saved locally
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
