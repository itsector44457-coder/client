// Backend: models/Battle.js
const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  field: String, // e.g. Data Science
  pointsStaked: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Battle", battleSchema);
