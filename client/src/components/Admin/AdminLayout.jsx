import React from "react";
import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  LogOut,
  Zap,
  LayoutGrid,
  FileText,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🛡️ SECURITY CHECK: Sirf Admin allowed hai!
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#0f1221] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* 🟢 ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <ShieldAlert size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest italic leading-none">
              God Mode
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink
            to="/admin"
            end // 'end' ensures exact match for dashboard
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={16} /> Overview
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Users size={16} /> Commanders (Users)
          </NavLink>

          <NavLink
            to="/admin/fields"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <LayoutGrid size={16} /> Domain Architect
          </NavLink>

          <NavLink
            to="/admin/exams/build"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <FileText size={16} /> Exam Architect
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all"
          >
            <LogOut size={14} /> System Exit
          </button>
        </div>
      </aside>

      {/* 🟢 MAIN CONTENT AREA (Alag alag pages yahan render honge) */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Outlet is where React Router injects the child pages */}
          <Outlet context={{ adminId: user.id || user._id }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
