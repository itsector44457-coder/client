import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; // 🔥 Socket client
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Loader2,
  Swords,
  TrendingUp,
  TrendingDown,
  Zap,
  History,
  Grid,
  BarChart2,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Timer,
  Clock,
} from "lucide-react";

// 🔥 Socket connection (Server URL se match karein)
const socket = io("import.meta.env.VITE_API_URL");

const NetworkProfile = ({ userId, onBack, currentUserId }) => {
  // --- 1. STATES ---
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        // User Info, Posts, aur Study Sessions fetch ho rahe hain
        const [userRes, postsRes, sessionsRes] = await Promise.all([
          axios.get(`import.meta.env.VITE_API_URL/api/users/${userId}`),
          axios.get(`import.meta.env.VITE_API_URL/api/posts/user/${userId}`),
          axios.get(`import.meta.env.VITE_API_URL/api/sessions/${userId}`),
        ]);

        setUser(userRes.data);
        setPosts(postsRes.data || []);
        setSessions(sessionsRes.data || {});

        // Follow status check logic
        const followers = userRes.data.followers || [];
        setIsFollowing(
          followers.some((id) => String(id) === String(currentUserId)),
        );
      } catch (err) {
        console.error("Neural Link Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId, currentUserId]);

  // --- 3. 🔥 REAL-TIME BATTLE CHALLENGE TRIGGER ---
  const handleChallengeHit = () => {
    const me = JSON.parse(localStorage.getItem("user") || "{}");
    const myField = me.field || "General";
    if (!user || !me) {
      alert("❌ System Error: User data missing!");
      return;
    }

    console.log(`⚔️ Emitting challenge to: ${userId}`);

    // 🔥 Seedha Socket Event bhej rahe hain (Server.js ke listener se match karta hai)
    socket.emit("send_battle_challenge", {
      fromUser: {
        name: me.name,
        id: currentUserId,
      },
      toUserId: userId, // Target User ID
      battleType: `${myField} Challenge`,
      xpStake: 50,
    });

    alert(`⚔️ Challenge signal broadcasted to ${user.name}! Intezaar karo...`);
  };

  // --- 4. INTERACTION LOGIC ---
  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `import.meta.env.VITE_API_URL/api/posts/like/${postId}`,
        { userId: currentUserId },
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p,
        ),
      );
    } catch (err) {
      console.error("Reaction failed");
    }
  };

  const handleComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    try {
      const me = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await axios.post(
        `import.meta.env.VITE_API_URL/api/posts/${postId}/comment`,
        {
          userId: currentUserId,
          userName: me.name || "Commander",
          text,
        },
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p)),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment failed");
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await axios.post(
        `import.meta.env.VITE_API_URL/api/users/save-post`,
        { userId: currentUserId, postId },
      );
      const freshUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (res.data.isSaved) {
        freshUser.savedPosts = [...(freshUser.savedPosts || []), postId];
      } else {
        freshUser.savedPosts = (freshUser.savedPosts || []).filter(
          (id) => String(id) !== String(postId),
        );
      }
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser({ ...user }); // Re-render logic
    } catch (err) {
      console.error("Archive failed");
    }
  };

  // --- 5. HELPERS ---
  const isSaved = (postId) => {
    const me = JSON.parse(localStorage.getItem("user") || "{}");
    return (me.savedPosts || []).some((id) => String(id) === String(postId));
  };

  const isLiked = (post) =>
    (post.likes || []).some((id) => String(id) === String(currentUserId));

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const stats = (() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const tSecs = sessions[today]?.reduce((acc, s) => acc + s.duration, 0) || 0;
    const ySecs =
      sessions[yesterday]?.reduce((acc, s) => acc + s.duration, 0) || 0;
    return { tSecs, ySecs, diff: tSecs - ySecs, isUp: tSecs - ySecs >= 0 };
  })();

  if (loading)
    return (
      <div className="flex justify-center py-40 h-full">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="bg-white h-full overflow-y-auto no-scrollbar rounded-[2.5rem] shadow-2xl border border-slate-100">
      {/* 🚀 STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-full transition-all"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-none">
              {user?.name}
            </h3>
            <p className="text-[9px] font-black text-indigo-500 uppercase mt-1 tracking-widest">
              {user?.field || "General"}
            </p>
          </div>
        </div>

        {/* 🔥 CHALLENGE BUTTON: Swords Icon */}
        <button
          onClick={handleChallengeHit}
          className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 active:scale-95 transition-all shadow-sm group"
          title="Battle Challenge"
        >
          <Swords
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
        </button>
      </div>

      {/* 📸 HERO SECTION */}
      <div className="relative">
        <div className="h-44 bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900" />
        <div className="px-6 flex justify-between items-end -mt-14">
          <div className="w-32 h-32 rounded-[2.8rem] bg-white p-1 shadow-2xl relative">
            <div className="w-full h-full rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-5xl font-black text-indigo-600 italic uppercase border-4 border-white">
              {user?.name?.[0] || "?"}
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
          </div>
          <div className="pb-4 flex gap-2">
            <button
              className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all shadow-lg ${isFollowing ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white shadow-indigo-200"}`}
            >
              {isFollowing ? "Linked" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 STATS ROW */}
      <div className="px-8 mt-6">
        <div className="flex gap-10 py-6 border-y border-slate-50">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 leading-none">
              {posts.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">
              Broadcasts
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 leading-none">
              {user?.followers?.length || 0}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">
              Followers
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 leading-none">
              {user?.battlePoints || 0}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">
              Total XP
            </span>
          </div>
        </div>
      </div>

      {/* 📑 TAB NAVIGATION */}
      <div className="flex mt-2 border-b border-slate-50 px-8">
        {[
          { id: "posts", icon: <Grid size={18} />, label: "Feed" },
          { id: "stats", icon: <BarChart2 size={18} />, label: "Analysis" },
          { id: "history", icon: <History size={18} />, label: "Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-5 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-300"}`}
          >
            {tab.icon}{" "}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* 🧩 CONTENT AREA */}
      <div className="p-8">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 italic border shadow-inner">
                        {post.author[0]}
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase italic leading-none">
                        {post.author}
                      </span>
                    </div>
                    <MoreHorizontal size={20} className="text-slate-200" />
                  </div>
                  <p className="text-[14px] text-slate-600 font-medium italic mb-5 leading-relaxed">
                    "{post.content}"
                  </p>
                  {post.imageUrl && (
                    <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-md">
                      <img
                        src={post.imageUrl}
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                        alt="Post"
                      />
                    </div>
                  )}
                </div>

                {/* Interaction Bar */}
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 group transition-all ${isLiked(post) ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}
                    >
                      <Heart
                        size={22}
                        fill={isLiked(post) ? "currentColor" : "none"}
                        className="group-active:scale-150 transition-transform"
                      />
                      <span className="text-[11px] font-black">
                        {post.likes?.length || 0}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setShowComments((prev) => ({
                          ...prev,
                          [post._id]: !prev[post._id],
                        }))
                      }
                      className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <MessageCircle size={22} />
                      <span className="text-[11px] font-black">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(post._id)}
                    className="transition-all"
                  >
                    <Bookmark
                      size={22}
                      className={
                        isSaved(post._id)
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-200"
                      }
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Analysis Tab --- */}
        {activeTab === "stats" && (
          <div className="p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 relative overflow-hidden group">
            <Zap
              className="absolute right-[-30px] top-[-30px] text-indigo-100 opacity-50"
              size={180}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <ShieldCheck size={14} /> Verified Data
              </p>
              <h4 className="text-5xl font-black text-indigo-600 italic mb-4">
                {formatDuration(stats.tSecs)}
              </h4>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase italic ${stats.isUp ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
              >
                {stats.isUp ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {formatDuration(Math.abs(stats.diff))}{" "}
                {stats.isUp ? "Surge" : "Drop"}
              </div>
            </div>
          </div>
        )}

        {/* --- History Tab --- */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {Object.entries(sessions)
              .slice(0, 10)
              .map(([date, dayLogs]) => (
                <div
                  key={date}
                  className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-indigo-600 transition-all">
                      <Timer size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">
                        {new Date(date).toDateString()}
                      </p>
                      <p className="text-sm font-black text-slate-800 italic uppercase">
                        {formatDuration(
                          dayLogs.reduce((a, b) => a + b.duration, 0),
                        )}{" "}
                        Focused
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkProfile;
