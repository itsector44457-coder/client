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
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop - Thoda soft blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container - Width aur shadow ko optimize kiya */}
      <div className="relative h-[100dvh] w-full max-w-[80vw] sm:max-w-sm bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* 1. Header - Clean aur simple */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <Settings2 className="text-indigo-600 w-5 h-5" />
            <h3 className="font-semibold text-lg text-slate-800 tracking-tight">
              Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar pb-10">
          {/* Theme Section */}
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Appearance
            </p>
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSetTheme(opt.id)}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    theme === opt.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {opt.id === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* User Profile - Heavy solid color hata kar soft minimal card banaya */}
          <section className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCircle size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-800 truncate">
                Vijay Singh Sengar
              </h4>
              <p className="text-xs text-slate-500 truncate mb-2">
                User Domain
              </p>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Edit Profile &rarr;
              </button>
            </div>
          </section>

          {/* Sync Data Section - Clean list format */}
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Data & Sync
            </p>
            <div className="space-y-2">
              {syncItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between group hover:border-indigo-100 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <item.icon
                        size={16}
                        className="text-slate-500 group-hover:text-indigo-600 transition-colors"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Version Info */}
          <div className="pt-4 text-center">
            <p className="text-[10px] font-medium text-slate-400">
              Universe Hub v2.0.26
            </p>
          </div>
        </div>

        {/* 3. Logout Footer - Sleek danger button */}
        <div className="p-5 border-t border-slate-100 bg-white z-10">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-3 w-full bg-white border border-rose-200 text-rose-600 rounded-xl font-medium text-sm hover:bg-rose-50 hover:border-rose-300 transition-colors"
          >
            <LogOut size={16} />
            <span>Terminate Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;
