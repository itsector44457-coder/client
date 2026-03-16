import React from "react";

const ProfileStats = ({ postCount = 0, followers = 0, xp = 0 }) => (
  // 🟢 Clean container with subtle top/bottom borders
  <div className="flex items-center justify-between py-4 border-y border-slate-100 bg-white">
    {/* 📊 Posts */}
    <div className="flex-1 flex flex-col items-center justify-center">
      <p className="text-lg sm:text-xl font-bold text-slate-800 leading-none">
        {postCount}
      </p>
      <p className="text-xs font-medium text-slate-500 mt-1.5">Posts</p>
    </div>

    {/* Soft Vertical Divider (Now visible on all screens) */}
    <div className="w-px h-8 bg-slate-100" />

    {/* 👥 Followers */}
    <div className="flex-1 flex flex-col items-center justify-center">
      <p className="text-lg sm:text-xl font-bold text-slate-800 leading-none">
        {followers}
      </p>
      <p className="text-xs font-medium text-slate-500 mt-1.5">Followers</p>
    </div>

    {/* Soft Vertical Divider */}
    <div className="w-px h-8 bg-slate-100" />

    {/* ⭐ XP */}
    <div className="flex-1 flex flex-col items-center justify-center">
      <p className="text-lg sm:text-xl font-bold text-indigo-600 leading-none">
        {xp}
      </p>
      <p className="text-xs font-medium text-slate-500 mt-1.5">XP</p>
    </div>
  </div>
);

export default ProfileStats;
