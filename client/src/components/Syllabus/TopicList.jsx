import React from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
  BarChart3,
  Swords,
  Zap,
  Eye, // 🔥 FIX: Aankh wala icon import kiya
} from "lucide-react";

const TopicList = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  onToggle,
  onQuizSubmit,
  onStartTest,
  onViewHistory, // 🔥 FIX: Naya prop add kiya history modal kholne ke liye
  quizInputs,
  setQuizInputs,
  savingTopicId,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 h-full max-h-full flex flex-col shadow-sm overflow-hidden">
      {/* 🟢 MATRIX HEADER (Fixed) */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <BarChart3 size={16} className="text-indigo-600" />
          </div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
            Knowledge Matrix
          </p>
        </div>
        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg shadow-indigo-100">
          {topics.length} Nodes
        </span>
      </div>

      {/* 📜 SCROLLABLE AREA (Strict internal scroll) */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 scroll-smooth">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Zap size={40} className="text-slate-300 mb-2" />
            <p className="text-slate-500 font-black italic uppercase text-[10px] tracking-widest">
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
                className={`group rounded-[2rem] border-2 p-5 transition-all duration-300 relative overflow-hidden shrink-0 ${
                  isWeak
                    ? "border-rose-200 bg-rose-50/20 shadow-lg shadow-rose-100/50 animate-pulse"
                    : isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/30"
                      : "border-slate-50 bg-white hover:border-indigo-100 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => onToggle(topic)}
                    className="pt-1 transition-transform active:scale-90 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {topic.isCompleted ? (
                      <CheckCircle2
                        size={22}
                        className="text-emerald-500 fill-emerald-50"
                      />
                    ) : (
                      <Circle
                        size={22}
                        className="text-slate-200 group-hover:text-indigo-200"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => onTopicSelect(topic)}
                    className="flex-1 text-left"
                  >
                    <p
                      className={`font-black text-sm uppercase italic tracking-tight leading-none ${
                        isSelected ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {topic.title}
                    </p>
                    {isWeak && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <AlertTriangle size={10} className="text-rose-500" />
                        <span className="text-[9px] text-rose-600 font-black uppercase tracking-widest">
                          Critical Revision Node
                        </span>
                      </div>
                    )}
                  </button>

                  {/* 🔥 FIX: Yahan humne Aankh aur Talwaar dono buttons ko ek sath laga diya hai */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewHistory) onViewHistory(topic);
                      }}
                      title="View Combat History"
                      className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-90 shadow-sm border border-slate-200"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartTest(topic);
                      }}
                      title="Start Combat"
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-90 shadow-md"
                    >
                      <Swords size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
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
                        className="w-16 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300">
                        %
                      </span>
                    </div>
                    <button
                      onClick={() => onQuizSubmit(topic._id)}
                      disabled={isSaving}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Sync Node"
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                      Avg Accuracy
                    </p>
                    <p
                      className={`text-sm font-black italic ${
                        topic.averageQuizScore < 40
                          ? "text-rose-500"
                          : "text-indigo-600"
                      }`}
                    >
                      {topic.averageQuizScore ?? "--"}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div className="py-4 opacity-0">Spacer</div>
      </div>
    </div>
  );
};

export default TopicList;
