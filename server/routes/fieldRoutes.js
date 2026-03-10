const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FieldTemplate = require("../models/FieldTemplate");
const SYLLABUS_DATA = require("../data/syllabusData");

const DEFAULT_FIELDS = ["Coding", "Data Science", "MPPSC", "Maths"];

const normalizeFieldKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const toDisplayField = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeTopics = (topics) => {
  const list = Array.isArray(topics)
    ? topics
    : String(topics || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim());

  return [...new Set(list.filter(Boolean))];
};

const normalizeSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return [];
  return subjects
    .map((subject) => {
      const name = String(subject?.name || "").trim();
      const topics = normalizeTopics(subject?.topics || []);
      if (!name) return null;
      return { name, topics };
    })
    .filter(Boolean);
};

const requireFieldAdmin = async (adminId) => {
  if (!adminId) return { allowed: false, message: "adminId is required" };
  const admin = await User.findById(adminId).select("isFieldAdmin");
  if (!admin) return { allowed: false, message: "Admin user not found" };
  if (!admin.isFieldAdmin) {
    return { allowed: false, message: "Field admin access required" };
  }
  return { allowed: true };
};

router.get("/", async (req, res) => {
  try {
    const templates = await FieldTemplate.find()
      .select("field subjects")
      .lean();
    const templateMap = new Map(
      templates.map((item) => [
        normalizeFieldKey(item.field),
        {
          field: item.field,
          subjectCount: item.subjects?.length || 0,
        },
      ]),
    );

    const mergedFields = [...DEFAULT_FIELDS];
    templates.forEach((item) => mergedFields.push(item.field));

    const uniqueFields = [
      ...new Set(mergedFields.map((item) => toDisplayField(item))),
    ];
    const fields = uniqueFields
      .filter(Boolean)
      .map((field) => {
        const meta = templateMap.get(normalizeFieldKey(field));
        return {
          field,
          hasAdminTemplate: Boolean(meta),
          subjectCount: meta?.subjectCount || 0,
        };
      })
      .sort((a, b) => a.field.localeCompare(b.field));

    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/template", async (req, res) => {
  try {
    // Saare templates fetch karo taki admin panel par dikh sakein
    const templates = await FieldTemplate.find().lean();
    res.json(templates);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Admin template fetch failed: " + err.message });
  }
});

router.get("/template/:field", async (req, res) => {
  try {
    const requestedField = toDisplayField(req.params.field);
    const fieldKey = normalizeFieldKey(requestedField);

    const doc = await FieldTemplate.findOne({ fieldKey }).lean();
    if (doc) {
      return res.json({
        field: doc.field,
        subjects: doc.subjects || [],
        source: "admin",
      });
    }

    const staticTemplate =
      SYLLABUS_DATA[requestedField] ||
      SYLLABUS_DATA[requestedField.toUpperCase()] ||
      SYLLABUS_DATA[requestedField.toLowerCase()] ||
      null;

    if (!staticTemplate) {
      return res.status(404).json({ message: "Field template not found" });
    }

    return res.json({
      field: requestedField,
      subjects: staticTemplate.map((subject) => ({
        name: subject.name,
        topics: subject.topics || [],
      })),
      source: "default",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/admin/template", async (req, res) => {
  try {
    const { adminId, field, subjects } = req.body;
    const gate = await requireFieldAdmin(adminId);
    if (!gate.allowed) return res.status(403).json({ message: gate.message });

    const displayField = toDisplayField(field);
    if (!displayField) {
      return res.status(400).json({ message: "field is required" });
    }

    const cleanedSubjects = normalizeSubjects(subjects);
    if (!cleanedSubjects.length) {
      return res
        .status(400)
        .json({ message: "At least one subject with topics is required" });
    }

    const doc = await FieldTemplate.findOneAndUpdate(
      { fieldKey: normalizeFieldKey(displayField) },
      {
        $set: {
          field: displayField,
          subjects: cleanedSubjects,
          updatedBy: adminId,
        },
        $setOnInsert: {
          createdBy: adminId,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/admin/subject", async (req, res) => {
  try {
    const { adminId, field, subjectName, topics } = req.body;
    const gate = await requireFieldAdmin(adminId);
    if (!gate.allowed) return res.status(403).json({ message: gate.message });

    const displayField = toDisplayField(field);
    const cleanSubject = String(subjectName || "").trim();
    const cleanTopics = normalizeTopics(topics);

    if (!displayField) {
      return res.status(400).json({ message: "field is required" });
    }
    if (!cleanSubject) {
      return res.status(400).json({ message: "subjectName is required" });
    }
    if (!cleanTopics.length) {
      return res
        .status(400)
        .json({ message: "At least one topic is required" });
    }

    const fieldKey = normalizeFieldKey(displayField);
    const doc = await FieldTemplate.findOne({ fieldKey });

    if (!doc) {
      const created = await FieldTemplate.create({
        field: displayField,
        subjects: [{ name: cleanSubject, topics: cleanTopics }],
        createdBy: adminId,
        updatedBy: adminId,
      });
      return res.status(201).json(created);
    }

    const existingSubject = doc.subjects.find(
      (item) =>
        normalizeFieldKey(item.name) === normalizeFieldKey(cleanSubject),
    );
    if (existingSubject) {
      existingSubject.topics = [
        ...new Set([...(existingSubject.topics || []), ...cleanTopics]),
      ];
      existingSubject.name = cleanSubject;
    } else {
      doc.subjects.push({ name: cleanSubject, topics: cleanTopics });
    }

    doc.field = displayField;
    doc.updatedBy = adminId;
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
