const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, required: true }, // seconds
    breakReason: { type: String, required: true, trim: true },
    workDone: { type: String, required: true, trim: true },
    isStrictValid: { type: Boolean, default: true },
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true },
);

module.exports = mongoose.model("Session", SessionSchema);
