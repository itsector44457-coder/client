const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresAt: {
      type: Date,
      default: null, // Agar null hai toh kabhi delete nahi hoga
      index: { expires: 0 }, // MongoDB khud check karega jab ye waqt aayega toh document delete kar dega
    },
    content: { type: String, required: true },
    field: { type: String, required: true },
    imageUrl: { type: String, default: "" },

    // Likes: users list to support like/unlike checks
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Comments: embedded lightweight thread per post
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Repost metadata
    isRepost: { type: Boolean, default: false },
    originalAuthor: { type: String },
  },
  { timestamps: true },
); // Kab post kiya, uska time automatically save hoga

module.exports = mongoose.model("Post", PostSchema);
