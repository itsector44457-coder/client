import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Grid, BarChart2, History, Loader2, FileQuestion } from "lucide-react";

import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import ProfileGrid from "./ProfileGrid";
import PostModal from "./PostModal";

const socket = io(`https://backend-6hhv.onrender.com`);

const NetworkProfile = ({ userId, onBack, currentUserId }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [uRes, pRes] = await Promise.all([
          axios.get(`https://backend-6hhv.onrender.com/api/users/${userId}`),
          axios.get(
            `https://backend-6hhv.onrender.com/api/posts/user/${userId}`,
          ),
        ]);
        setUser(uRes.data);
        setPosts(pRes.data || []);
        setIsFollowing(
          (uRes.data.followers || []).some(
            (id) => String(id) === String(currentUserId),
          ),
        );
      } catch (err) {
        console.error("Sync Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      const res = await axios.put(
        `https://backend-6hhv.onrender.com/api/users/${userId}/follow`,
        { currentUserId },
      );
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Follow Failed");
    }
  };

  const handleChallenge = () => {
    socket.emit("send_battle_challenge", {
      fromUser: { id: currentUserId },
      toUserId: userId,
      battleType: "General Duel",
      xpStake: 50,
    });
    alert("⚔️ Challenge Sent!");
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `https://backend-6hhv.onrender.com/api/posts/like/${postId}`,
        { userId: currentUserId },
      );
      const updated = posts.map((p) =>
        p._id === postId ? { ...p, likes: res.data.likes } : p,
      );
      setPosts(updated);
      if (selectedPost?._id === postId)
        setSelectedPost({ ...selectedPost, likes: res.data.likes });
    } catch (err) {
      console.error("Like Failed");
    }
  };

  /* ==================================
          UI RENDERING
  ================================== */
  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={32} />
        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-full w-full overflow-y-auto no-scrollbar sm:rounded-2xl flex flex-col relative border-x-0 sm:border border-slate-200 shadow-sm font-sans">
      <ProfileHeader name={user?.name} onBack={onBack} />

      <ProfileInfo
        user={user}
        postCount={posts.length}
        isFollowing={isFollowing}
        onFollow={handleFollowToggle}
        onChallenge={handleChallenge}
      />

      {/* 🟢 TABS - Minimal & Sticky */}
      <div className="flex border-b border-slate-100 sticky top-0 z-30 bg-white/90 backdrop-blur-md px-2 sm:px-4">
        {[
          { id: "grid", icon: <Grid size={20} /> },
          { id: "stats", icon: <BarChart2 size={20} /> },
          { id: "history", icon: <History size={20} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-3.5 flex justify-center items-center transition-all border-b-2 ${
              activeTab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* 🟢 TAB CONTENT */}
      <div className="flex-1 bg-slate-50/50 min-h-[50vh]">
        {activeTab === "grid" && (
          <ProfileGrid posts={posts} onPostClick={setSelectedPost} />
        )}

        {/* Empty states for other tabs */}
        {activeTab !== "grid" && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
            <FileQuestion size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm font-medium">
              Data not synced yet.
            </p>
          </div>
        )}
      </div>

      {/* 🟢 MODAL */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          myId={currentUserId}
          onLike={handleLike}
          showComments={showComments}
          onCommentToggle={(id) =>
            setShowComments((p) => ({ ...p, [id]: !p[id] }))
          }
          commentInput={commentInputs[selectedPost._id] || ""}
          setCommentInput={(id, val) =>
            setCommentInputs((p) => ({ ...p, [id]: val }))
          }
          onCommentSubmit={() => {}}
        />
      )}
    </div>
  );
};

export default NetworkProfile;
