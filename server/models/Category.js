const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Coding"
  emoji: { type: String, default: "🚀" }, // e.g., "💻"
  description: { type: String },
  subFields: [
    {
      name: { type: String, required: true }, // e.g., "React JS"
      description: { type: String },
    },
  ],
});

module.exports = mongoose.model("Category", CategorySchema);
