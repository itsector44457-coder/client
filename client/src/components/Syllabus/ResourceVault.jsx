import React, { useState } from "react";
import axios from "axios";
import {
  Filter,
  Youtube,
  FileText,
  Bookmark,
  Image as ImageIcon,
  Notebook,
  Zap,
  Plus,
  X,
  Upload,
  Loader2,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";

const ResourceVault = ({
  resources,
  resourceType,
  setResourceType,
  onBookmark,
  onAddResource,
  activeTopicTitle,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newRes, setNewRes] = useState({ title: "", url: "", type: "Note" });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalUrl = newRes.url;

    if ((newRes.type === "Photo" || newRes.type === "PDF") && selectedFile) {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("upload_preset", "TODO123");
      try {
        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dsitca1zl/auto/upload",
          data,
        );
        finalUrl = cloudRes.data.secure_url;
      } catch (err) {
        alert("Cloud Injection Failed!");
        setUploading(false);
        return;
      }
    }

    if (onAddResource) await onAddResource({ ...newRes, url: finalUrl });
    setIsAddModalOpen(false);
    setUploading(false);
    setNewRes({ title: "", url: "", type: "Note" });
    setSelectedFile(null);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "YouTube":
        return <Youtube size={22} className="text-rose-500" />;
      case "PDF":
        return <FileText size={22} className="text-orange-500" />;
      case "Photo":
        return <ImageIcon size={22} className="text-emerald-500" />;
      default:
        return <Notebook size={22} className="text-indigo-500" />;
    }
  };

  const displayedResources =
    resourceType === "Saved"
      ? resources.filter((r) => r.isBookmarked)
      : resources;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 h-full flex flex-col shadow-2xl overflow-hidden relative">
      {/* 🟢 TOP NAV & FILTERS - Responsive Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg">
            <Zap
              size={18}
              className="text-indigo-500 fill-indigo-500 sm:w-5 sm:h-5"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
              Universal Vault
            </p>
            <h3 className="text-base sm:text-xl font-black text-slate-900 uppercase italic mt-1 truncate">
              {activeTopicTitle || "Global Repository"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="flex-1 sm:flex-none text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            {["All", "Saved", "YouTube", "PDF", "Photo", "Note"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg active:scale-90 transition-all shrink-0"
          >
            <Plus size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* 🚀 RESPONSIVE GRID */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {displayedResources.length === 0 ? (
            <div className="col-span-full py-20 sm:py-40 text-center opacity-20 italic font-black uppercase text-sm sm:text-xl tracking-[0.3em] sm:tracking-[0.5em] px-4">
              Vault Locked: No Nodes Synced
            </div>
          ) : (
            displayedResources.map((res) => (
              <div
                key={res._id}
                className="group bg-slate-50/50 border border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98]"
                onClick={() => setPreviewData(res)}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-3xl shadow-sm mb-4 sm:mb-6">
                    {getResourceIcon(res.type)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(res);
                    }}
                    className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-all active:scale-125"
                  >
                    <Bookmark
                      size={18}
                      className={
                        res.isBookmarked
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-200"
                      }
                    />
                  </button>
                </div>

                <div className="relative z-10 min-w-0">
                  <h4 className="font-black text-slate-800 uppercase italic text-xs sm:text-sm truncate leading-tight">
                    {res.title}
                  </h4>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase mt-1 sm:mt-2 tracking-widest flex items-center gap-2">
                    {res.type} Node{" "}
                    <Eye
                      size={10}
                      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    />
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🖼️ UNIVERSAL PREVIEW MODAL - Full Screen on Mobile */}
      {previewData && (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full h-[100dvh] sm:h-[94vh] max-w-[100vw] sm:max-w-[95vw] rounded-none sm:rounded-[3rem] sm:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl relative border-x-0 sm:border border-white/20">
            {/* Modal Header */}
            <div className="p-4 sm:p-8 border-b flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <div className="p-2 sm:p-3 bg-indigo-50 rounded-xl sm:rounded-2xl text-indigo-600 shrink-0">
                  {getResourceIcon(previewData.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black italic uppercase text-slate-900 text-sm sm:text-xl tracking-tighter truncate max-w-[180px] sm:max-w-none">
                    {previewData.title}
                  </h4>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">
                    Authorized Access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => window.open(previewData.url, "_blank")}
                  className="p-2 sm:px-6 sm:py-3 text-indigo-600 bg-indigo-50 rounded-xl sm:rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink size={18} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewData(null)}
                  className="p-2 sm:p-4 bg-rose-50 text-rose-600 rounded-full active:scale-90 transition-all border border-rose-100 shadow-sm"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Rendering Zone - Fully responsive */}
            <div className="flex-1 bg-slate-900/5 flex items-center justify-center relative overflow-hidden">
              {previewData.type === "PDF" && (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewData.url)}&embedded=true`}
                  className="w-full h-full border-none bg-white"
                  title="Vault PDF Preview"
                />
              )}
              {previewData.type === "Photo" && (
                <img
                  src={previewData.url}
                  className="max-w-full max-h-full object-contain p-4 sm:p-6"
                  alt="node-view"
                />
              )}
              {previewData.type === "YouTube" && (
                <div className="w-full h-full max-w-6xl aspect-video flex items-center justify-center p-2">
                  <iframe
                    src={`https://www.youtube.com/embed/${previewData.url.split("v=")[1] || previewData.url.split("/").pop()}?autoplay=1`}
                    className="w-full h-full rounded-xl sm:rounded-[3rem] shadow-2xl"
                    allowFullScreen
                  />
                </div>
              )}
              {previewData.type === "Note" && (
                <div className="p-6 sm:p-20 text-center max-w-2xl bg-white rounded-2xl sm:rounded-[3rem] shadow-xl border border-slate-100 m-4">
                  <Notebook
                    size={48}
                    className="text-indigo-200 mx-auto mb-4 sm:mb-6"
                  />
                  <h3 className="text-lg sm:text-2xl font-black italic uppercase text-slate-800 mb-2 sm:mb-4">
                    Node Data
                  </h3>
                  <p className="text-[10px] sm:text-sm text-slate-400 font-medium mb-6 sm:mb-10 leading-relaxed uppercase">
                    Study nodes and article data. Access full node via link.
                  </p>
                  <a
                    href={previewData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-slate-900 text-white px-6 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-indigo-600 transition-all"
                  >
                    Establish Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ ADD MODAL - Centered and mobile safe */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 text-slate-400 active:rotate-90 transition-all"
            >
              <X size={20} />
            </button>
            <h4 className="text-xl sm:text-2xl font-black italic uppercase text-slate-900 mb-6 sm:mb-8 leading-none">
              Inject Signal
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1.5 block">
                  Identifier
                </label>
                <input
                  required
                  type="text"
                  value={newRes.title}
                  onChange={(e) =>
                    setNewRes({ ...newRes, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Robot Logic PDF"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {["PDF", "Photo", "Note", "YouTube"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setNewRes({ ...newRes, type });
                      setSelectedFile(null);
                    }}
                    className={`py-2.5 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase border transition-all ${newRes.type === type ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-400 border-slate-100"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {newRes.type === "Photo" || newRes.type === "PDF" ? (
                <div className="border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center relative bg-slate-50/50 group">
                  <input
                    type="file"
                    accept={newRes.type === "Photo" ? "image/*" : ".pdf"}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload
                    size={24}
                    className="mx-auto text-slate-300 mb-2 sm:mb-4 group-hover:text-indigo-400 transition-colors"
                  />
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase truncate">
                    {selectedFile ? selectedFile.name : `Select ${newRes.type}`}
                  </p>
                </div>
              ) : (
                <input
                  required
                  type="url"
                  value={newRes.url}
                  onChange={(e) =>
                    setNewRes({ ...newRes, url: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Global URL Access"
                />
              )}

              <button
                disabled={uploading}
                className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black uppercase italic text-[10px] sm:text-xs tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Authorize Sync <Zap size={12} fill="white" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceVault;
