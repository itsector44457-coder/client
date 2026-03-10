import React, { useState } from "react";
import { Sparkles, ChevronRight, Play } from "lucide-react";

const CategorySelection = ({ categories, loadingCats, onRegister }) => {
  const [selectedParent, setSelectedParent] = useState(null);

  if (loadingCats)
    return (
      <div className="flex flex-col items-center py-20 bg-[#080b14] h-screen justify-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
          Initializing Universe...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Blur Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-indigo-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl py-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] sm:text-xs text-indigo-300 font-medium tracking-wider uppercase italic">
              Universe Hub
            </span>
          </div>
          <h1 className="display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3 italic uppercase leading-tight">
            {selectedParent ? "Select Your" : "Choose Your"}
            <br />
            <span className="text-indigo-400">
              {selectedParent ? "Specialization" : "Domain"}
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {!selectedParent ? (
            categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedParent(cat)}
                className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 text-left hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all group active:scale-[0.98]"
              >
                <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">
                  {cat.emoji || "📁"}
                </span>
                <p className="font-bold text-white text-lg sm:text-xl uppercase italic">
                  {cat.name}
                </p>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-1 sm:mt-2 line-clamp-2">
                  {cat.description}
                </p>
              </button>
            ))
          ) : (
            <div className="col-span-full animate-in slide-in-from-right duration-300">
              <button
                onClick={() => setSelectedParent(null)}
                className="mb-4 sm:mb-6 text-indigo-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1 hover:text-indigo-300 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>

              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {selectedParent.subFields.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => onRegister(selectedParent.name, sub.name)}
                    className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left flex items-center justify-between group hover:bg-indigo-500/10 transition-all active:scale-[0.98]"
                  >
                    <div>
                      <p className="text-white font-bold text-base sm:text-lg italic uppercase">
                        {sub.name}
                      </p>
                      <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                        {sub.description || "Start your journey"}
                      </p>
                    </div>
                    {/* 🔥 THE FIX: Mobile pe always visible, Desktop pe hover par visible */}
                    <Play
                      size={16}
                      className="text-indigo-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0 ml-4"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
