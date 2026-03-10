// server/models/CombatResult.js
const mongoose = require("mongoose");

const CombatResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomExam",
      required: true,
    },
    examTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isCheated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CombatResult", CombatResultSchema);
