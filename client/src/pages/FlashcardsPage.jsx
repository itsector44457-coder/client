import { useState } from "react";
import DeckList from "../components/flashcards/DeckList";
import FlashcardReview from "../components/flashcards/FlashcardReview";
import axios from "axios";
import { X, Plus } from "lucide-react";

export default function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ title: "", category: "General" });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  // ➕ CREATE DECK HANDLER
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://backend-6hhv.onrender.com/api/flashcards/decks",
        {
          ...newDeck,
          userId: myId,
        },
      );
      setIsModalOpen(false);
      setNewDeck({ title: "", category: "General" });
      // Refresh page to show new deck
      window.location.reload();
    } catch (err) {
      alert("Deck creation failed!");
    }
  };

  return (
    <div className="h-full w-full relative">
      {activeDeck ? (
        <FlashcardReview deck={activeDeck} onBack={() => setActiveDeck(null)} />
      ) : (
        <DeckList
          onStartStudy={setActiveDeck}
          onCreateNew={() => setIsModalOpen(true)}
        />
      )}

      {/* 🟢 CREATE DECK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase italic">
                New Neural Deck
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Deck Title
                </label>
                <input
                  required
                  value={newDeck.title}
                  onChange={(e) =>
                    setNewDeck({ ...newDeck, title: e.target.value })
                  }
                  placeholder="e.g. React Hooks, MPPSC History..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Category
                </label>
                <select
                  value={newDeck.category}
                  onChange={(e) =>
                    setNewDeck({ ...newDeck, category: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 mt-1 appearance-none"
                >
                  <option value="General">General</option>
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-indigo-100 mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus size={18} /> Initialize Deck
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
