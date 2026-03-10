import React from "react";
import { Folder, ChevronRight, BookOpen } from "lucide-react";

const SubjectSidebar = ({ subjects, selectedSubjectId, onSelect }) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-5 h-full flex flex-col shadow-sm">
      {/* 🏷️ Header Section */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] inline-flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-500" /> Sector Folders
        </p>
        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg">
          {subjects.length} Units
        </span>
      </div>

      {/* 📜 Scrollable Container (No Scrollbar) */}
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
        {subjects.map((subject) => {
          const active = subject._id === selectedSubjectId;
          const progress = subject.progressPercent || 0;

          return (
            <button
              key={subject._id}
              onClick={() => onSelect(subject)}
              className={`group w-full text-left rounded-[1.5rem] border p-4 transition-all duration-300 relative overflow-hidden ${
                active
                  ? "border-indigo-200 bg-indigo-50/50 shadow-lg shadow-indigo-100/20 translate-x-1"
                  : "border-slate-50 bg-white hover:border-indigo-100 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* Background Glow for Active State */}
              {active && (
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl" />
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl transition-colors ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                    }`}
                  >
                    <Folder size={16} fill={active ? "white" : "none"} />
                  </div>
                  <div>
                    <p
                      className={`font-black text-[13px] uppercase tracking-tighter leading-none italic ${
                        active ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {subject.name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      {progress === 100
                        ? "Verified Mastery"
                        : "Ongoing Mission"}
                    </p>
                  </div>
                </div>
                {active ? (
                  <ChevronRight
                    size={16}
                    className="text-indigo-400 animate-pulse"
                  />
                ) : (
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400">
                    {progress}%
                  </span>
                )}
              </div>

              {/* 📊 Compact Progress Rail */}
              <div className="mt-4 relative">
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      progress === 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* Empty State Shadow taaki end feel ho */}
        <div className="py-4 opacity-0 pointer-events-none">End Buffer</div>
      </div>
    </div>
  );
};

export default SubjectSidebar;
