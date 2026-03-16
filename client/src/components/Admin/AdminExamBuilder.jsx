import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Clock,
  Target,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  KeyRound,
} from "lucide-react";

const AdminExamBuilder = () => {
  const { adminId } = useOutletContext();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 AI MAGIC STATES
  const [rawAIText, setRawAIText] = useState("");
  const [isAIExtracting, setIsAIExtracting] = useState(false);

  const [answerKeyString, setAnswerKeyString] = useState("");
  const [examDetails, setExamDetails] = useState({
    fieldId: "",
    title: "",
    type: "mock_test",
    timeLimit: 60,
    totalMarks: 100,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
    },
  ]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(
          `https://backend-6hhv.onrender.com/api/admin/fields`,
        );
        setFields(res.data);
      } catch (err) {
        console.error("Failed to fetch fields");
      }
    };
    fetchFields();
  }, []);

  const handleDetailChange = (e) =>
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });

  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);

  const removeQuestion = (index) => {
    if (questions.length === 1) return alert("Minimum 1 question is required!");
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (text, qIndex) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (text, qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  // ==========================================
  // 🤖 THE AI MAGIC FUNCTION
  // ==========================================
  const handleAIExtract = async () => {
    if (!rawAIText.trim()) return alert("Please paste the raw PDF text first!");

    setIsAIExtracting(true);
    try {
      const res = await axios.post(
        `https://backend-6hhv.onrender.com/api/admin/extract-ai`,
        { rawText: rawAIText },
      );

      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
        setRawAIText("");
        alert(
          `🔥 AI Magic Success! ${res.data.length} questions extracted perfectly.`,
        );
      } else {
        alert("AI couldn't find questions. Please check the text format.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI Server busy or API key issue. Check console.");
    } finally {
      setIsAIExtracting(false);
    }
  };

  // ==========================================
  // 🔑 SMART ANSWER KEY MAPPER
  // ==========================================
  const applyAnswerKey = () => {
    const cleanKey = answerKeyString.replace(/[^A-Da-d]/g, "").toUpperCase();
    if (cleanKey.length === 0)
      return alert("Invalid answer key. Only use A, B, C, D.");

    const updated = [...questions];
    let mappedCount = 0;

    for (let i = 0; i < updated.length && i < cleanKey.length; i++) {
      const char = cleanKey[i];
      if (char === "A") updated[i].correctOptionIndex = 0;
      else if (char === "B") updated[i].correctOptionIndex = 1;
      else if (char === "C") updated[i].correctOptionIndex = 2;
      else if (char === "D") updated[i].correctOptionIndex = 3;
      mappedCount++;
    }

    setQuestions(updated);
    setAnswerKeyString("");
    alert(`🔥 Magic! ${mappedCount} questions mapped to the Answer Key!`);
  };

  const handleSaveExam = async () => {
    if (!examDetails.fieldId) return alert("Please select a Domain first!");
    if (!examDetails.title) return alert("Please enter an Exam Title!");
    setLoading(true);
    try {
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.options[q.correctOptionIndex],
        explanation: q.explanation,
      }));
      await axios.post(
        `https://backend-6hhv.onrender.com/api/admin/fields/${examDetails.fieldId}/exams`,
        { ...examDetails, questions: formattedQuestions },
        { headers: { adminid: adminId } },
      );
      alert("🔥 Exam Successfully Published!");
      navigate("/admin/fields");
    } catch (err) {
      alert("Failed to save exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-28 font-sans">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Back to Domains
      </button>

      <div className="mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText size={24} />
          </div>
          Exam Builder
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-2">
          Create new mock tests or past papers for the network.
        </p>
      </div>

      {/* 🟢 STEP 1: EXAM METADATA */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          Exam Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Target Domain
            </label>
            <select
              name="fieldId"
              value={examDetails.fieldId}
              onChange={handleDetailChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
            >
              <option value="" disabled>
                -- Select Domain --
              </option>
              {fields.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.field}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Exam Type
            </label>
            <select
              name="type"
              value={examDetails.type}
              onChange={handleDetailChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
            >
              <option value="mock_test">Custom Mock Test</option>
              <option value="past_paper">Previous Year Paper</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Time Limit (Mins)
            </label>
            <div className="relative group">
              <Clock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
              <input
                type="number"
                name="timeLimit"
                value={examDetails.timeLimit}
                onChange={handleDetailChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Exam Title
            </label>
            <input
              type="text"
              name="title"
              value={examDetails.title}
              onChange={handleDetailChange}
              placeholder="e.g. MPPSC 2023 Prelims"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 🤖 NEW STEP: AI MAGIC EXTRACTOR */}
      <div className="bg-indigo-50/50 border border-indigo-100 p-6 sm:p-8 rounded-2xl mb-8">
        <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-500" /> AI Question
          Extractor
        </h3>
        <p className="text-sm text-slate-600 font-medium mb-4">
          Paste raw garbled text from PDFs here. The AI will instantly clean it
          up and generate ready-to-use questions.
        </p>
        <textarea
          rows="4"
          placeholder="Paste raw PDF text here..."
          value={rawAIText}
          onChange={(e) => setRawAIText(e.target.value)}
          className="w-full bg-white border border-indigo-200 text-slate-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm leading-relaxed"
        />
        <button
          onClick={handleAIExtract}
          disabled={isAIExtracting}
          className="w-full sm:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
        >
          {isAIExtracting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processing AI...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Extract via AI
            </>
          )}
        </button>
      </div>

      {/* 🟢 STEP 2: QUESTIONS BUILDER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Questions List{" "}
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-sm">
            {questions.length}
          </span>
        </h3>

        {/* Answer Key Mapper */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
          <input
            type="text"
            placeholder="Paste Key (A B C D...)"
            value={answerKeyString}
            onChange={(e) => setAnswerKeyString(e.target.value)}
            className="bg-transparent text-slate-800 px-4 py-2 text-sm outline-none w-48 font-medium placeholder:text-slate-400"
          />
          <button
            onClick={applyAnswerKey}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 border-l border-slate-200"
          >
            <KeyRound size={14} /> Map Keys
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl relative group hover:border-indigo-200 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold">
                Question {qIndex + 1}
              </span>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove Question"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <textarea
              rows="2"
              placeholder="Enter question text here..."
              value={q.questionText}
              onChange={(e) => handleQuestionTextChange(e.target.value, qIndex)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 mb-5 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm font-medium placeholder:text-slate-400"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    q.correctOptionIndex === optIndex
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    onClick={() => handleCorrectAnswerSelect(qIndex, optIndex)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                      q.correctOptionIndex === optIndex
                        ? "border-emerald-500"
                        : "border-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {q.correctOptionIndex === optIndex && (
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(e.target.value, qIndex, optIndex)
                    }
                    className="w-full bg-transparent text-slate-800 text-sm outline-none font-medium placeholder:text-slate-400"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={18} /> Add New Question
      </button>

      {/* 🟢 BOTTOM SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 flex justify-center md:justify-end md:pr-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSaveExam}
          disabled={loading}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}{" "}
          Save & Publish Exam
        </button>
      </div>
    </div>
  );
};

export default AdminExamBuilder;
