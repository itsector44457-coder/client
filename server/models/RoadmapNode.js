const mongoose = require("mongoose");

const RoadmapNodeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String }, // Purani requirement ke liye
    order: { type: Number, required: true },
    estimatedTime: { type: String, default: "1 Week" },

    // 🔥 NAYE AI FIELDS JO PEHLE MISSING THE
    subject: { type: String },
    fullStructure: [
      {
        moduleName: { type: String },
        content: { type: String },
      },
    ],
    tasks: [{ type: String }],
    howToStudy: { type: String },
    resources: { type: String },
    position3D: { type: [Number], default: [0, 0, 0] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RoadmapNode", RoadmapNodeSchema);
