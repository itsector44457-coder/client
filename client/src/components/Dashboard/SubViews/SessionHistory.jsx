import React from "react";
import { ChevronLeft, History, Calendar } from "lucide-react";
import StudyLog from "../../../pages/StudyLog";

const injectFonts = () => {
  if (document.getElementById("sh-fonts")) return;
  const link = document.createElement("link");
  link.id = "sh-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
};

const SessionHistory = ({ onBack }) => {
  React.useEffect(() => {
    injectFonts();
  }, []);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e0c1a",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Sticky top nav ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(14,12,26,0.85)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            }}
          >
            <ChevronLeft size={13} />
            Back
          </button>

          <div
            style={{
              width: 1,
              height: 16,
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <History size={13} color="#a78bfa" />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#f0eeff",
                fontFamily: "'Instrument Serif', serif",
                letterSpacing: "-0.01em",
              }}
            >
              Session History
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <Calendar size={11} />
          {dateStr}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "36px 28px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: 60,
            width: 280,
            height: 280,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: 300,
            width: 200,
            height: 200,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "#a78bfa",
              textTransform: "uppercase",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 1,
                background: "#a78bfa",
                verticalAlign: "middle",
              }}
            />
            Study Journal
          </p>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: 400,
              color: "#f0eeff",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
            }}
          >
            Every session, <em style={{ color: "#c4b5fd" }}>every hour</em> —
            logged.
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              maxWidth: 500,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Filter by date, session type, or duration. Analyze your deep work
            patterns and peak study hours.
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          padding: "24px 28px 48px",
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <StudyLog fullPage={true} />
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;
