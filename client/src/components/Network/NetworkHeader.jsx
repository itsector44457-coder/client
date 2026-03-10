import React from "react";
import { Search, Users } from "lucide-react";

const NetworkHeader = ({
  searchTerm,
  setSearchTerm,
  userCount,
  currentField,
}) => (
  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-4 sm:p-6 shadow-sm">
    {/* Top Row: Title & Online Count */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
          Universe Network
        </h2>
        <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 sm:mt-2 truncate max-w-[250px]">
          Syncing with {currentField || "All Sectors"}
        </p>
      </div>

      <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-indigo-100 flex items-center gap-2 self-start transition-all">
        <Users size={14} className="sm:w-4 sm:h-4" />
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
          {userCount} Online
        </span>
      </div>
    </div>

    {/* Search Bar Container */}
    <div className="relative group">
      <Search
        className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors sm:w-[18px] sm:h-[18px]"
        size={16}
      />
      <input
        type="text"
        placeholder="Search name or expertise..."
        className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[1.5rem] py-3 sm:py-4 pl-11 sm:pl-14 pr-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-xs sm:text-sm font-medium shadow-sm placeholder:text-slate-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
);

export default NetworkHeader;
