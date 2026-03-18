import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Flame,
  NotebookPen,
  Settings,
  CheckCircle2,
  Zap,
  Layers,
} from "lucide-react";

const injectFonts = () => {
  if (document.getElementById("topbar-fonts")) return;
  const link = document.createElement("link");
  link.id = "topbar-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
};

const Topbar = ({
  currentUserName,
  myField,
  todayDeepSeconds = 0,
  streakCount = 0,
  battlePoints = 0,
  setQuickCaptureOpen,
  resourceDeckEnabled,
  toggleResourceDeck,
  setSettingsOpen,
  hasCheckedInToday = true,
  onCheckIn,
}) => {
  const [liveXp, setLiveXp] = useState(0);
  const [liveStreak, setLiveStreak] = useState(streakCount);
  const [xpAnimate, setXpAnimate] = useState(false);

  useEffect(() => {
    injectFonts();
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const myId = currentUser?.id || currentUser?._id;
    if (myId) {
      axios
        .get(`https://backend-6hhv.onrender.com/api/stats/${myId}`)
        .then((res) => {
          setLiveXp(res.data.totalReviewed || 0);
          setLiveStreak(res.data.streak || 0);
        })
        .catch((err) => console.error("Topbar stats error:", err));
    }
  }, []);

  useEffect(() => {
    const handleXpGain = () => {
      setLiveXp((prev) => prev + 1);
      setXpAnimate(true);
      setTimeout(() => setXpAnimate(false), 400);
    };
    window.addEventListener("xpGained", handleXpGain);
    return () => window.removeEventListener("xpGained", handleXpGain);
  }, []);

  const formatHours = (sec) => {
    if (!sec || isNaN(sec)) return "0.0h";
    const h = sec / 3600;
    return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
  };

  const initials = currentUserName?.[0]?.toUpperCase() || "U";

  // ── Shared style tokens ──────────────────────────────────────────────────
  const pill = {
    base: {
      display: "flex",
      flexDirection: "column",
      padding: "7px 13px",
      borderRadius: 11,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      minWidth: 68,
      flexShrink: 0,
      gap: 2,
    },
    label: {
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.35)",
      fontFamily: "'DM Sans', sans-serif",
    },
    value: {
      fontSize: 15,
      fontWeight: 700,
      color: "#f0eeff",
      fontFamily: "'Syne', sans-serif",
      lineHeight: 1,
    },
  };

  const iconBtn = {
    width: 34,
    height: 34,
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "rgba(255,255,255,0.45)",
    transition: "all 0.15s",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @keyframes xp-pop { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        .xp-pop { animation: xp-pop 0.35s ease; }
        .tb-icon-btn:hover { background: rgba(139,92,246,0.15) !important; border-color: rgba(139,92,246,0.3) !important; color: #c4b5fd !important; }
        .tb-deck-btn:hover { background: rgba(139,92,246,0.12) !important; border-color: rgba(139,92,246,0.3) !important; color: #c4b5fd !important; }
        .tb-checkin:hover { border-color: rgba(251,146,60,0.4) !important; background: rgba(251,146,60,0.08) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        style={{
          background: "rgba(14,12,26,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 50,
          fontFamily: "'DM Sans', sans-serif",
          flexWrap: "wrap",
        }}
      >
        {/* ── Left: Avatar + Name ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6355d0, #3d2db0)",
              border: "1px solid rgba(139,92,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {/* Name + field */}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#f0eeff",
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              {currentUserName || "Commander"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                margin: 0,
                marginTop: 1,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              {myField || "General Studies"}
            </p>
          </div>

          {/* Thin divider */}
          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(255,255,255,0.07)",
              marginLeft: 4,
              flexShrink: 0,
            }}
          />
        </div>

        {/* ── Centre: Stat Pills ──────────────────────────────────────────── */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flex: 1,
            overflowX: "auto",
          }}
        >
          {/* Focus time */}
          <div style={pill.base}>
            <span style={pill.label}>Focus</span>
            <span style={pill.value}>{formatHours(todayDeepSeconds)}</span>
          </div>

          {/* XP */}
          <div
            className={xpAnimate ? "xp-pop" : ""}
            style={{
              ...pill.base,
              background: xpAnimate
                ? "rgba(251,146,60,0.15)"
                : "rgba(251,146,60,0.07)",
              border: `1px solid ${xpAnimate ? "rgba(251,146,60,0.4)" : "rgba(251,146,60,0.15)"}`,
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            <span
              style={{
                ...pill.label,
                color: "rgba(251,146,60,0.7)",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Zap size={9} color="rgba(251,146,60,0.8)" />
              XP
            </span>
            <span style={{ ...pill.value, color: "#fb923c" }}>{liveXp}</span>
          </div>

          {/* Streak / Check-in */}
          <button
            className={hasCheckedInToday ? "" : "tb-checkin"}
            onClick={() => !hasCheckedInToday && onCheckIn?.()}
            style={{
              ...pill.base,
              background: hasCheckedInToday
                ? "rgba(52,211,153,0.07)"
                : "rgba(251,146,60,0.07)",
              border: `1px solid ${hasCheckedInToday ? "rgba(52,211,153,0.2)" : "rgba(251,146,60,0.2)"}`,
              cursor: hasCheckedInToday ? "default" : "pointer",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: "7px 13px",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            {hasCheckedInToday ? (
              <CheckCircle2 size={14} color="#34d399" />
            ) : (
              <Flame
                size={14}
                color="#fb923c"
                style={{ animation: "pulse 1.5s infinite" }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  ...pill.label,
                  color: hasCheckedInToday
                    ? "rgba(52,211,153,0.7)"
                    : "rgba(251,146,60,0.7)",
                }}
              >
                {hasCheckedInToday ? "Logged" : "Check In"}
              </span>
              <span
                style={{
                  ...pill.value,
                  fontSize: 14,
                  color: hasCheckedInToday ? "#34d399" : "#fb923c",
                }}
              >
                {liveStreak}d
              </span>
            </div>
          </button>
        </div>

        {/* ── Right: Action buttons ───────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {/* Quick capture */}
          <button
            className="tb-icon-btn"
            onClick={() => setQuickCaptureOpen(true)}
            style={iconBtn}
            title="Quick Notes"
          >
            <NotebookPen size={15} />
          </button>

          {/* Resource deck toggle */}
          <button
            className="tb-deck-btn"
            onClick={toggleResourceDeck}
            style={{
              ...iconBtn,
              width: "auto",
              padding: "0 12px",
              fontSize: 11,
              fontWeight: 600,
              gap: 5,
              color: resourceDeckEnabled ? "#c4b5fd" : "rgba(255,255,255,0.35)",
              background: resourceDeckEnabled
                ? "rgba(139,92,246,0.12)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${resourceDeckEnabled ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.15s",
            }}
            title="Toggle Resource Deck"
          >
            <Layers size={13} />
            <span
              className="hidden-mobile"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Module {resourceDeckEnabled ? "On" : "Off"}
            </span>
          </button>

          {/* Settings */}
          <button
            className="tb-icon-btn"
            onClick={() => setSettingsOpen(true)}
            style={iconBtn}
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Topbar;
