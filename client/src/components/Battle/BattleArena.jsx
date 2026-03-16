import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Swords,
  Clock,
  Play,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

const BattleArena = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeExam, setActiveExam] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [warnings, setWarnings] = useState(0);

  const arenaRef = useRef(null);
  const activeExamRef = useRef(null);
  const selectedAnswersRef = useRef({});
  const isSubmittingRef = useRef(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userField = localStorage.getItem("userField");

  useEffect(() => {
    activeExamRef.current = activeExam;
  }, [activeExam]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  /* =============================
        FETCH EXAMS
  ============================= */
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(
          `https://backend-6hhv.onrender.com/api/user/exams?field=${userField}`,
        );
        setExams(res.data);
      } catch (err) {
        console.error("Exams fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [userField]);

  /* =============================
        ANTI CHEAT SYSTEM
  ============================= */
  useEffect(() => {
    const handleCheatWarning = () => {
      if (!activeExamRef.current || isSubmittingRef.current) return;

      setWarnings((prev) => {
        const newCount = prev + 1;

        if (newCount >= 3) {
          submitExam(true);
        } else {
          alert(
            `🚨 CHEATING WARNING (${newCount}/3)\nTab switching or exiting fullscreen is prohibited!`,
          );

          try {
            if (!document.fullscreenElement && arenaRef.current) {
              const elem = arenaRef.current;
              if (elem.requestFullscreen)
                elem.requestFullscreen().catch(() => {});
              else if (elem.webkitRequestFullscreen)
                elem.webkitRequestFullscreen();
            }
          } catch (e) {
            console.log("Fullscreen request failed", e);
          }
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden && activeExamRef.current) handleCheatWarning();
    };

    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        activeExamRef.current
      )
        handleCheatWarning();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  /* =============================
        START EXAM
  ============================= */
  const startExam = async (exam) => {
    try {
      if (arenaRef.current) {
        const elem = arenaRef.current;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen)
          await elem.webkitRequestFullscreen();
      }
    } catch {
      alert("Please allow Fullscreen to start the test!");
      return;
    }

    isSubmittingRef.current = false;
    setWarnings(0);
    setActiveExam(exam);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTestResult(null);
  };

  /* =============================
        SELECT OPTION
  ============================= */
  const handleSelectOption = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: option,
    });
  };

  /* =============================
        SUBMIT EXAM
  ============================= */
  const submitExam = async (isCheatSubmit = false) => {
    if (
      !isCheatSubmit &&
      !window.confirm("Are you sure you want to finish the combat?")
    )
      return;

    isSubmittingRef.current = true;

    // 🔥 CRASH PROOF FULLSCREEN EXIT
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen)
          await document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    } catch (fsError) {
      console.log("Fullscreen exit ignored", fsError);
    }

    const currentExam = activeExamRef.current;
    const currentAnswers = selectedAnswersRef.current;

    if (!currentExam) return;

    let score = 0;
    currentExam.questions.forEach((q, index) => {
      if (currentAnswers[index] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / currentExam.questions.length) * 100);

    const finalScore = isCheatSubmit ? 0 : score;
    const finalPercentage = isCheatSubmit ? 0 : percentage;

    setTestResult({
      score: finalScore,
      total: currentExam.questions.length,
      percentage: finalPercentage,
      cheated: isCheatSubmit,
    });

    try {
      await axios.post(
        `https://backend-6hhv.onrender.com/api/users/combat-result`,
        {
          userId: user.id || user._id,
          examId: currentExam._id,
          examTitle: currentExam.title,
          score: finalScore,
          totalQuestions: currentExam.questions.length,
          percentage: finalPercentage,
          isCheated: isCheatSubmit,
        },
      );
    } catch (err) {
      console.error("Failed to save combat history", err);
    }

    if (isCheatSubmit) {
      try {
        await axios.post(
          `https://backend-6hhv.onrender.com/api/users/mark-cheater`,
          {
            email: user.email,
          },
        );
        const updatedUser = { ...user, cheaterTag: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {
        console.error("Failed to mark cheater");
      }
    }

    setActiveExam(null);
  };

  /* =============================
        UI
  ============================= */
  return (
    <div
      ref={arenaRef}
      className={`w-full min-h-screen transition-all font-sans ${
        activeExam || testResult
          ? "bg-slate-50 p-4 md:p-8 flex items-center justify-center overflow-y-auto"
          : "bg-transparent p-4 md:p-6"
      }`}
    >
      {/* =============================
            RESULT SCREEN
      ============================= */}
      {testResult && (
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 md:p-10 rounded-2xl md:rounded-3xl text-center shadow-xl mx-auto animate-in zoom-in-95 duration-300">
          {testResult.cheated ? (
            <>
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertTriangle
                  size={36}
                  className="text-rose-500 animate-pulse"
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                Test Cancelled
              </h2>
              <p className="text-slate-500 text-sm mb-8 px-2">
                Suspicious activity detected. Protocol violated and cheater tag
                applied.
              </p>
            </>
          ) : (
            <>
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${
                  testResult.percentage >= 50
                    ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                    : "bg-rose-50 border-rose-100 text-rose-500"
                }`}
              >
                <ShieldAlert size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">
                Combat Finished
              </h2>
              <div className="text-5xl font-bold text-indigo-600 mb-2 font-mono tracking-tight">
                {testResult.score}
                <span className="text-3xl text-slate-400">
                  /{testResult.total}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Accuracy: {testResult.percentage}%
              </p>
            </>
          )}

          <button
            onClick={() => setTestResult(null)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            Return to Arena
          </button>
        </div>
      )}

      {/* =============================
            LIVE EXAM
      ============================= */}
      {activeExam && !testResult && (
        <div className="max-w-3xl w-full mx-auto py-6 md:py-0 flex flex-col h-full md:h-auto">
          {/* Subtle Warning Bar */}
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-lg text-xs font-semibold text-center mb-6 flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            Do not exit Fullscreen or switch tabs. Warnings: {warnings}/3
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 flex-1">
            <div className="mb-6">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Question {currentQIndex + 1} of {activeExam.questions.length}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
              {activeExam.questions[currentQIndex].questionText}
            </h3>

            <div className="space-y-3">
              {activeExam.questions[currentQIndex].options.map((opt, i) => {
                const isSelected = selectedAnswers[currentQIndex] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 mt-auto md:mt-0">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
              className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {currentQIndex === activeExam.questions.length - 1 ? (
              <button
                onClick={() => submitExam(false)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                Submit Combat
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 font-medium text-sm transition-colors shadow-sm"
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =============================
            EXAM LIST (DASHBOARD VIEW)
      ============================= */}
      {!activeExam && !testResult && (
        <div className="max-w-5xl mx-auto pb-10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Swords size={24} />
              </div>
              Battle Arena
            </h1>

            <div className="bg-indigo-50/80 border border-indigo-100 p-4 md:p-5 rounded-xl flex items-start gap-3">
              <div className="mt-0.5 text-indigo-600">
                <ShieldAlert size={18} />
              </div>
              <h2 className="text-sm text-indigo-900 leading-relaxed font-medium">
                Sign up for more Mock Tests and Previous Year Combats to sharpen
                your skills! Click the given link{" "}
                <a
                  href="https://accounts.examgoal.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 font-bold hover:text-indigo-800 underline underline-offset-2 transition-all"
                >
                  here
                </a>
                .
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium text-sm">
                Fetching arena details...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-white border border-slate-200 p-5 md:p-6 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {exam.type === "mock_test" ? "Mock Test" : "Past Paper"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Clock size={12} /> {exam.timeLimit}m
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => startExam(exam)}
                    className="w-full mt-6 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                    Start Combat
                  </button>
                </div>
              ))}

              {exams.length === 0 && (
                <div className="col-span-full text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl">
                  <Swords size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">
                    No active combats found.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleArena;
