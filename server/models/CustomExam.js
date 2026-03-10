const mongoose = require("mongoose");

const CustomExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "MPPSC 2023 Prelims"
    type: {
      type: String,
      enum: ["mock_test", "past_paper"], // Pata chalega ki ye kya hai
      required: true,
    },
    // 🔥 THE LINK: Ye test kis Field ka hai?
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FieldTemplate",
      required: true,
    },
    // Questions ka Array
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }], // 4 options
        correctAnswer: { type: String, required: true },
        explanation: { type: String }, // Answer ka logic (optional)
      },
    ],
    timeLimit: { type: Number, default: 60 }, // Minutes me
    totalMarks: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CustomExam", CustomExamSchema);
