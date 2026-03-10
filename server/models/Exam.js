const mongoose = require("mongoose");

const QuizScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100, required: true },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const TopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    lastInteractedAt: { type: Date, default: Date.now },
    lastCheckedAt: { type: Date, default: null },
    quizScores: { type: [QuizScoreSchema], default: [] },
    linkedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  { _id: true },
);

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    topics: { type: [TopicSchema], default: [] },
  },
  { _id: true },
);

const ExamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    examCode: {
      type: String,
      trim: true,
      required: true,
    },
    subjects: { type: [SubjectSchema], default: [] },
  },
  { timestamps: true },
);

ExamSchema.index({ userId: 1, examCode: 1 }, { unique: true });

module.exports = mongoose.model("Exam", ExamSchema);
