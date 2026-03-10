const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CustomExam = require("../models/CustomExam");
const FieldTemplate = require("../models/FieldTemplate");
const CombatResult = require("../models/CombatResult");

const {
  MIN_DAILY_STUDY_SECONDS,
  calculateDailyStreakCriteria,
} = require("../utils/streakEngine");

const getDateByOffset = (tzOffsetMinutes = 0) => {
  const date = new Date();
  const localMs = date.getTime() - tzOffsetMinutes * 60000;
  return new Date(localMs).toISOString().split("T")[0];
};

// 1. GET: Saare users ki list bhejna (Taki hum unhe follow kar sakein)
router.get("/", async (req, res) => {
  try {
    // .select('-password') ka matlab hai ki password frontend par mat bhejna (Security!)
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/mark-cheater", async (req, res) => {
  try {
    const { email } = req.body;

    // User ko dhoondho aur uske cheaterTag ko true kar do
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { cheaterTag: true },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    console.log(`🚨 CHEATER MARKED IN MATRIX: ${email}`);
    res.json({ message: "Cheater Tag applied!", user: updatedUser });
  } catch (err) {
    console.error("Mark Cheater Error:", err);
    res.status(500).json({ error: "System Error" });
  }
});

router.get("/:userId/weaknesses", async (req, res) => {
  try {
    const { userId } = req.params;

    // Check karo ki user exist karta hai ya nahi
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found in Universe" });
    }

    // 🔥 DYNAMIC DATA: Filhal hum ye bhej rahe hain,
    // baad mein ise Mock Test ke results se calculate karenge.
    const neuralGaps = [
      { subject: "Mathematics", topic: "Linear Algebra", accuracy: 35 },
      { subject: "Data Science", topic: "Python Logic", accuracy: 52 },
      { subject: "Coding", topic: "Array Manipulation", accuracy: 48 },
    ];

    res.json(neuralGaps);
  } catch (err) {
    res.status(500).json({ message: "Neural Sync Error: " + err.message });
  }
});

router.post("/save-post", async (req, res) => {
  const { userId, postId } = req.body;
  const user = await User.findById(userId);

  const isAlreadySaved = user.savedPosts.includes(postId);

  if (isAlreadySaved) {
    // Unsave logic
    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
  } else {
    // Save logic
    user.savedPosts.push(postId);
  }

  await user.save();
  res.json({ isSaved: !isAlreadySaved });
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "User profile nahi mili" });
  }
});

router.get("/:id/streak", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "streakCount streakShields lastStreakDate",
    );

    if (!user) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    const tzOffset = Number(req.query.tzOffset || 0);
    const today = getDateByOffset(tzOffset);
    const criteria = await calculateDailyStreakCriteria(req.params.id, today);

    res.json({
      streakCount: user.streakCount,
      streakShields: user.streakShields,
      lastStreakDate: user.lastStreakDate,
      today,
      minimumStudySeconds: MIN_DAILY_STUDY_SECONDS,
      todayProgress: criteria,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. PUT: Kisi ko Follow ya Unfollow karna
router.put("/:id/follow", async (req, res) => {
  try {
    // req.params.id = Jisko hum follow karne wale hain
    // req.body.currentUserId = Jo follow kar raha hai (Humara khud ka ID)

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User nahi mila bhai!" });
    }

    // Check karo ki kya hum isko pehle se follow kar rahe hain?
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Agar haan, toh Unfollow kar do
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      await userToFollow.updateOne({
        $pull: { followers: req.body.currentUserId },
      });
      res
        .status(200)
        .json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Agar nahi, toh Follow kar lo
      await currentUser.updateOne({ $push: { following: req.params.id } });
      await userToFollow.updateOne({
        $push: { followers: req.body.currentUserId },
      });
      res
        .status(200)
        .json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/saved", async (req, res) => {
  try {
    const { id } = req.params;

    // User ko dhoondo aur uske 'savedPosts' array ko populate karo
    // Isse humein sirf IDs nahi, balki poori post ka data (text, image) mil jayega
    const user = await User.findById(id).populate({
      path: "savedPosts",
      model: "Post", // Ensure karo ki tumhara Post model ka naam yahi hai
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sirf saved posts bhej do
    res.json(user.savedPosts || []);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/exams", async (req, res) => {
  try {
    const { field } = req.query; // Frontend bacche ki field bheja ga (e.g., "Data Science")

    // 1. Pehle us field ki ID dhoondo
    const fieldDoc = await FieldTemplate.findOne({ field: field });
    if (!fieldDoc)
      return res.status(404).json({ message: "Field matrix not found" });

    // 2. Us ID wale saare Active Exams nikal lo
    // Note: Hum questions ka correct answer nahi bhejenge, warna baccha hack kar lega! (Lekin abhi simple rakhte hain, sab bhej dete hain)
    const exams = await CustomExam.find({
      fieldId: fieldDoc._id,
      isActive: true,
    });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Matrix connection lost." });
  }
});

router.post("/combat-result", async (req, res) => {
  try {
    const {
      userId,
      examId,
      examTitle,
      score,
      totalQuestions,
      percentage,
      isCheated,
    } = req.body;

    const newResult = new CombatResult({
      userId,
      examId,
      examTitle,
      score,
      totalQuestions,
      percentage,
      isCheated,
    });

    await newResult.save();
    res.status(201).json({ message: "Result saved to Matrix Vault!" });
  } catch (err) {
    console.error("Save Result Error:", err);
    res.status(500).json({ error: "Result save fail ho gaya." });
  }
});

// 2. History Dikhane Ki API
router.get("/combat-history/:userId", async (req, res) => {
  try {
    const history = await CombatResult.find({ userId: req.params.userId }).sort(
      { createdAt: -1 },
    );
    res.json(history);
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ error: "History fetch nahi ho paayi." });
  }
});

module.exports = router;
