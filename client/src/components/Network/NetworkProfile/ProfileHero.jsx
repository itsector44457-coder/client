import React from "react";

const ProfileHero = ({ name, isFollowing, onFollow }) => {
  return (
    <div className="relative">
      {/* 🌌 Cover - Adaptive height for mobile vs desktop */}
      <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-b-[1.5rem] sm:rounded-b-[2.5rem] shadow-inner" />

      {/* 👤 Avatar + Follow Button Container */}
      <div className="px-4 sm:px-8 flex justify-between items-end -mt-10 sm:-mt-12 md:-mt-14">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-white p-1 sm:p-1.5 shadow-xl relative z-10">
          <div className="w-full h-full rounded-[0.6rem] sm:rounded-xl bg-indigo-50 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black text-indigo-600 uppercase italic shadow-inner">
            {name?.[0] || "?"}
          </div>
        </div>

        {/* Follow Button */}
        <button
          onClick={onFollow}
          className={`relative z-10 px-5 py-2 sm:px-8 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 mb-1 sm:mb-0 ${
            isFollowing
              ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 shadow-sm"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default ProfileHero;
