import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Pin,
  PinOff,
  ExternalLink,
  FileText,
  Video,
  StickyNote,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const asYouTubeEmbed = (url) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return url;
};

const ResourcePanel = ({ myField, currentUserId, onHide }) => {
  const storageKey = `resourceDeck:${currentUserId || "guest"}:${myField}`;

  const [resources, setResources] = useState([]);
  const [activeResourceId, setActiveResourceId] = useState(null);
  const [newResource, setNewResource] = useState({
    title: "",
    type: "pdf",
    url: "",
    content: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    setResources(Array.isArray(parsed) ? parsed : []);
    setActiveResourceId(parsed?.[0]?.id || null);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(resources));
  }, [resources, storageKey]);

  const addResource = () => {
    const title = newResource.title.trim();
    const url = newResource.url.trim();
    const content = newResource.content.trim();

    if (!title) return;
    if (newResource.type === "note" && !content) return;
    if (newResource.type !== "note" && !url) return;

    const item = {
      id: `${Date.now()}`,
      title,
      type: newResource.type,
      url: newResource.type === "note" ? "" : url,
      content: newResource.type === "note" ? content : "",
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    setResources((prev) => [item, ...prev]);
    setActiveResourceId(item.id);
    setNewResource({ title: "", type: "pdf", url: "", content: "" });
  };

  const togglePin = (resourceId) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, isPinned: !r.isPinned } : r,
      ),
    );
  };

  const deleteResource = (resourceId) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    if (activeResourceId === resourceId) {
      const next = resources.find((r) => r.id !== resourceId);
      setActiveResourceId(next?.id || null);
    }
  };

  const sortedResources = useMemo(() => {
    const pinned = resources.filter((r) => r.isPinned);
    const others = resources.filter((r) => !r.isPinned);
    return [...pinned, ...others];
  }, [resources]);

  const activeResource =
    sortedResources.find((r) => r.id === activeResourceId) ||
    sortedResources[0] ||
    null;

  return (
    <aside className="hidden xl:flex w-[360px] border-l border-slate-200 bg-white/95 backdrop-blur-md flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <BookOpen size={14} /> Resource Deck
          </h3>
          <button
            onClick={onHide}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Hide deck"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Add and pin your own study resources for {myField}
        </p>
      </div>

      <div className="p-3 border-b border-slate-100 space-y-2">
        <input
          value={newResource.title}
          onChange={(e) =>
            setNewResource((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Resource title"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <div className="flex gap-2">
          <select
            value={newResource.type}
            onChange={(e) =>
              setNewResource((prev) => ({ ...prev, type: e.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
          >
            <option value="pdf">PDF/Doc Link</option>
            <option value="video">YouTube Link</option>
            <option value="note">Quick Note</option>
          </select>
          <button
            onClick={addResource}
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {newResource.type === "note" ? (
          <textarea
            rows={2}
            value={newResource.content}
            onChange={(e) =>
              setNewResource((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Type your note"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-300"
          />
        ) : (
          <input
            value={newResource.url}
            onChange={(e) =>
              setNewResource((prev) => ({ ...prev, url: e.target.value }))
            }
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-300"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-3 space-y-2">
          {sortedResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-400 text-center">
              No resources yet. Add your first link or note.
            </div>
          ) : (
            sortedResources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => setActiveResourceId(resource.id)}
                className={`w-full text-left rounded-2xl border p-3 transition ${
                  activeResource?.id === resource.id
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-100 bg-white hover:border-indigo-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{resource.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1">
                      {resource.type === "pdf" ? (
                        <FileText size={11} />
                      ) : resource.type === "video" ? (
                        <Video size={11} />
                      ) : (
                        <StickyNote size={11} />
                      )}
                      {resource.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(resource.id);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                      title="Pin"
                    >
                      {resource.isPinned ? (
                        <Pin size={14} className="text-indigo-600" />
                      ) : (
                        <PinOff size={14} />
                      )}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteResource(resource.id);
                      }}
                      className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        {!activeResource ? (
          <div className="text-xs text-slate-400">No resource selected.</div>
        ) : activeResource.type === "note" ? (
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700">
            {activeResource.content}
          </div>
        ) : activeResource.type === "video" ? (
          <div className="space-y-2">
            <iframe
              src={asYouTubeEmbed(activeResource.url)}
              title={activeResource.title}
              className="w-full h-44 rounded-xl border border-slate-200"
              allowFullScreen
            />
            <a
              href={activeResource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold"
            >
              Open full video <ExternalLink size={12} />
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <a
              href={activeResource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold"
            >
              Open resource <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ResourcePanel;
