import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Loader2, Users, Swords, Zap, Trophy, Target } from "lucide-react";

const AdminDashboard = () => {
  const { adminId } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTestsTaken: 0,
    totalXP: 0,
    domainStats: [],
    topUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `https://backend-6hhv.onrender.com/api/admin/stats`,
          {
            headers: { adminid: adminId },
          },
        );
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [adminId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center mt-32">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-sm font-medium text-slate-500">
          Loading command center...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
          Admin Overview
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Monitor network activity, domain distribution, and top performers.
        </p>
      </div>

      {/* 🟢 TOP 3 MAIN STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Stat Card 1 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-300 transition-all shadow-sm">
          <div className="absolute -right-4 -top-4 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-indigo-900">
            <Users size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" /> Total Users
            </p>
            <p className="text-4xl font-bold text-slate-800 tracking-tight">
              {stats.totalUsers}
            </p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-rose-300 transition-all shadow-sm">
          <div className="absolute -right-4 -top-4 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-rose-900">
            <Swords size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
              <Swords size={16} className="text-rose-500" /> Battles Fought
            </p>
            <p className="text-4xl font-bold text-slate-800 tracking-tight">
              {stats.totalTestsTaken}
            </p>
          </div>
        </div>

        {/* Stat Card 3 (Highlight) */}
        <div className="bg-indigo-600 border border-indigo-500 p-6 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute -right-4 -top-4 p-6 opacity-10 text-white">
            <Zap size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-indigo-100 mb-1 flex items-center gap-2">
              <Zap size={16} className="text-amber-300" /> Global XP Mined
            </p>
            <p className="text-4xl font-bold text-white tracking-tight">
              {stats.totalXP}
            </p>
          </div>
        </div>
      </div>

      {/* 🟢 ANALYTICS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📊 LEFT: Domain Distribution Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Target size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
              Domain Distribution
            </h3>
          </div>

          <div className="space-y-5 flex-1">
            {stats.domainStats.map((domain, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-700 font-semibold">
                    {domain.name}
                  </span>
                  <span className="text-slate-500">
                    {domain.count} Users{" "}
                    <span className="text-indigo-600 font-semibold ml-1">
                      ({domain.percentage}%)
                    </span>
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.domainStats.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-sm font-medium">
                  No domain data available yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 🏆 RIGHT: Elite Vanguard (Top Users) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Trophy size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
              Top Performers
            </h3>
          </div>

          <div className="space-y-3 flex-1">
            {stats.topUsers.length > 0 ? (
              stats.topUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badges */}
                    <div
                      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-amber-100 text-amber-700 border border-amber-200" // Gold
                          : index === 1
                            ? "bg-slate-200 text-slate-700 border border-slate-300" // Silver
                            : index === 2
                              ? "bg-orange-100 text-orange-700 border border-orange-200" // Bronze
                              : "bg-slate-100 text-slate-500 border border-slate-200" // Others
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {user.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                        {user.field || "General Domain"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <p className="text-base font-bold text-indigo-600 leading-none">
                      {user.battlePoints || 0}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                      XP
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-sm font-medium">
                  No performers recorded yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
