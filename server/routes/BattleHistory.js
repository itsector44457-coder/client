router.get("/api/battles/history/:userId", async (req, res) => {
  const history = await Battle.find({
    $or: [
      { challengerId: req.params.userId },
      { opponentId: req.params.userId },
    ],
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .populate("winnerId loserId");
  res.json(history);
});
