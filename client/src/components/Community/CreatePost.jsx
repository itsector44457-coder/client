import React, { useState } from "react";
import { ImagePlus, Timer, TimerOff, Send, Loader2, X } from "lucide-react";

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
      className={`bg-white rounded-xl sm:rounded-2xl border border-slate-200 transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "shadow-md ring-1 ring-indigo-100"
          : "shadow-sm hover:border-slate-300"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* --- Top Row: Identity & Input --- */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Subtle Avatar */}
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-100">
            {myName[0]?.toUpperCase() || "C"}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <textarea
              onFocus={() => setIsExpanded(true)}
              className="w-full bg-transparent pt-2.5 sm:pt-2 text-sm sm:text-base text-slate-800 outline-none resize-none placeholder:text-slate-400 leading-relaxed"
              rows={isExpanded ? 3 : 1}
              placeholder="Share an insight or initiate a broadcast..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />

            {/* Collapsed State Quick Send Button */}
            {!isExpanded && !uploading && (
              <div className="self-end mt-1">
                <button
                  onClick={onSubmit}
                  disabled={!newPost.trim() && !imagePreview}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
                  title="Quick Post"
                >
                  <Send size={16} className="-ml-0.5 mt-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Hidden Content: Appears on Focus --- */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 ml-0 sm:ml-14 mt-3">
            {/* Image Preview Area - Clean corners */}
            {imagePreview && (
              <div className="mb-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  className="w-full max-h-64 object-contain"
                  alt="Preview"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-rose-500 transition-colors"
                  title="Remove Image"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-3">
              {/* Left Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Media Upload - Subtle Icon Button */}
                <label
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full cursor-pointer transition-colors"
                  title="Add Media"
                >
                  <ImagePlus size={20} />
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

                {/* Expiry Toggle - Pill shape */}
                <button
                  onClick={() => setIsExpiring(!isExpiring)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isExpiring
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                  title="Toggle 24h Expiry"
                >
                  {isExpiring ? (
                    <Timer size={14} className="animate-pulse" />
                  ) : (
                    <TimerOff size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {isExpiring ? "24h Fade" : "Permanent"}
                  </span>
                </button>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={uploading || (!newPost.trim() && !imagePreview)}
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Post
                    </>
                  )}
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
