const express = require("express");
const router = express.Router();
const User = require("../models/User");
const TestResult = require("../models/TestResult"); // Jo history ke liye banaya tha
const FieldTemplate = require("../models/FieldTemplate");
const jwt = require("jsonwebtoken");
const CustomExam = require("../models/CustomExam");

const createFieldKey = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
};
// ==========================================
// 🛡️ SECURITY GUARD (Middleware)
// Ye function har admin route se pehle chalega
// ==========================================
const isAdmin = async (req, res, next) => {
  try {
    // Frontend se adminId aayegi headers mein
    const adminId = req.headers.adminid || req.query.adminId;

    if (!adminId) {
      return res
        .status(401)
        .json({ message: "Access Denied: No ID Provided." });
    }

    const user = await User.findById(adminId);

    // Check karo ki user exist karta hai aur uska role 'admin' hai
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Security Breach: You are not a Commander/Admin!" });
    }

    // Agar sab theek hai, toh aage badho
    next();
  } catch (err) {
    res.status(500).json({ message: "Server Error in Admin Verification" });
  }
};

// ==========================================
// 📊 1. GET PLATFORM STATS (Dashboard Data)
// ==========================================
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTestsTaken = await TestResult.countDocuments();

    const users = await User.find({}, "battlePoints");
    const totalXP = users.reduce(
      (acc, user) => acc + (user.battlePoints || 0),
      0,
    );

    // 🔥 UPGRADE 1: MONGODB AGGREGATION (Data Science Level Data Extraction)
    // Ye check karega ki kis Field (Data Science, Web Dev) mein kitne users hain
    const domainStatsRaw = await User.aggregate([
      { $group: { _id: "$field", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Clean up the data for frontend
    const domainStats = domainStatsRaw.map((d) => ({
      name: d._id || "Unassigned Matrix",
      count: d.count,
      percentage: Math.round((d.count / totalUsers) * 100) || 0,
    }));

    // 🔥 UPGRADE 2: TOP 3 COMMANDERS
    const topUsers = await User.find()
      .select("name battlePoints field")
      .sort({ battlePoints: -1 })
      .limit(3);

    res.json({
      totalUsers,
      totalTestsTaken,
      totalXP,
      domainStats,
      topUsers,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch matrix stats" });
  }
});

// ==========================================
// 👥 2. GET ALL USERS (For Leaderboard & Management)
// ==========================================
router.get("/users", isAdmin, async (req, res) => {
  try {
    // Saare users laao, par password hata do (-password).
    // Aur unhe Battle Points ke hisaab se descending order (-1) mein sort karo
    const users = await User.find()
      .select("-password")
      .sort({ battlePoints: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ==========================================
// ⚔️ 3. DELETE/BAN A USER (Admin Superpower)
// ==========================================
router.delete("/users/:targetId", isAdmin, async (req, res) => {
  try {
    const { targetId } = req.params;
    await User.findByIdAndDelete(targetId);
    // User ke saare test result bhi delete kar do
    await TestResult.deleteMany({ userId: targetId });

    res.json({
      message: "User successfully banned and removed from the system.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/users/:targetId/analytics", isAdmin, async (req, res) => {
  try {
    const { targetId } = req.params;

    const user = await User.findById(targetId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const testHistory = await TestResult.find({ userId: targetId });

    let tasks = [];
    let sessions = [];

    try {
      const Task = require("../models/Task");
      tasks = await Task.find({
        $or: [{ userId: targetId }, { user: targetId }],
      });
    } catch (e) {}

    try {
      const Session = require("../models/Session"); // Tumhara Mission Clock Model
      sessions = await Session.find({ userId: targetId });
    } catch (e) {}

    const allActivities = [];

    // 1. Session Data (Mission Clock) - Sabse detailed
    sessions.forEach((s) => {
      const topic = s.topicName || s.taskTitle || s.focusArea || "Deep Work";
      const reason = s.stopReason || s.pauseReason || s.reason || "Completed";
      const mins = s.duration || s.timeSpent || 0;

      allActivities.push({
        id: s._id,
        type: "session",
        topic: topic,
        startTime: s.startTime || s.createdAt, // Shuru kitne baje kiya
        endTime: s.endTime || s.updatedAt, // Khatam kitne baje kiya
        duration: mins,
        status:
          s.status === "completed"
            ? "Finished"
            : s.status === "paused"
              ? "Paused"
              : "Interrupted",
        reason: reason,
        date: s.createdAt, // Filter karne ke liye base date
      });
    });

    // 2. Mock Test Data
    testHistory.forEach((h) => {
      allActivities.push({
        id: h._id,
        type: "combat",
        topic: `Combat: ${h.topicName}`,
        startTime: h.createdAt,
        endTime: h.createdAt, // Test generally ek point par submit hota hai
        duration: 15, // Approx 15 mins agar exact na ho
        status: h.score >= h.totalQuestions * 10 * 0.8 ? "Passed" : "Failed",
        reason: `Score: ${h.score}`,
        date: h.createdAt,
      });
    });

    // 3. Task Data
    tasks.forEach((t) => {
      allActivities.push({
        id: t._id,
        type: "task",
        topic: `Task: ${t.title || "Mission"}`,
        startTime: t.createdAt,
        endTime: t.updatedAt || t.createdAt,
        duration: 0,
        status: t.status === "completed" ? "Completed" : "Pending",
        reason: t.description ? t.description.substring(0, 30) : "Task Update",
        date: t.updatedAt || t.createdAt,
      });
    });

    // Sort by Latest Date first
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalScore = 0,
      totalMaxScore = 0;
    testHistory.forEach((r) => {
      totalScore += r.score;
      totalMaxScore += r.totalQuestions * 10;
    });
    const averageAccuracy =
      totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    res.json({
      user,
      totalTests: testHistory.length,
      averageAccuracy,
      activities: allActivities, // Saara raw data bhej diya
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

router.post("/users/:targetId/impersonate", isAdmin, async (req, res) => {
  try {
    const { targetId } = req.params;

    // 1. Target user ko dhoondo
    const user = await User.findById(targetId);
    if (!user)
      return res.status(404).json({ message: "User matrix not found." });

    // 2. 🛡️ SECURITY CHECK: Ek Admin doosre Admin ke account me nahi ghus sakta
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Security Breach: Cannot impersonate another Commander!",
      });
    }

    // 3. Naya Token Banao (Master Key) - Sirf 2 ghante ke liye valid rakhte hain security ke liye
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // 4. Frontend ko User details aur Naya Token bhej do
    res.json({
      message: "Impersonation successful. Entering user matrix...",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        field: user.field,
        battlePoints: user.battlePoints,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Impersonation Error:", err);
    res.status(500).json({ error: "Failed to bypass user matrix." });
  }
});

router.get("/fields", async (req, res) => {
  try {
    const fields = await FieldTemplate.find().sort({ createdAt: -1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch domains" });
  }
});

// B. Create New Field
router.post("/fields", isAdmin, async (req, res) => {
  try {
    const { field } = req.body; // e.g., "Cyber Security"
    const fieldKey = createFieldKey(field); // ban jayega "cyber_security"
    const adminId = req.headers.adminid;

    const newField = new FieldTemplate({
      field,
      fieldKey,
      createdBy: adminId, // Tumhare schema ke hisaab se admin ki ID
    });

    await newField.save();
    res
      .status(201)
      .json({ message: "Domain added to Matrix", field: newField });
  } catch (err) {
    res.status(500).json({ error: "Domain already exists or creation failed" });
  }
});

// C. Update Existing Field
router.put("/fields/:id", isAdmin, async (req, res) => {
  try {
    const { field } = req.body;
    const fieldKey = createFieldKey(field);
    const adminId = req.headers.adminid;

    const updatedField = await FieldTemplate.findByIdAndUpdate(
      req.params.id,
      { field, fieldKey, updatedBy: adminId },
      { new: true },
    );
    res.json({ message: "Domain updated", field: updatedField });
  } catch (err) {
    res.status(500).json({ error: "Failed to update domain" });
  }
});

// D. Delete Field
router.delete("/fields/:id", isAdmin, async (req, res) => {
  try {
    await FieldTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: "Domain permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete domain" });
  }
});

router.post("/fields/:fieldId/exams", isAdmin, async (req, res) => {
  try {
    const { title, type, questions, timeLimit, totalMarks } = req.body;

    const newExam = new CustomExam({
      title,
      type,
      fieldId: req.params.fieldId, // URL se aayega
      questions,
      timeLimit,
      totalMarks,
    });

    await newExam.save();
    res
      .status(201)
      .json({ message: "Exam Successfully Vaulted!", exam: newExam });
  } catch (err) {
    res.status(500).json({ error: "Failed to create exam" });
  }
});

// B. Kisi ek Field ke saare tests mangwao
router.get("/fields/:fieldId/exams", async (req, res) => {
  try {
    const exams = await CustomExam.find({ fieldId: req.params.fieldId }).select(
      "-questions",
    ); // Bina questions ke list mangwao taaki fast ho
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// C. Test Delete Karo
router.delete("/exams/:examId", isAdmin, async (req, res) => {
  try {
    await CustomExam.findByIdAndDelete(req.params.examId);
    res.json({ message: "Exam deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
