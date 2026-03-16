import React from "react";
import { Swords, UserPlus, UserCheck, ShieldCheck, Zap } from "lucide-react";

const UserCard = ({
  user,
  onChallenge,
  onFollow,
  isFollowing,
  challengeBusy,
  inActiveBattle,
  onClick,
}) => {
  const uid = String(user._id || user.id);

  return (
    <div
      onClick={() => onClick(uid)}
      className="group bg-white border border-slate-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* 👤 User Info Section */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Minimal Circular Avatar */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
          {(user.name || "C")[0]?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 tracking-tight truncate flex items-center gap-1.5 text-base sm:text-lg leading-snug">
            {user.name || "Commander"}
            <ShieldCheck size={16} className="text-blue-500 shrink-0" />
          </h4>
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate mt-0.5">
            {user.field || "General"} Sector
          </p>
        </div>
      </div>

      {/* ⚔️ Action Buttons Section */}
      <div className="flex gap-2.5 mt-auto">
        {/* Challenge Button - Ghost style so it doesn't overpower */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onChallenge) onChallenge(user);
          }}
          disabled={challengeBusy || inActiveBattle}
          className="flex-1 bg-white border border-rose-200 text-rose-600 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:hover:bg-white flex items-center justify-center gap-1.5 sm:gap-2"
        >
          <Swords size={16} />
          <span className="truncate">
            {inActiveBattle
              ? "Duel On"
              : challengeBusy
                ? "Calling..."
                : "Challenge"}
          </span>
        </button>

        {/* Link/Follow Button - Primary highlight */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onFollow) onFollow(uid);
          }}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
            isFollowing
              ? "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100"
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} />
              <span className="truncate">Linked</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span className="truncate">Link</span>
            </>
          )}
        </button>
      </div>

      {/* Subtle Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400">
        <span className="truncate">Network Hub</span>
        <Zap size={12} className="text-slate-300" />
      </div>
    </div>
  );
};

export default UserCard;
