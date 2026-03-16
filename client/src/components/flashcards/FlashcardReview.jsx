import { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle,
  Trophy,
  ArrowLeft,
  Brain,
  Zap,
} from "lucide-react";
import axios from "axios";

const RATINGS = [
  {
    key: "again",
    label: "Again",
    sub: "< 1m",
    emoji: "🔴",
    cls: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
  },
  {
    key: "hard",
    label: "Hard",
    sub: "1d",
    emoji: "🟠",
    cls: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
  },
  {
    key: "good",
    label: "Good",
    sub: "3d",
    emoji: "🟢",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
  },
  {
    key: "easy",
    label: "Easy",
    sub: "7d",
    emoji: "🔵",
    cls: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100",
  },
];

export default function FlashcardReview({ deck, onBack }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!myId || !deck._id) return;
    // 🔥 FIX: Added userId to the due cards API
    axios
      .get(
        `https://backend-6hhv.onrender.com/api/flashcards/cards/due/${myId}/${deck._id}`,
      )
      .then((r) => setCards(r.data))
      .catch((err) => console.error("Fetch Error:", err))
      .finally(() => setLoading(false));
  }, [deck._id, myId]);

  const handleFlip = () => !flipped && setFlipped(true);

  const handleRate = useCallback(
    async (rating) => {
      const card = cards[index];
      try {
        await axios.patch(
          `https://backend-6hhv.onrender.com/api/flashcards/cards/${card._id}/review`,
          { rating },
        );
        setResults((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
        setFlipped(false);

        // Smooth transition to next card
        setTimeout(() => {
          if (index + 1 >= cards.length) setDone(true);
          else setIndex((i) => i + 1);
        }, 300);
      } catch (err) {
        console.error("Review Update Failed", err);
      }
    },
    [cards, index],
  );

  const progress = cards.length ? (index / cards.length) * 100 : 0;
  const current = cards[index];

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 opacity-50">
        <RotateCcw className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Loading Neural Cards...
        </p>
      </div>
    );

  if (done)
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-emerald-100 mb-6">
          <Trophy className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 italic uppercase">
            Sync Complete!
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Memory Matrix Updated for {deck.title}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-10">
          {RATINGS.map((r) => (
            <div
              key={r.key}
              className={`rounded-3xl p-4 text-center border-2 ${r.cls}`}
            >
              <div className="text-2xl mb-1">{r.emoji}</div>
              <div className="text-xl font-black">{results[r.key]}</div>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-60">
                {r.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-3 text-xs font-black uppercase italic text-white bg-indigo-600 px-8 py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <ArrowLeft size={16} /> Back to Vault
        </button>
      </div>
    );

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col h-full overflow-hidden">
      {/* 🧠 HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:border-indigo-200 transition-all active:scale-90"
        >
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-800 uppercase italic truncate">
            {deck.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase">
              {index + 1}/{cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* 🃏 3D FLIP CARD */}
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div
          onClick={handleFlip}
          className="w-full max-w-md cursor-pointer group"
          style={{ perspective: "2000px" }}
        >
          <div
            className="relative w-full h-72 sm:h-80 transition-transform duration-700 ease-in-out"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-xl shadow-slate-100 flex flex-col items-center justify-center p-8 text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <Brain className="text-indigo-400" size={14} />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Neural Input
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-800 italic uppercase leading-tight px-4">
                {current?.frontText}
              </p>
              <div className="absolute bottom-6 text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse italic">
                Click to reveal answer
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-indigo-600 border-2 border-indigo-400 rounded-[2.5rem] shadow-xl shadow-indigo-100 flex flex-col items-center justify-center p-8 text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <Zap className="text-indigo-200" size={14} />
                <span className="text-[8px] font-black text-indigo-200 uppercase tracking-[0.2em]">
                  Matrix Answer
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {current?.backText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🕹️ CONTROLS */}
      <div className="h-32 flex flex-col justify-end">
        {flipped ? (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <p className="text-[9px] font-black text-center text-slate-400 uppercase tracking-[0.3em] mb-4 italic">
              How well did you process this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(r.key);
                  }}
                  className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 text-[10px] font-black uppercase italic transition-all active:scale-95 ${r.cls}`}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span>{r.label}</span>
                  <span className="opacity-50 text-[8px]">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-slate-400 font-black uppercase italic text-[10px] animate-pulse">
            <RotateCcw size={14} className="text-indigo-500" />
            Engage with card to flip
          </div>
        )}
      </div>
    </div>
  );
}
