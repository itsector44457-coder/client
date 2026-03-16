import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Play,
  Pause,
  Square,
  Swords,
  Loader2,
  ExternalLink,
} from "lucide-react";

const StudyTimer = ({
  isActive,
  setIsActive,
  seconds,
  setSeconds,
  onSessionSaved,
  battle,
  onBattleLose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("pause");
  const [feedback, setFeedback] = useState({ reason: "", work: "" });
  const [saving, setSaving] = useState(false);

  const pipWindowRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;
  const battleActive = battle?.status === "active";
  const opponent =
    String(battle?.challengerId?._id) === String(myId)
      ? battle?.opponentId
      : battle?.challengerId;

  // ============================
  // 🕒 FORMAT TIME FUNCTION
  // ============================
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  // ============================
  // 🚀 PiP WINDOW SYNC
  // ============================
  useEffect(() => {
    if (pipWindowRef.current && pipWindowRef.current.document) {
      const timeElement =
        pipWindowRef.current.document.getElementById("pip-time");
      if (timeElement) {
        timeElement.innerText = formatTime(seconds);
      }
    }
  }, [seconds]);

  // ============================
  // 🪟 OPEN FLOATING TIMER (PiP)
  // ============================
  const openFloatingTimer = async () => {
    if (!("documentPictureInPicture" in window)) {
      return alert(
        "Bhai, tumhara browser is feature ko support nahi karta. Chrome update karo!",
      );
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 280,
        height: 140,
      });

      pipWindowRef.current = pipWindow;

      // Cleaned up PiP UI
      pipWindow.document.body.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          background: #ffffff; 
          color: #0f172a; 
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          overflow: hidden;
        ">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 600;">
            Study Focus
          </div>
          <div id="pip-time" style="font-size: 40px; font-weight: 700; color: #4f46e5; font-variant-numeric: tabular-nums; letter-spacing: -1px;">
            ${formatTime(seconds)}
          </div>
        </div>
      `;

      pipWindow.addEventListener("pagehide", () => {
        pipWindowRef.current = null;
      });
    } catch (error) {
      console.error("PiP failed", error);
    }
  };

  // ============================
  // 💾 SAVE SESSION DATA
  // ============================
  const handleFinalSave = async (isTermination) => {
    if (seconds < 1) return alert("Bhai, thoda toh padh lo! 😂");
    try {
      setSaving(true);
      const payload = {
        userId: myId,
        duration: seconds,
        breakReason:
          feedback.reason.trim() ||
          (isTermination ? "Commander Exit" : "System Pause"),
        workDone: feedback.work.trim() || "Deep Study Protocol Completed",
        date: new Date().toISOString().split("T")[0],
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        isStrictValid: feedback.work.trim().length > 5,
      };

      await axios.post(
        `https://backend-6hhv.onrender.com/api/sessions/save`,
        payload,
      );

      if (isTermination && battleActive) {
        await onBattleLose({
          battleId: battle._id,
          loserId: myId,
          reason: "Session Terminated",
        });
      }

      onSessionSaved(seconds);
      setShowModal(false);
      setFeedback({ reason: "", work: "" });

      if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
      }

      alert("Session Synced to Hub! 🚀");
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Server Error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    // Wrapper radius aur padding ko neat aur compact kiya
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
      {/* 1. Top Section (Timer & Battle Status) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Focus Timer
            </h3>
            <button
              onClick={openFloatingTimer}
              title="Pop out Floating Timer"
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
            >
              <ExternalLink size={14} />
            </button>
          </div>
          {/* Timer text ko italic aur black se normal bold mono mein convert kiya */}
          <div className="text-4xl sm:text-5xl font-bold text-slate-800 font-mono tracking-tight leading-none">
            {formatTime(seconds)}
          </div>
        </div>

        {/* Battle status ko thoda subtle kiya */}
        {battleActive && (
          <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
            <Swords size={14} className="text-rose-500" />
            <span className="text-xs font-semibold text-rose-600">
              Vs {opponent?.name}
            </span>
          </div>
        )}
      </div>

      {/* 2. Controls Section */}
      <div className="flex gap-3">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            {seconds > 0 ? "Resume" : "Start Focus"}
          </button>
        ) : (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("pause");
            }}
            className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <Pause size={16} fill="currentColor" />
            Pause
          </button>
        )}

        {(isActive || seconds > 0) && (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("terminate");
            }}
            // Stop button ko flat design diya gaya hai taaki danger action clear rahe par chubhhe na
            className="w-14 sm:w-16 bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors shrink-0"
            title="Stop & Save"
          >
            <Square size={16} fill="currentColor" />
          </button>
        )}
      </div>

      {/* 3. Mission Log Modal - Clean and Compact */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4">
              {modalMode === "terminate" ? "End Session" : "Pause Session"}
            </h4>

            <div className="space-y-3">
              <input
                placeholder="Why are you stopping? (e.g., Break, Done)"
                className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 transition-all"
                onChange={(e) =>
                  setFeedback({ ...feedback, reason: e.target.value })
                }
              />
              <textarea
                placeholder="What did you work on?"
                className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none border border-slate-200 transition-all"
                onChange={(e) =>
                  setFeedback({ ...feedback, work: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleFinalSave(modalMode === "terminate")}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex justify-center items-center"
              >
                {saving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save Log"
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalMode === "pause") setIsActive(true);
                }}
                className="flex-1 bg-white text-slate-600 border border-slate-200 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
