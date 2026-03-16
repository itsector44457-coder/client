const express = require("express");
const router = express.Router();
// Controller functions ko import kiya
const {
  createDeck,
  getAllDecks,
  createFlashcard,
  getDueCards,
  reviewCard,
} = require("../controllers/flashcardController");

// 🗂️ DECK ROUTES
// Saare Decks lane ke liye (GET) aur Naya Deck banane ke liye (POST)
router.get("/decks/:userId", getAllDecks); // Dashboard pe decks dikhane ke liye
router.post("/decks", createDeck);

// 🃏 FLASHCARD ROUTES
// Naya card add karne ke liye
router.post("/cards", createFlashcard);

// Jo cards aaj "Due" hain revision ke liye
router.get("/cards/due/:userId/:deckId", getDueCards);

// Card ko review karne ke baad SRS update karne ke liye (PATCH/POST)
router.patch("/cards/:id/review", reviewCard);

module.exports = router;
