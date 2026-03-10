const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Coding", "MPPSC", "Aarambh Institute", "Personal"],
      default: "Personal",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    completedDate: { type: String, default: "" }, // YYYY-MM-DD
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", TaskSchema);
