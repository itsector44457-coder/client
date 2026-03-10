const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource"); // Tumhara Mongoose Model

// 🔥 FIX: Add Resource Endpoint
router.post("/add", async (req, res) => {
  try {
    const { title, url, type, userId, examId, topicId } = req.body;

    const newResource = new Resource({
      title,
      url,
      type,
      userId,
      examId,
      topicId,
      isBookmarked: false, // Default value
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource); // Success Signal
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Vault Injection Failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Frontend se jo params bhej rahe ho unhe nikalna
    const { topicId, examId, userId, type } = req.query;

    let query = { userId, examId, topicId };

    // Agar user ne specific type (PDF/YouTube) filter kiya ho
    if (type && type !== "All" && type !== "Saved") {
      query.type = type;
    }

    // Agar "Saved" (Bookmark) wala filter on ho
    if (type === "Saved") {
      query.isBookmarked = true;
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.status(200).json(resources); // Success: Data wapas bhej diya
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Vault Data Retrieval Failed" });
  }
});

// Bookmark Toggle logic (Just in case ye bhi 404 de raha ho)
router.put("/:id/bookmark", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    resource.isBookmarked = !resource.isBookmarked;
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).send("Bookmark Toggle Failed");
  }
});

module.exports = router;
