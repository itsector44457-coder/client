const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["YouTube", "PDF", "Photo", "Note", "Article"],
    default: "Note",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tumhara User model name
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam", // Tumhara Exam model name
    required: true,
  },
  topicId: {
    type: String, // Agar MongoDB ID use kar rahe ho toh ObjectId rakho
    required: true,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resource", ResourceSchema);
