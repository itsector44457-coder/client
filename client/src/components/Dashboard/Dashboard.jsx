import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import Sidebar from "../Dashboard/Sidebar";
import Topbar from "../Dashboard/Topbar";
import SettingsDrawer from "../Dashboard/SettingsDrawer";
import ZenMode from "../Dashboard/ZenMode";
import QuickCaptureModal from "../Dashboard/QuickCaptureModal";
import StudyTimer from "./StudyTimer";
import BattleRequestModal from "../Battle/BattleRequestModal";

const socket = io(`https://backend-6hhv.onrender.com`);

const Dashboard = ({ theme, onSetTheme, themeOptions, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const myId = userData?.id || userData?._id;
  const myField = localStorage.getItem("userField") || userData?.field || "";

  /* ============================
        STREAK & CHECK-IN STATE
  ============================ */
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streakCount, setStreakCount] = useState(userData?.streakCount || 0);

  useEffect(() => {
    const lastCheckIn = localStorage.getItem(`lastCheckIn_${myId}`);
    const today = new Date().toDateString();
    if (lastCheckIn === today) setHasCheckedInToday(true);
  }, [myId]);

  /* ============================
        TIMER STATES
  ============================ */
  const [seconds, setSeconds] = useState(
    () => Number(localStorage.getItem("timer_seconds")) || 0,
  );
  const [isActive, setIsActive] = useState(
    () => localStorage.getItem("timer_isActive") === "true",
  );
  const [todayDeepSeconds, setTodayDeepSeconds] = useState(
    userData?.todayDeepSeconds || 0,
  );

  /* ============================
        BATTLE STATES
  ============================ */
  const [activeBattle, setActiveBattle] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);

  /* ============================
        UI STATES
  ============================ */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [resourceDeckEnabled, setResourceDeckEnabled] = useState(true);

  /* ============================
        LIVE USER DATA SYNC
  ============================ */
  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user_updated", handleStorageChange);
    };
  }, []);

  /* ============================
        SOCKET CONNECTION
  ============================ */
  useEffect(() => {
    if (!myId) return;

    socket.emit("join_private_sector", myId);

    socket.on("receive_battle_request", (data) => setIncomingChallenge(data));

    socket.on("battle_response_received", (data) => {
      alert(`Commander ${data.targetName} has ${data.status} your challenge!`);
      if (data.status === "accepted") fetchActiveBattle();
    });

    return () => {
      socket.off("receive_battle_request");
      socket.off("battle_response_received");
    };
  }, [myId]);

  /* ============================
        FETCH ACTIVE BATTLE
  ============================ */
  const fetchActiveBattle = async () => {
    try {
      const res = await axios.get(
        `https://backend-6hhv.onrender.com/api/battles/active/${myId}`,
      );
      setActiveBattle(res.data);
    } catch (err) {
      console.log("No active battle");
    }
  };

  useEffect(() => {
    fetchActiveBattle();
  }, [myId]);

  /* ============================
        TIMER LOGIC
  ============================ */
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        localStorage.setItem("timer_lastTimestamp", Date.now().toString());
      }, 1000);
    }
    localStorage.setItem("timer_seconds", seconds);
    localStorage.setItem("timer_isActive", isActive);
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  /* ============================
        HANDLERS
  ============================ */
  const handleDailyCheckIn = async () => {
    try {
      await axios.post(
        `https://backend-6hhv.onrender.com/api/users/${myId}/checkin`,
      );
      const newStreak = streakCount + 1;

      setHasCheckedInToday(true);
      setStreakCount(newStreak);
      localStorage.setItem(`lastCheckIn_${myId}`, new Date().toDateString());

      const updatedUser = { ...userData, streakCount: newStreak };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
    } catch (error) {
      console.error("Check-in failed", error);
    }
  };

  const handleSessionSaved = (duration) => {
    setTodayDeepSeconds((prev) => prev + duration);
    setSeconds(0);
    setIsActive(false);
    localStorage.removeItem("timer_seconds");
    localStorage.removeItem("timer_isActive");
    localStorage.removeItem("timer_lastTimestamp");
  };

  const handleAcceptBattle = () => {
    socket.emit("respond_to_challenge", {
      fromUserId: incomingChallenge.senderId,
      status: "accepted",
      targetName: userData.name,
    });
    setIncomingChallenge(null);
    fetchActiveBattle();
    navigate("/dashboard/battle-arena", {
      state: {
        opponent: incomingChallenge.senderName,
        field: incomingChallenge.battleType,
      },
    });
  };

  const handleRejectBattle = () => {
    socket.emit("respond_to_challenge", {
      fromUserId: incomingChallenge.senderId,
      status: "rejected",
      targetName: userData.name,
    });
    setIncomingChallenge(null);
  };

  const formatHours = (sec) => `${(sec / 3600).toFixed(1)}h`;

  /* ============================
        UI (LAYOUT SHELL)
  ============================ */
  return (
    // bg-slate-100 ko bg-slate-50 kiya gaya hai for a cleaner, modern look.
    // selection colors add kiye hain taaki text select karne par minimal feel aaye.
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* SIDEBAR */}
      <Sidebar setZenMode={setZenMode} onLogout={onLogout} />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden relative">
        {/* TOPBAR */}
        <Topbar
          currentUserName={userData.name || "Commander"}
          myField={myField}
          todayDeepSeconds={todayDeepSeconds + (isActive ? seconds : 0)}
          streakCount={streakCount}
          battlePoints={userData.battlePoints}
          setSettingsOpen={setSettingsOpen}
          setQuickCaptureOpen={setQuickCaptureOpen}
          resourceDeckEnabled={resourceDeckEnabled}
          toggleResourceDeck={() =>
            setResourceDeckEnabled(!resourceDeckEnabled)
          }
          formatHours={formatHours}
          hasCheckedInToday={hasCheckedInToday}
          onCheckIn={handleDailyCheckIn}
        />

        {/* PAGE CONTENT AREA - Adjusted paddings for minimal components */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-24 md:pb-8 scroll-smooth no-scrollbar">
          {location.pathname === "/dashboard" && (
            <div className="mb-5 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StudyTimer
                isActive={isActive}
                setIsActive={setIsActive}
                seconds={seconds}
                setSeconds={setSeconds}
                onSessionSaved={handleSessionSaved}
                battle={activeBattle}
                onBattleLose={(data) =>
                  axios.put(
                    `https://backend-6hhv.onrender.com/api/battles/${data.battleId}/lose`,
                    data,
                  )
                }
              />
            </div>
          )}

          <div className="animate-in fade-in duration-500">
            <Outlet
              context={{
                currentUserId: myId,
                myField,
                resourceDeckEnabled,
              }}
            />
          </div>
        </main>
      </div>

      {/* MODALS */}
      <BattleRequestModal
        request={incomingChallenge}
        onAccept={handleAcceptBattle}
        onReject={handleRejectBattle}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onViewHistory={() => {
          setSettingsOpen(false);
          navigate("/dashboard/history");
        }}
        onViewBattles={() => {
          setSettingsOpen(false);
          navigate("/dashboard/battles");
        }}
        onViewWeakness={() => {
          setSettingsOpen(false);
          navigate("/dashboard/weakness");
        }}
        theme={theme}
        onSetTheme={onSetTheme}
        themeOptions={themeOptions}
        onLogout={onLogout}
      />

      {zenMode && (
        <ZenMode
          setZenMode={setZenMode}
          isActive={isActive}
          setIsActive={setIsActive}
          seconds={seconds}
          todayDeepSeconds={todayDeepSeconds}
          setQuickCaptureOpen={setQuickCaptureOpen}
        />
      )}

      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
