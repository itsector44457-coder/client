import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Users } from "lucide-react";
import NetworkHeader from "./NetworkHeader";
import UserCard from "./UserCard";
import NetworkProfile from "../Network/NetworkProfile/NetworkProfile";

const Network = ({
  onChallengeUser,
  challengeLoadingIds = {},
  activeBattle = null,
}) => {
  // --- 1. CORE STATES ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Identity Logic
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser?.id || storedUser?._id;
  const myField = (storedUser?.field || "").toLowerCase();

  // Fresh following list from state/localstorage
  const followingList = storedUser.following || [];

  // --- 2. FETCH USERS ENGINE ---
  useEffect(() => {
    if (myId) fetchUsers();
  }, [myId, myField]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://backend-6hhv.onrender.com/api/users`,
      );

      const others = res.data.filter(
        (u) => String(u._id || u.id) !== String(myId),
      );

      const sorted = [...others].sort((a, b) => {
        const af = (a.field || "").toLowerCase();
        const bf = (b.field || "").toLowerCase();
        if (af === myField && bf !== myField) return -1;
        return 0;
      });
      setUsers(sorted);
    } catch (err) {
      console.error("Universe Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SOCIAL HANDLERS ---
  const handleFollow = async (targetId) => {
    try {
      const res = await axios.put(
        `https://backend-6hhv.onrender.com/api/users/${targetId}/follow`,
        { currentUserId: myId },
      );

      const freshUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (res.data.isFollowing) {
        freshUser.following = [...(freshUser.following || []), targetId];
      } else {
        freshUser.following = (freshUser.following || []).filter(
          (id) => String(id) !== String(targetId),
        );
      }
      localStorage.setItem("user", JSON.stringify(freshUser));

      // Fetch users again to update followers count on card
      // (Optimized: Better to just update local state instead of full refetch if backend allows, but keeping your logic for safety)
      setUsers([...users]);
    } catch (err) {
      console.error("Social Link Failed", err);
    }
  };

  // --- search & battle logic ---
  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.field || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeBattleOpponentId =
    activeBattle?.status === "active"
      ? String(
          activeBattle?.challengerId?._id || activeBattle?.challengerId,
        ) === String(myId)
        ? String(activeBattle?.opponentId?._id || activeBattle?.opponentId)
        : String(activeBattle?.challengerId?._id || activeBattle?.challengerId)
      : "";

  // --- 4. PROFILE VIEW ---
  if (selectedUserId) {
    return (
      <NetworkProfile
        userId={selectedUserId}
        currentUserId={myId}
        onBack={() => setSelectedUserId(null)}
        onChallengeUser={onChallengeUser}
      />
    );
  }

  // --- 5. MAIN UI ---
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-sans">
      <NetworkHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userCount={filteredUsers.length}
        currentField={myField}
      />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader2 className="animate-spin text-indigo-500 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500 tracking-wide">
            Discovering network...
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar pb-24 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 max-w-[90rem] mx-auto">
            {filteredUsers.length === 0 ? (
              // Minimal Empty State
              <div className="col-span-full py-20 px-4 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
                <Users size={40} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  No users found matching your search.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const uid = String(user._id || user.id);
                return (
                  <UserCard
                    key={uid}
                    user={user}
                    onChallenge={onChallengeUser}
                    onFollow={handleFollow}
                    isFollowing={followingList.some((id) => String(id) === uid)}
                    challengeBusy={challengeLoadingIds[uid]}
                    inActiveBattle={activeBattleOpponentId === uid}
                    onClick={(id) => setSelectedUserId(id)}
                  />
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
