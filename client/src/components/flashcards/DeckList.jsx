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

const CATEGORY_COLORS = {
  Programming: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  Frontend: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
  Backend: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  General: {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-100",
  },
};

export default function DeckList({ onStartStudy, onCreateNew }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // User details local storage se
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!myId) return;

    // 🔥 API Fix: userId pass kiya
    axios
      .get(`https://backend-6hhv.onrender.com/api/flashcards/decks/${myId}`)
      .then((r) => setDecks(r.data))
      .catch((err) => console.error("Deck Fetch Error:", err))
      .finally(() => setLoading(false));
  }, [myId]);

  const totalDue = decks.reduce((s, d) => s + (d.dueCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 h-full overflow-hidden flex flex-col">
      <div className="max-w-3xl mx-auto w-full">
        {/* 🧠 HEADER */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl border border-slate-100 p-5 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 italic uppercase">
                Memory Vault
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                Spaced Repetition System
              </p>
            </div>
          </div>

          {totalDue > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2 animate-pulse">
              <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />
              <span className="text-xs font-black text-orange-600 uppercase italic">
                {totalDue} Critical
              </span>
            </div>
          )}
        </div>

        {/* 📜 DECK GRID (Clean & Spacious) */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-20">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <Loader2
                className="animate-spin text-indigo-600 mb-3"
                size={40}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Syncing Decks...
              </p>
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold italic uppercase text-xs">
                No Decks Found in Archive
              </p>
            </div>
          ) : (
            decks.map((deck) => {
              const colors =
                CATEGORY_COLORS[deck.category] || CATEGORY_COLORS.General;
              return (
                <button
                  key={deck._id}
                  onClick={() => onStartStudy(deck)}
                  className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 flex items-center gap-5 text-left hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden"
                >
                  <div
                    className={`w-14 h-14 ${colors.bg} ${colors.border} border rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
                  >
                    <BookOpen className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-black text-base text-slate-800 uppercase italic tracking-tight truncate">
                      {deck.title}
                    </div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-widest mt-1 ${colors.text}`}
                    >
                      {deck.category}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 pr-2">
                    {deck.dueCount > 0 ? (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-orange-100">
                        {deck.dueCount} Due
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        Mastered
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}

          {/* ➕ CREATE DECK BUTTON */}
          <button
            onClick={onCreateNew}
            className="w-full border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">
              New Training Deck
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
