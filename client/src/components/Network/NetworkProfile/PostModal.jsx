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
  <div className="fixed inset-0 z-[200] bg-slate-950/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-in fade-in">
    {/* ❌ Close Button - Scaled and repositioned for mobile reachability */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/60 hover:text-white transition-all bg-white/10 p-2 sm:p-3 rounded-full hover:bg-white/20 active:scale-90 z-[210]"
    >
      <X size={20} className="sm:w-6 sm:h-6" />
    </button>

    {/* 📦 Modal Container - Responsive radius and max-height */}
    <div className="bg-white max-w-lg w-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 mt-10 sm:mt-0">
      {/* Scrollable Area - Uses dvh to prevent mobile keyboard layout breaks */}
      <div className="max-h-[80dvh] sm:max-h-[85vh] overflow-y-auto no-scrollbar">
        <PostCard
          post={post}
          myId={myId}
          onLike={onLike}
          isCommentOpen={showComments[post._id]}
          onCommentToggle={() => onCommentToggle(post._id)}
          commentInput={commentInput}
          setCommentInput={(id, val) => setCommentInput(id, val)}
          onCommentSubmit={() => onCommentSubmit(post._id)}
          onImageClick={() => {}} // Disabled fullscreen image inside the modal to avoid modal-in-modal
        />
      </div>
    </div>
  </div>
);

export default PostModal;
