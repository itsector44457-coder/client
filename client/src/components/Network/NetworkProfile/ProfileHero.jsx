import React from "react";

const ProfileHero = ({ name, isFollowing, onFollow }) => {
  return (
    <div className="relative bg-white pb-3 sm:pb-4 border-b border-slate-100">
      {/* 🌌 Cover - Minimal soft background instead of heavy gradient */}
      <div className="h-24 sm:h-32 w-full bg-slate-200" />

      {/* 👤 Avatar + Follow Button Container */}
      <div className="px-4 sm:px-6 flex justify-between items-end -mt-10 sm:-mt-12">
        {/* Minimal Circular Avatar overlapping the cover */}
        <div className="relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 border-4 border-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-700">
              {name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        </div>

        {/* Follow Button - Standard SaaS Styling (Pill shape) */}
        <button
          onClick={onFollow}
          className={`relative z-10 px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors mb-1 sm:mb-2 ${
            isFollowing
              ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default ProfileHero;
