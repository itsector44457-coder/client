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

const STORAGE_KEY = "skillvault_timer";

// 🚀 Helper to smoothly update storage without wiping out new keys
const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};
const updateStorage = (updates) => {
  const existing = loadFromStorage() || {};
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...existing, ...updates }),
  );
};
const clearStorage = () => localStorage.removeItem(STORAGE_KEY);

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
  const [modalMode, setModalMode] = useState("pauseRequest"); // 'pauseRequest' or 'terminate'
  const [feedback, setFeedback] = useState({ reason: "", work: "" });
  const [saving, setSaving] = useState(false);

  // 🚀 New States for True Pause Tracking
  const [pauseLogs, setPauseLogs] = useState(
    () => loadFromStorage()?.pauseLogs || [],
  );
  const [pendingPause, setPendingPause] = useState(
    () => loadFromStorage()?.pendingPause || null,
  );

  const workerRef = useRef(null);
  const startTimeRef = useRef(null);
  const startDateRef = useRef(null);
  const pipWindowRef = useRef(null);
  const isActiveRef = useRef(isActive);

  const pauseLogsRef = useRef(pauseLogs);
  const pendingPauseRef = useRef(pendingPause);

  useEffect(() => {
    pauseLogsRef.current = pauseLogs;
  }, [pauseLogs]);
  useEffect(() => {
    pendingPauseRef.current = pendingPause;
  }, [pendingPause]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;
  const battleActive = battle?.status === "active";
  const opponent =
    String(battle?.challengerId?._id) === String(myId)
      ? battle?.opponentId
      : battle?.challengerId;

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  const formatTimeShort = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    let str = "";
    if (h > 0) str += `${h}h `;
    if (m > 0) str += `${m}m `;
    if (s > 0 || str === "") str += `${s}s`;
    return str.trim();
  };

  // ── LAYER 1: Inline Web Worker ────────────────────────────
  useEffect(() => {
    const workerCode = `
      let timer;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          timer = setInterval(() => self.postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          clearInterval(timer);
        }
      };
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = () => {
      if (startTimeRef.current && isActiveRef.current) {
        const currentSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        setSeconds(currentSeconds);

        if (currentSeconds % 5 === 0) {
          updateStorage({
            isRunning: true,
            seconds: currentSeconds,
            startEpoch: startTimeRef.current,
            startDate: startDateRef.current,
          });
        }
      }
    };
    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [setSeconds]);

  // ── LAYER 2: Screen Wake-Up Sync ──────────────────────────
  useEffect(() => {
    const handleWakeUp = () => {
      if (!document.hidden && isActiveRef.current && startTimeRef.current) {
        const exactSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        setSeconds(exactSeconds > 0 ? exactSeconds : 0);
      }
    };
    document.addEventListener("visibilitychange", handleWakeUp);
    window.addEventListener("focus", handleWakeUp);
    return () => {
      document.removeEventListener("visibilitychange", handleWakeUp);
      window.removeEventListener("focus", handleWakeUp);
    };
  }, [setSeconds]);

  // ── LAYER 3: localStorage Recovery on Mount ───────────────
  useEffect(() => {
    const stored = loadFromStorage();
    if (!stored) return;

    if (stored.isRunning && stored.startEpoch) {
      const exactSeconds = Math.floor((Date.now() - stored.startEpoch) / 1000);
      setSeconds(exactSeconds > 0 ? exactSeconds : 0);
      setIsActive(true);
      startTimeRef.current = stored.startEpoch;
      startDateRef.current =
        stored.startDate || new Date().toISOString().split("T")[0];
    } else if (!stored.isRunning && stored.seconds > 0) {
      setSeconds(stored.seconds);
      startDateRef.current = stored.startDate || null;
    }
  }, [setSeconds, setIsActive]);

  // ── Start/Stop Logic & Epoch Sync ────────────────────────
  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive) {
      workerRef.current?.postMessage("start");
      const currentStartEpoch = Date.now() - seconds * 1000;
      startTimeRef.current = currentStartEpoch;
      if (!startDateRef.current)
        startDateRef.current = new Date().toISOString().split("T")[0];

      updateStorage({
        isRunning: true,
        seconds,
        startEpoch: currentStartEpoch,
        startDate: startDateRef.current,
      });
    } else {
      workerRef.current?.postMessage("stop");
      updateStorage({
        isRunning: false,
        seconds,
        startEpoch: startTimeRef.current,
        startDate: startDateRef.current,
      });
    }
  }, [isActive]); // Removes 'seconds' to avoid firing every tick

  // ── True Pause Handling ──────────────────────────────────
  const confirmPause = () => {
    if (!feedback.reason.trim()) {
      alert("Commander, please provide a reason for pausing!");
      return;
    }
    // STOP the timer ONLY after reason is given
    setIsActive(false);
    const pStart = Date.now();
    const pData = { start: pStart, reason: feedback.reason.trim() };

    setPendingPause(pData);
    updateStorage({ isRunning: false, pendingPause: pData });
    setShowModal(false);
    setFeedback({ reason: "", work: "" });
  };

  const handleResume = () => {
    setIsActive(true);
    if (pendingPauseRef.current) {
      const pDuration = Math.floor(
        (Date.now() - pendingPauseRef.current.start) / 1000,
      );
      const newLogs = [
        ...pauseLogsRef.current,
        { reason: pendingPauseRef.current.reason, duration: pDuration },
      ];

      setPauseLogs(newLogs);
      setPendingPause(null);
      updateStorage({
        pauseLogs: newLogs,
        pendingPause: null,
        isRunning: true,
      });
    }
  };

  const handlePipToggle = () => {
    if (isActiveRef.current) {
      // Quick Pause from PiP
      const pStart = Date.now();
      const pData = { start: pStart, reason: "Quick Pause (PiP)" };
      setPendingPause(pData);
      setIsActive(false);
      updateStorage({ isRunning: false, pendingPause: pData });
    } else {
      handleResume();
    }
  };

  // ── PiP Sync & Open Logic ─────────────────────────────────
  useEffect(() => {
    if (pipWindowRef.current?.document) {
      const timeEl = pipWindowRef.current.document.getElementById("pip-time");
      if (timeEl) timeEl.innerText = formatTime(seconds);

      const toggleBtn =
        pipWindowRef.current.document.getElementById("pip-toggle-btn");
      if (toggleBtn) {
        toggleBtn.innerHTML = isActive ? "⏸ Pause" : "▶ Resume";
        toggleBtn.style.backgroundColor = isActive ? "#f59e0b" : "#4f46e5";
      }
    }
  }, [seconds, isActive]);

  const openFloatingTimer = async () => {
    if (!("documentPictureInPicture" in window))
      return alert("Chrome 116+ required!");
    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 180,
      });
      pipWindowRef.current = pipWindow;

      pipWindow.document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#ffffff;color:#0f172a;font-family:system-ui,sans-serif;margin:0;overflow:hidden;">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;">Study Focus</div>
          <div id="pip-time" style="font-size:42px;font-weight:700;color:#4f46e5;font-variant-numeric:tabular-nums;letter-spacing:-1px;margin-bottom:16px;">${formatTime(seconds)}</div>
          <div style="display:flex; gap: 12px;">
            <button id="pip-toggle-btn" style="padding: 8px 16px; border: none; border-radius: 8px; background: ${isActiveRef.current ? "#f59e0b" : "#4f46e5"}; color: white; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s;">
              ${isActiveRef.current ? "⏸ Pause" : "▶ Resume"}
            </button>
            <button id="pip-stop-btn" style="padding: 8px 16px; border: 1px solid #f43f5e; border-radius: 8px; background: #fff; color: #f43f5e; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s;">
              ⏹ Stop
            </button>
          </div>
        </div>
      `;

      pipWindow.document
        .getElementById("pip-toggle-btn")
        .addEventListener("click", handlePipToggle);
      pipWindow.document
        .getElementById("pip-stop-btn")
        .addEventListener("click", () => {
          setIsActive(false);
          setShowModal(true);
          setModalMode("terminate");
          pipWindow.document.body.innerHTML = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#ffffff;color:#0f172a;font-family:system-ui,sans-serif;margin:0;padding:20px;text-align:center;"><h3 style="margin:0 0 10px 0; color:#f43f5e;">Session Stopped</h3><p style="font-size:14px; color:#64748b; margin:0;">Please go back to the main window to save.</p></div>`;
        });
      pipWindow.addEventListener(
        "pagehide",
        () => (pipWindowRef.current = null),
      );
    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  const handleFinalSave = async () => {
    if (seconds < 1) return alert("Bhai thoda toh padh lo! 😂");
    try {
      setSaving(true);
      const sessionDate =
        startDateRef.current || new Date().toISOString().split("T")[0];

      // Build Beautiful String for History Page (HACK FOR DB)
      let finalWorkStr =
        feedback.work.trim() || "Deep Study Protocol Completed";
      let allPauses = [...pauseLogs];

      // If they stop while paused, log that ongoing pause too
      if (pendingPause) {
        const pDuration = Math.floor((Date.now() - pendingPause.start) / 1000);
        allPauses.push({ reason: pendingPause.reason, duration: pDuration });
      }

      if (allPauses.length > 0) {
        finalWorkStr +=
          `\n\n⏸ BREAK LOGS:\n` +
          allPauses
            .map((p) => `- ${p.reason} (${formatTimeShort(p.duration)})`)
            .join(`\n`);
      }

      const dynamicBreakReason =
        allPauses.length > 0
          ? `Completed with ${allPauses.length} pauses`
          : "Continuous Focus";

      await axios.post("https://backend-6hhv.onrender.com/api/sessions/save", {
        userId: myId,
        duration: seconds,
        breakReason: dynamicBreakReason,
        workDone: finalWorkStr,
        date: sessionDate,
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        isStrictValid: feedback.work.trim().length > 5,
      });

      if (battleActive) {
        await onBattleLose({
          battleId: battle._id,
          loserId: myId,
          reason: "Session Terminated",
        });
      }

      onSessionSaved?.(seconds);
      setSeconds(0);
      setIsActive(false);
      setPauseLogs([]);
      setPendingPause(null);
      startTimeRef.current = null;
      startDateRef.current = null;
      clearStorage();
      workerRef.current?.postMessage("stop");
      setShowModal(false);
      setFeedback({ reason: "", work: "" });
      if (pipWindowRef.current) pipWindowRef.current.close();
      alert("Session Synced to Hub! 🚀");
    } catch (err) {
      alert(
        `Network Error: Data save nahi hua. Aapka timer paused hai, internet check karke wapas try karo!`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Focus Timer
            </h3>
            <button
              onClick={openFloatingTimer}
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
            >
              <ExternalLink size={14} />
            </button>
            {isActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                LIVE
              </span>
            )}
            {!isActive && pendingPause && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                PAUSED
              </span>
            )}
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-slate-800 font-mono tracking-tight leading-none">
            {formatTime(seconds)}
          </div>
        </div>
        {battleActive && (
          <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Swords size={14} className="text-rose-500" />
            <span className="text-xs font-semibold text-rose-600">
              Vs {opponent?.name}
            </span>
          </div>
        )}
      </div>

      {/* Buttons Logic */}
      <div className="flex gap-3">
        {!isActive ? (
          <button
            onClick={() => {
              if (pendingPause) handleResume();
              else setIsActive(true);
            }}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            {seconds > 0 ? "Resume Focus" : "Start Focus"}
          </button>
        ) : (
          <button
            onClick={() => {
              setModalMode("pauseRequest");
              setShowModal(true);
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
              setIsActive(false); // Stop timer while they fill completion report
              setModalMode("terminate");
              setShowModal(true);
            }}
            className="w-14 sm:w-16 bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors shrink-0"
            title="Stop & Save"
          >
            <Square size={16} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Dynamic Modals */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
            {modalMode === "pauseRequest" && (
              <>
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  Pause Session
                </h4>
                <p className="text-[12px] text-slate-500 mb-5 leading-tight">
                  Timer is still running. Please provide a reason to initiate
                  the pause.
                </p>
                <input
                  autoFocus
                  placeholder="Why are you pausing? (e.g., Water break)"
                  className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-slate-200 mb-6"
                  value={feedback.reason}
                  onChange={(e) =>
                    setFeedback({ ...feedback, reason: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && confirmPause()}
                />
                <div className="flex gap-3">
                  <button
                    onClick={confirmPause}
                    className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors flex justify-center items-center"
                  >
                    Confirm Pause
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setFeedback({ reason: "", work: "" });
                    }}
                    className="flex-1 bg-white text-slate-600 border border-slate-200 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modalMode === "terminate" && (
              <>
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  End Session
                </h4>
                <div className="bg-slate-50 rounded-xl p-3 mb-4 flex justify-between items-center mt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Time Logged
                    </p>
                    <p className="text-lg font-bold text-indigo-600 font-mono">
                      {formatTime(seconds)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <textarea
                    autoFocus
                    placeholder="What did you accomplish in this session?"
                    className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none border border-slate-200"
                    value={feedback.work}
                    onChange={(e) =>
                      setFeedback({ ...feedback, work: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleFinalSave}
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
                      setFeedback({ reason: "", work: "" });
                      if (!pendingPause) setIsActive(true);
                    }}
                    className="flex-1 bg-white text-slate-600 border border-slate-200 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudyTimer;
