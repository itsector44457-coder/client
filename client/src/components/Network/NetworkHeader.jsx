import React from "react";
import { Search, Users } from "lucide-react";

const NetworkHeader = ({
  searchTerm,
  setSearchTerm,
  userCount,
  currentField,
}) => (
  // 🟢 Clean frosted glass header
  <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
    {/* Top Row: Title & Online Count */}
    <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-none">
          Universe Network
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1.5 truncate max-w-[250px] sm:max-w-md">
          Sector:{" "}
          <span className="text-indigo-600">{currentField || "All"}</span>
        </p>
      </div>

      {/* Online Badge - Soft & Minimal */}
      <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 shrink-0 shadow-sm">
        <Users size={14} />
        <span className="text-xs font-semibold">
          {userCount} <span className="hidden sm:inline">Online</span>
        </span>
      </div>
    </div>

    {/* Search Bar Container */}
    <div className="relative group">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
        size={18}
      />
      <input
        type="text"
        placeholder="Search commanders or expertise..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
);

export default NetworkHeader;
