import React from "react";
import { Clock, ChevronLeft } from "lucide-react";
import StudyLog from "../../../pages/StudyLog";

const SessionHistory = ({ onBack }) => {
  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-sm h-full flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl sm:rounded-2xl text-emerald-600">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="display font-black text-lg sm:text-xl italic uppercase">
            Session History
          </h3>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          {/* Mobile par sirf 'Hub' dikhega, Laptop par 'Back to Hub' */}
          <span className="hidden sm:inline">Back to Hub</span>
          <span className="sm:hidden">Hub</span>
        </button>
      </div>

      {/* Main Content (List) */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <StudyLog fullPage={true} />
      </div>
    </div>
  );
};

export default SessionHistory;
