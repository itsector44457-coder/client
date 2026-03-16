import React from "react";

const CommunityHeader = ({ viewMode, setViewMode }) => {
  return (
    // Sticky header with soft blur and a very subtle bottom border for separation
    <div className="sticky top-0 z-20 bg-slate-50/85 backdrop-blur-md pt-4 pb-3 px-4 flex justify-center border-b border-slate-200/50">
      {/* Segmented Control Wrapper - Soft background, no heavy inner shadow */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl w-full max-w-[320px] sm:w-auto transition-colors">
        {["Explore", "Following"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 sm:flex-none sm:w-32 px-6 py-2 text-sm rounded-lg transition-all duration-200 ${
              viewMode === mode
                ? "bg-white text-indigo-600 font-semibold shadow-sm"
                : "text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-200/30"
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
