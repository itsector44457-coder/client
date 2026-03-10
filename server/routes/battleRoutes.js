const express = require("express");
const router = express.Router();
const Battle = require("../models/Battle");
const User = require("../models/User");

const idsEqual = (a, b) => String(a) === String(b);

const populateBattle = (query) =>
  query
    .populate("challengerId", "name field battlePoints")
    .populate("opponentId", "name field battlePoints")
    .populate("winnerId", "name field battlePoints")
    .populate("loserId", "name field battlePoints");

router.post("/challenge", async (req, res) => {
  try {
    const { challengerId, opponentId } = req.body || {};

    if (!challengerId || !opponentId) {
      return res
        .status(400)
        .json({ message: "challengerId and opponentId are required" });
    }

    if (idsEqual(challengerId, opponentId)) {
      return res.status(400).json({ message: "You cannot challenge yourself" });
    }

    const [challenger, opponent] = await Promise.all([
      User.findById(challengerId).select("following"),
      User.findById(opponentId).select("_id"),
    ]);

    if (!challenger || !opponent) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = (challenger.following || []).some((id) =>
      idsEqual(id, opponentId),
    );
    if (!isFollowing) {
      return res
        .status(403)
        .json({ message: "Challenge bhejne ke liye pehle follow karo" });
    }

    const existing = await Battle.findOne({
      status: { $in: ["pending", "active"] },
      $or: [
        { challengerId, opponentId },
        { challengerId: opponentId, opponentId: challengerId },
      ],
    });

    if (existing) {
      const battle = await populateBattle(Battle.findById(existing._id));
      return res.status(200).json({
        message: "Battle already pending/active",
        battle,
        existing: true,
      });
    }

    const created = await Battle.create({
      challengerId,
      opponentId,
      status: "pending",
    });

    const battle = await populateBattle(Battle.findById(created._id));
    return res.status(201).json(battle);
  } catch (err) {
    return res.status(500).json({ message: "Challenge failed", error: err.message });
  }
});

router.get("/incoming/:userId", async (req, res) => {
  try {
    const battles = await populateBattle(
      Battle.find({
        opponentId: req.params.userId,
        status: "pending",
      }).sort({ createdAt: -1 }),
    );

    return res.json(battles);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Incoming challenges load failed", error: err.message });
  }
});

router.get("/active/:userId", async (req, res) => {
  try {
    const battle = await populateBattle(
      Battle.findOne({
        status: "active",
        $or: [{ challengerId: req.params.userId }, { opponentId: req.params.userId }],
      }).sort({ startedAt: -1 }),
    );

    return res.json(battle || null);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Active battle load failed", error: err.message });
  }
});

router.get("/history/:userId", async (req, res) => {
  try {
    const battles = await populateBattle(
      Battle.find({
        status: "completed",
        $or: [{ challengerId: req.params.userId }, { opponentId: req.params.userId }],
      }).sort({ endedAt: -1 }),
    );

    return res.json(battles);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Battle history load failed", error: err.message });
  }
});

router.put("/:battleId/accept", async (req, res) => {
  try {
    const { userId } = req.body || {};
    const battle = await Battle.findById(req.params.battleId);

    if (!battle || battle.status !== "pending") {
      return res.status(404).json({ message: "Pending battle not found" });
    }

    if (!idsEqual(userId, battle.opponentId)) {
      return res.status(403).json({ message: "Only invited user can accept" });
    }

    battle.status = "active";
    battle.startedAt = new Date();
    await battle.save();

    const populated = await populateBattle(Battle.findById(battle._id));
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Accept failed", error: err.message });
  }
});

router.put("/:battleId/reject", async (req, res) => {
  try {
    const { userId } = req.body || {};
    const battle = await Battle.findById(req.params.battleId);

    if (!battle || battle.status !== "pending") {
      return res.status(404).json({ message: "Pending battle not found" });
    }

    if (!idsEqual(userId, battle.opponentId)) {
      return res.status(403).json({ message: "Only invited user can reject" });
    }

    battle.status = "rejected";
    battle.endedAt = new Date();
    await battle.save();

    const populated = await populateBattle(Battle.findById(battle._id));
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Reject failed", error: err.message });
  }
});

router.put("/:battleId/lose", async (req, res) => {
  try {
    const { loserId, reason = "Session terminated first" } = req.body || {};
    if (!loserId) {
      return res.status(400).json({ message: "loserId is required" });
    }

    const battle = await Battle.findOne({
      _id: req.params.battleId,
      status: "active",
    });

    if (!battle) {
      return res.status(404).json({ message: "Active battle not found" });
    }

    const isLoserInBattle =
      idsEqual(battle.challengerId, loserId) || idsEqual(battle.opponentId, loserId);
    if (!isLoserInBattle) {
      return res.status(403).json({ message: "Invalid loserId for this battle" });
    }

    const winnerId = idsEqual(battle.challengerId, loserId)
      ? battle.opponentId
      : battle.challengerId;

    const updateResult = await Battle.updateOne(
      { _id: battle._id, status: "active" },
      {
        $set: {
          status: "completed",
          endedAt: new Date(),
          loserId,
          winnerId,
          loseReason: reason,
        },
      },
    );

    if (!updateResult.modifiedCount) {
      return res
        .status(409)
        .json({ message: "Battle already resolved by another action" });
    }

    await Promise.all([
      User.updateOne(
        { _id: winnerId },
        { $inc: { battlePoints: battle.winnerPoints || 15 } },
      ),
      User.updateOne(
        { _id: loserId },
        { $inc: { battlePoints: battle.loserPoints || -10 } },
      ),
    ]);

    const finalBattle = await populateBattle(Battle.findById(battle._id));
    return res.json(finalBattle);
  } catch (err) {
    return res.status(500).json({ message: "Battle resolve failed", error: err.message });
  }
});

module.exports = router;
