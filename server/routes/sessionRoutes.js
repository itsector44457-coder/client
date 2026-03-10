const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const { maybeAwardDailyStreak } = require("../utils/streakEngine");

const isNonEmptyText = (value) =>
  typeof value === "string" && value.trim().length > 0;

router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      duration,
      breakReason,
      workDone,
      date,
      startTime,
      endTime,
      isStrictValid,
    } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ message: "duration must be greater than 0" });
    }

    if (!isNonEmptyText(breakReason) || !isNonEmptyText(workDone)) {
      return res
        .status(400)
        .json({ message: "breakReason and workDone are required" });
    }

    if (!isNonEmptyText(date)) {
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    }

    const parsedEnd = endTime ? new Date(endTime) : new Date();
    const parsedStart = startTime
      ? new Date(startTime)
      : new Date(parsedEnd.getTime() - duration * 1000);

    const saved = await Session.create({
      userId,
      duration,
      breakReason: breakReason.trim(),
      workDone: workDone.trim(),
      isStrictValid: isStrictValid !== false,
      date: date.trim(),
      startTime: parsedStart,
      endTime: parsedEnd,
    });

    const streak = await maybeAwardDailyStreak({
      userId,
      date: date.trim(),
    });

    res.status(201).json({
      ...saved.toObject(),
      _streak: streak,
    });
  } catch (err) {
    res.status(500).json({ message: "Session save failed", error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.find({ userId }).sort({
      date: -1,
      createdAt: -1,
    });

    const grouped = sessions.reduce((acc, session) => {
      if (!acc[session.date]) acc[session.date] = [];
      acc[session.date].push(session);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Session fetch failed", error: err.message });
  }
});

module.exports = router;
