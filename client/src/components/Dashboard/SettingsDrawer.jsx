import React from "react";
import {
  X,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Settings2,
  UserCircle,
  Clock,
  Swords,
  BrainCircuit,
} from "lucide-react";

const SettingsDrawer = ({
  isOpen,
  onClose,
  theme,
  onSetTheme,
  themeOptions,
  onLogout,
  onViewHistory,
  onViewBattles,
  onViewWeakness,
}) => {
  if (!isOpen) return null;

  const syncItems = [
    { label: "Session History", icon: Clock, action: onViewHistory },
    { label: "Battle Logs", icon: Swords, action: onViewBattles },
    { label: "Neural Weaknesses", icon: BrainCircuit, action: onViewWeakness },
  ];

  return (
    // z-index bohot high rakha hai taaki modal hamesha top par rahe
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container - Use h-[100dvh] for mobile browser compatibility */}
      <div className="relative h-[100dvh] w-full max-w-[85vw] sm:max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* 1. Header */}
        <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-50 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings2 className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="display font-black text-lg sm:text-xl text-slate-900 uppercase italic">
              Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* 2. Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 no-scrollbar pb-10">
          {/* Theme Section */}
          <section>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 italic">
              Visual Interface
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSetTheme(opt.id)}
                  className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${
                    theme === opt.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-500/10"
                      : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  {opt.id === "dark" ? (
                    <Moon size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <Sun size={18} className="sm:w-5 sm:h-5" />
                  )}
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* User Profile */}
          <section className="p-5 sm:p-6 bg-indigo-600 rounded-[1.5rem] sm:rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <UserCircle size={80} className="sm:w-[100px] sm:h-[100px]" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 relative z-10">
              User Domain
            </p>
            <h4 className="font-bold text-base sm:text-lg mb-4 italic uppercase relative z-10 line-clamp-1">
              Vijay Singh Sengar
            </h4>
            <button className="relative z-10 w-full py-2.5 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98]">
              Update Profile
            </button>
          </section>

          {/* Sync Data Section */}
          <section>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              Sync Data
            </p>
            <div className="space-y-2.5 sm:space-y-3">
              {syncItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full p-3.5 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={16}
                      className="text-slate-400 group-hover:text-indigo-600 sm:w-[18px] sm:h-[18px] transition-colors"
                    />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1"
                  />
                </button>
              ))}
            </div>
          </section>

          <div className="pt-6 sm:pt-10 text-center">
            <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Universe Hub v2.0.26
            </p>
            <p className="text-[7px] sm:text-[8px] text-slate-300 mt-1">
              Refined for Aarambh Institute
            </p>
          </div>
        </div>

        {/* 3. Logout Footer */}
        <div className="p-5 sm:p-8 border-t border-slate-50 bg-white z-10">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 w-full bg-rose-50 text-rose-500 rounded-2xl sm:rounded-[2rem] font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 active:scale-[0.98]"
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="line-clamp-1">Terminate Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;
