import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Radio } from "lucide-react";
import CommunityHeader from "./CommunityHeader";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

const Community = ({ myField }) => {
  // --- 1. STATES ---
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [fullImg, setFullImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState("Explore"); // 'Explore' | 'Following'
  const [isExpiring, setIsExpiring] = useState(false);

  // --- 2. IDENTITY & CONTEXT ---
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser?.id || storedUser?._id;
  const myName = storedUser?.name || "Commander";
  const currentSector =
    myField || localStorage.getItem("userField") || "General";
  const followingList = storedUser.following || [];

  // --- 3. FETCH BROADCASTS ---
  useEffect(() => {
    fetchPosts();
  }, [currentSector]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://backend-6hhv.onrender.com/api/posts`,
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Link Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. SMART FILTERING ---
  const filteredPosts = posts.filter((post) => {
    if (viewMode === "Following") {
      return followingList.includes(post.authorId);
    }
    return post.field === currentSector;
  });

  // --- 5. POST SUBMISSION ---
  const handlePostSubmit = async () => {
    if (!newPost.trim() && !image) return;
    setUploading(true);
    let uploadedImageUrl = "";

    try {
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

      const postPayload = {
        author: myName,
        authorId: myId,
        field: currentSector,
        content: newPost.trim() || "Signal Initialized",
        imageUrl: uploadedImageUrl,
        expiresAt: isExpiring
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      };

      const res = await axios.post(
        `https://backend-6hhv.onrender.com/api/posts/add`,
        postPayload,
      );
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setImage(null);
      setImagePreview(null);
      setIsExpiring(false);
    } catch (err) {
      alert("Broadcast Sync Failed");
    } finally {
      setUploading(false);
    }
  };

  // --- 6. INTERACTIONS ---
  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `https://backend-6hhv.onrender.com/api/posts/like/${postId}`,
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
    if (!text) return;
    try {
      const res = await axios.post(
        `https://backend-6hhv.onrender.com/api/posts/${postId}/comment`,
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
      console.error("Comm Failed");
    }
  };

  /* ==================================
          UI RENDERING
  ================================== */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-40 h-full bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={32} />
        <p className="text-sm font-medium text-slate-500 tracking-wide">
          Syncing Sector Feed...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans">
      <CommunityHeader
        currentSector={currentSector}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main scrolling container - Optimized padding for minimal layout */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-5 md:p-6 pb-24 scroll-smooth">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <CreatePost
            myName={myName}
            newPost={newPost}
            setNewPost={setNewPost}
            imagePreview={imagePreview}
            setImage={setImage}
            setImagePreview={setImagePreview}
            isExpiring={isExpiring}
            setIsExpiring={setIsExpiring}
            uploading={uploading}
            onSubmit={handlePostSubmit}
          />

          {/* Responsive Grid - Clean spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-2">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  myId={myId}
                  onLike={handleLike}
                  onImageClick={setFullImg}
                  isCommentOpen={showComments[post._id]}
                  onCommentToggle={(id) =>
                    setShowComments((p) => ({ ...p, [id]: !p[id] }))
                  }
                  commentInput={commentInputs[post._id] || ""}
                  setCommentInput={(id, val) =>
                    setCommentInputs((p) => ({ ...p, [id]: val }))
                  }
                  onCommentSubmit={handleComment}
                />
              ))
            ) : (
              // Minimal Empty State
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                <Radio size={40} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  {viewMode === "Following"
                    ? "No signals from your circle yet. Connect with commanders!"
                    : "Silence in this sector. Be the first to broadcast."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal - Clean light/dark blur */}
      {fullImg && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-opacity"
          onClick={() => setFullImg(null)}
        >
          <img
            src={fullImg}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
            alt="Expanded view"
          />
        </div>
      )}
    </div>
  );
};

export default Community;
