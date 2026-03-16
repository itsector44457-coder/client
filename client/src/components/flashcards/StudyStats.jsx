import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Flame,
  Target,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Loader2,
  RotateCcw,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

const API = "https://backend-6hhv.onrender.com/api/stats";

// ── Heatmap helpers (🔥 IST Timezone BUG FIXED) ───────────────
function getLast365Days() {
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // 🛠️ The Magic Fix: Isse Indian Time (IST) hamesha sahi aayega
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getHeatColor(count) {
  if (count === 0) return { bg: "#f8fafc", border: "#f1f5f9" }; // Lighter empty state
  if (count <= 5) return { bg: "#c7d2fe", border: "#a5b4fc" };
  if (count <= 15) return { bg: "#818cf8", border: "#6366f1" };
  if (count <= 30) return { bg: "#4f46e5", border: "#4338ca" };
  return { bg: "#1e1b4b", border: "#312e81" };
}

// ── Retention Ring ────────────────────────────────────────────
function RetentionRing({ value, size = 80, stroke = 8, color = "#6366f1" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "center",
          fontSize: size * 0.22,
          fontWeight: 900,
          fill: "#1e293b",
          fontStyle: "italic",
        }}
      >
        {value}%
      </text>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function StudyStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!myId) return;
    axios
      .get(`${API}/${myId}`)
      .then((r) => setStats(r.data))
      .catch((err) => console.error("Stats load error:", err))
      .finally(() => setLoading(false));
  }, [myId]);

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Analyzing Neural Patterns...
        </p>
      </div>
    );

  if (!stats)
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase italic">
        Failed to load analytics data.
      </div>
    );

  const { heatmap, deckStats, totalReviewed, overallRetention, streak } = stats;

  const heatLookup = {};
  heatmap.forEach((s) => {
    heatLookup[s.date] = s.reviewed;
  });
  const allDays = getLast365Days();

  const weeks = [];
  let week = [];
  allDays.forEach((day, i) => {
    week.push(day);
    if (week.length === 7 || i === allDays.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full h-full overflow-y-auto no-scrollbar pb-20">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-6 bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm">
        <button
          onClick={() => navigate("/dashboard/flashcards")}
          className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center hover:border-indigo-200 transition-all active:scale-90 shrink-0"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
          <TrendingUp className="text-white" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 uppercase italic truncate">
            Neural Analytics
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Study Stats Dashboard
          </p>
        </div>
      </div>

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-lg shadow-orange-100 text-white">
          <Flame className="text-white opacity-80" size={24} />
          <div className="text-2xl sm:text-3xl font-black italic">{streak}</div>
          <div className="text-[9px] font-black uppercase tracking-widest opacity-80">
            Day Streak
          </div>
        </div>
        <div className="bg-white border-2 border-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-sm">
          <Brain className="text-indigo-500" size={24} />
          <div className="text-2xl sm:text-3xl font-black text-slate-800 italic">
            {totalReviewed}
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Cards Reviewed
          </div>
        </div>
        <div className="bg-white border-2 border-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-sm">
          <Target className="text-emerald-500" size={24} />
          <div className="text-2xl sm:text-3xl font-black text-slate-800 italic">
            {overallRetention}%
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Retention
          </div>
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 sm:p-8 mb-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={18} className="text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-800 italic">
            Activity Matrix (365 Days)
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-2">
          <div style={{ minWidth: weeks.length * 13 + "px" }}>
            <div className="flex mb-1" style={{ gap: "2px" }}>
              {weeks.map((w, wi) => {
                const month = new Date(w[0]).getMonth();
                const prevMonth =
                  wi > 0 ? new Date(weeks[wi - 1][0]).getMonth() : -1;
                return (
                  <div key={wi} style={{ width: "11px", flexShrink: 0 }}>
                    {month !== prevMonth ? (
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {MONTHS[month]}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex" style={{ gap: "2px" }}>
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: "2px" }}>
                  {w.map((day) => {
                    const count = heatLookup[day] || 0;
                    const col = getHeatColor(count);
                    return (
                      <div
                        key={day}
                        style={{
                          width: "11px",
                          height: "11px",
                          borderRadius: "3px",
                          background: col.bg,
                          border: `1px solid ${col.border}`,
                          cursor: count > 0 ? "pointer" : "default",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (count > 0) {
                            setTooltip({ date: day, count });
                            e.currentTarget.style.transform = "scale(1.4)";
                            e.currentTarget.style.zIndex = 10;
                          }
                        }}
                        onMouseLeave={(e) => {
                          setTooltip(null);
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.zIndex = 1;
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="h-4">
            {tooltip && (
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-in fade-in">
                {tooltip.date} — {tooltip.count} cards reviewed
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
              Less
            </span>
            {[0, 5, 15, 30, 50].map((v) => {
              const col = getHeatColor(v);
              return (
                <div
                  key={v}
                  style={{
                    width: "11px",
                    height: "11px",
                    borderRadius: "2px",
                    background: col.bg,
                    border: `1px solid ${col.border}`,
                  }}
                />
              );
            })}
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
              More
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {["overview", "decks", "weak"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-indigo-400"
            }`}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "decks"
                ? "Per Deck"
                : "Weak Cards"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <div className="col-span-full">
              <EmptyState text="No decks studied yet" />
            </div>
          ) : (
            deckStats.map((d) => (
              <div
                key={d.deckId}
                className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 flex items-center gap-5 hover:border-indigo-100 transition-colors shadow-sm"
              >
                <RetentionRing
                  value={d.retention}
                  color={
                    d.retention >= 70
                      ? "#10b981"
                      : d.retention >= 40
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-800 uppercase italic truncate text-sm">
                    {d.deckTitle}
                  </div>
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                    {d.category}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Chip color="emerald" label={`${d.mastered} Mastered`} />
                    <Chip color="orange" label={`${d.weak} Weak`} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PER DECK TAB ── */}
      {activeTab === "decks" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <EmptyState text="No decks found" />
          ) : (
            deckStats.map((d) => (
              <div
                key={d.deckId}
                className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-black text-slate-800 uppercase italic text-base">
                      {d.deckTitle}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {d.total} cards total
                    </div>
                  </div>
                  <div
                    className="text-3xl font-black italic"
                    style={{
                      color:
                        d.retention >= 70
                          ? "#10b981"
                          : d.retention >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {d.retention}%
                  </div>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${d.retention}%`,
                      background:
                        d.retention >= 70
                          ? "#10b981"
                          : d.retention >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  <StatPill
                    icon={<Trophy size={14} />}
                    val={d.mastered}
                    label="Mastered"
                    color="emerald"
                  />
                  <StatPill
                    icon={<AlertTriangle size={14} />}
                    val={d.weak}
                    label="Weak"
                    color="orange"
                  />
                  <StatPill
                    icon={<RotateCcw size={14} />}
                    val={d.total - d.mastered - d.weak}
                    label="Learning"
                    color="indigo"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── WEAK CARDS TAB ── */}
      {activeTab === "weak" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <EmptyState text="No weak cards found — you're crushing it!" />
          ) : (
            deckStats.flatMap((d) =>
              d.weakCards.length === 0
                ? []
                : [
                    <div
                      key={d.deckId + "-header"}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 pt-4 flex items-center gap-2"
                    >
                      <Brain size={14} className="text-indigo-400" />{" "}
                      {d.deckTitle}
                    </div>,
                    ...d.weakCards.map((card) => (
                      <div
                        key={card._id}
                        className="bg-white border-2 border-orange-100 rounded-[2rem] p-5 flex items-start gap-4 shadow-sm hover:shadow-orange-100 transition-shadow"
                      >
                        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                          <AlertTriangle
                            className="text-orange-500"
                            size={18}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-black text-slate-800 leading-snug italic uppercase">
                            {card.frontText}
                          </p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                              Ease: {card.easeFactor}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                              Interval: {card.interval}d
                            </span>
                          </div>
                        </div>
                      </div>
                    )),
                  ],
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Small reusable pieces ──────────────────────────────────────
function Chip({ color, label }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border border-orange-100",
    slate: "bg-slate-50 text-slate-500 border border-slate-100",
    indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${map[color]}`}
    >
      {label}
    </span>
  );
}

function StatPill({ icon, val, label, color }) {
  const map = {
    emerald: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border border-orange-100",
    indigo: "text-indigo-600 bg-indigo-50 border border-indigo-100",
  };
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${map[color]}`}
    >
      <div className="opacity-80">{icon}</div>
      <span className="text-sm font-black italic">{val}</span>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
        {label}
      </span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
        <Brain className="text-slate-300" size={32} />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
        {text}
      </p>
    </div>
  );
}
