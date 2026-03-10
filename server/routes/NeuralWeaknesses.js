// 2. Neural Weaknesses (Based on Mock Tests)
router.get("/api/users/:userId/weaknesses", async (req, res) => {
  // Logic to calculate weaknesses from mock results
  const weaknesses = [
    { subject: "Maths", topic: "Linear Algebra", accuracy: 42 },
    { subject: "Data Science", topic: "Python Logic", accuracy: 55 },
  ];
  res.json(weaknesses);
});
