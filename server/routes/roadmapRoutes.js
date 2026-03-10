// routes/roadmapRoutes.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const RoadmapNode = require("../models/RoadmapNode");
const User = require("../models/User");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
router.post("/generate-roadmap", async (req, res) => {
  try {
    const { field, duration } = req.body;

    // Pehle purana data check karo aur clean karo agar naya AI roadmap ban raha hai
    const existingNodes = await RoadmapNode.find({ field });
    if (existingNodes.length > 0) {
      await RoadmapNode.deleteMany({ field });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Create a comprehensive roadmap for the entire field of ${field} for a duration of ${duration}.
  
  OUTPUT FORMAT:
  Return ONLY a valid JSON ARRAY. No explanations, no markdown. Do not include \`\`\`json.
  [
    {
      "phase": 1,
      "subject": "Core Basics", 
      "title": "Introduction to ${field}",
      "days": "Week 1-2",
      "fullStructure": [
        {"moduleName": "Fundamentals", "content": "Basic concepts"}
      ],
      "3dPosition": [0, 0, 0],
      "tasks": ["Task 1"],
      "howToStudy": "Focus on practicals.",
      "resources": "Official documentation."
    }
  ]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 🔥 BULLETPROOF JSON CLEANER
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI did not return a valid array format.");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const roadmapData = JSON.parse(jsonString);

    // Prepare Data Safely
    const nodesToInsert = roadmapData.map((node, index) => ({
      field: field,
      order: node.phase || index + 1,
      subject: node.subject || "Core Module",
      title: node.title || `Phase ${index + 1}`,
      description:
        node.howToStudy || `AI Generated modules for ${field} mastery.`,
      estimatedTime: node.days || "1 Week",
      fullStructure: node.fullStructure || [],
      position3D: node["3dPosition"] || [0, 0, 0],
      tasks: node.tasks || [],
      howToStudy: node.howToStudy || "",
      resources: node.resources || "",
    }));

    // Bulk Insert into MongoDB
    await RoadmapNode.insertMany(nodesToInsert);

    res.status(201).json({ message: "AI Matrix injected successfully!" });
  } catch (err) {
    console.error("🔥 AI ERROR:", err.message);
    res.status(500).json({ error: "AI Engine Parsing Failed!" });
  }
});

// ==========================================
// 🟢 2. GET DYNAMIC ROADMAP (For User Frontend)
// ==========================================
router.get("/:field", async (req, res) => {
  try {
    const { field } = req.params;
    const { userId } = req.query;

    const nodes = await RoadmapNode.find({ field }).sort({ order: 1 });
    if (nodes.length === 0) return res.json([]);

    if (!userId) return res.json(nodes);

    const user = await User.findById(userId);
    const completedNodeIds =
      user.completedNodes.map((id) => id.toString()) || [];

    let activeFound = false;

    const dynamicRoadmap = nodes.map((node) => {
      const isCompleted = completedNodeIds.includes(node._id.toString());
      let status = "locked";

      if (isCompleted) {
        status = "completed";
      } else if (!activeFound) {
        status = "active";
        activeFound = true;
      }

      return {
        ...node._doc,
        status,
      };
    });

    res.json(dynamicRoadmap);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load path", error: err.message });
  }
});

// ==========================================
// 🟡 3. MARK NODE AS COMPLETED (Progress Tracker)
// ==========================================
router.post("/complete/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { userId } = req.body;

    // 🔥 INDUSTRY HACK: Direct Update Bypass
    // $addToSet array mein ID daalega (agar pehle se nahi hai toh)
    // $inc tumhare battlePoints mein 20 add kar dega bina kisi error ke!
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { completedNodes: nodeId },
        $inc: { battlePoints: 20 },
      },
      { new: true }, // Ye updated data wapas return karega
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Commander not found in database!" });
    }

    res.json({
      message: "Node Conquered! +20 XP",
      battlePoints: updatedUser.battlePoints,
    });
  } catch (err) {
    // Agar ab bhi fail hua, toh exact error terminal mein dikhega!
    console.error("🔥 CONQUER ERROR:", err.message);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});
module.exports = router;
