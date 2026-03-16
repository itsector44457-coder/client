import { useState, useEffect } from "react";
import {
  Brain,
  BookOpen,
  ChevronRight,
  Flame,
  Loader2,
  Plus,
} from "lucide-react";
import axios from "axios";

const API = "https://backend-6hhv.onrender.com/api/flashcards";

export default function DeckList({
  onStartStudy,
  onAddCard,
  onAddDeck,
  refreshKey,
}) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  // ✅ FIX: refreshKey dependency add kiya — card/deck add hone pe auto-refresh
  useEffect(() => {
    if (!myId) return;
    setLoading(true);
    axios
      .get(`${API}/decks/${myId}`)
      .then((r) => setDecks(r.data))
      .catch((err) => console.error("Decks Load Error:", err))
      .finally(() => setLoading(false));
  }, [myId, refreshKey]);

  const totalDue = decks.reduce((s, d) => s + (d.dueCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 italic uppercase">
              Memory Vault
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {decks.length} Deck{decks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {totalDue > 0 && (
          <div className="bg-orange-50 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-xs font-black text-orange-600 uppercase italic">
              {totalDue} Due
            </span>
          </div>
        )}
      </div>

      {/* Deck List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 opacity-50">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading Archives...
            </p>
          </div>
        ) : decks.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <BookOpen className="text-slate-300" size={48} />
            <p className="text-sm font-black text-slate-400 uppercase italic">
              No Decks Yet
            </p>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest">
              Create your first archive below
            </p>
          </div>
        ) : (
          decks.map((deck) => (
            <div
              key={deck._id}
              onClick={() => onStartStudy(deck)}
              className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <BookOpen className="text-indigo-600" size={24} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-800 uppercase italic truncate">
                  {deck.title}
                </div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                  {deck.category}
                </div>
              </div>

              {/* Add Card Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCard(deck);
                }}
                title="Add Card"
                className="p-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-xl transition-all shrink-0"
              >
                <Plus size={18} />
              </button>

              {/* Due Badge */}
              <div className="shrink-0">
                {deck.dueCount > 0 ? (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                    {deck.dueCount} Due
                  </span>
                ) : (
                  <span className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Mastered
                  </span>
                )}
              </div>

              <ChevronRight
                size={16}
                className="text-slate-200 group-hover:text-indigo-400 transition-colors shrink-0"
              />
            </div>
          ))
        )}

        {/* Create New Deck Button */}
        <button
          onClick={onAddDeck}
          className="w-full border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] p-6 flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-white transition-all text-slate-400 hover:text-indigo-600"
        >
          <Plus size={24} />
          <p className="text-[10px] font-black uppercase tracking-widest">
            Create New Archive
          </p>
        </button>
      </div>
    </div>
  );
}
