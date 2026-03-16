import React from "react";
import { Heart, MessageCircle, Grid3X3 } from "lucide-react";

const ProfileGrid = ({ posts, onPostClick }) => (
  // Gap ko 1px se badal kar slightly wider (0.5/1) kiya gaya hai for a modern web look
  <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-white">
    {posts.length > 0 ? (
      posts.map((post) => {
        const hasImage = post.imageUrl || post.image;

        return (
          <div
            key={post._id}
            onClick={() => onPostClick(post)}
            className="aspect-square bg-slate-50 relative group cursor-pointer overflow-hidden"
          >
            {/* Handle Images vs Text-Only Posts */}
            {hasImage ? (
              <img
                src={hasImage}
                // Scaling ko 110 se 105 par laya gaya hai taaki smooth aur premium feel aaye
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Post content"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-3 sm:p-5 text-center bg-indigo-50/50 text-slate-700">
                <p className="text-[10px] sm:text-sm line-clamp-3 sm:line-clamp-4 font-medium break-words leading-relaxed">
                  {post.content}
                </p>
              </div>
            )}

            {/* Hover Overlay - Soft dark blur with clean icons */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4 sm:gap-6 text-white">
              <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <Heart
                  size={18}
                  fill="currentColor"
                  className="sm:w-5 sm:h-5"
                />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <MessageCircle
                  size={18}
                  fill="currentColor"
                  className="sm:w-5 sm:h-5"
                />{" "}
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <div className="col-span-3 py-24 flex flex-col items-center justify-center text-center bg-white">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
          <Grid3X3 size={24} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-sm">No posts to show</p>
      </div>
    )}
  </div>
);

export default ProfileGrid;
