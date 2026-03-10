import React from "react";

const CommunityHeader = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex justify-center py-3 sm:py-4 px-4 sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur-md">
      {/* Mobile par w-full aur max-w use kiya hai taaki dabbe jaisa na lage */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl w-full max-w-[320px] sm:w-auto shadow-inner">
        {["Explore", "Following"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 sm:flex-none px-6 py-2.5 sm:py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              viewMode === mode
                ? "bg-white text-indigo-600 shadow-sm transform scale-[1.02]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommunityHeader;
