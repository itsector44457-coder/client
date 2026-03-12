import React from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
  BarChart3,
  Swords,
  Zap,
  Eye,
} from "lucide-react";

const TopicList = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  onToggle,
  onQuizSubmit,
  onStartTest,
  onViewHistory,
  quizInputs,
  setQuizInputs,
  savingTopicId,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-4 sm:p-6 h-full max-h-full flex flex-col shadow-sm overflow-hidden">
      {/* 🟢 MATRIX HEADER */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <BarChart3 size={18} className="text-indigo-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic">
            Knowledge Matrix
          </p>
        </div>
        <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg shadow-indigo-100">
          {topics.length} Nodes
        </span>
      </div>

      {/* 📜 SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 pb-10 scroll-smooth">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Zap size={48} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-black italic uppercase text-xs tracking-widest">
              No Nodes Synced
            </p>
          </div>
        ) : (
          topics.map((topic) => {
            const isSelected = topic._id === selectedTopicId;
            const isWeak = topic.isWeak;
            const isSaving = savingTopicId === topic._id;

            return (
              <div
                key={topic._id}
                className={`group rounded-[1.5rem] border-2 p-4 sm:p-5 transition-all duration-300 relative shrink-0 ${
                  isWeak
                    ? "border-rose-200 bg-rose-50/30 shadow-lg shadow-rose-100/40"
                    : isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/30"
                      : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* TOP SECTION: Topic Name & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(topic);
                      }}
                      className="pt-0.5 transition-transform active:scale-90 disabled:opacity-50 shrink-0"
                      disabled={isSaving}
                    >
                      {topic.isCompleted ? (
                        <CheckCircle2
                          size={24}
                          className="text-emerald-500 fill-emerald-50"
                        />
                      ) : (
                        <Circle
                          size={24}
                          className="text-slate-200 group-hover:text-indigo-300"
                        />
                      )}
                    </button>

                    <button
                      onClick={() => onTopicSelect(topic)}
                      className="flex-1 text-left min-w-0"
                    >
                      <h3
                        className={`font-black text-sm sm:text-base uppercase italic tracking-tight leading-snug break-words ${
                          isSelected ? "text-indigo-900" : "text-slate-700"
                        }`}
                      >
                        {topic.title}
                      </h3>
                      {isWeak && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <AlertTriangle size={12} className="text-rose-500" />
                          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                            Critical Revision
                          </span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Right: Action Buttons (Eye & Sword) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewHistory) onViewHistory(topic);
                      }}
                      title="View Combat History"
                      className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-95 shadow-sm border border-slate-200"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartTest(topic);
                      }}
                      title="Start Combat"
                      className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 shadow-md flex items-center justify-center"
                    >
                      <Swords size={18} />
                    </button>
                  </div>
                </div>

                {/* BOTTOM SECTION: Score Input & Average */}
                <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
                  {/* Left: Input & Sync Button */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={quizInputs[topic._id] || ""}
                        onChange={(e) =>
                          setQuizInputs((prev) => ({
                            ...prev,
                            [topic._id]: e.target.value,
                          }))
                        }
                        className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20 text-center"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                        %
                      </span>
                    </div>
                    <button
                      onClick={() => onQuizSubmit(topic._id)}
                      disabled={isSaving}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 active:scale-95"
                    >
                      {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Sync"
                      )}
                    </button>
                  </div>

                  {/* Right: Average Score */}
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Avg Accuracy
                    </p>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-black italic border ${
                        topic.averageQuizScore < 40
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                      }`}
                    >
                      {topic.averageQuizScore ?? "--"}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopicList;
