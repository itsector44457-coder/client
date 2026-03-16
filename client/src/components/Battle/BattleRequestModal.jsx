import React from "react";
import { Swords } from "lucide-react";

const BattleRequestModal = ({ request, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8 text-center">
          {/* 🟢 Clean Circular Icon Container */}
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-full mx-auto flex items-center justify-center mb-5 shadow-sm">
            <Swords className="text-indigo-600 w-7 h-7" strokeWidth={2} />
          </div>

          {/* 🟢 Title & Sender Info */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mb-1.5">
            Combat Challenge
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 px-2">
            <span className="font-semibold text-slate-800">
              {request.senderName}
            </span>{" "}
            has invited you to a battle!
          </p>

          {/* 🟢 Details Box - Soft & Minimal */}
          <div className="bg-slate-50 rounded-xl p-4 mb-8 flex justify-between items-center border border-slate-100">
            <div className="text-left flex-1 border-r border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Mode
              </p>
              <p className="text-sm font-bold text-slate-700 truncate pr-2">
                {request.battleType}
              </p>
            </div>
            <div className="text-right flex-1 pl-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Stake
              </p>
              <p className="text-sm font-bold text-indigo-600">
                {request.xpStake} XP
              </p>
            </div>
          </div>

          {/* 🟢 Action Buttons - Standard SaaS Sizing */}
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Accept Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleRequestModal;
