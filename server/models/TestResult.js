const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: { type: String, required: true }, // AI Roadmap topic ID
    topicName: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    difficulty: { type: String, default: "Normal" },
  },
  { timestamps: true }, // Ye automatically Date aur Time save kar lega
);

module.exports = mongoose.model("TestResult", testResultSchema);
