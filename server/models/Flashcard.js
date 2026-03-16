const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    frontText: { type: String, required: true },
    backText: { type: String, required: true },

    // 🧠 Spaced Repetition System (SRS) Fields
    nextReviewDate: { type: Date, default: Date.now }, // Date.now Mongoose mein zyada clean rehta hai
    interval: { type: Number, default: 0 }, // Days until next review
    repetition: { type: Number, default: 0 }, // How many times reviewed successfully
    easeFactor: { type: Number, default: 2.5 }, // Multiplier for difficulty
  },
  { timestamps: true },
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
