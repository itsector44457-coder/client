import { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Trash2,
  Download,
  X,
  Save,
  CheckCircle,
  Maximize2,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const STORAGE_KEY = "skillvault_scratchpad";
const PEN_SIZES = [
  { label: "S", size: 2 },
  { label: "M", size: 5 },
  { label: "L", size: 10 },
];
const COLORS = [
  { hex: "#1e293b", label: "Black" },
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#10b981", label: "Green" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#ffffff", label: "White" },
];

// ─────────────────────────────────────────────────────────────

export default function GlobalScratchpad() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);

  const [isOpen, setIsOpen] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1e293b");
  const [penSize, setPenSize] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saved, setSaved] = useState(false); // save feedback
  const [hasWork, setHasWork] = useState(false); // kuch likha hai?

  // ── Load saved canvas on mount ────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHasWork(true);
  }, []);

  // ── Setup canvas when opened ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Small delay taaki DOM render ho jaye
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // White background
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Restore saved work
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = savedData;
        setHasWork(true);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveWork();
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
      if (e.key === "e") setTool("eraser");
      if (e.key === "p") setTool("pen");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // ── Save snapshot ─────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setHasWork(true);
  }, []);

  // ── Get point ─────────────────────────────────────────────
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ── Draw line ─────────────────────────────────────────────
  const drawLine = useCallback(
    (from, to) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = penSize * 6;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = penSize;
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    },
    [tool, color, penSize],
  );

  // ── Pointer events ────────────────────────────────────────
  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      saveSnapshot();
      isDrawingRef.current = true;
      lastPointRef.current = getPoint(e);

      // Dot on tap
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pt = lastPointRef.current;
      ctx.beginPath();
      ctx.arc(
        pt.x,
        pt.y,
        tool === "eraser" ? penSize * 3 : penSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
      ctx.fill();
    },
    [saveSnapshot, tool, color, penSize],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const current = getPoint(e);
      drawLine(lastPointRef.current, current);
      lastPointRef.current = current;
    },
    [drawLine],
  );

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  // ── Undo ─────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    redoRef.current.push(canvas.toDataURL());
    const prev = historyRef.current.pop();
    setCanRedo(true);
    setCanUndo(historyRef.current.length > 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, rect.width, rect.height);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = prev;
  }, []);

  // ── Redo ─────────────────────────────────────────────────
  const redo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const next = redoRef.current.pop();
    historyRef.current.push(canvas.toDataURL());
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = next;
  }, []);

  // ── Save to localStorage ──────────────────────────────────
  const saveWork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    localStorage.setItem(STORAGE_KEY, canvas.toDataURL());
    setSaved(true);
    setHasWork(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // ── Clear ─────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveSnapshot();
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, rect.width, rect.height);
    localStorage.removeItem(STORAGE_KEY);
    setHasWork(false);
  }, [saveSnapshot]);

  // ── Download PNG ──────────────────────────────────────────
  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `scratchpad-${new Date().toISOString().split("T")[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setIsOpen(true)}
        title="Open Scratchpad"
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-6 z-[300]
          w-13 h-13 rounded-2xl shadow-xl transition-all duration-200
          flex items-center justify-center gap-0
          active:scale-90 hover:scale-105 group
          ${
            hasWork
              ? "bg-indigo-600 shadow-indigo-200"
              : "bg-white border-2 border-slate-200 shadow-slate-100"
          }`}
        style={{ width: "52px", height: "52px" }}
      >
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Pencil
            size={20}
            className={
              hasWork
                ? "text-white"
                : "text-slate-500 group-hover:text-indigo-500"
            }
          />
          {/* Dot indicator — saved work hai */}
          {hasWork && (
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-80" />
          )}
        </div>
      </button>

      {/* ── Fullscreen Modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[500] flex flex-col"
          style={{ background: "#f8fafc" }}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100 flex-wrap shrink-0 shadow-sm">
            {/* Title */}
            <div className="flex items-center gap-2 mr-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Pencil size={14} className="text-white" />
              </div>
              <span className="text-sm font-black text-slate-800 uppercase italic hidden sm:block">
                Scratchpad
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block" />

            {/* Pen / Eraser toggle */}
            <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5">
              <ToolBtn
                active={tool === "pen"}
                onClick={() => setTool("pen")}
                title="Pen (P)"
              >
                <Pencil size={15} />
              </ToolBtn>
              <ToolBtn
                active={tool === "eraser"}
                onClick={() => setTool("eraser")}
                title="Eraser (E)"
              >
                <Eraser size={15} />
              </ToolBtn>
            </div>

            {/* Pen sizes */}
            <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-xl p-0.5">
              {PEN_SIZES.map((ps) => (
                <button
                  key={ps.label}
                  onClick={() => setPenSize(ps.size)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                    penSize === ps.size
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-white hover:text-slate-700"
                  }`}
                >
                  {ps.label}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex gap-1.5 items-center">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setColor(c.hex);
                    setTool("pen");
                  }}
                  title={c.label}
                  className={`rounded-full transition-all border-2 ${
                    color === c.hex && tool === "pen"
                      ? "scale-125 border-indigo-500"
                      : "border-slate-200 hover:scale-110"
                  }`}
                  style={{ background: c.hex, width: "18px", height: "18px" }}
                />
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Undo / Redo */}
            <div className="flex gap-1">
              <ToolBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <svg
                  width="15"
                  height="15"
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
                  width="15"
                  height="15"
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

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 mx-1" />

            {/* Save button */}
            <button
              onClick={saveWork}
              title="Save (Ctrl+S)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle size={14} /> Saved!
                </>
              ) : (
                <>
                  <Save size={14} /> Save
                </>
              )}
            </button>

            {/* Download */}
            <ToolBtn onClick={downloadCanvas} title="Download PNG">
              <Download size={15} />
            </ToolBtn>

            {/* Clear */}
            <ToolBtn onClick={clearCanvas} title="Clear All" danger>
              <Trash2 size={15} />
            </ToolBtn>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 mx-1" />

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close (Esc)"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500 flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Canvas Area */}
          <div
            className="flex-1 relative"
            style={{
              cursor: tool === "eraser" ? "cell" : "crosshair",
              backgroundImage:
                "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundColor: "#fafafa",
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              style={{ display: "block" }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />

            {/* Empty state hint */}
            {!hasWork && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Pencil size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-300 italic">
                  Start writing your rough work...
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                  Ctrl+S to save · Esc to close
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-slate-100 px-4 py-2 flex items-center gap-4 flex-wrap shrink-0">
            {[
              ["P", "Pen"],
              ["E", "Eraser"],
              ["Ctrl+Z", "Undo"],
              ["Ctrl+Y", "Redo"],
              ["Ctrl+S", "Save"],
              ["Esc", "Close"],
            ].map(([key, label]) => (
              <span
                key={key}
                className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1"
              >
                <kbd className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
            <div className="flex-1" />
            {hasWork && (
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Work saved locally
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Toolbar button ────────────────────────────────────────────
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
