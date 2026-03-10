const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // 🔥 Security Module Import

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ek email se do account nahi banenge
    },
    password: {
      type: String,
      required: true, // Ye encrypt hoke save hoga
    },
    field: {
      type: String,
      required: true, // e.g., MPPSC, Coding, Data Science
      trim: true,
    },
    isFieldAdmin: {
      type: Boolean,
      default: false,
    },
    // Social Graph (Followers & Following)
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    completedNodes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "RoadmapNode" },
    ],
    battlePoints: {
      type: Number,
      default: 100,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    cheaterTag: {
      type: Boolean,
      default: false, // Default sab shareef hain
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student", // Naya account banne par default student rahega
    },
    lastStreakDate: {
      type: String, // YYYY-MM-DD
      default: "",
    },
    streakShields: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

// ==========================================
// 🔐 SECURITY MIDDLEWARE (INDUSTRY STANDARD)
// ==========================================

// 1. Pre-save Hook: Data save hone se theek pehle chalega
// 🔥 FIX: Yahan se 'next' hata diya gaya hai. Async function automatically promise handle kar leta hai.
UserSchema.pre("save", async function () {
  // Agar user ne sirf apna naam ya streak update ki hai (password nahi chheda), toh seedha aage badho
  if (!this.isModified("password")) {
    return; // next() ki jagah sirf return
  }

  try {
    // Password ko encrypt (hash) karna
    const salt = await bcrypt.genSalt(10); // 10 rounds of salting (Secure & Fast)
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; // Error aane par backend usko properly catch kar lega
  }
});

// 2. Match Password Method: Login ke waqt kaam aayega
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // enteredPassword (jo user ne form me dala) aur this.password (jo DB me hashed hai) ko compare karega
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
