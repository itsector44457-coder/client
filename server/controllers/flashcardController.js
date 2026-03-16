const Deck = require("../models/Deck");
const Flashcard = require("../models/Flashcard");

// ── Deck Controllers ──────────────────────────────────────────

const createDeck = async (req, res) => {
  try {
    // 🔥 FIX: req.user._id ki jagah req.body se userId liya
    const { title, category, userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const deck = await Deck.create({ title, category, userId });
    res.status(201).json(deck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllDecks = async (req, res) => {
  try {
    const { userId } = req.params; // 🔥 FIX: Params se userId aayega

    const decks = await Deck.find({ userId }).sort("-createdAt");

    // Attach "due today" count to each deck
    const now = new Date();
    const decksWithDue = await Promise.all(
      decks.map(async (deck) => {
        const dueCount = await Flashcard.countDocuments({
          deckId: deck._id,
          userId,
          nextReviewDate: { $lte: now },
        });
        return { ...deck.toObject(), dueCount };
      }),
    );
    res.json(decksWithDue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Flashcard Controllers ─────────────────────────────────────

const createFlashcard = async (req, res) => {
  try {
    const { deckId, frontText, backText, userId } = req.body;

    const card = await Flashcard.create({
      deckId,
      frontText,
      backText,
      userId,
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDueCards = async (req, res) => {
  try {
    const { deckId, userId } = req.params;

    const cards = await Flashcard.find({
      deckId,
      userId,
      nextReviewDate: { $lte: new Date() }, // Jo aaj ya usse pehle due hain
    }).sort("nextReviewDate");

    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SRS Update (The Magic Algorithm) ──────────────────────────

const reviewCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 'again' | 'hard' | 'good' | 'easy'

    const card = await Flashcard.findById(id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    let { interval, repetition, easeFactor } = card;

    // 🧠 SM-2 ALGORITHM CORE
    if (rating === "again") {
      // Galat jawaab: Sab reset, kal wapas aayega
      repetition = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      // Sahi jawaab
      if (repetition === 0) {
        interval = 1; // Pehli baar sahi bataya toh kal aayega
      } else if (repetition === 1) {
        interval = 6; // Dusri baar bhi sahi bataya toh 6 din baad
      } else {
        // Uske baad magic multipliers lagenge
        if (rating === "hard") interval = Math.round(interval * 1.2);
        else if (rating === "good")
          interval = Math.round(interval * easeFactor);
        else if (rating === "easy")
          interval = Math.round(interval * easeFactor * 1.3);
      }

      // Difficulty factor adjust karo
      if (rating === "hard") easeFactor = Math.max(1.3, easeFactor - 0.15);
      else if (rating === "easy") easeFactor = Math.min(3.0, easeFactor + 0.15);

      repetition += 1;
    }

    // Agli date set karo
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const updated = await Flashcard.findByIdAndUpdate(
      id,
      { interval, repetition, easeFactor, nextReviewDate },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDeck,
  getAllDecks,
  createFlashcard,
  getDueCards,
  reviewCard,
};
