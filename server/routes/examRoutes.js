const express = require("express");
const router = express.Router();
const Exam = require("../models/Exam");
const Task = require("../models/Task");
const FieldTemplate = require("../models/FieldTemplate");
const SYLLABUS_DATA = require("../data/syllabusData");

const DAY_MS = 24 * 60 * 60 * 1000;
const WEAK_TOPIC_DAYS = 7;
const LOW_QUIZ_SCORE = 45;

const EXAM_TEMPLATES = SYLLABUS_DATA;
const SUPPORTED_EXAM_CODES = Object.keys(EXAM_TEMPLATES);
const EXAM_CODE_ALIASES = {
  dsssb: "DSSSB",
  nic: "NIC",
  "ibps it": "IBPS IT",
  ibps: "IBPS IT",
  "upsc statistics": "UPSC Statistics",
  upsc: "UPSC Statistics",
  mppsc: "MPPSC",
  "data science": "Data Science",
  datascience: "Data Science",
  coding: "Coding",
  code: "Coding",
  maths: "Maths",
  math: "Maths",
};

const normalizeExamCode = (rawCode) => {
  const value = String(rawCode || "").trim();
  if (!value) return "";

  const lowered = value.toLowerCase();
  if (EXAM_CODE_ALIASES[lowered]) return EXAM_CODE_ALIASES[lowered];

  const direct = SUPPORTED_EXAM_CODES.find(
    (code) => code.toLowerCase() === lowered,
  );
  return direct || value;
};

const normalizeFieldKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const toDisplayCode = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeTemplateSubjects = (subjects = []) =>
  (Array.isArray(subjects) ? subjects : [])
    .map((subject) => ({
      name: String(subject?.name || "").trim(),
      topics: (Array.isArray(subject?.topics) ? subject.topics : [])
        .map((topic) => String(topic || "").trim())
        .filter(Boolean),
    }))
    .filter((subject) => subject.name && subject.topics.length > 0);

const resolveTemplateForCode = async (rawCode) => {
  const normalizedCode = normalizeExamCode(rawCode);
  const codeCandidates = [
    toDisplayCode(normalizedCode),
    toDisplayCode(rawCode),
  ].filter(Boolean);

  const uniqueCandidates = [...new Set(codeCandidates)];
  for (const candidate of uniqueCandidates) {
    const fieldTemplate = await FieldTemplate.findOne({
      fieldKey: normalizeFieldKey(candidate),
    }).lean();

    if (fieldTemplate?.subjects?.length) {
      return {
        examCode: toDisplayCode(fieldTemplate.field),
        templateSubjects: normalizeTemplateSubjects(fieldTemplate.subjects),
        source: "admin",
      };
    }
  }

  for (const candidate of uniqueCandidates) {
    const staticTemplate = EXAM_TEMPLATES[candidate];
    if (staticTemplate?.length) {
      return {
        examCode: candidate,
        templateSubjects: normalizeTemplateSubjects(staticTemplate),
        source: "default",
      };
    }
  }

  return null;
};

const cloneTemplateSubjects = (templateSubjects) =>
  templateSubjects.map((subject) => ({
    name: subject.name,
    topics: (subject.topics || []).map((topic) => ({
      title: topic,
      isCompleted: false,
      lastInteractedAt: new Date(),
      lastCheckedAt: null,
      quizScores: [],
      linkedTaskId: null,
    })),
  }));

const averageScore = (quizScores = []) => {
  if (!quizScores.length) return null;
  const total = quizScores.reduce((sum, item) => sum + Number(item.score || 0), 0);
  return Number((total / quizScores.length).toFixed(1));
};

const toComputedTopic = (topic) => {
  const avgScore = averageScore(topic.quizScores || []);
  const ageMs = Date.now() - new Date(topic.lastInteractedAt || Date.now()).getTime();
  const staleUnchecked = !topic.isCompleted && ageMs > WEAK_TOPIC_DAYS * DAY_MS;
  const weakByScore = avgScore !== null && avgScore < LOW_QUIZ_SCORE;

  return {
    ...topic,
    averageQuizScore: avgScore,
    isWeak: staleUnchecked || weakByScore,
  };
};

const toComputedExam = (examDoc) => {
  const exam = examDoc.toObject();
  let totalTopics = 0;
  let totalCompleted = 0;

  const subjects = exam.subjects.map((subject) => {
    const topics = subject.topics.map((topic) => toComputedTopic(topic));
    const done = topics.filter((topic) => topic.isCompleted).length;
    const total = topics.length;
    totalTopics += total;
    totalCompleted += done;

    return {
      ...subject,
      topics,
      progressPercent: total > 0 ? Math.round((done / total) * 100) : 0,
      completedCount: done,
      totalCount: total,
      weakCount: topics.filter((topic) => topic.isWeak).length,
    };
  });

  return {
    ...exam,
    subjects,
    progressPercent: totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0,
    completedCount: totalCompleted,
    totalCount: totalTopics,
  };
};

const findTopicInExam = (exam, topicId) => {
  for (const subject of exam.subjects) {
    const topic = subject.topics.id(topicId);
    if (topic) return { subject, topic };
  }
  return { subject: null, topic: null };
};

const getTaskCategoryByExam = (examCode) => {
  if (examCode === "MPPSC") return "MPPSC";
  if (examCode === "Data Science") return "Personal";
  if (examCode === "Coding") return "Coding";
  if (examCode === "Maths") return "Personal";
  if (examCode === "NIC" || examCode === "IBPS IT") return "Coding";
  return "Personal";
};

const ensureExamDocument = async ({ userId, examCode, seededSubjects }) => {
  const filter = { userId, examCode };
  let created = false;

  try {
    const updateResult = await Exam.updateOne(
      filter,
      {
        $setOnInsert: {
          userId,
          examCode,
          subjects: seededSubjects,
        },
      },
      { upsert: true },
    );

    created = Number(updateResult?.upsertedCount || 0) > 0;
  } catch (err) {
    // Parallel bootstrap requests (e.g. React StrictMode dev) may race.
    // If another request inserted first, duplicate key should be treated as success.
    if (err?.code !== 11000) {
      throw err;
    }
  }

  const examDoc = await Exam.findOne(filter);
  return { examDoc, created };
};

router.post("/bootstrap", async (req, res) => {
  try {
    const { userId, examCodes, forceReseed = false } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const requestedCodes = [
      ...new Set(
        (Array.isArray(examCodes) && examCodes.length > 0
          ? examCodes
          : SUPPORTED_EXAM_CODES
        )
          .map((code) => toDisplayCode(code))
          .filter(Boolean),
      ),
    ];

    if (!requestedCodes.length) {
      return res.status(400).json({ message: "examCodes are required" });
    }

    const resolvedTemplatesRaw = await Promise.all(
      requestedCodes.map((code) => resolveTemplateForCode(code)),
    );
    const invalidCodes = requestedCodes.filter(
      (_, index) => !resolvedTemplatesRaw[index],
    );

    if (invalidCodes.length > 0) {
      return res.status(400).json({
        message: `Invalid exam code: ${invalidCodes[0]}`,
        invalidCodes,
        supportedExamCodes: SUPPORTED_EXAM_CODES,
      });
    }

    const resolvedTemplateMap = new Map();
    resolvedTemplatesRaw.forEach((item) => {
      if (item) resolvedTemplateMap.set(item.examCode, item);
    });

    const resolvedTemplates = [...resolvedTemplateMap.values()];
    const results = [];
    await Promise.all(
      resolvedTemplates.map(async ({ examCode, templateSubjects, source }) => {
        const seededSubjects = cloneTemplateSubjects(templateSubjects);
        const { examDoc, created } = await ensureExamDocument({
          userId,
          examCode,
          seededSubjects,
        });

        if (!examDoc) {
          results.push({ examCode, status: "failed" });
          return;
        }

        const hasSubjects = Array.isArray(examDoc.subjects) && examDoc.subjects.length > 0;
        const hasTopics = hasSubjects && examDoc.subjects.some((s) => (s.topics || []).length > 0);
        if (forceReseed || !hasSubjects || !hasTopics) {
          examDoc.subjects = seededSubjects;
          await examDoc.save();
          results.push({ examCode, status: "reseeded", source });
          return;
        }

        results.push({ examCode, status: created ? "created" : "exists", source });
      }),
    );

    const examCodesToReturn = resolvedTemplates.map((item) => item.examCode);
    const exams = await Exam.find({ userId, examCode: { $in: examCodesToReturn } })
      .sort({ examCode: 1 });
    res.status(201).json({
      results,
      exams: exams.map((exam) => toComputedExam(exam)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId, examCode } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const query = { userId };
    if (examCode) {
      const normalizedExamCode = normalizeExamCode(examCode);
      query.examCode = new RegExp(
        `^${normalizedExamCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      );
    }

    const exams = await Exam.find(query).sort({ examCode: 1 });
    res.json(exams.map((exam) => toComputedExam(exam)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:examId/topics/:topicId/toggle", async (req, res) => {
  try {
    const { examId, topicId } = req.params;
    const { isCompleted } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { topic } = findTopicInExam(exam, topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const nextCompleted =
      typeof isCompleted === "boolean" ? isCompleted : !topic.isCompleted;

    topic.isCompleted = nextCompleted;
    topic.lastInteractedAt = new Date();
    topic.lastCheckedAt = nextCompleted ? new Date() : null;

    await exam.save();
    res.json(toComputedExam(exam));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:examId/topics/:topicId/quiz", async (req, res) => {
  try {
    const { examId, topicId } = req.params;
    const score = Number(req.body.score);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({ message: "score must be between 0 and 100" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { topic } = findTopicInExam(exam, topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.quizScores.push({ score, takenAt: new Date() });
    topic.lastInteractedAt = new Date();

    await exam.save();
    res.json(toComputedExam(exam));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:examId/topics/:topicId/task-link", async (req, res) => {
  try {
    const { examId, topicId } = req.params;
    const { userId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { subject, topic } = findTopicInExam(exam, topicId);
    if (!topic || !subject) return res.status(404).json({ message: "Topic not found" });

    const ownerId = userId || exam.userId;
    let linkedTask = null;

    if (topic.linkedTaskId) {
      linkedTask = await Task.findById(topic.linkedTaskId);
    }

    if (!linkedTask) {
      linkedTask = await Task.create({
        userId: ownerId,
        title: `[${exam.examCode}] ${subject.name} - ${topic.title}`,
        description: `Syllabus topic linked from ${exam.examCode}`,
        category: getTaskCategoryByExam(exam.examCode),
        priority: "High",
        isCompleted: false,
      });

      topic.linkedTaskId = linkedTask._id;
      topic.lastInteractedAt = new Date();
      await exam.save();
    }

    res.status(201).json({
      task: linkedTask,
      exam: toComputedExam(exam),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:examId/subjects/:subjectId/topics", async (req, res) => {
  try {
    const { examId, subjectId } = req.params;
    const { title } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const subject = exam.subjects.id(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    subject.topics.push({
      title: String(title).trim(),
      isCompleted: false,
      lastInteractedAt: new Date(),
      lastCheckedAt: null,
      quizScores: [],
    });

    await exam.save();
    res.status(201).json(toComputedExam(exam));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
