import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Send,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Maximize2,
  Loader2,
  ImagePlus,
  X,
  MoreHorizontal,
  Zap,
  Globe,
  Timer,
  TimerOff,
  ShieldCheck,
} from "lucide-react";

const Community = ({ myField }) => {
  // --- 1. CORE STATES ---
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [fullImg, setFullImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState("Explore");

  // 🔥 NEW: Neural Fade Toggle (Self-Destruct)
  const [isExpiring, setIsExpiring] = useState(false);

  // --- 2. IDENTITY LOGIC ---
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser?.id || storedUser?._id;
  const myName = storedUser?.name || "Commander";
  const currentSector =
    myField || localStorage.getItem("userField") || "General";

  // --- 3. FETCH BROADCASTS ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("import.meta.env.VITE_API_URL/api/posts");
        // Filter: Sirf apne sector (BCA/Maths/Data Science) ke posts
        const filtered = res.data.filter((p) => p.field === currentSector);
        setPosts(filtered);
      } catch (err) {
        console.error("Link Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentSector, myId]);

  // --- 4. BROADCAST SUBMISSION (Fixed 400 Error) ---
  const handlePostSubmit = async () => {
    if (!newPost.trim() && !image) return;
    if (!myId) return alert("Neural Link Error: Please log in again.");

    setUploading(true);
    let uploadedImageUrl = "";

    try {
      // Step A: Image Handling (Cloudinary)
      if (image) {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "TODO123");
        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dsitca1zl/image/upload",
          data,
        );
        uploadedImageUrl = cloudRes.data.secure_url;
      }

      // Step B: Expiry Calculation
      const expiryDate = isExpiring
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : null;

      // Step C: Payload Construction (Alignment with Backend)
      const postPayload = {
        author: myName,
        authorId: myId,
        content: newPost.trim() || "Broadcast Signal Initialized",
        field: currentSector,
        imageUrl: uploadedImageUrl,
        expiresAt: expiryDate, // Optional field for self-destruction
      };

      const res = await axios.post(
        "import.meta.env.VITE_API_URL/api/posts/add",
        postPayload,
      );

      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setImage(null);
      setImagePreview(null);
      setIsExpiring(false); // Toggle reset
      alert(
        isExpiring ? "Temporary Signal Sent (24h)!" : "Permanent Signal Sent!",
      );
    } catch (err) {
      console.error("400 Bad Request Context:", err.response?.data);
      alert(
        `Sync Failed: ${err.response?.data?.message || "Check Connection"}`,
      );
    } finally {
      setUploading(false);
    }
  };

  // --- 5. INTERACTIONS ---
  const handleLike = async (postId) => {
    if (!myId) return;
    try {
      const res = await axios.put(
        `import.meta.env.VITE_API_URL/api/posts/like/${postId}`,
        { userId: myId },
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p,
        ),
      );
    } catch (err) {
      console.error("Reaction Failed");
    }
  };

  const handleComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text || !myId) return;
    try {
      const res = await axios.post(
        `import.meta.env.VITE_API_URL/api/posts/${postId}/comment`,
        {
          userId: myId,
          userName: myName,
          text,
        },
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p)),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Communication Failed");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc]">
      {/* Dynamic Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 p-5 border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
            {currentSector} HUB
          </h2>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] border border-slate-200">
          <button
            onClick={() => setViewMode("Explore")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === "Explore" ? "bg-white shadow-md text-indigo-600" : "text-slate-500"}`}
          >
            EXPLORE
          </button>
          <button
            onClick={() => setViewMode("Following")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === "Following" ? "bg-white shadow-md text-indigo-600" : "text-slate-500"}`}
          >
            CIRCLE
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        {/* Create Post Interface */}
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 mb-12 hover:shadow-indigo-50/50 transition-all duration-500">
          <div className="flex gap-5">
            <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl italic border shadow-sm">
              {myName[0]}
            </div>
            <textarea
              className="w-full bg-slate-50 rounded-3xl p-5 text-sm outline-none resize-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all font-medium italic"
              rows="3"
              placeholder={`Share a neural update, Commander ${myName}...`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
          </div>

          {imagePreview && (
            <div className="mt-6 relative rounded-[2rem] overflow-hidden group border-4 border-slate-50 shadow-2xl">
              <img
                src={imagePreview}
                className="w-full h-72 object-cover"
                alt="Preview"
              />
              <button
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-2xl shadow-xl hover:rotate-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center mt-6 pt-6 border-t border-slate-50 gap-4">
            <div className="flex items-center gap-6">
              {/* Media Action */}
              <label className="group flex items-center gap-2 cursor-pointer text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest">
                <ImagePlus size={20} /> Satellite Media
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>

              {/* Neural Fade Toggle (Expiry) */}
              <button
                onClick={() => setIsExpiring(!isExpiring)}
                className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${isExpiring ? "text-amber-500 scale-105" : "text-slate-300 hover:text-slate-500"}`}
              >
                {isExpiring ? (
                  <Timer size={20} className="animate-pulse" />
                ) : (
                  <TimerOff size={20} />
                )}
                {isExpiring ? "Fade On (24h)" : "Fade Off"}
              </button>
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={uploading || (!newPost.trim() && !image)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-[1.5rem] font-black text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-40"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}{" "}
              BROADCAST
            </button>
          </div>
        </div>

        {/* Neural Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto pb-20">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col group relative"
            >
              {/* Expiry Badge */}
              {post.expiresAt && (
                <div className="absolute top-6 right-20 z-10 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border border-amber-100 flex items-center gap-1">
                  <Timer size={10} /> Neural Fade Active
                </div>
              )}

              <div className="p-6 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black italic border shadow-sm group-hover:rotate-6 transition-transform">
                    {post.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">
                      {post.author}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Globe size={10} />{" "}
                      {new Date(post.createdAt).toDateString()}
                    </p>
                  </div>
                </div>
                <MoreHorizontal
                  size={20}
                  className="text-slate-300 cursor-pointer"
                />
              </div>

              <div className="px-8 py-4 flex-1">
                <p className="text-slate-600 text-[14px] leading-relaxed italic font-medium leading-relaxed">
                  "{post.content}"
                </p>
              </div>

              {post.imageUrl && (
                <div className="px-4 pb-4">
                  <div className="relative group rounded-[2.2rem] overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      onClick={() => setFullImg(post.imageUrl)}
                      className="w-full aspect-video object-cover cursor-zoom-in group-hover:scale-105 transition-all duration-700"
                    />
                    <button
                      onClick={() => setFullImg(post.imageUrl)}
                      className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-xl text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition shadow-2xl"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 transition-all ${(post.likes || []).includes(myId) ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                  >
                    <Heart
                      size={22}
                      fill={
                        (post.likes || []).includes(myId)
                          ? "currentColor"
                          : "none"
                      }
                      className="active:scale-150 transition-transform"
                    />
                    <span className="text-[10px] font-black">
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
                    <span className="text-[10px] font-black">
                      {post.comments?.length || 0}
                    </span>
                  </button>
                </div>
                <Bookmark
                  size={22}
                  className="text-slate-300 hover:text-amber-500 transition-all"
                />
              </div>

              {showComments[post._id] && (
                <div className="px-8 pb-8 bg-slate-50/50 animate-in slide-in-from-top duration-300">
                  <div className="max-h-40 overflow-y-auto no-scrollbar space-y-3 pt-4 border-t border-slate-100">
                    {(post.comments || []).map((c, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm flex flex-col"
                      >
                        <span className="text-[9px] font-black text-indigo-600 uppercase mb-1">
                          {c.userName}
                        </span>
                        <p className="text-xs text-slate-600 font-medium">
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Reply to broadcast..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase italic"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full View Modal */}
      {fullImg && (
        <div className="fixed inset-0 bg-slate-950/98 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
          <button
            onClick={() => setFullImg(null)}
            className="absolute top-10 right-10 text-white/50 hover:text-white transition-all bg-white/10 p-3 rounded-full hover:rotate-90"
          >
            <X size={32} />
          </button>
          <img
            src={fullImg}
            className="max-w-full max-h-[90vh] rounded-[2rem] shadow-2xl object-contain border-4 border-white/10"
            alt="Full View"
          />
        </div>
      )}
    </div>
  );
};

export default Community;
