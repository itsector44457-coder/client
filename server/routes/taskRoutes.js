const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { maybeAwardDailyStreak } = require("../utils/streakEngine");

const buildDayRangeByOffset = (dateString, tzOffsetMinutes = 0) => {
  const parts = (dateString || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;

  const [year, month, day] = parts;
  const startMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) + tzOffsetMinutes * 60000;
  const endMs = startMs + 24 * 60 * 60 * 1000 - 1;

  return { start: new Date(startMs), end: new Date(endMs) };
};

const getTasksByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const tzOffset = Number(req.query.tzOffset || 0);
    const range = buildDayRangeByOffset(date, tzOffset);

    if (!range) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const tasks = await Task.find({
      userId,
      createdAt: { $gte: range.start, $lte: range.end },
    }).sort({ createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 1) Naya Task banana
router.post("/add", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5) Specific date ke tasks nikalna (timezone-safe history endpoint)
router.get("/history/:userId/:date", getTasksByDate);

// Backward-compatible date route
router.get("/:userId/:date", getTasksByDate);

// 2) User ke saare Tasks nikalna
router.get("/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3) Task update karna (complete/edit)
router.put("/:id", async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updatePayload, "isCompleted")) {
      if (updatePayload.isCompleted) {
        const nowIso = updatePayload.completedAt || new Date().toISOString();
        updatePayload.completedAt = new Date(nowIso);
        updatePayload.completedDate =
          updatePayload.completedDate || String(nowIso).split("T")[0];
      } else {
        updatePayload.completedAt = null;
        updatePayload.completedDate = "";
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    let streak = null;
    if (
      updatedTask.isCompleted &&
      updatedTask.priority === "High" &&
      updatedTask.completedDate
    ) {
      streak = await maybeAwardDailyStreak({
        userId: updatedTask.userId,
        date: updatedTask.completedDate,
      });
    }

    res.json({
      ...updatedTask.toObject(),
      _streak: streak,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4) Task delete karna
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task khatam!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
