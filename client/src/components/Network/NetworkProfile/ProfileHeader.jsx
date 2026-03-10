import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

const ProfileHeader = ({ name, onBack }) => (
  <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-3 py-2 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-100 shadow-sm sm:shadow-none">
    <button
      onClick={onBack}
      className="p-2 sm:p-2.5 hover:bg-slate-100 rounded-full transition-all active:scale-90"
      aria-label="Go Back"
    >
      <ArrowLeft size={20} className="sm:w-[22px] sm:h-[22px] text-slate-700" />
    </button>

    {/* 🔥 THE FIX: truncate add kiya hai taaki lamba naam UI na tode */}
    <h3 className="font-black text-slate-900 uppercase italic text-sm sm:text-base tracking-tighter truncate px-2 max-w-[200px] sm:max-w-md text-center">
      {name || "Loading..."}
    </h3>

    <button
      className="p-2 sm:p-2.5 hover:bg-slate-100 rounded-full transition-all active:scale-90"
      aria-label="More Options"
    >
      <MoreVertical
        size={20}
        className="sm:w-[22px] sm:h-[22px] text-slate-400"
      />
    </button>
  </div>
);

export default ProfileHeader;
