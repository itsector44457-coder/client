import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, Trash2, Trophy, Eye, Users } from "lucide-react";

const AdminUsers = () => {
  const { adminId } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `https://backend-6hhv.onrender.com/api/admin/users`,
        {
          headers: { adminid: adminId },
        },
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminId]);

  const handleBanUser = async (targetId, name) => {
    if (
      window.confirm(
        `Are you sure you want to permanently ban ${name} from the platform?`,
      )
    ) {
      try {
        await axios.delete(
          `https://backend-6hhv.onrender.com/api/admin/users/${targetId}`,
          {
            headers: { adminid: adminId },
          },
        );
        setUsers(users.filter((u) => u._id !== targetId));
      } catch (err) {
        alert("Failed to ban user.");
      }
    }
  };

  const handleViewAnalytics = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center mt-32 font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-sm font-medium text-slate-500">
          Loading user matrix...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12 font-sans">
      {/* 🟢 HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Users size={24} />
          </div>
          User Management
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-2">
          Monitor user rankings, domains, and manage account access.
        </p>
      </div>

      {/* 🟢 DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Rank
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Commander Info
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Domain
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  XP (Battle Points)
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length > 0 ? (
                users.map((u, index) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {index === 0 ? (
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg w-max border border-amber-100">
                          <Trophy size={16} /> #1
                        </div>
                      ) : index === 1 ? (
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg w-max border border-slate-200">
                          <Trophy size={16} /> #2
                        </div>
                      ) : index === 2 ? (
                        <div className="flex items-center gap-1.5 text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-lg w-max border border-orange-100">
                          <Trophy size={16} /> #3
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-500 ml-2">
                          #{index + 1}
                        </span>
                      )}
                    </td>

                    {/* Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 capitalize text-sm">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {u.email}
                      </p>
                    </td>

                    {/* Domain */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {u.field || "Unassigned"}
                      </span>
                    </td>

                    {/* XP */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-600 text-sm">
                        {u.battlePoints || 0}{" "}
                        <span className="text-xs text-emerald-500/70 ml-0.5">
                          XP
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewAnalytics(u._id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="View Analytics"
                        >
                          <Eye size={18} />
                        </button>

                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleBanUser(u._id, u.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Ban User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                  >
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
