const express = require("express");
const router = express.Router();

// In-memory live presence store: { [userId]: { field, updatedAt } }
const livePresence = new Map();
const PRESENCE_TTL_MS = 70 * 1000;

const cleanupStalePresence = () => {
  const now = Date.now();
  for (const [userId, entry] of livePresence.entries()) {
    if (!entry?.updatedAt || now - entry.updatedAt > PRESENCE_TTL_MS) {
      livePresence.delete(userId);
    }
  }
};

// Ping route: mark user active/inactive for live study indicator.
router.post("/ping", (req, res) => {
  try {
    const { userId, field, active = true } = req.body || {};
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    cleanupStalePresence();

    if (!active) {
      livePresence.delete(String(userId));
      return res.json({ ok: true, active: false });
    }

    livePresence.set(String(userId), {
      field: field || "",
      updatedAt: Date.now(),
    });

    return res.json({ ok: true, active: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Count route: returns active learner count globally or by field.
router.get("/count", (req, res) => {
  try {
    cleanupStalePresence();
    const fieldFilter = (req.query.field || "").toString().trim();

    let count = 0;
    for (const entry of livePresence.values()) {
      if (!fieldFilter || entry.field === fieldFilter) {
        count += 1;
      }
    }

    return res.json({ count, field: fieldFilter || "all" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
