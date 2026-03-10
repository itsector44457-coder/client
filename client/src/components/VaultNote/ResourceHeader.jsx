import React from "react";
import { Plus, Zap, ShieldCheck, Search } from "lucide-react";

const ResourceHeader = ({ onAddClick, resourceCount, notice }) => (
  <header className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between shrink-0 shadow-sm relative z-20">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-100">
        <Zap size={28} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
          Universal <span className="text-indigo-600">Vault</span>
        </h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
          <ShieldCheck size={12} className="text-indigo-500" /> Authorized Data:{" "}
          {resourceCount} Nodes Locked
        </p>
      </div>
    </div>

    {/* Center Notice */}
    {notice && (
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase animate-bounce">
        {notice}
      </div>
    )}

    <div className="flex items-center gap-4">
      {/* 🔍 Add Button is here */}
      <button
        onClick={() => onAddClick()} // Isse modal khulega jo ResourceVault manage karta hai
        className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={18} strokeWidth={3} />
        Inject New Resource
      </button>
    </div>
  </header>
);

export default ResourceHeader;
