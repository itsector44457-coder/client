import React, { useState, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Sphere,
  MeshDistortMaterial,
  Stars,
  Text,
  Line,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Compass,
  Rocket,
  ShieldCheck,
  XCircle,
  BrainCircuit,
  Zap,
  Layers,
  Target,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import RoadmapCanvas from "../components/RoadmapCanvas";

// --- 1. RoadmapPath: Nodes ko connect karne wali Energy Beam ---
const RoadmapPath = ({ points }) => {
  if (!points || points.length < 2) return null;
  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={3}
      transparent
      opacity={0.6}
      dashed={false}
    />
  );
};

// --- 2. RoadmapNode: Subject wise Planet ---
const RoadmapNode = ({ position, title, subject, onClick, isActive }) => {
  if (!position || position.some((v) => isNaN(v))) return null;

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[0.5, 32, 32]} position={position} onClick={onClick}>
        <MeshDistortMaterial
          color={isActive ? "#818cf8" : "#1e293b"}
          speed={4}
          distort={0.4}
          radius={1}
          emissive={isActive ? "#4f46e5" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
        />
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.22}
          color="white"
          maxWidth={2}
          textAlign="center"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFufMZhrib2Bg-4.woff"
        >
          {`${subject}\n(${title})`}
        </Text>
      </Sphere>
    </Float>
  );
};

// --- 3. Main Component ---
const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("1 Year");

  const durationOptions = ["1 Month", "6 Months", "1 Year", "2 Years"];

  // AI Roadmap Generation
  const generateAIPath = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/roadmap/generate-roadmap",
        {
          field: "SSC Maths, Data Science & Robotics", //
          duration: duration,
          goal: "Professional Mastery",
        },
      );
      setRoadmap(res.data);
      setActiveStep(null);
    } catch (err) {
      alert("AI Server Error! Check Gemini Key.");
    } finally {
      setLoading(false);
    }
  };

  // PDF Export (Aarambh Institute Letterhead Style)
  const downloadPDF = () => {
    if (!roadmap) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("AARAMBH INSTITUTE: CAREER ROADMAP", 20, 25);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(
      `Target: ${duration} Plan | Candidate: Vijay Singh Sengar`,
      20,
      50,
    );

    roadmap.milestones.forEach((m, i) => {
      const y = 65 + i * 40;
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${m.subject} - ${m.title} (${m.days})`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Core Tasks: ${m.tasks.join(", ")}`, 20, y + 8, {
        maxWidth: 170,
      });
    });
    doc.save(`Roadmap_${duration}.pdf`);
  };

  // Memoized points for the connecting line
  const pathPoints = useMemo(() => {
    return roadmap?.milestones?.map((m) => m["3dPosition"]) || [];
  }, [roadmap]);

  return (
    <div className="h-screen w-full bg-[#020617] relative overflow-hidden font-sans">
      <RoadmapCanvas />

      {/* 3D Visualizer Canvas */}
      <div className="h-full w-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
          <Stars
            radius={100}
            depth={50}
            count={6000}
            factor={4}
            saturation={0}
            fade
            speed={1.5}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />

          <Suspense fallback={null}>
            {/* Energy Beam Connection */}
            <RoadmapPath points={pathPoints} />

            {/* Career Nodes (Planets) */}
            {roadmap?.milestones?.map((m, i) => (
              <RoadmapNode
                key={i}
                position={m["3dPosition"]}
                title={m.title}
                subject={m.subject}
                isActive={activeStep?.title === m.title}
                onClick={() => setActiveStep(m)}
              />
            ))}
          </Suspense>
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            maxDistance={20}
            minDistance={5}
          />
        </Canvas>
      </div>

      {/* UI Overlay: Top Left Header */}
      <div className="absolute top-10 left-10 z-10 pointer-events-auto">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Compass className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
              Universe Path
            </h1>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1">
              Linear Career Mapping
            </p>
          </div>
        </div>

        {/* Duration Pills */}
        <div className="flex gap-2 mb-6 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10 w-fit">
          {durationOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setDuration(opt)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                duration === opt
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={generateAIPath}
            disabled={loading}
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Calculating Neural Path..." : "Generate 3D Roadmap"}
          </button>
          {roadmap && (
            <button
              onClick={downloadPDF}
              className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg border border-white/5"
            >
              <Download size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Side Panel: Detailed Subject Breakdown */}
      <AnimatePresence>
        {activeStep && (
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            className="absolute right-0 top-0 h-full w-[450px] bg-[#0f172a]/90 backdrop-blur-3xl border-l border-white/10 p-12 overflow-y-auto no-scrollbar z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={() => setActiveStep(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 font-bold uppercase text-[10px] tracking-widest transition-colors"
            >
              <XCircle size={18} /> Abort Scan
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Layers className="text-indigo-400" size={16} />
              <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                Subject: {activeStep.subject}
              </span>
            </div>

            <h2 className="text-4xl font-black text-white mb-8 uppercase italic leading-tight">
              {activeStep.title}
            </h2>

            <div className="space-y-8">
              <section>
                <h4 className="text-white font-black text-xs uppercase mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500" /> Full
                  Structure
                </h4>
                <div className="space-y-4">
                  {activeStep.fullStructure?.map((module, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-5 rounded-[2rem] border border-white/5"
                    >
                      <p className="text-indigo-400 font-bold text-[10px] uppercase mb-1">
                        {module.moduleName}
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {module.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem]">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase mb-2">
                  Battle Strategy
                </h4>
                <p className="text-slate-200 text-xs leading-relaxed italic leading-relaxed italic">
                  "{activeStep.howToStudy}"
                </p>
              </div>

              <section>
                <h4 className="text-amber-400 font-black text-[10px] uppercase mb-3 flex items-center gap-2">
                  <Zap size={14} /> Intelligence Vault
                </h4>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 text-slate-400 text-xs font-mono">
                  {activeStep.resources}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <BrainCircuit
            className="text-indigo-500 animate-pulse mb-6"
            size={80}
          />
          <p className="text-[12px] font-black uppercase tracking-[0.8em] text-white animate-pulse">
            Mapping {duration} Universe...
          </p>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
