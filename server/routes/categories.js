const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// 1. Saari categories fetch karna
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Nayi Category banana (Initialise Domain)
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    emoji: req.body.emoji,
    description: req.body.description,
  });
  try {
    const newCat = await category.save();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(400).json({ message: "Bhai, ye domain shayad pehle se hai!" });
  }
});

// 3. Sub-fields add karne ke liye update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Delete Domain
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
