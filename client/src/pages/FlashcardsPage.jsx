import { useState } from "react";
import DeckList from "../components/flashcards/DeckList";
import FlashcardReview from "../components/flashcards/FlashcardReview";
import { X, Plus, ArrowLeft, Save, FolderPlus } from "lucide-react";
import axios from "axios";

const API = "https://backend-6hhv.onrender.com/api/flashcards";

export default function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState(null);
  const [mode, setMode] = useState("list"); // "list" | "study" | "addCard" | "addDeck"

  const [deckForm, setDeckForm] = useState({ title: "", category: "General" });
  const [cardForm, setCardForm] = useState({ frontText: "", backText: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Single refreshKey — DeckList ko prop se pass hoga
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  // ── CREATE DECK ───────────────────────────────────────────
  const handleAddDeck = async (e) => {
    e.preventDefault();
    if (!deckForm.title.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/decks`, { ...deckForm, userId: myId });
      setDeckForm({ title: "", category: "General" });
      refresh();
      setMode("list");
    } catch {
      alert("Deck create failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ── ADD CARD ──────────────────────────────────────────────
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardForm.frontText.trim() || !cardForm.backText.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/cards`, {
        deckId: activeDeck._id,
        ...cardForm,
        userId: myId,
      });
      setCardForm({ frontText: "", backText: "" });
      refresh();
      // Stay on same screen — user can keep adding cards
    } catch {
      alert("Card add failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ── STUDY MODE ────────────────────────────────────────────
  if (mode === "study" && activeDeck) {
    return (
      <FlashcardReview
        deck={activeDeck}
        onBack={() => {
          setMode("list");
          refresh(); // due counts update karo wapas aane pe
        }}
      />
    );
  }

  // ── ADD CARD SCREEN ───────────────────────────────────────
  if (mode === "addCard" && activeDeck) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              setMode("list");
              setCardForm({ frontText: "", backText: "" });
            }}
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:border-indigo-200 transition-all"
          >
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">
              Add Card
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
              Deck: {activeDeck.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleAddCard} className="space-y-6">
          <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block ml-1">
                Front — Question / Term
              </label>
              <textarea
                rows={3}
                value={cardForm.frontText}
                onChange={(e) =>
                  setCardForm((f) => ({ ...f, frontText: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="e.g. MP ki capital kya hai?"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block ml-1">
                Back — Answer / Definition
              </label>
              <textarea
                rows={3}
                value={cardForm.backText}
                onChange={(e) =>
                  setCardForm((f) => ({ ...f, backText: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="e.g. Bhopal"
              />
            </div>
          </div>

          {/* Save & Add Another */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase italic text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save & Add Another ⚡"}
          </button>

          {/* Done adding — go back */}
          <button
            type="button"
            onClick={() => setMode("list")}
            className="w-full border-2 border-dashed border-slate-200 rounded-[2rem] py-4 text-[10px] font-black uppercase text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
          >
            Done Adding Cards → Go to Vault
          </button>
        </form>
      </div>
    );
  }

  // ── DECK LIST + ADD DECK MODAL ────────────────────────────
  return (
    <div className="h-full w-full relative">
      {/* ✅ refreshKey prop pass karo DeckList ko */}
      <DeckList
        refreshKey={refreshKey}
        onStartStudy={(deck) => {
          setActiveDeck(deck);
          setMode("study");
        }}
        onAddCard={(deck) => {
          setActiveDeck(deck);
          setMode("addCard");
        }}
        onAddDeck={() => setMode("addDeck")}
      />

      {/* Add Deck Modal */}
      {mode === "addDeck" && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FolderPlus className="text-indigo-600" size={22} />
                <h2 className="text-xl font-black text-slate-800 uppercase italic">
                  New Deck
                </h2>
              </div>
              <button
                onClick={() => setMode("list")}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddDeck} className="space-y-4">
              <input
                required
                value={deckForm.title}
                onChange={(e) =>
                  setDeckForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Deck title e.g. MPPSC History"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 placeholder:font-normal placeholder:text-slate-300"
              />
              <select
                value={deckForm.category}
                onChange={(e) =>
                  setDeckForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 appearance-none cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Programming">Programming</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="GK">GK</option>
                <option value="Science">Science</option>
                <option value="Maths">Maths</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <Plus size={18} />
                {loading ? "Creating..." : "Initialize Deck"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
