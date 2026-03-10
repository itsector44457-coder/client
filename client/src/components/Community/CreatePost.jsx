import React, { useState } from "react";
import {
  ImagePlus,
  Timer,
  TimerOff,
  Send,
  Loader2,
  X,
  Zap,
} from "lucide-react";

const CreatePost = ({
  myName,
  newPost,
  setNewPost,
  imagePreview,
  setImage,
  setImagePreview,
  isExpiring,
  setIsExpiring,
  uploading,
  onSubmit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`max-w-2xl mx-auto bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 overflow-hidden ${
        isExpanded ? "shadow-xl ring-1 ring-indigo-50" : "hover:shadow-md"
      }`}
    >
      <div className="p-3 sm:p-4 lg:p-5">
        {/* --- Top Row: Identity & Input --- */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black italic text-xs sm:text-sm shadow-indigo-100 shadow-lg mt-1 sm:mt-0">
            {myName[0]}
          </div>

          <textarea
            onFocus={() => setIsExpanded(true)}
            className="w-full bg-transparent py-1.5 sm:py-2 text-sm sm:text-base outline-none resize-none font-medium placeholder:text-slate-400 placeholder:italic"
            rows={isExpanded ? 3 : 1}
            placeholder={
              isExpanded
                ? "Write your neural signal..."
                : "Initiate broadcast..."
            }
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />

          {!isExpanded && !uploading && (
            <button
              onClick={onSubmit}
              disabled={!newPost.trim() && !imagePreview}
              className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 mt-1 sm:mt-0"
            >
              <Send size={18} />
            </button>
          )}
        </div>

        {/* --- Hidden Content: Appears on Focus --- */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Image Preview Area */}
            {imagePreview && (
              <div className="mt-3 sm:mt-4 relative rounded-[1.5rem] overflow-hidden border-2 border-slate-50">
                <img
                  src={imagePreview}
                  className="w-full h-32 sm:h-48 object-cover"
                  alt="Preview"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-slate-900/40 backdrop-blur-md text-white p-1.5 rounded-xl hover:bg-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50 gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Media Upload */}
                <label className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-400 hover:text-indigo-600 transition-all">
                  <ImagePlus size={18} className="sm:w-5 sm:h-5" />
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

                {/* Neural Fade Toggle */}
                <button
                  onClick={() => setIsExpiring(!isExpiring)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${
                    isExpiring
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {isExpiring ? (
                    <Timer
                      size={12}
                      className="animate-pulse sm:w-[14px] sm:h-[14px]"
                    />
                  ) : (
                    <TimerOff size={12} className="sm:w-[14px] sm:h-[14px]" />
                  )}
                  {isExpiring ? "24h Fade" : "Permanent"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={uploading || (!newPost.trim() && !imagePreview)}
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-40 transition-all"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Zap size={14} fill="white" />
                  )}
                  BROADCAST
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
