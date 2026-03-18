import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Flame,
  History,
  Loader2,
  Moon,
  Sun,
  XCircle,
  Clock3,
  CalendarDays,
  Search,
  TrendingUp,
  BarChart2,
  Grid,
} from "lucide-react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (sec = 0) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
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

// ─── Mini Heatmap ─────────────────────────────────────────────────────────────
const Heatmap = ({ logs }) => {
  const today = new Date();
  const cells = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (90 - i));
    const key = d.toISOString().slice(0, 10);
    const secs = (logs[key] || []).reduce((s, x) => s + (x.duration || 0), 0);
    const hrs = secs / 3600;
    const level = hrs === 0 ? 0 : hrs < 1 ? 1 : hrs < 2 ? 2 : hrs < 4 ? 3 : 4;
    return { key, level, hrs };
  });

  const shades = ["#f1f0fb", "#c4bff0", "#9489e3", "#6355d0", "#3d2db0"];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(13, 1fr)",
          gap: 3,
        }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key}: ${c.hrs.toFixed(1)}h`}
            style={{
              aspectRatio: "1",
              borderRadius: 3,
              background: shades[c.level],
              transition: "transform 0.1s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.3)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ))}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}
      >
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Less</span>
        {shades.map((s, i) => (
          <div
            key={i}
            style={{ width: 10, height: 10, borderRadius: 2, background: s }}
          />
        ))}
        <span style={{ fontSize: 10, color: "#94a3b8" }}>More</span>
      </div>
    </div>
  );
};

// ─── Weekly Bars ──────────────────────────────────────────────────────────────
const WeekBars = ({ logs }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = Array(7).fill(0);
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dow = (d.getDay() + 6) % 7; // Mon=0
    totals[dow] +=
      (logs[key] || []).reduce((s, x) => s + (x.duration || 0), 0) / 3600;
  }

  const max = Math.max(...totals, 0.1);
  const todayDow = (today.getDay() + 6) % 7;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {days.map((day, i) => {
        const pct = Math.round((totals[i] / max) * 100);
        const isToday = i === todayDow;
        const isBest = totals[i] === max && max > 0;
        return (
          <div
            key={day}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                fontSize: 11,
                color: isToday ? "#6355d0" : "#94a3b8",
                width: 26,
                fontWeight: isToday ? 600 : 400,
              }}
            >
              {day}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: "#f1f0fb",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: isBest ? "#3d2db0" : "#9489e3",
                  borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "#94a3b8",
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

// ─── Time-of-Day Grid ─────────────────────────────────────────────────────────
const TimeGrid = ({ allSessions }) => {
  const slots = [
    { label: "5–9am", start: 5, end: 9 },
    { label: "9–12pm", start: 9, end: 12 },
    { label: "12–3pm", start: 12, end: 15 },
    { label: "3–6pm", start: 15, end: 18 },
    { label: "6–9pm", start: 18, end: 21 },
    { label: "9pm+", start: 21, end: 29 },
  ];
  const totals = slots.map(({ start, end }) =>
    allSessions.reduce((s, sess) => {
      if (!sess.startTime) return s;
      const h = new Date(sess.startTime).getHours();
      return h >= start && h < end ? s + (sess.duration || 0) / 3600 : s;
    }, 0),
  );
  const max = Math.max(...totals, 0.1);
  const shades = (v) => {
    const pct = v / max;
    if (pct === 0) return "#f8f8ff";
    if (pct < 0.25) return "#e0ddf8";
    if (pct < 0.5) return "#b8b2ee";
    if (pct < 0.75) return "#8a82df";
    return "#4f46d6";
  };
  const textCol = (v) => (v / max > 0.5 ? "#fff" : "#3d2db0");

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}
    >
      {slots.map((s, i) => (
        <div
          key={s.label}
          style={{
            background: shades(totals[i]),
            borderRadius: 10,
            padding: "10px 8px",
            textAlign: "center",
            transition: "background 0.4s",
          }}
        >
          <div
            style={{ fontSize: 10, color: textCol(totals[i]), opacity: 0.8 }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: textCol(totals[i]),
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = false }) => (
  <div
    style={{
      background: accent
        ? "linear-gradient(135deg, #6355d0, #3d2db0)"
        : "#f8f8ff",
      borderRadius: 14,
      padding: "14px 16px",
      border: accent ? "none" : "1px solid #ede9fe",
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: accent ? "rgba(255,255,255,0.7)" : "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: accent ? "#fff" : "#1e1b4b",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {value}
    </div>
    {sub && (
      <div
        style={{
          fontSize: 11,
          color: accent ? "rgba(255,255,255,0.6)" : "#94a3b8",
          marginTop: 3,
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

// ─── Session Card ─────────────────────────────────────────────────────────────
const SessionCard = ({ session }) => {
  const night = isNight(session.startTime);
  const midnight = crossedMidnight(session.startTime, session.endTime);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: night ? "#f5f3ff" : "#fff",
        border: `1px solid ${night ? "#ddd6fe" : "#e8e5f8"}`,
        borderRadius: 14,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,85,208,0.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          background: night ? "#ede9fe" : "#fef3c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {night ? (
          <Moon size={14} color="#6355d0" />
        ) : (
          <Sun size={14} color="#d97706" />
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#1e1b4b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session.workDone || "Deep Work Session"}
        </div>
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
              color: "#94a3b8",
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
                color: "#7c3aed",
                background: "#ede9fe",
                padding: "1px 7px",
                borderRadius: 99,
              }}
            >
              Midnight
            </span>
          )}
        </div>
        {session.breakReason &&
          !["System Pause", "Commander Exit"].includes(session.breakReason) && (
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11 }}>☕</span>
              {session.breakReason}
            </div>
          )}
      </div>

      {/* Right */}
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
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            color: "#3d2db0",
            background: "#ede9fe",
            padding: "2px 10px",
            borderRadius: 8,
          }}
        >
          {fmt(session.duration)}
        </span>
        {session.isStrictValid && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#ea580c",
              background: "#fff7ed",
              padding: "1px 7px",
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Flame size={9} /> Deep
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Section Divider ──────────────────────────────────────────────────────────
const Section = ({ date, sessions }) => {
  const dayTotal = sessions.reduce((s, x) => s + (x.duration || 0), 0);
  const hasNight = sessions.some((s) => isNight(s.startTime));

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          marginBottom: 10,
          borderBottom: "1px solid #ede9fe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6355d0",
              fontFamily: "'Syne', sans-serif",
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
                color: "#6355d0",
                background: "#ede9fe",
                padding: "1px 7px",
                borderRadius: 99,
              }}
            >
              <Moon size={9} /> Night
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
          {fmt(dayTotal)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sessions.map((s) => (
          <SessionCard key={s._id} session={s} />
        ))}
      </div>
    </div>
  );
};

// ─── Analytics Panel ──────────────────────────────────────────────────────────
const AnalyticsPanel = ({ logs, allSessions }) => {
  const totalSecs = allSessions.reduce((s, x) => s + (x.duration || 0), 0);
  const deepCount = allSessions.filter((s) => s.isStrictValid).length;
  const deepPct = allSessions.length
    ? Math.round((deepCount / allSessions.length) * 100)
    : 0;

  const allDates = Object.keys(logs);
  let bestDay = "—",
    bestSecs = 0;
  allDates.forEach((d) => {
    const s = (logs[d] || []).reduce((t, x) => t + (x.duration || 0), 0);
    if (s > bestSecs) {
      bestSecs = s;
      bestDay = fmtDateLabel(d);
    }
  });

  const avgPerDay = allDates.length ? totalSecs / allDates.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        <StatCard
          label="Total time"
          value={fmt(totalSecs)}
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
          value={fmt(Math.round(avgPerDay))}
          sub="Active days"
        />
        <StatCard label="Best day" value={bestDay} sub={fmt(bestSecs)} />
      </div>

      {/* Heatmap */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ede9fe",
          borderRadius: 14,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Grid size={12} /> 90-day activity
        </div>
        <Heatmap logs={logs} />
      </div>

      {/* Weekly */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ede9fe",
          borderRadius: 14,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <TrendingUp size={12} /> This week
        </div>
        <WeekBars logs={logs} />
      </div>

      {/* Time of day */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ede9fe",
          borderRadius: 14,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <BarChart2 size={12} /> Peak hours
        </div>
        <TimeGrid allSessions={allSessions} />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudyLog = ({ refreshKey = 0, fullPage = false }) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);

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

  // ── Filtered dates ──
  const filteredDates = useMemo(() => {
    return dates.filter((date) => {
      if (dateFilter !== "ALL" && date !== dateFilter) return false;
      const sessions = logs[date] || [];

      const matched = sessions.filter((s) => {
        if (typeFilter === "DEEP" && !s.isStrictValid) return false;
        if (typeFilter === "LIGHT" && s.isStrictValid) return false;
        const durMin = (s.duration || 0) / 60;
        if (durationFilter === "30" && durMin < 30) return false;
        if (durationFilter === "60" && durMin < 60) return false;
        if (durationFilter === "120" && durMin < 120) return false;
        if (
          searchQuery &&
          !(s.workDone || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        return true;
      });

      return matched.length > 0;
    });
  }, [dates, logs, dateFilter, typeFilter, durationFilter, searchQuery]);

  const filteredLogs = useMemo(() => {
    const out = {};
    filteredDates.forEach((d) => {
      out[d] = (logs[d] || []).filter((s) => {
        if (typeFilter === "DEEP" && !s.isStrictValid) return false;
        if (typeFilter === "LIGHT" && s.isStrictValid) return false;
        const durMin = (s.duration || 0) / 60;
        if (durationFilter === "30" && durMin < 30) return false;
        if (durationFilter === "60" && durMin < 60) return false;
        if (durationFilter === "120" && durMin < 120) return false;
        if (
          searchQuery &&
          !(s.workDone || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        return true;
      });
    });
    return out;
  }, [filteredDates, logs, typeFilter, durationFilter, searchQuery]);

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

  // ── Styles ──
  const s = {
    wrap: {
      fontFamily: "'DM Sans', sans-serif",
      background: "#faf9ff",
      borderRadius: 20,
      padding: fullPage ? "20px 20px" : "16px",
      minHeight: fullPage ? "calc(100vh - 200px)" : "auto",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      fontFamily: "'Syne', sans-serif",
      fontSize: 20,
      fontWeight: 700,
      color: "#1e1b4b",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    filterRow: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 14,
      alignItems: "center",
    },
    select: {
      fontSize: 12,
      padding: "7px 11px",
      borderRadius: 10,
      border: "1px solid #ddd6fe",
      background: "#fff",
      color: "#3d2db0",
      fontWeight: 500,
      cursor: "pointer",
      outline: "none",
      fontFamily: "'DM Sans', sans-serif",
    },
    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "#fff",
      border: "1px solid #ddd6fe",
      borderRadius: 10,
      padding: "7px 11px",
      flex: 1,
      minWidth: 140,
    },
    searchInput: {
      border: "none",
      outline: "none",
      fontSize: 12,
      color: "#1e1b4b",
      background: "transparent",
      width: "100%",
      fontFamily: "'DM Sans', sans-serif",
    },
    resultBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      background: "#ede9fe",
      borderRadius: 10,
      marginBottom: 14,
      fontSize: 12,
      color: "#3d2db0",
    },
    toggleBtn: {
      fontSize: 12,
      padding: "6px 14px",
      borderRadius: 10,
      border: "1px solid #ddd6fe",
      background: showAnalytics ? "#6355d0" : "#fff",
      color: showAnalytics ? "#fff" : "#6355d0",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: fullPage && showAnalytics ? "300px 1fr" : "1fr",
      gap: 16,
      flex: 1,
      alignItems: "start",
    },
    listWrap: {
      overflowY: "auto",
      maxHeight: fullPage ? "calc(100vh - 280px)" : 400,
    },
  };

  if (loading)
    return (
      <div
        style={{
          ...s.wrap,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <Loader2
          size={24}
          color="#6355d0"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.title}>
          <History size={18} color="#6355d0" />
          Session History
        </div>
        {fullPage && (
          <button
            style={s.toggleBtn}
            onClick={() => setShowAnalytics((p) => !p)}
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={s.filterRow}>
        <select
          style={s.select}
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
          style={s.select}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="DEEP">Deep only</option>
          <option value="LIGHT">Light only</option>
        </select>
        <select
          style={s.select}
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
        >
          <option value="ALL">Any duration</option>
          <option value="30">30min+</option>
          <option value="60">1hr+</option>
          <option value="120">2hr+</option>
        </select>
        <div style={s.searchWrap}>
          <Search size={12} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="Search task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Result summary bar */}
      <div style={s.resultBar}>
        <span>
          <strong>{sessionCount}</strong> sessions
          {hasActiveFilters && " (filtered)"}
        </span>
        <span style={{ fontWeight: 700 }}>{fmt(totalFiltered)} total</span>
      </div>

      {/* Main content */}
      <div style={s.mainGrid}>
        {/* Analytics sidebar */}
        {fullPage && showAnalytics && (
          <div style={{ position: "sticky", top: 0 }}>
            <AnalyticsPanel logs={logs} allSessions={allSessions} />
          </div>
        )}

        {/* Session list */}
        <div style={s.listWrap} className="no-scrollbar">
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
              <XCircle size={32} color="#c4bff0" />
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  marginTop: 10,
                  fontWeight: 500,
                }}
              >
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
                    color: "#6355d0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyLog;
