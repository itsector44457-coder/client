import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  NotebookPen,
  Mic,
  MicOff,
  AudioLines,
  Sparkles,
} from "lucide-react";

const QuickCaptureModal = ({
  isOpen,
  onClose,
  quickText,
  setQuickText,
  quickImage,
  onCaptureImageSelect,
  saveQuickCapture,
}) => {
  // 🔥 NEURAL DICTATION STATES
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check browser support for Speech API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Lagaatar sunta rahega
      recognition.interimResults = true; // Bolte waqt hi text dikhayega
      recognition.lang = "en-IN"; // English (India) - Hindi/Hinglish bhi thoda samajh leta hai

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }
        // Naya text purane text mein append kar do
        if (finalTranscript) {
          setQuickText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Mic error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setQuickText]);

  // Mic Toggle Function
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Bhai, tumhara browser Voice Dictation support nahi karta. Chrome use karo!",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            // 🔥 THE FIX: Added max-h-[90vh] and overflow-y-auto so it doesn't break when mobile keyboard opens
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#0f1221] border border-indigo-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(79,70,229,0.15)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <NotebookPen className="text-indigo-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase italic tracking-widest text-base sm:text-lg leading-none">
                    Neural Capture
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">
                    Voice & Visual Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isListening) recognitionRef.current?.stop();
                  onClose();
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors bg-white/5 p-1.5 sm:p-2 rounded-full"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-8 flex-1 flex flex-col">
              {/* Text Area Container */}
              <div
                className={`relative rounded-[1.2rem] sm:rounded-3xl overflow-hidden transition-all duration-300 flex-1 min-h-[150px] sm:min-h-[200px] ${
                  isListening
                    ? "shadow-[0_0_30px_rgba(79,70,229,0.2)] border border-indigo-500/50"
                    : "border border-white/10"
                }`}
              >
                <textarea
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  rows={5}
                  placeholder={
                    isListening
                      ? "Listening to Commander..."
                      : "Type your logic, or tap the mic to speak..."
                  }
                  className="w-full h-full bg-slate-900/50 p-4 sm:p-6 text-white placeholder-slate-500 outline-none resize-none text-xs sm:text-sm font-medium"
                />

                {/* 🔥 The Neural Dictation Toolbar */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2">
                  {/* Animation indicator when listening */}
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full"
                    >
                      <AudioLines
                        size={12}
                        className="text-indigo-400 animate-pulse sm:w-3.5 sm:h-3.5"
                      />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-indigo-300">
                        Recording
                      </span>
                    </motion.div>
                  )}

                  <button
                    onClick={toggleListening}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center ${
                      isListening
                        ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                        : "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 hover:text-white border border-indigo-500/30"
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={16} className="sm:w-[18px] sm:h-[18px]" />
                    ) : (
                      <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {quickImage && (
                <div className="mt-4 relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group">
                  <img
                    src={quickImage}
                    alt="Capture"
                    className="w-full h-32 sm:h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white">
                    Visual Attached
                  </div>
                </div>
              )}

              {/* Footer Controls */}
              {/* 🔥 THE FIX: flex-col on mobile so buttons don't break, flex-row on larger screens */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 sm:mt-8 gap-4 sm:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <label className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors bg-white/5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10">
                    <Camera size={14} /> <span>Visual</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onCaptureImageSelect(e.target.files[0])}
                    />
                  </label>

                  {/* Future AI Format Trigger Button */}
                  <button className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 cursor-pointer transition-colors bg-white/5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 disabled:opacity-50">
                    <Sparkles size={14} /> <span>Format</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (isListening) recognitionRef.current?.stop(); // Close karte waqt mic band
                    saveQuickCapture();
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  Save Node
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickCaptureModal;
