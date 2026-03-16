import React from "react";
import { ShieldCheck, Zap, UserPlus, UserCheck, Swords } from "lucide-react";

const ProfileInfo = ({
  user,
  postCount,
  isFollowing,
  onFollow,
  onChallenge,
}) => (
  // 🟢 Clean padding with soft background base
  <div className="px-4 sm:px-6 pt-5 pb-5 bg-white border-b border-slate-100">
    {/* Avatar & Stats Section */}
    <div className="flex items-center justify-between gap-6 sm:gap-10">
      {/* 🌈 Avatar - Clean circular without heavy gradients */}
      <div className="relative shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-200 bg-indigo-50 flex items-center justify-center text-2xl sm:text-3xl font-bold text-indigo-700 shadow-sm">
          {user?.name?.[0]?.toUpperCase() || "C"}
        </div>
        <div
          className="absolute bottom-0.5 right-0.5 bg-emerald-500 border-[3px] border-white w-4 h-4 sm:w-5 sm:h-5 rounded-full"
          title="Online"
        />
      </div>

      {/* 📊 Stats Row - Clean Typography */}
      <div className="flex-1 flex justify-around sm:justify-start sm:gap-10">
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-bold text-slate-800 leading-none">
            {postCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Posts</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-bold text-slate-800 leading-none">
            {user?.followers?.length || 0}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Followers</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-bold text-indigo-600 leading-none">
            {user?.battlePoints || 0}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">XP</p>
        </div>
      </div>
    </div>

    {/* 📝 Bio Section - Readable & Professional */}
    <div className="mt-4 sm:mt-5 px-1">
      <h4 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-1.5 tracking-tight leading-snug">
        {user?.name || "Commander"}
        <ShieldCheck size={16} className="text-blue-500 shrink-0" />
      </h4>
      <div className="text-sm font-medium text-slate-600 mt-1.5 leading-relaxed max-w-sm">
        <p>
          Director at{" "}
          <span className="font-semibold text-slate-800">
            Aarambh Institute
          </span>
        </p>
        <p className="flex items-center gap-1.5 mt-0.5 text-slate-500">
          <Zap size={14} className="text-amber-500" />
          Sector:{" "}
          <span className="font-semibold text-slate-700">
            {user?.field || "General"}
          </span>
        </p>
      </div>
    </div>

    {/* ⚡ Primary Actions - SaaS Standard Buttons */}
    <div className="flex gap-2.5 mt-5 sm:mt-6">
      {/* Follow/Link Button - Primary Highlight */}
      <button
        onClick={onFollow}
        className={`flex-1 py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          isFollowing
            ? "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck size={16} /> Linked
          </>
        ) : (
          <>
            <UserPlus size={16} /> Follow
          </>
        )}
      </button>

      {/* Challenge Button - Secondary Ghost Button */}
      <button
        onClick={onChallenge}
        className="flex-1 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
      >
        <Swords size={16} /> Challenge
      </button>
    </div>
  </div>
);

export default ProfileInfo;
