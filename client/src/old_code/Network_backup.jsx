import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  UserCheck,
  Loader2,
  Search,
  Users,
  Swords,
  Filter,
} from "lucide-react";
import NetworkProfile from "../components/Dashboard/NetworkProfile"; // Ensure ye file exist karti ho

const Network = ({
  onChallengeUser,
  challengeLoadingIds = {},
  activeBattle = null,
}) => {
  // 1. STATES
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null); // Profile View Toggle

  // 2. IDENTITY LOGIC
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.id || currentUser?._id;
  const currentField = String(
    currentUser?.field || localStorage.getItem("userField") || "",
  )
    .trim()
    .toLowerCase();

  // 3. FETCH USERS ENGINE
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get("import.meta.env.VITE_API_URL/api/users");

        // Filter out current user
        const otherUsers = res.data.filter(
          (u) => String(u._id || u.id) !== String(currentUserId),
        );

        // Sort: Same field users first
        const sortedUsers = [...otherUsers].sort((a, b) => {
          const aField = String(a.field || "").toLowerCase();
          const bField = String(b.field || "").toLowerCase();
          if (aField === currentField && bField !== currentField) return -1;
          if (aField !== currentField && bField === currentField) return 1;
          return 0;
        });

        setUsers(sortedUsers);
      } catch (err) {
        console.error("Network sync failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId, currentField]);

  // 4. SOCIAL HANDLERS
  const handleFollow = async (e, targetId) => {
    e.stopPropagation(); // Card click event ko rokne ke liye
    try {
      const res = await axios.put(
        `import.meta.env.VITE_API_URL/api/users/${targetId}/follow`,
        { currentUserId },
      );

      // Update LocalStorage
      const freshUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (res.data.isFollowing) {
        freshUser.following = [...(freshUser.following || []), targetId];
      } else {
        freshUser.following = (freshUser.following || []).filter(
          (id) => String(id) !== String(targetId),
        );
      }
      localStorage.setItem("user", JSON.stringify(freshUser));

      // Force UI re-render
      setUsers([...users]);
    } catch (err) {
      console.error("Social link failed:", err);
    }
  };

  const isFollowing = (userId) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (user.following || []).some((id) => String(id) === String(userId));
  };

  // 5. FILTERING LOGIC
  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.field || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Battle status check
  const activeBattleOpponentId =
    activeBattle?.status === "active"
      ? String(
          activeBattle?.challengerId?._id || activeBattle?.challengerId,
        ) === String(currentUserId)
        ? String(activeBattle?.opponentId?._id || activeBattle?.opponentId)
        : String(activeBattle?.challengerId?._id || activeBattle?.challengerId)
      : "";

  // 6. CONDITIONAL RENDER: Profile View
  if (selectedUserId) {
    return (
      <NetworkProfile
        userId={selectedUserId}
        currentUserId={currentUserId}
        onBack={() => setSelectedUserId(null)}
        onChallengeUser={onChallengeUser}
      />
    );
  }

  // 7. MAIN LIST RENDER
  return (
    <div className="h-full w-full bg-[#f8fafc] flex flex-col animate-in fade-in duration-500">
      {/* Header & Search Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
              Universe Network
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Syncing with {currentField || "All Sectors"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-2">
              <Users size={16} />
              <span className="text-[10px] font-black uppercase">
                {filteredUsers.length} Online
              </span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, field, or expertise..."
            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Scanning Sectors...
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                <p className="text-slate-400 italic text-sm">
                  No other commanders found in this sector.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const uid = String(user._id || user.id);
                const challengeBusy = Boolean(challengeLoadingIds[uid]);
                const inActiveBattle = activeBattleOpponentId === uid;

                return (
                  <div
                    key={uid}
                    onClick={() => setSelectedUserId(uid)}
                    className="group relative bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Background Glow */}
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                        {(user.name || "C")[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none">
                          {user.name || "Commander"}
                        </h4>
                        <span className="inline-flex mt-2 text-[8px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-slate-100">
                          {user.field || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 relative z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChallengeUser?.(user);
                        }}
                        disabled={challengeBusy || inActiveBattle}
                        className="flex-1 bg-rose-500 text-white py-3 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Swords size={14} />
                          {inActiveBattle
                            ? "Duel On"
                            : challengeBusy
                              ? "Calling..."
                              : "Challenge"}
                        </span>
                      </button>

                      <button
                        onClick={(e) => handleFollow(e, uid)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all border ${
                          isFollowing(uid)
                            ? "bg-white text-slate-400 border-slate-100 hover:text-rose-500 hover:border-rose-100"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isFollowing(uid) ? (
                            <>
                              <UserCheck size={14} /> Linked
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} /> Link
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
