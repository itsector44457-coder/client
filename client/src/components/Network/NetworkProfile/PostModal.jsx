import React from "react";
import { X } from "lucide-react";
import PostCard from "../../Community/PostCard";

const PostModal = ({
  post,
  onClose,
  myId,
  onLike,
  showComments,
  onCommentToggle,
  commentInput,
  setCommentInput,
  onCommentSubmit,
}) => (
  // 🟢 Clean Overlay: Soft dark blur
  <div
    className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    onClick={onClose} // Clicking outside closes the modal
  >
    {/* ❌ Floating Close Button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors p-2 sm:p-2.5 rounded-full z-[610]"
      title="Close"
    >
      <X size={20} />
    </button>

    {/* 📦 Modal Container */}
    <div
      className="w-full max-w-xl max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside card from closing modal
    >
      {/* PostCard directly renders here. 
        Kyunki PostCard pehle se hi bg-white aur rounded-2xl hai, 
        humein extra background lagane ki zarurat nahi hai.
      */}
      <PostCard
        post={post}
        myId={myId}
        onLike={onLike}
        isCommentOpen={showComments[post._id]}
        onCommentToggle={() => onCommentToggle(post._id)}
        commentInput={commentInput}
        setCommentInput={(id, val) => setCommentInput(id, val)}
        onCommentSubmit={() => onCommentSubmit(post._id)}
        onImageClick={() => {}} // Disabled fullscreen image inside the modal to avoid modal-in-modal inception
      />
    </div>
  </div>
);

export default PostModal;
