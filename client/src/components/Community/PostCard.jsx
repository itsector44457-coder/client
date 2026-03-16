import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Maximize2,
  MoreHorizontal,
  Globe,
  Timer,
  Share2,
  ShieldCheck,
} from "lucide-react";

const PostCard = ({
  post,
  myId,
  onLike,
  onCommentToggle,
  isCommentOpen,
  commentInput,
  setCommentInput,
  onCommentSubmit,
  onImageClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLiked = (post.likes || []).includes(myId);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden shadow-sm"
    >
      {/* ⚡ Tags: Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
        {post.field && (
          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide">
            {post.field}
          </span>
        )}
        {post.expiresAt && (
          <div className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 border border-rose-100">
            <Timer size={12} /> 24h
          </div>
        )}
      </div>

      {/* 👤 Header Section */}
      <div className="px-4 pt-4 sm:px-5 sm:pt-5 pb-2 flex justify-between items-start">
        <div className="flex items-start gap-3">
          {/* Subtle Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {post.author[0]?.toUpperCase() || "U"}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 border-2 border-white w-3.5 h-3.5 rounded-full"
              title="Online Status"
            />
          </div>

          <div className="mt-0.5 min-w-0 pr-12">
            {" "}
            {/* pr-12 to avoid overlap with tags */}
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-800 truncate cursor-pointer hover:underline hover:text-indigo-600">
                {post.author}
              </p>
              <ShieldCheck size={14} className="text-indigo-500 shrink-0" />
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Globe size={12} className="text-slate-400" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Only show menu on hover or mobile to keep UI clean */}
        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 📝 Content Section */}
      <div className="px-4 sm:px-5 py-2 flex-1">
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* 🖼️ Media Section */}
      {post.imageUrl && (
        <div className="px-4 sm:px-5 py-2">
          <div className="relative group/img rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={post.imageUrl}
              alt="Post media"
              className="w-full max-h-96 object-cover cursor-zoom-in"
              onClick={() => onImageClick(post.imageUrl)}
            />
            {/* Subtle Expand Button on hover */}
            <button
              onClick={() => onImageClick(post.imageUrl)}
              className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 📊 Interaction Bar */}
      <div className="px-2 sm:px-3 py-2 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-4 text-slate-500">
          {/* Like Button */}
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors hover:bg-rose-50 hover:text-rose-500 group/btn ${
              isLiked ? "text-rose-500" : ""
            }`}
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              className={`transition-transform ${isLiked ? "" : "group-active/btn:scale-110"}`}
            />
            <span className="text-xs font-semibold">
              {post.likes?.length || 0}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onCommentToggle(post._id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${
              isCommentOpen ? "text-indigo-600" : ""
            }`}
          >
            <MessageCircle
              size={18}
              fill={isCommentOpen ? "currentColor" : "none"}
            />
            <span className="text-xs font-semibold">
              {post.comments?.length || 0}
            </span>
          </button>

          {/* Share Button */}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors hover:bg-slate-100">
            <Share2 size={18} />
          </button>
        </div>

        {/* Bookmark Button */}
        <button className="px-3 py-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <Bookmark size={18} />
        </button>
      </div>

      {/* 💬 Comment Section */}
      {isCommentOpen && (
        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
          {/* Comment Input */}
          <div className="flex gap-2 sm:gap-3 mt-3 mb-4">
            <input
              className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Post a reply..."
              value={commentInput}
              onChange={(e) => setCommentInput(post._id, e.target.value)}
            />
            <button
              onClick={() => onCommentSubmit(post._id)}
              disabled={!commentInput?.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              Reply
            </button>
          </div>

          {/* Comments List */}
          <div className="max-h-60 overflow-y-auto no-scrollbar space-y-4 pt-2">
            {post.comments?.length > 0 ? (
              post.comments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  {/* Small Avatar */}
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 border border-slate-300">
                    {c.userName[0]?.toUpperCase() || "U"}
                  </div>

                  {/* Comment Bubble */}
                  <div className="flex-1">
                    <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm inline-block">
                      <span className="text-xs font-semibold text-slate-800 block mb-0.5">
                        {c.userName}
                      </span>
                      <p className="text-sm text-slate-700 leading-snug">
                        {c.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 font-medium py-2">
                No replies yet. Be the first to join the conversation.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
