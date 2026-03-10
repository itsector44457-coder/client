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
      className="group relative bg-white border border-slate-100 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 sm:hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98] sm:active:scale-100"
    >
      {/* Visual Decoration (Hidden on small mobile to save GPU) */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />

      {/* 👤 User Info Section */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[1rem] sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl italic shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform shrink-0">
          {(user.name || "C")[0]}
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none flex items-center gap-1 text-sm sm:text-base">
            {user.name || "Commander"}
            <ShieldCheck size={12} className="text-blue-500 shrink-0" />
          </h4>
          <span className="inline-flex mt-1.5 sm:mt-2 text-[7px] sm:text-[8px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-slate-100 truncate max-w-full">
            {user.field || "General"}
          </span>
        </div>
      </div>

      {/* ⚔️ Action Buttons Section */}
      <div className="flex gap-2 relative z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onChallenge) onChallenge(user);
          }}
          disabled={challengeBusy || inActiveBattle}
          className="flex-1 bg-rose-500 text-white py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase italic shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50 active:scale-95"
        >
          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
            <Swords size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="truncate">
              {inActiveBattle
                ? "Duel On"
                : challengeBusy
                  ? "Calling..."
                  : "Challenge"}
            </span>
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onFollow) onFollow(uid);
          }}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase italic transition-all border active:scale-95 ${
            isFollowing
              ? "bg-white text-slate-400 border-slate-100"
              : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
            {isFollowing ? (
              <>
                <UserCheck size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
                <span className="truncate">Linked</span>
              </>
            ) : (
              <>
                <UserPlus size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
                <span className="truncate">Link</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Speed Indicator */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest">
        <span className="truncate">{user.field || "General"} Sector Hub</span>
        <Zap size={10} className="text-indigo-200 shrink-0" />
      </div>
    </div>
  );
};

export default UserCard;
