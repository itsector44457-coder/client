// Result save karne ka function
exports.saveBattleResult = async (req, res) => {
  const { winnerId, loserId, field, points } = req.body;
  try {
    const newBattle = new Battle({
      players: [winnerId, loserId],
      winner: winnerId,
      loser: loserId,
      field,
      pointsStaked: points,
    });
    await newBattle.save();

    // Winner ke points badhao
    await User.findByIdAndUpdate(winnerId, {
      $inc: { battlePoints: points, wins: 1 },
    });
    // Loser ke stats update karo
    await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });

    res.json({ message: "Battle result archived at Battle Hub!" });
  } catch (err) {
    res.status(500).send("Sync Error");
  }
};
