import React from "react";
import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  LogOut,
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
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* 🟢 ADMIN SIDEBAR - Clean White Background */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-sm">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 shrink-0">
            <ShieldAlert size={20} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-800 leading-none truncate">
              Universe Hub
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <LayoutDashboard size={18} /> Overview
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Users size={18} /> User Management
          </NavLink>

          <NavLink
            to="/admin/fields"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <LayoutGrid size={18} /> Domains
          </NavLink>

          <NavLink
            to="/admin/exams/build"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FileText size={18} /> Exam Builder
          </NavLink>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-500 font-semibold text-sm hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto h-full">
          {/* Outlet is where React Router injects the child pages */}
          <Outlet context={{ adminId: user.id || user._id }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
