import React from "react";
import { Heart, MessageCircle } from "lucide-react";

const ProfileGrid = ({ posts, onPostClick }) => (
  <div className="grid grid-cols-3 gap-[1px] bg-slate-100">
    {posts.length > 0 ? (
      posts.map((post) => (
        <div
          key={post._id}
          onClick={() => onPostClick(post)}
          className="aspect-square bg-white relative group cursor-pointer overflow-hidden"
        >
          <img
            src={post.imageUrl || post.image}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt="signal"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-1 font-black text-[10px]">
              <Heart size={14} fill="white" /> {post.likes?.length || 0}
            </div>
            <div className="flex items-center gap-1 font-black text-[10px]">
              <MessageCircle size={14} fill="white" />{" "}
              {post.comments?.length || 0}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-3 py-20 text-center text-slate-300 italic text-[10px] uppercase tracking-widest bg-white">
        No Signals Detected
      </div>
    )}
  </div>
);

export default ProfileGrid;
