import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MoonStar,
  LogOut,
  CheckCircle,
  BookOpen,
  Users,
  UserPlus,
  Waypoints,
  Swords,
  AlertTriangle,
  History,
  Sparkles,
} from "lucide-react";
import LogoImg from "../../assets/skill-vault-logo.png"; // 🔥 Apna logo yahan import karo

// 🔥 Import your logo image here (assuming it's in your assets folder)
// import LogoImg from "../assets/skill-vault-logo.png";

const Sidebar = ({ setZenMode, onLogout }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name ? user.name[0].toUpperCase() : "U";

  const navItems = [
    { path: "/dashboard", icon: CheckCircle, label: "Tasks" },
    { path: "/dashboard/syllabus", icon: BookOpen, label: "Syllabus" },
    { path: "/dashboard/battle-arena", icon: Swords, label: "Battle Arena" },
    { path: "/dashboard/battles", icon: History, label: "Combat Records" },
    { path: "/dashboard/community", icon: Users, label: "Community" },
    { path: "/dashboard/network", icon: UserPlus, label: "Network" },
    { path: "/dashboard/universe", icon: Sparkles, label: "Universe" },
    { path: "/roadmap", icon: Waypoints, label: "Roadmap" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:relative md:w-64 md:h-screen md:flex md:flex-col md:border-t-0 md:border-r md:shadow-sm transition-all duration-300">
      {/* 🟢 TOP LOGO SECTION (Skill Vault Branded) */}
      <div className="hidden md:flex px-6 py-8 shrink-0 items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-md border border-slate-100">
          {/* 🔥 Logo Image yahan set kiya hai */}
          <img
            src={LogoImg} // Yahan apne imported logo ka variable name use karo
            alt="Skill Vault Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="font-black text-slate-900 text-xl italic tracking-tighter uppercase leading-none block">
            Skill
          </span>
          <span className="font-black text-indigo-600 text-xl italic tracking-tighter uppercase leading-none block">
            Vault
          </span>
        </div>
      </div>

      {/* SCROLLABLE NAV (Horizontal on Mobile, Vertical on Desktop) */}
      <div className="flex flex-row md:flex-col flex-1 overflow-x-auto md:overflow-y-auto px-2 py-2 md:px-4 md:py-0 space-x-1 md:space-x-0 md:space-y-1 no-scrollbar items-center md:items-stretch">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:p-3.5 rounded-xl transition-all flex-shrink-0 min-w-[72px] md:min-w-0 ${
                isActive
                  ? "text-indigo-600 bg-indigo-50 md:bg-indigo-600 md:text-white md:shadow-md md:shadow-indigo-600/10"
                  : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600 md:text-slate-500 md:hover:bg-slate-100"
              }`
            }
          >
            <Icon className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            <span className="text-[9px] md:text-sm font-black md:font-bold text-center md:text-left uppercase md:capitalize tracking-wider md:tracking-normal leading-none mt-1 md:mt-0">
              {label}
            </span>
          </NavLink>
        ))}

        {/* Zen Mode Button */}
        <button
          onClick={() => setZenMode(true)}
          className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:p-3.5 rounded-xl transition-all flex-shrink-0 min-w-[72px] md:min-w-0 md:w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 md:mt-4 group"
        >
          <MoonStar className="w-5 h-5 md:w-[22px] md:h-[22px] group-hover:rotate-12 transition-transform" />
          <span className="text-[9px] md:text-sm font-black md:font-bold text-center md:text-left uppercase md:capitalize tracking-wider md:tracking-normal leading-none mt-1 md:mt-0">
            Zen Mode
          </span>
        </button>
      </div>

      {/* BOTTOM PROFILE & LOGOUT (Hidden on Mobile) */}
      <div className="hidden md:block p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-slate-200"
        >
          <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-inner">
            {initials}

            {user.cheaterTag && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <AlertTriangle size={8} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 truncate uppercase italic">
              {user.name || "Commander"}
            </p>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">
              View Profile
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 p-3 w-full text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl mt-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-100 hover:border-transparent"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
