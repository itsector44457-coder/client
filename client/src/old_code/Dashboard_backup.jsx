import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Play,
  Square,
  CheckCircle,
  BookOpen,
  Users,
  UserPlus,
  LogOut,
  MoonStar,
  NotebookPen,
  Settings,
  Swords,
  X,
  UsersRound,
  Sparkles,
  Flame,
  Shield,
  Zap,
  ChevronRight,
  Camera,
} from "lucide-react";
import Community from "./Community";
import Network from "./Network";
import UserProfile from "./UserProfile";
import Tasks from "./Tasks";
import ResourcePanel from "./ResourcePanel";
import StudyTimer from "../components/Dashboard/StudyTimer";
import StudyLog from "./StudyLog";
import UniversePage from "./UniversePage";
import Syllabus from "./Syllabus";

const Dashboard = ({
  theme = "light",
  onSetTheme = () => {},
  themeOptions = [],
}) => {
  const bootUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [myField, setMyField] = useState(
    localStorage.getItem("userField") || bootUser?.field || "",
  );

  // --- NEW DYNAMIC FIELD STATES ---
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);

  const [activeTab, setActiveTab] = useState("Tasks");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [zenMode, setZenMode] = useState(false);
  const [focusTask, setFocusTask] = useState("Deep Study Session");
  const [todayDeepSeconds, setTodayDeepSeconds] = useState(0);
  const [lastSessionSeconds, setLastSessionSeconds] = useState(0);
  const [liveStudyCount, setLiveStudyCount] = useState(0);

  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [quickText, setQuickText] = useState("");
  const [quickImage, setQuickImage] = useState("");
  const [captures, setCaptures] = useState([]);
  const [resourceDeckEnabled, setResourceDeckEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTimeHistory, setShowTimeHistory] = useState(false);
  const [studyActive, setStudyActive] = useState(false);
  const [studyLogRefresh, setStudyLogRefresh] = useState(0);
  const [incomingBattles, setIncomingBattles] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [latestCompletedBattle, setLatestCompletedBattle] = useState(null);
  const [battleNotice, setBattleNotice] = useState("");
  const [battlePopup, setBattlePopup] = useState(null);
  const [challengeLoadingIds, setChallengeLoadingIds] = useState({});
  const [streakStats, setStreakStats] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = parsedUser?.id || parsedUser?._id || null;
  const currentUserName = parsedUser?.name || "Learner";
  const activeBattleOpponentName =
    activeBattle &&
    String(activeBattle?.challengerId?._id || activeBattle?.challengerId) ===
      String(currentUserId)
      ? activeBattle?.opponentId?.name
      : activeBattle?.challengerId?.name;

  const todayKey = currentUserId
    ? `deepStudy:${currentUserId}:${new Date().toISOString().slice(0, 10)}`
    : null;
  const captureKey = currentUserId
    ? `quickCaptures:${currentUserId}`
    : "quickCaptures:guest";
  const resourceDeckKey = currentUserId
    ? `resourceDeckEnabled:${currentUserId}`
    : "resourceDeckEnabled:guest";
  const battleSeenKey = currentUserId ? `battleSeen:${currentUserId}` : null;

  const isImmersiveTab =
    (activeTab === "Community" ||
      activeTab === "Network" ||
      activeTab === "Universe") &&
    !selectedUserId;
  const isStudying = isActive || studyActive;

  // --- NEW: FETCH DYNAMIC CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Categories fetch error:", err);
      } finally {
        setLoadingCats(false);
      }
    };
    if (!myField) fetchCategories();
  }, [myField]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!todayKey) return;
    const saved = Number(localStorage.getItem(todayKey) || 0);
    setTodayDeepSeconds(saved);
  }, [todayKey]);

  useEffect(() => {
    const saved = localStorage.getItem(captureKey);
    setCaptures(saved ? JSON.parse(saved) : []);
  }, [captureKey]);

  useEffect(() => {
    const raw = localStorage.getItem(resourceDeckKey);
    setResourceDeckEnabled(raw === null ? true : raw === "true");
  }, [resourceDeckKey]);

  useEffect(() => {
    if (!currentUserId || !myField) return;
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/presence/count",
          { params: { field: myField } },
        );
        setLiveStudyCount(res.data.count || 0);
      } catch (err) {
        console.error("Presence count error:", err);
      }
    };
    fetchCount();
    const poll = setInterval(fetchCount, 20000);
    return () => clearInterval(poll);
  }, [currentUserId, myField]);

  useEffect(() => {
    if (!currentUserId) return;
    reloadBattles();
    const poll = setInterval(reloadBattles, 5000);
    return () => clearInterval(poll);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !myField) return;
    const pingPresence = async (active) => {
      try {
        await axios.post("http://localhost:5000/api/presence/ping", {
          userId: currentUserId,
          field: myField,
          active,
        });
      } catch (err) {
        console.error("Presence ping error:", err);
      }
    };
    let heartbeat = null;
    if (isStudying) {
      pingPresence(true);
      heartbeat = setInterval(() => pingPresence(true), 25000);
    } else {
      pingPresence(false);
    }
    return () => {
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [isStudying, currentUserId, myField]);

  useEffect(() => {
    if (!battleNotice) return;
    const t = setTimeout(() => setBattleNotice(""), 4500);
    return () => clearTimeout(t);
  }, [battleNotice]);

  useEffect(() => {
    if (!battlePopup) return;
    const t = setTimeout(() => setBattlePopup(null), 2000);
    return () => clearTimeout(t);
  }, [battlePopup]);

  useEffect(() => {
    if (!latestCompletedBattle?._id || !battleSeenKey) return;
    const seenBattleId = localStorage.getItem(battleSeenKey);
    if (seenBattleId === latestCompletedBattle._id) return;
    showBattleResultPopup(latestCompletedBattle);
    localStorage.setItem(battleSeenKey, latestCompletedBattle._id);
  }, [latestCompletedBattle, battleSeenKey]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatHours = (sec) => `${(sec / 3600).toFixed(1)}h`;

  const loadStreakStats = async () => {
    if (!currentUserId) {
      setStreakStats(null);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${currentUserId}/streak`,
        {
          params: { tzOffset: new Date().getTimezoneOffset() },
        },
      );
      setStreakStats(res.data);
    } catch (err) {
      console.error("Streak stats fetch error:", err);
    }
  };

  const showBattleResultPopup = (battle) => {
    if (!battle || !currentUserId) return;
    const myId = String(currentUserId);
    const winnerId = String(battle?.winnerId?._id || battle?.winnerId || "");
    const loserId = String(battle?.loserId?._id || battle?.loserId || "");
    if (myId !== winnerId && myId !== loserId) return;
    const isWinner = myId === winnerId;
    const points = isWinner
      ? Number(battle?.winnerPoints ?? 15)
      : Number(battle?.loserPoints ?? -10);
    const score = isWinner
      ? battle?.winnerId?.battlePoints
      : battle?.loserId?.battlePoints;
    setBattlePopup({
      type: isWinner ? "win" : "lose",
      title: isWinner ? "🏆 Victory!" : "💀 Defeated",
      text: `${points > 0 ? `+${points}` : points} pts${Number.isFinite(Number(score)) ? ` · Score: ${score}` : ""}`,
    });
  };

  const handleFocusToggle = () => {
    if (isActive) {
      const sessionSeconds = seconds;
      const updated = todayDeepSeconds + sessionSeconds;
      setTodayDeepSeconds(updated);
      if (todayKey) localStorage.setItem(todayKey, String(updated));
      setLastSessionSeconds(sessionSeconds);
      setSeconds(0);
      setIsActive(false);
      return;
    }
    setLastSessionSeconds(0);
    setIsActive(true);
  };

  const handleSessionSaved = (sessionSeconds) => {
    if (!sessionSeconds || sessionSeconds <= 0) return;
    const updated = todayDeepSeconds + sessionSeconds;
    setTodayDeepSeconds(updated);
    if (todayKey) localStorage.setItem(todayKey, String(updated));
    setLastSessionSeconds(sessionSeconds);
    setStudyLogRefresh((prev) => prev + 1);
    loadStreakStats();
  };

  useEffect(() => {
    loadStreakStats();
  }, [currentUserId, studyLogRefresh]);

  const reloadBattles = async () => {
    if (!currentUserId) return;
    try {
      const [incomingRes, activeRes, historyRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/battles/incoming/${currentUserId}`,
        ),
        axios.get(`http://localhost:5000/api/battles/active/${currentUserId}`),
        axios.get(`http://localhost:5000/api/battles/history/${currentUserId}`),
      ]);
      setIncomingBattles(incomingRes.data || []);
      setActiveBattle(activeRes.data || null);
      setLatestCompletedBattle((historyRes.data || [])[0] || null);
    } catch (err) {
      console.error("Battle refresh error:", err);
    }
  };

  const handleChallengeUser = async (targetUser) => {
    try {
      if (!currentUserId || !targetUser?._id) return;
      const targetId = String(targetUser._id);
      if (challengeLoadingIds[targetId]) return;
      setChallengeLoadingIds((prev) => ({ ...prev, [targetId]: true }));
      const res = await axios.post(
        "http://localhost:5000/api/battles/challenge",
        {
          challengerId: currentUserId,
          opponentId: targetUser._id,
        },
      );
      setBattleNotice(
        res.data?.existing
          ? `Already pending with ${targetUser.name || "user"}.`
          : `Challenge sent to ${targetUser.name || "user"}!`,
      );
      reloadBattles();
    } catch (err) {
      setBattleNotice(
        err?.response?.data?.message || "Challenge send nahi ho paya.",
      );
    } finally {
      if (targetUser?._id) {
        const targetId = String(targetUser._id);
        setChallengeLoadingIds((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
      }
    }
  };

  const handleAcceptBattle = async (battleId) => {
    try {
      await axios.put(`http://localhost:5000/api/battles/${battleId}/accept`, {
        userId: currentUserId,
      });
      setBattleNotice("Battle accepted!");
      reloadBattles();
    } catch (err) {
      setBattleNotice(err?.response?.data?.message || "Accept failed");
    }
  };

  const handleRejectBattle = async (battleId) => {
    try {
      await axios.put(`http://localhost:5000/api/battles/${battleId}/reject`, {
        userId: currentUserId,
      });
      setBattleNotice("Challenge rejected.");
      reloadBattles();
    } catch (err) {
      setBattleNotice(err?.response?.data?.message || "Reject failed");
    }
  };

  const LogoutButton = ({ onLogout }) => {
    return (
      <button
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 p-4 w-full text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all group border border-transparent hover:border-rose-500/20"
      >
        <div className="p-2 bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white rounded-xl transition-colors">
          <LogOut size={20} />
        </div>
        <span className="font-black uppercase italic text-xs tracking-[0.2em]">
          Exit Universe
        </span>
      </button>
    );
  };

  const handleBattleLose = async ({ battleId, loserId, reason }) => {
    try {
      if (!battleId || !loserId) return;
      const res = await axios.put(
        `http://localhost:5000/api/battles/${battleId}/lose`,
        { loserId, reason },
      );
      const winner = res.data?.winnerId?.name || "Winner";
      const loser = res.data?.loserId?.name || "Loser";
      setBattleNotice(`Battle complete: ${winner} won!`);
      if (battleSeenKey && res.data?._id)
        localStorage.setItem(battleSeenKey, res.data._id);
      showBattleResultPopup(res.data);
      reloadBattles();
    } catch (err) {
      setBattleNotice(
        err?.response?.data?.message || "Battle result update failed",
      );
    }
  };

  // --- UPDATED: HANDLE DYNAMIC REGISTRATION ---
  const handleRegister = (parentName, subName) => {
    const fullField = `${parentName} - ${subName}`;
    localStorage.setItem("userField", fullField);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && Object.keys(user).length > 0) {
      user.field = fullField;
      localStorage.setItem("user", JSON.stringify(user));
    }
    setMyField(fullField);
  };

  const resetField = () => {
    localStorage.removeItem("userField");
    setMyField("");
    setSelectedParent(null);
  };

  const onCaptureImageSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQuickImage(reader.result?.toString() || "");
    reader.readAsDataURL(file);
  };

  const saveQuickCapture = () => {
    if (!quickText.trim() && !quickImage) return;
    const item = {
      id: Date.now(),
      text: quickText.trim(),
      image: quickImage,
      task: focusTask.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [item, ...captures].slice(0, 30);
    setCaptures(updated);
    localStorage.setItem(captureKey, JSON.stringify(updated));
    setQuickText("");
    setQuickImage("");
    setQuickCaptureOpen(false);
  };

  const toggleResourceDeck = () => {
    const next = !resourceDeckEnabled;
    setResourceDeckEnabled(next);
    localStorage.setItem(resourceDeckKey, String(next));
  };

  const navItems = [
    { id: "Tasks", icon: CheckCircle, label: "Tasks" },
    { id: "Syllabus", icon: BookOpen, label: "Syllabus" },
    { id: "Community", icon: Users, label: "Community" },
    { id: "Network", icon: UserPlus, label: "Network" },
    { id: "Universe", icon: Sparkles, label: "Universe" },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // DYNAMIC FIELD SELECTION SCREEN (UPDATED)
  // ──────────────────────────────────────────────────────────────────────────
  if (!myField) {
    return (
      <div className="min-h-screen bg-[#080b14] text-white flex items-center justify-center p-6 font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
          * { font-family: 'DM Sans', sans-serif; }
          .display { font-family: 'Syne', sans-serif; }
          .field-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
          .field-card:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.4); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.2); }
          .glow-orb { background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%); }
        `}</style>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] glow-orb opacity-40 pointer-events-none" />
        <div className="relative w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-xs text-indigo-300 font-medium tracking-wider uppercase">
                Universe Hub
              </span>
            </div>
            <h1 className="display text-5xl font-extrabold tracking-tight mb-3 italic">
              {selectedParent ? "Select Your" : "Choose Your"}
              <br />
              <span className="text-indigo-400">
                {selectedParent ? "Specialization" : "Domain"}
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              {selectedParent
                ? `Path: ${selectedParent.name}`
                : "Admin curated domains for your carrier journey"}
            </p>
          </div>

          {loadingCats ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
                Initializing Universe...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!selectedParent ? (
                // --- LEVEL 1: MAIN CATEGORIES ---
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedParent(cat)}
                    className="field-card rounded-[2.5rem] p-8 text-left group"
                  >
                    <span className="text-4xl block mb-4">
                      {cat.emoji || "📁"}
                    </span>
                    <p className="display font-bold text-white text-xl leading-tight uppercase italic">
                      {cat.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore Path <ChevronRight size={12} />
                    </div>
                  </button>
                ))
              ) : (
                // --- LEVEL 2: SUB-FIELDS ---
                <div className="col-span-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <button
                    onClick={() => setSelectedParent(null)}
                    className="mb-6 flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors"
                  >
                    ← Back to Domains
                  </button>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedParent.subFields.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleRegister(selectedParent.name, sub.name)
                        }
                        className="bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 p-6 rounded-2xl text-left flex items-center justify-between group transition-all"
                      >
                        <div>
                          <p className="text-white font-bold text-lg italic uppercase">
                            {sub.name}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            {sub.description ||
                              "Start your training in this galaxy"}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Play
                            size={16}
                            fill="currentColor"
                            className="text-indigo-400"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ZEN MODE (Same as original code)
  // ──────────────────────────────────────────────────────────────────────────
  if (zenMode) {
    return (
      <div className="min-h-screen bg-[#060810] text-white font-sans overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&family=Syne:wght@600;800&family=DM+Sans:wght@300;400;500&display=swap');
          body { font-family: 'DM Sans', sans-serif; }
          .display { font-family: 'Syne', sans-serif; }
          .mono { font-family: 'Syne Mono', monospace; }
          .zen-bg { background: radial-gradient(ellipse at 30% 0%, rgba(79,70,229,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.08) 0%, transparent 50%), #060810; }
          .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
          .capture-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        `}</style>
        <div className="zen-bg min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400/70 font-medium mb-1">
                Zen Mode
              </p>
              <h2 className="display text-2xl font-bold text-white uppercase italic">
                Deep Focus
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">
                  {liveStudyCount} online
                </span>
              </div>
              <button
                onClick={() => setZenMode(false)}
                className="glass rounded-xl px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Exit Zen
              </button>
            </div>
          </div>

          {/* Main Timer */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
            <div className="w-full max-w-2xl">
              <input
                value={focusTask}
                onChange={(e) => setFocusTask(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 text-white/60 text-sm text-center outline-none pb-3 mb-12 focus:border-indigo-500/50 transition-colors placeholder-white/20"
                placeholder="What are you working on?"
              />

              <div className="mono text-center text-[clamp(4rem,12vw,9rem)] font-normal tracking-[0.05em] text-white leading-none mb-12">
                {formatTime(seconds)}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleFocusToggle}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                      : "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
                  }`}
                >
                  {isActive ? <Square size={16} /> : <Play size={16} />}
                  {isActive ? "End Session" : "Begin Session"}
                </button>
                <button
                  onClick={() => setQuickCaptureOpen(true)}
                  className="glass px-5 py-4 rounded-2xl text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <NotebookPen size={15} /> Capture
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-10">
                <div className="text-center">
                  <p className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-bold">
                    Today
                  </p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatHours(todayDeepSeconds)}
                  </p>
                </div>
                {lastSessionSeconds > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-slate-600 uppercase tracking-widest mb-1 font-bold">
                      Last Session
                    </p>
                    <p className="text-xl font-bold text-indigo-300">
                      {formatTime(lastSessionSeconds)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Captures */}
          {captures.length > 0 && (
            <div className="px-8 pb-8">
              <div className="glass rounded-2xl p-4 max-w-2xl mx-auto">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-medium">
                  Later List
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                  {captures.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="capture-card rounded-xl px-3 py-2"
                    >
                      <p className="text-sm text-slate-300">
                        {item.text || "(image capture)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {quickCaptureModal(true)}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // QUICK CAPTURE MODAL
  // ──────────────────────────────────────────────────────────────────────────
  function quickCaptureModal(dark = false) {
    return (
      quickCaptureOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${dark ? "bg-[#0f1221] border border-white/10" : "bg-white border border-slate-100"}`}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${dark ? "border-white/5" : "border-slate-100"}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <NotebookPen size={14} className="text-indigo-400" />
                </div>
                <h3
                  className={`font-bold text-base ${dark ? "text-white" : "text-slate-900"}`}
                >
                  Quick Capture
                </h3>
              </div>
              <button
                onClick={() => setQuickCaptureOpen(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                rows={4}
                placeholder="Doubt, formula ya quick note..."
                className={`w-full rounded-xl p-4 text-sm outline-none resize-none transition-all ${dark ? "bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-indigo-500/50" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"}`}
              />
              {quickImage && (
                <img
                  src={quickImage}
                  alt="Preview"
                  className="mt-3 w-full max-h-48 object-cover rounded-xl border border-white/10"
                />
              )}
              <div className="flex items-center justify-between mt-4">
                <label
                  className={`flex items-center gap-2 text-xs font-medium cursor-pointer px-3 py-2 rounded-lg transition-colors ${dark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <Camera size={14} />
                  Add Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onCaptureImageSelect(e.target.files?.[0])}
                  />
                </label>
                <button
                  onClick={saveQuickCapture}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SETTINGS DRAWER
  // ──────────────────────────────────────────────────────────────────────────
  const settingsDrawer = settingsOpen && (
    <div className="fixed inset-0 z-[125]">
      <button
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white border-l border-slate-100 shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-slate-900">Settings</h3>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => {
              setSettingsOpen(false);
              setSelectedUserId(null);
              setActiveTab("Tasks");
              setShowTimeHistory(true);
            }}
            className="w-full px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-sm text-left flex items-center justify-between hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/10"
          >
            View Time History <ChevronRight size={16} />
          </button>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              App Theme
            </p>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSetTheme(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    theme === item.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN DASHBOARD (Same as original code)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#f4f6fb] text-slate-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .display { font-family: 'Syne', sans-serif; }
        .sidebar { background: #ffffff; border-right: 1px solid rgba(0,0,0,0.06); }
        .nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.15s; cursor: pointer; width: 100%; border: none; background: transparent; }
        .nav-btn:hover { background: #f1f5ff; color: #4f46e5; }
        .nav-btn.active { background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #4338ca; font-weight: 700; shadow: 0 4px 12px rgba(99,102,241,0.1); }
        .topbar { background: white; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .stat-pill { display: flex; flex-direction: column; padding: 10px 16px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); background: white; }
        .battle-badge { animation: pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite; }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
        .battle-notice { animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="sidebar w-16 md:w-56 flex flex-col justify-between py-6 px-3">
        <div>
          {/* Logo */}
          <div className="mb-10 px-2">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="display font-bold text-indigo-600 text-lg tracking-tight italic uppercase">
                Universe
              </span>
            </div>
            <div className="md:hidden flex justify-center">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedUserId(null);
                  setShowTimeHistory(false);
                  setActiveTab(id);
                }}
                className={`nav-btn ${activeTab === id && !selectedUserId && !showTimeHistory ? "active" : ""}`}
              >
                <Icon size={16} />
                <span className="hidden md:block tracking-tight">{label}</span>
              </button>
            ))}
          </nav>

          {/* Zen Mode */}
          <div className="mt-6">
            <button
              onClick={() => setZenMode(true)}
              className="nav-btn w-full shadow-sm"
              style={{
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                color: "#15803d",
                fontWeight: 700,
              }}
            >
              <MoonStar size={16} />
              <span className="hidden md:block">Zen Mode</span>
            </button>
          </div>
        </div>

        {/* Change Field */}
        <button
          onClick={LogoutButton}
          className="nav-btn text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold"
        >
          <LogOut size={16} />
          <span className="hidden md:block">Logout Universe</span>
        </button>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        {!isImmersiveTab && (
          <div className="topbar px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
            {/* User info */}
            <div>
              <h2 className="display font-bold text-lg text-slate-900 tracking-tight italic uppercase">
                Commander: {currentUserName} 👋
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mt-0.5">
                Current Domain: {myField}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="stat-pill">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                  Deep Study
                </span>
                <span className="text-sm font-bold text-emerald-600 mt-0.5">
                  {formatHours(todayDeepSeconds)}
                </span>
              </div>

              <div className="stat-pill shadow-sm">
                <span className="text-[9px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-1">
                  <Flame size={10} /> Streak
                </span>
                <span className="text-sm font-bold text-amber-600 mt-0.5">
                  {streakStats?.streakCount || 0}d
                </span>
              </div>

              <div className="stat-pill border-indigo-100">
                <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-black flex items-center gap-1">
                  <Zap size={10} /> Live
                </span>
                <span className="text-sm font-bold text-indigo-600 mt-0.5">
                  {liveStudyCount} online
                </span>
              </div>

              {activeBattle?.status === "active" && (
                <div className="stat-pill battle-badge border-rose-100 bg-rose-50/30">
                  <span className="text-[9px] text-rose-500 uppercase tracking-widest font-black flex items-center gap-1">
                    <Swords size={10} /> Battle
                  </span>
                  <span className="text-[11px] font-black text-rose-600 mt-0.5">
                    vs {activeBattleOpponentName || "Opponent"}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
                <button
                  onClick={() => setQuickCaptureOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all active:scale-95 shadow-sm"
                  title="Quick Capture"
                >
                  <NotebookPen size={16} />
                </button>

                <button
                  onClick={toggleResourceDeck}
                  className={`h-9 px-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm ${resourceDeckEnabled ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                >
                  Deck {resourceDeckEnabled ? "On" : "Off"}
                </button>

                <button
                  onClick={() => setSettingsOpen(true)}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Battle Notice */}
        {battleNotice && !isImmersiveTab && (
          <div className="battle-notice mx-6 mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-800 flex items-center gap-2 shadow-sm">
            <Zap size={14} className="text-amber-500" /> {battleNotice}
          </div>
        )}

        {/* Content Area */}
        <div
          className={`flex-1 flex overflow-hidden ${isImmersiveTab ? "" : "p-4 md:p-6 gap-6"}`}
        >
          <div
            className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isImmersiveTab ? "h-screen" : "gap-6"}`}
          >
            {/* Study Timer Section */}
            {!isImmersiveTab && !showTimeHistory && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6">
                <StudyTimer
                  onActiveChange={setStudyActive}
                  onSessionSaved={handleSessionSaved}
                  battle={activeBattle}
                  incomingBattles={incomingBattles}
                  onAcceptChallenge={handleAcceptBattle}
                  onRejectChallenge={handleRejectBattle}
                  onBattleLose={handleBattleLose}
                />
              </div>
            )}

            {/* Tab Content Section */}
            <div className="flex-1 overflow-auto no-scrollbar">
              {showTimeHistory ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="display font-black text-xl text-slate-900 italic uppercase italic">
                      Session History
                    </h3>
                    <button
                      onClick={() => setShowTimeHistory(false)}
                      className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                  <StudyLog refreshKey={studyLogRefresh} fullPage />
                </div>
              ) : selectedUserId ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
                  <UserProfile
                    userId={selectedUserId}
                    currentUserId={currentUserId}
                    onBack={() => setSelectedUserId(null)}
                  />
                </div>
              ) : activeTab === "Tasks" ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
                  <Tasks onStreakUpdate={loadStreakStats} />
                </div>
              ) : activeTab === "Syllabus" ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
                  <Syllabus myField={myField} />
                </div>
              ) : activeTab === "Community" ? (
                <div className="h-full">
                  <Community myField={myField} />
                </div>
              ) : activeTab === "Network" ? (
                <div className="h-full">
                  <Network
                    onUserClick={(id) => setSelectedUserId(id)}
                    onChallengeUser={handleChallengeUser}
                    challengeLoadingIds={challengeLoadingIds}
                    activeBattle={activeBattle}
                  />
                </div>
              ) : activeTab === "Universe" ? (
                <div className="h-full">
                  <UniversePage myField={myField} />
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-center h-48">
                  <p className="text-slate-300 font-black uppercase tracking-widest italic">
                    Target Coming Soon...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resource Panel (Always Visible when studying) */}
          {!isImmersiveTab && isStudying && resourceDeckEnabled && (
            <div className="w-80 flex-shrink-0 hidden xl:block">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
                <ResourcePanel
                  myField={myField}
                  currentUserId={currentUserId}
                  onHide={() => {
                    setResourceDeckEnabled(false);
                    localStorage.setItem(resourceDeckKey, "false");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle Results */}
      {battlePopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[180] animate-in slide-in-from-top duration-500">
          <div
            className={`rounded-full border px-8 py-3.5 shadow-2xl backdrop-blur-md text-center flex items-center gap-3 ${
              battlePopup.type === "win"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-700"
                : "bg-rose-50/90 border-rose-200 text-rose-700"
            }`}
          >
            <Trophy
              size={18}
              className={
                battlePopup.type === "win" ? "text-amber-500" : "text-slate-400"
              }
            />
            <div>
              <p className="font-black text-xs uppercase tracking-widest leading-none">
                {battlePopup.title}
              </p>
              <p className="text-[10px] font-bold mt-1 opacity-80">
                {battlePopup.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {quickCaptureModal(false)}
      {settingsDrawer}
    </div>
  );
};

export default Dashboard;
