import React from "react";
import { ShieldCheck, Zap, UserPlus, UserCheck, Swords } from "lucide-react";

const ProfileInfo = ({
  user,
  postCount,
  isFollowing,
  onFollow,
  onChallenge,
}) => (
  <div className="px-4 sm:px-6 pt-5 sm:pt-8 pb-3">
    {/* Avatar & Stats Section */}
    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-10">
      {/* 🌈 Gradient Avatar Ring - Adaptive Size */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shrink-0 shadow-lg shadow-rose-500/10">
        <div className="w-full h-full rounded-full bg-white p-0.5 sm:p-1">
          <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-600 italic">
            {user?.name?.[0] || "?"}
          </div>
        </div>
      </div>

      {/* Stats Row - Responsive Flex */}
      <div className="flex-1 flex justify-around sm:justify-start sm:gap-12">
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base font-black text-slate-900 leading-none">
            {postCount}
          </p>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">
            Signals
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base font-black text-slate-900 leading-none">
            {user?.followers?.length || 0}
          </p>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">
            Commanders
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base font-black text-slate-900 leading-none text-indigo-600">
            {user?.battlePoints || 0}
          </p>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">
            XP Power
          </p>
        </div>
      </div>
    </div>

    {/* Bio Section */}
    <div className="mt-5 sm:mt-6 px-1">
      <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1 uppercase italic">
        {user?.name || "Unknown Commander"}{" "}
        <ShieldCheck
          size={14}
          className="text-blue-500 fill-blue-500/10 shrink-0"
        />
      </h4>
      <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-1.5 leading-relaxed max-w-sm">
        Director at{" "}
        <span className="font-bold text-indigo-600 uppercase tracking-tighter">
          Aarambh Institute
        </span>
        <br />
        <span className="flex items-center gap-1 mt-0.5">
          <Zap size={10} className="text-amber-500 fill-amber-500" />
          Sector: {user?.field || "General"} Active 🚀
        </span>
      </p>
    </div>

    {/* Primary Actions - Highly Tappable for Mobile */}
    <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
      <button
        onClick={onFollow}
        className={`flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
          isFollowing
            ? "bg-slate-100 text-slate-600 border border-slate-200"
            : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck size={14} /> Linked
          </>
        ) : (
          <>
            <UserPlus size={14} /> Follow
          </>
        )}
      </button>

      <button
        onClick={onChallenge}
        className="flex-1 bg-white border border-slate-200 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
      >
        <Swords size={14} /> Challenge
      </button>
    </div>
  </div>
);

export default ProfileInfo;
