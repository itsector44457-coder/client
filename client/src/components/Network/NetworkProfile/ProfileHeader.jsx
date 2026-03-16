import React from "react";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

const ProfileHeader = ({ name, onBack }) => (
  // 🟢 Clean frosted glass header with subtle bottom border
  <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-100">
    {/* Left: Back Button (Fixed width container for perfect centering) */}
    <div className="w-10 flex justify-start shrink-0">
      <button
        onClick={onBack}
        // -ml-2 optical alignment ke liye taaki padding hote hue bhi button edge ke paas lage
        className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
        aria-label="Go Back"
      >
        <ArrowLeft size={20} />
      </button>
    </div>

    {/* Center: Profile Name */}
    <div className="flex-1 min-w-0 px-2">
      <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight truncate text-center">
        {name || "Loading..."}
      </h3>
    </div>

    {/* Right: More Options Button */}
    <div className="w-10 flex justify-end shrink-0">
      <button
        // MoreVertical ki jagah MoreHorizontal web aur modern apps mein zyada clean lagta hai
        className="p-2 -mr-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
        aria-label="More Options"
      >
        <MoreHorizontal size={20} />
      </button>
    </div>
  </div>
);

export default ProfileHeader;
