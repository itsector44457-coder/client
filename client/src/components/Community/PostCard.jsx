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
  Zap,
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
      className="group relative bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col overflow-hidden"
    >
      {/* ⚡ Neural Fade & Field Badge */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20 flex flex-col items-end sm:flex-row gap-1.5 sm:gap-2">
        {post.field && (
          <span className="bg-indigo-50 text-indigo-600 px-2 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
            {post.field}
          </span>
        )}
        {post.expiresAt && (
          <div className="bg-amber-50 text-amber-600 px-2 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-tighter border border-amber-100 flex items-center gap-1 shadow-sm animate-pulse">
            <Timer size={10} /> Neural Fade
          </div>
        )}
      </div>

      {/* 👤 Header Section */}
      <div className="p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
              {post.author[0]}
            </div>
            <div
              className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm"
              title="Online Status"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs sm:text-sm font-black text-slate-800 uppercase italic tracking-tight cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1 max-w-[120px] sm:max-w-none">
                {post.author}
              </p>
              <ShieldCheck size={14} className="text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mt-0.5">
              <Globe size={10} />{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <MoreHorizontal size={18} className="text-slate-300 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* 📝 Content Section */}
      <div className="px-5 sm:px-8 py-1 sm:py-2 flex-1">
        <p className="text-slate-600 text-[13px] sm:text-[15px] leading-relaxed font-medium italic">
          <Zap size={14} className="inline mr-1.5 sm:mr-2 text-indigo-400" />
          {post.content}
        </p>
      </div>

      {/* 🖼️ Media Section */}
      {post.imageUrl && (
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="relative group/img rounded-2xl sm:rounded-[2rem] overflow-hidden border-2 sm:border-4 border-slate-50 shadow-md">
            <img
              src={post.imageUrl}
              alt="Post broadcast"
              className="w-full aspect-video object-cover cursor-zoom-in group-hover/img:scale-105 transition-all duration-1000"
              onClick={() => onImageClick(post.imageUrl)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
            <button
              onClick={() => onImageClick(post.imageUrl)}
              className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/30 backdrop-blur-md text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl opacity-0 group-hover/img:opacity-100 transition-all transform translate-y-2 group-hover/img:translate-y-0 shadow-2xl"
            >
              <Maximize2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* 📊 Interaction Bar */}
      <div className="p-3 sm:p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-1.5 sm:gap-5">
          {/* Like Button */}
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl transition-all ${
              isLiked
                ? "bg-rose-50 text-rose-500 shadow-sm"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              className={`sm:w-5 sm:h-5 transition-transform duration-300 ${isLiked ? "scale-110" : "group-active:scale-125"}`}
            />
            <span className="text-[10px] sm:text-[11px] font-black">
              {post.likes?.length || 0}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onCommentToggle(post._id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl transition-all ${
              isCommentOpen
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <MessageCircle size={18} className="sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-[11px] font-black">
              {post.comments?.length || 0}
            </span>
          </button>

          {/* Share Button */}
          <button className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-slate-400 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all">
            <Share2 size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <button className="p-2 sm:p-3 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl sm:rounded-2xl transition-all">
          <Bookmark size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* 💬 Comment Section */}
      {isCommentOpen && (
        <div className="px-4 sm:px-8 pb-4 sm:pb-8 bg-white border-t border-slate-50 animate-in slide-in-from-top duration-300">
          <div className="max-h-48 sm:max-h-56 overflow-y-auto no-scrollbar space-y-3 sm:space-y-4 pt-4 sm:pt-6">
            {post.comments?.length > 0 ? (
              post.comments.map((c, i) => (
                <div key={i} className="flex gap-2 sm:gap-3 group/comment">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase flex-shrink-0">
                    {c.userName[0]}
                  </div>
                  <div className="flex-1 bg-slate-50 p-2.5 sm:p-3 rounded-2xl rounded-tl-none border border-slate-100">
                    <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase italic block mb-0.5 sm:mb-1">
                      {c.userName}
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[9px] sm:text-[10px] text-slate-300 font-black uppercase tracking-widest py-3 sm:py-4">
                No neural responses yet.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4 sm:mt-6">
            <input
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-[11px] sm:text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              placeholder="Inject a neural response..."
              value={commentInput}
              onChange={(e) => setCommentInput(post._id, e.target.value)}
            />
            <button
              onClick={() => onCommentSubmit(post._id)}
              className="bg-indigo-600 text-white px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase italic shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
