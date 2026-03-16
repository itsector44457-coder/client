import React from "react";
import {
  Flame,
  Zap,
  NotebookPen,
  Settings,
  Trophy,
  CheckCircle2,
} from "lucide-react";

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
  const formatHours = (sec) => {
    if (!sec || isNaN(sec)) return "0h";
    const hours = sec / 3600;
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
      {/* 1. Commander Identity */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          {/* Minimal Avatar instead of an icon box */}
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
            {currentUserName?.[0]?.toUpperCase() || "C"}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base tracking-tight truncate">
              {currentUserName || "Commander"}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {myField || "General Studies"}
            </p>
          </div>
        </div>

        {/* Mobile Quick Actions (Settings & Notes) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <NotebookPen size={18} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 2. Live Stats & Streak Area (Scrollable on Mobile) */}
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
        {/* Deep Focus */}
        <div className="flex flex-col px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg min-w-[80px] shrink-0">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            Focus
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {formatHours(todayDeepSeconds)}
          </span>
        </div>

        {/* Rank XP */}
        <div className="flex flex-col px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg min-w-[80px] shrink-0">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Trophy size={10} className="text-indigo-400" /> XP
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {battlePoints}
          </span>
        </div>

        {/* 🔥 STREAK CHECK-IN BUTTON - Minimal & Clean */}
        <button
          onClick={() => !hasCheckedInToday && onCheckIn && onCheckIn()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border min-w-[100px] shrink-0 transition-all duration-200 text-left ${
            hasCheckedInToday
              ? "bg-emerald-50 border-emerald-100 cursor-default"
              : "bg-white border-orange-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer shadow-sm"
          }`}
        >
          {hasCheckedInToday ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <Flame size={16} className="text-orange-500 shrink-0" />
          )}
          <div className="flex flex-col">
            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${hasCheckedInToday ? "text-emerald-600" : "text-orange-500"}`}
            >
              {hasCheckedInToday ? "Logged" : "Check In"}
            </span>
            <span
              className={`text-xs font-bold ${hasCheckedInToday ? "text-emerald-700" : "text-orange-600"}`}
            >
              {streakCount} Days
            </span>
          </div>
        </button>

        {/* Mobile Resource Toggle */}
        <button
          onClick={toggleResourceDeck}
          className={`md:hidden shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors h-full ${
            resourceDeckEnabled
              ? "bg-indigo-50 border-indigo-100 text-indigo-600"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          Mod: {resourceDeckEnabled ? "On" : "Off"}
        </button>

        {/* 3. Global Quick Actions (Desktop Only) - Clean Icons */}
        <div className="hidden md:flex items-center gap-1 pl-3 ml-1 border-l border-slate-100 shrink-0">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Quick Notes"
          >
            <NotebookPen size={18} />
          </button>

          <button
            onClick={toggleResourceDeck}
            className={`px-3 py-1.5 mx-1 rounded-lg border text-xs font-medium transition-colors ${
              resourceDeckEnabled
                ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            Module {resourceDeckEnabled ? "On" : "Off"}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
