const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeField = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

// ==========================================
// 1. REGISTER (Naya Account Banana)
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, field, adminCode } = req.body;
    const finalField = normalizeField(field);
    if (!finalField) {
      return res
        .status(400)
        .json({ message: "Field select karna zaroori hai." });
    }

    // Check karo ki email pehle se toh nahi hai
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "Bhai, ye email pehle se register hai!" });

    const providedAdminCode = String(adminCode || "").trim();
    const configuredAdminCode = String(
      process.env.FIELD_ADMIN_CODE || "",
    ).trim();
    const isFieldAdmin = configuredAdminCode
      ? providedAdminCode === configuredAdminCode
      : Boolean(providedAdminCode);

    // Database mein save karo
    user = new User({
      name,
      email,
      password, // Mongoose isko khud encrypt karega pre-save hook se
      field: finalField,
      isFieldAdmin,
      // 🔥 FIX: 'role: user.role' hata diya.
      // Mongoose apne aap 'default: "student"' laga dega.
    });

    await user.save();

    res.status(201).json({ message: "Account mast ban gaya! Ab login karo." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. LOGIN (System mein ghusna)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password, selectedField } = req.body;

    // User dhoondho
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User nahi mila, pehle register karo." });

    // Password Check
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Password galat hai mere bhai!" });

    const finalField = normalizeField(selectedField);
    if (finalField && finalField !== user.field) {
      user.field = finalField;
      await user.save();
    }

    // JWT Token Banao
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔥 FIX: Frontend ko 'role' aur 'battlePoints' bhej diya!
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        field: user.field,
        isFieldAdmin: Boolean(user.isFieldAdmin),
        streakCount: user.streakCount,
        streakShields: user.streakShields,
        lastStreakDate: user.lastStreakDate,
        battlePoints: user.battlePoints, // XP update
        role: user.role, // 👈 THE GOD MODE KEY
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
