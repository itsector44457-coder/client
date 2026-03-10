const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true }, // e.g., "Coding"
    subject: { type: String, required: true }, // e.g., "React JS"
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam.subjects.topics",
    },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 options
    correctAnswer: { type: Number, required: true }, // Index (0 to 3)
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    explanation: { type: String }, // Taki user galti sudhar sake
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", QuestionSchema);
