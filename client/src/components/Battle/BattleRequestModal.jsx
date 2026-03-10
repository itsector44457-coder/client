import React from "react";
import { Swords, X, Check, Zap } from "lucide-react";

const BattleRequestModal = ({ request, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-indigo-600 p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Background Zap Icon scaled for mobile */}
          <Zap className="absolute -right-4 -top-4 text-white/10 w-24 h-24 sm:w-32 sm:h-32" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-3 sm:mb-4 rotate-3">
            <Swords className="text-indigo-600 w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-white font-black uppercase italic tracking-tighter text-lg sm:text-xl">
            Battle Incoming!
          </h3>
        </div>

        <div className="p-6 sm:p-8 text-center">
          <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">
            Challenger Detected
          </p>
          {/* line-clamp-1 add kiya hai taaki lamba naam phone par line na tode */}
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic mb-5 sm:mb-6 line-clamp-1 px-2">
            {request.senderName}
          </h4>

          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 flex justify-between items-center border border-slate-100">
            <div className="text-left">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">
                Battle Type
              </p>
              <p className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase">
                {request.battleType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">
                Stake
              </p>
              <p className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase">
                {request.xpStake} XP
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-3 sm:py-4 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="flex-[2] py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Accept Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleRequestModal;
