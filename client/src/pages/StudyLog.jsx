import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Flame,
  History,
  Loader2,
  Moon,
  Sun,
  XCircle,
  Clock3,
  Search,
  TrendingUp,
  BarChart2,
  Grid,
  X,
} from "lucide-react";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (sec = 0) => {
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
const fmtShort = (sec = 0) => {
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
};
const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
const fmtDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date().toDateString();
  const yest = new Date(Date.now() - 86400000).toDateString();
  if (d.toDateString() === today) return "Today";
  if (d.toDateString() === yest) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const isNight = (iso) => {
  if (!iso) return false;
  const h = new Date(iso).getHours();
  return h >= 21 || h < 5;
};
const crossedMidnight = (a, b) =>
  a && b && new Date(a).toDateString() !== new Date(b).toDateString();
const parseBreakSec = (reason) => {
  if (!reason) return 0;
  const m = reason.match(/(\d+)m/),
    s = reason.match(/(\d+)s/);
  return (m ? parseInt(m[1]) * 60 : 0) + (s ? parseInt(s[1]) : 0);
};

// ─── Session Detail Modal ─────────────────────────────────────────────────────
const SessionModal = ({ session, onClose }) => {
  if (!session) return null;
  const night = isNight(session.startTime);
  const midnight = crossedMidnight(session.startTime, session.endTime);
  const breakSec = parseBreakSec(session.breakReason);
  const activeSec = Math.max((session.duration || 0) - breakSec, 0);
  const eff = session.duration
    ? Math.round((activeSec / session.duration) * 100)
    : null;
  const breakPct =
    session.duration && breakSec > 0
      ? Math.round((activeSec / session.duration) * 100)
      : null;

  const badges = [
    session.isStrictValid && {
      label: "Deep Work",
      color: "#fb923c",
      bg: "rgba(249,115,22,0.12)",
      border: "rgba(249,115,22,0.2)",
      icon: "🔥",
    },
    night && {
      label: "Night",
      color: "#a78bfa",
      bg: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.2)",
      icon: "🌙",
    },
    midnight && {
      label: "Crossed Midnight",
      color: "#c4b5fd",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
      icon: "⟳",
    },
  ].filter(Boolean);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        inset: 0,
        zIndex: 200,
        position: "fixed",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeO 0.18s ease",
      }}
    >
      <style>{`
        @keyframes fadeO{from{opacity:0}to{opacity:1}}
        @keyframes slideM{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <div
        style={{
          background: "#13111f",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 460,
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideM 0.22s cubic-bezier(0.34,1.3,0.64,1)",
        }}
        className="no-scrollbar"
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: night
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(251,191,36,0.12)",
                border: `1px solid ${night ? "rgba(139,92,246,0.25)" : "rgba(251,191,36,0.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {night ? (
                <Moon size={16} color="#a78bfa" />
              ) : (
                <Sun size={16} color="#fbbf24" />
              )}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 16,
                  color: "#f0eeff",
                  lineHeight: 1.35,
                  margin: 0,
                }}
              >
                {session.workDone || "Deep Work Session"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.28)",
                  marginTop: 2,
                }}
              >
                {fmtDateLabel(session.date || session.startTime)} ·{" "}
                {night ? "Night" : "Day"} session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Duration Hero */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 52,
                color: "#c4b5fd",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {fmtShort(session.duration)}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginTop: 5,
              }}
            >
              Total Duration
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            {badges.map((b, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  color: b.color,
                  background: b.bg,
                  border: `1px solid ${b.border}`,
                }}
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Timing Grid */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
              marginBottom: 13,
            }}
          >
            Session Timing
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 13,
            }}
          >
            {[
              { label: "Started", value: fmtTime(session.startTime) },
              { label: "Ended", value: fmtTime(session.endTime) },
              {
                label: "Pauses",
                value: `${session.pauseCount ?? (session.breakReason ? 1 : 0)}×`,
              },
              { label: "Active Time", value: fmt(activeSec) },
              {
                label: "Break Time",
                value: breakSec > 0 ? fmt(breakSec) : "—",
              },
              {
                label: "Efficiency",
                value: eff !== null ? `${eff}%` : "—",
                green: eff !== null && eff >= 90,
              },
            ].map((item, i) => (
              <div key={i}>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.22)",
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: item.green ? "#34d399" : "#e2deff",
                    margin: 0,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
              marginBottom: 11,
            }}
          >
            Session Timeline
          </p>
          <div
            style={{
              height: 10,
              borderRadius: 99,
              background: "rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
              marginBottom: 7,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg,#4f46e5,#8b7cf6)",
                borderRadius: 99,
              }}
            />
            {breakPct !== null && breakSec > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: `${breakPct}%`,
                  width: `${Math.min(Math.round((breakSec / session.duration) * 100), 100 - breakPct)}%`,
                  height: "100%",
                  background: "rgba(251,146,60,0.75)",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            <span>{fmtTime(session.startTime)}</span>
            <span>{fmtTime(session.endTime)}</span>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 9 }}>
            {[
              {
                color: "linear-gradient(90deg,#4f46e5,#8b7cf6)",
                label: "Study time",
              },
              { color: "rgba(251,146,60,0.75)", label: "Break" },
            ].map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.28)",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: l.color,
                  }}
                />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Break Log */}
        {session.breakReason &&
          !["System Pause", "Commander Exit"].includes(session.breakReason) && (
            <div style={{ padding: "16px 20px 20px" }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.18)",
                  marginBottom: 11,
                }}
              >
                Break Log
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "rgba(251,146,60,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  ☕
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    {session.breakReason}
                  </p>
                  {breakSec > 0 && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.2)",
                        marginTop: 5,
                      }}
                    >
                      Duration: {fmt(breakSec)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const Heatmap = ({ logs }) => {
  const today = new Date();
  const cells = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (90 - i));
    const key = d.toISOString().slice(0, 10);
    const hrs =
      (logs[key] || []).reduce((s, x) => s + (x.duration || 0), 0) / 3600;
    const lv = hrs === 0 ? 0 : hrs < 1 ? 1 : hrs < 2 ? 2 : hrs < 4 ? 3 : 4;
    return { key, lv };
  });
  const sh = ["#1a1730", "#3d2db0", "#6355d0", "#8b7cf6", "#c4b5fd"];
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(13,1fr)",
          gap: 3,
        }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            title={c.key}
            style={{
              aspectRatio: "1",
              borderRadius: 3,
              background: sh[c.lv],
              transition: "transform 0.1s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.35)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ))}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7 }}
      >
        <span style={{ fontSize: 10, color: "#475569" }}>Less</span>
        {sh.map((s, i) => (
          <div
            key={i}
            style={{ width: 10, height: 10, borderRadius: 2, background: s }}
          />
        ))}
        <span style={{ fontSize: 10, color: "#475569" }}>More</span>
      </div>
    </div>
  );
};

const WeekBars = ({ logs }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = Array(7).fill(0);
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dow = (d.getDay() + 6) % 7;
    totals[dow] +=
      (logs[key] || []).reduce((s, x) => s + (x.duration || 0), 0) / 3600;
  }
  const max = Math.max(...totals, 0.1);
  const todayDow = (today.getDay() + 6) % 7;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {days.map((day, i) => {
        const pct = Math.round((totals[i] / max) * 100);
        const best = totals[i] === max && max > 0.1;
        return (
          <div
            key={day}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                fontSize: 11,
                color: i === todayDow ? "#8b7cf6" : "#475569",
                width: 26,
                fontWeight: i === todayDow ? 600 : 400,
              }}
            >
              {day}
            </span>
            <div
              style={{
                flex: 1,
                height: 7,
                background: "#1a1730",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: best ? "#8b7cf6" : "#3d2db0",
                  borderRadius: 99,
                  transition: "width 0.6s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "#475569",
                width: 34,
                textAlign: "right",
              }}
            >
              {totals[i].toFixed(1)}h
            </span>
          </div>
        );
      })}
    </div>
  );
};

const TimeGrid = ({ allSessions }) => {
  const slots = [
    { l: "5–9am", s: 5, e: 9 },
    { l: "9–12pm", s: 9, e: 12 },
    { l: "12–3pm", s: 12, e: 15 },
    { l: "3–6pm", s: 15, e: 18 },
    { l: "6–9pm", s: 18, e: 21 },
    { l: "9pm+", s: 21, e: 29 },
  ];
  const totals = slots.map(({ s, e }) =>
    allSessions.reduce((t, sess) => {
      if (!sess.startTime) return t;
      const h = new Date(sess.startTime).getHours();
      return h >= s && h < e ? t + (sess.duration || 0) / 3600 : t;
    }, 0),
  );
  const max = Math.max(...totals, 0.1);
  const bg = (v) => {
    const p = v / max;
    if (p === 0) return "#14111e";
    if (p < 0.25) return "#2d1d6e";
    if (p < 0.5) return "#3d2db0";
    if (p < 0.75) return "#6355d0";
    return "#8b7cf6";
  };
  const tc = (v) => (v / max > 0.5 ? "#f0eeff" : "#8b7cf6");
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}
    >
      {slots.map((s, i) => (
        <div
          key={s.l}
          style={{
            background: bg(totals[i]),
            borderRadius: 10,
            padding: "10px 8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, color: tc(totals[i]), opacity: 0.75 }}>
            {s.l}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: tc(totals[i]),
              marginTop: 3,
            }}
          >
            {totals[i].toFixed(1)}h
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: accent
        ? "linear-gradient(135deg,#4f46e5,#3730a3)"
        : "#161226",
      border: `1px solid ${accent ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.05)"}`,
      borderRadius: 13,
      padding: "13px 15px",
    }}
  >
    <p
      style={{
        fontSize: 10,
        color: accent ? "rgba(255,255,255,0.5)" : "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 4,
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: "'Instrument Serif',serif",
        fontSize: 21,
        color: accent ? "#fff" : "#c4b5fd",
        margin: 0,
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        style={{
          fontSize: 11,
          color: accent ? "rgba(255,255,255,0.4)" : "#475569",
          marginTop: 3,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const AnalyticsPanel = ({ logs, allSessions }) => {
  const totalSecs = allSessions.reduce((s, x) => s + (x.duration || 0), 0);
  const deepPct = allSessions.length
    ? Math.round(
        (allSessions.filter((s) => s.isStrictValid).length /
          allSessions.length) *
          100,
      )
    : 0;
  const dates = Object.keys(logs);
  let bestDay = "—",
    bestSecs = 0;
  dates.forEach((d) => {
    const s = (logs[d] || []).reduce((t, x) => t + (x.duration || 0), 0);
    if (s > bestSecs) {
      bestSecs = s;
      bestDay = fmtDateLabel(d);
    }
  });
  const avgPerDay = dates.length ? totalSecs / dates.length : 0;
  const pCard = {
    background: "#0e0c1a",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "14px 16px",
  };
  const pTitle = {
    fontSize: 9,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <StatCard
          label="Total"
          value={fmtShort(totalSecs)}
          sub="All time"
          accent
        />
        <StatCard
          label="Sessions"
          value={allSessions.length}
          sub={`${deepPct}% deep`}
        />
        <StatCard
          label="Avg / day"
          value={fmtShort(Math.round(avgPerDay))}
          sub="Active days"
        />
        <StatCard label="Best day" value={bestDay} sub={fmtShort(bestSecs)} />
      </div>
      <div style={pCard}>
        <p style={pTitle}>
          <Grid size={11} color="#475569" />
          90-day heatmap
        </p>
        <Heatmap logs={logs} />
      </div>
      <div style={pCard}>
        <p style={pTitle}>
          <TrendingUp size={11} color="#475569" />
          This week
        </p>
        <WeekBars logs={logs} />
      </div>
      <div style={pCard}>
        <p style={pTitle}>
          <BarChart2 size={11} color="#475569" />
          Peak hours
        </p>
        <TimeGrid allSessions={allSessions} />
      </div>
    </div>
  );
};

// ─── Session Card ─────────────────────────────────────────────────────────────
const SessionCard = ({ session, onClick }) => {
  const [hov, setHov] = useState(false);
  const night = isNight(session.startTime);
  const midnight = crossedMidnight(session.startTime, session.endTime);
  const breakRaw =
    session.breakReason &&
    !["System Pause", "Commander Exit"].includes(session.breakReason)
      ? session.breakReason
      : null;
  return (
    <div
      onClick={() => onClick(session)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: hov ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? "rgba(139,92,246,0.35)" : night ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 13,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          flexShrink: 0,
          background: night ? "rgba(139,92,246,0.15)" : "rgba(251,191,36,0.1)",
          border: `1px solid ${night ? "rgba(139,92,246,0.2)" : "rgba(251,191,36,0.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {night ? (
          <Moon size={13} color="#a78bfa" />
        ) : (
          <Sun size={13} color="#fbbf24" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#e2deff",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session.workDone || "Deep Work Session"}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              color: "#475569",
            }}
          >
            <Clock3 size={10} />
            {fmtTime(session.startTime)}
            {session.endTime ? ` → ${fmtTime(session.endTime)}` : ""}
          </span>
          {midnight && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#a78bfa",
                background: "rgba(139,92,246,0.1)",
                padding: "1px 6px",
                borderRadius: 99,
              }}
            >
              Midnight
            </span>
          )}
        </div>
        {breakRaw && (
          <p
            style={{
              fontSize: 11,
              color: "#334155",
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ☕ {breakRaw.length > 36 ? breakRaw.slice(0, 36) + "…" : breakRaw}
          </p>
        )}
        <p style={{ fontSize: 10, color: "#2d2a40", marginTop: 2 }}>
          {session.pauseCount ?? (breakRaw ? 1 : 0)} pause
          {(session.pauseCount ?? (breakRaw ? 1 : 0)) !== 1 ? "s" : ""} · click
          for details
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 17,
            color: "#8b7cf6",
            background: "rgba(139,92,246,0.1)",
            padding: "2px 10px",
            borderRadius: 8,
          }}
        >
          {fmtShort(session.duration)}
        </span>
        {session.isStrictValid && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#fb923c",
              background: "rgba(249,115,22,0.1)",
              padding: "1px 7px",
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Flame size={9} />
            Deep
          </span>
        )}
      </div>
    </div>
  );
};

const Section = ({ date, sessions, onSessionClick }) => {
  const dayTotal = sessions.reduce((s, x) => s + (x.duration || 0), 0);
  const hasNight = sessions.some((s) => isNight(s.startTime));
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          marginBottom: 10,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 13,
              color: "#8b7cf6",
            }}
          >
            {fmtDateLabel(date)}
          </span>
          {hasNight && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10,
                fontWeight: 600,
                color: "#8b7cf6",
                background: "rgba(139,92,246,0.1)",
                padding: "1px 7px",
                borderRadius: 99,
              }}
            >
              <Moon size={9} />
              Night
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>
          {fmtShort(dayTotal)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {sessions.map((s) => (
          <SessionCard key={s._id} session={s} onClick={onSessionClick} />
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const StudyLog = ({ refreshKey = 0, fullPage = false }) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!document.getElementById("studylog-fonts")) {
      const link = document.createElement("link");
      link.id = "studylog-fonts";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!myId) {
        setLogs({});
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `https://backend-6hhv.onrender.com/api/sessions/${myId}`,
        );
        setLogs(res.data || {});
      } catch (err) {
        console.error("Study log fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [myId, refreshKey]);

  const dates = useMemo(
    () => Object.keys(logs).sort((a, b) => new Date(b) - new Date(a)),
    [logs],
  );
  const allSessions = useMemo(
    () => dates.flatMap((d) => logs[d] || []),
    [dates, logs],
  );

  const filteredLogs = useMemo(() => {
    const out = {};
    dates.forEach((d) => {
      if (dateFilter !== "ALL" && d !== dateFilter) return;
      const f = (logs[d] || []).filter((s) => {
        if (typeFilter === "DEEP" && !s.isStrictValid) return false;
        if (typeFilter === "LIGHT" && s.isStrictValid) return false;
        const dm = (s.duration || 0) / 60;
        if (durationFilter === "30" && dm < 30) return false;
        if (durationFilter === "60" && dm < 60) return false;
        if (durationFilter === "120" && dm < 120) return false;
        if (
          searchQuery &&
          !(s.workDone || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        return true;
      });
      if (f.length > 0) out[d] = f;
    });
    return out;
  }, [dates, logs, dateFilter, typeFilter, durationFilter, searchQuery]);

  const filteredDates = Object.keys(filteredLogs).sort(
    (a, b) => new Date(b) - new Date(a),
  );
  const totalFiltered = filteredDates.reduce(
    (s, d) =>
      s + (filteredLogs[d] || []).reduce((t, x) => t + (x.duration || 0), 0),
    0,
  );
  const sessionCount = filteredDates.reduce(
    (s, d) => s + (filteredLogs[d] || []).length,
    0,
  );
  const hasActiveFilters =
    dateFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    durationFilter !== "ALL" ||
    searchQuery;

  const base = {
    fontFamily: "'DM Sans',sans-serif",
    background: "#0e0c1a",
    color: "#e2deff",
    padding: fullPage ? "20px" : "16px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderRadius: fullPage ? 0 : 16,
  };
  const sel = {
    fontSize: 12,
    padding: "7px 11px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#161226",
    color: "#8b7cf6",
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    fontFamily: "'DM Sans',sans-serif",
  };

  if (loading)
    return (
      <div
        style={{
          ...base,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 240,
        }}
      >
        <Loader2
          size={24}
          color="#8b7cf6"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div style={base}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 18,
            color: "#f0eeff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: 0,
          }}
        >
          <History size={17} color="#8b7cf6" />
          Session History
        </p>
        {fullPage && (
          <button
            onClick={() => setShowAnalytics((p) => !p)}
            style={{
              ...sel,
              padding: "6px 13px",
              color: showAnalytics ? "#c4b5fd" : "#475569",
              background: showAnalytics ? "rgba(139,92,246,0.12)" : "#161226",
              border: `1px solid ${showAnalytics ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 7,
          flexWrap: "wrap",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <select
          style={sel}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="ALL">All dates</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {fmtDateLabel(d)}
            </option>
          ))}
        </select>
        <select
          style={sel}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="DEEP">Deep only</option>
          <option value="LIGHT">Light only</option>
        </select>
        <select
          style={sel}
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
        >
          <option value="ALL">Any duration</option>
          <option value="30">30min+</option>
          <option value="60">1hr+</option>
          <option value="120">2hr+</option>
        </select>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#161226",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "7px 11px",
            flex: 1,
            minWidth: 130,
          }}
        >
          <Search size={11} color="#475569" />
          <input
            style={{
              border: "none",
              outline: "none",
              fontSize: 12,
              color: "#e2deff",
              background: "transparent",
              width: "100%",
              fontFamily: "'DM Sans',sans-serif",
            }}
            placeholder="Search task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Result bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.11)",
          borderRadius: 10,
          marginBottom: 16,
          fontSize: 12,
          color: "#8b7cf6",
        }}
      >
        <span>
          <strong style={{ color: "#c4b5fd" }}>{sessionCount}</strong> sessions
          {hasActiveFilters ? " (filtered)" : ""}
        </span>
        <span
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 15,
            color: "#c4b5fd",
          }}
        >
          {fmtShort(totalFiltered)}
        </span>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: fullPage && showAnalytics ? "280px 1fr" : "1fr",
          gap: 16,
          flex: 1,
          alignItems: "start",
        }}
      >
        {fullPage && showAnalytics && (
          <div
            style={{
              position: "sticky",
              top: 0,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            className="no-scrollbar"
          >
            <AnalyticsPanel logs={logs} allSessions={allSessions} />
          </div>
        )}
        <div
          style={{
            overflowY: "auto",
            maxHeight: fullPage ? "calc(100vh - 260px)" : 400,
          }}
          className="no-scrollbar"
        >
          {filteredDates.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 0",
                opacity: 0.5,
              }}
            >
              <XCircle size={30} color="#3d2db0" />
              <p style={{ fontSize: 13, color: "#475569", marginTop: 10 }}>
                {hasActiveFilters
                  ? "No sessions match filters"
                  : "No sessions yet"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setDateFilter("ALL");
                    setTypeFilter("ALL");
                    setDurationFilter("ALL");
                    setSearchQuery("");
                  }}
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#8b7cf6",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredDates.map((date) => (
              <Section
                key={date}
                date={date}
                sessions={filteredLogs[date] || []}
                onSessionClick={setSelectedSession}
              />
            ))
          )}
        </div>
      </div>

      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default StudyLog;
