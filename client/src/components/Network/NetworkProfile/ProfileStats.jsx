import React from "react";

const ProfileStats = ({ postCount = 0, followers = 0, xp = 0 }) => (
  <div className="flex items-center justify-around py-3 sm:py-5 border-b border-slate-100 bg-white sm:bg-transparent">
    {/* Signals / Posts */}
    <div className="flex-1 text-center">
      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">
        {postCount}
      </p>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">
        Signals
      </p>
    </div>

    {/* Vertical Divider (Visible on small screens and up) */}
    <div className="w-px h-6 bg-slate-100 hidden sm:block" />

    {/* Followers / Commanders */}
    <div className="flex-1 text-center">
      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">
        {followers}
      </p>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">
        Commanders
      </p>
    </div>

    {/* Vertical Divider (Visible on small screens and up) */}
    <div className="w-px h-6 bg-slate-100 hidden sm:block" />

    {/* XP Power */}
    <div className="flex-1 text-center">
      <p className="text-base sm:text-lg font-black text-indigo-600 leading-none italic">
        {xp}
      </p>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">
        XP Power
      </p>
    </div>
  </div>
);

export default ProfileStats;
