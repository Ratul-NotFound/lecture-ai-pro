"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, ArrowRight, BookOpen, Activity, Sparkles, FileText, X, Loader2, Wand2, Download, Printer, Languages, Brain, Heart, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";

// --- 1. NEURAL BACKGROUND ---
const NeuralBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * 360; 
        this.speed = Math.random() * 0.5 + 0.2;
        this.size = Math.random() * 2 + 0.5;
        this.color = Math.random() > 0.5 ? "14, 165, 233" : "139, 92, 246";
      }
      
      update() {
        this.angle += 0.01; 
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 150;
        const force = (maxDistance - distance) / maxDistance;

        if (distance < maxDistance) {
          this.x -= forceDirectionX * force * 2;
          this.y -= forceDirectionY * force * 2;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, 0.6)`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = Array.from({ length: 90 }, () => new Particle());
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(1, 1, 3, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            const opacity = 1 - (dist / 120);
            ctx.strokeStyle = `rgba(100, 116, 139, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", () => { resize(); init(); });
    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    resize();
    init();
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none opacity-100" />;
};

// Brain Logo Component (animated)
const BrainLogo = () => (
  <motion.div whileHover={{ scale: 1.06, rotate: 6 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 relative overflow-hidden group">
    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    <Brain className="w-5 h-5 text-white z-10" />
  </motion.div>
);

export default function Home() {
  const [mode, setMode] = useState('audio');
  const [language, setLanguage] = useState('english');
  const [file, setFile] = useState(null);
  const [manualTranscript, setManualTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  // --- TITLE STATE ---
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File must be under 20MB");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setNotes("");
      setTitle(""); // Reset Title
      setError("");
    }
  };

  const handleAudioSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setUploadProgress(0); // Start at 0
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    // --- USE XMLHTTPREQUEST FOR REAL PROGRESS TRACKING ---
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/analyze", true);

    let processingInterval;

    // 1. Monitor Real Upload Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        // Map upload (0-100%) to the first 60% of the bar
        // We save the last 40% for "AI Processing"
        setUploadProgress(Math.round(percentComplete * 0.6)); 
      }
    };

    // 2. Start Processing Simulation when upload finishes
    xhr.upload.onload = () => {
      // Upload is done, now we wait for server. Animate from 60% to 90%
      let p = 60;
      processingInterval = setInterval(() => {
        p += 1;
        if (p > 90) p = 90; // Cap at 90 until response comes
        setUploadProgress(p);
      }, 500); // Increment every 500ms
    };

    // 3. Handle Response
    xhr.onload = () => {
      clearInterval(processingInterval); // Stop animation
      
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadProgress(100); // Complete
          setNotes(data.result);
          setTitle(data.title);
        } catch (e) {
          setError("Failed to parse response");
        }
      } else {
        try {
           const errorData = JSON.parse(xhr.responseText);
           setError(errorData.error || "Upload failed");
        } catch (e) {
           setError("Upload failed");
        }
      }
      setLoading(false);
      // Optional: Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    };

    xhr.onerror = () => {
      clearInterval(processingInterval);
      setError("Network error occurred");
      setLoading(false);
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const handleTextSubmit = async () => {
    if (!manualTranscript.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: manualTranscript.trim(),
          language: language
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setNotes(data.result);
      setTitle(data.title);
    } catch (err) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("m.h.ratul18@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch (e) {
      setError("Failed to copy email");
    }
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    const offsetX = e.nativeEvent.clientX - rect.left - radius;
    const offsetY = e.nativeEvent.clientY - rect.top - radius;
    circle.style.left = `${offsetX}px`;
    circle.style.top = `${offsetY}px`;
    circle.className = 'ripple';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#010103] text-white selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      <NeuralBackground />
      
      {/* Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="fixed top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-10 flex-1 w-full flex flex-col">
        
        {/* HEADER */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-12 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 print:hidden"
        >
          <div className="flex items-center gap-3">
            <BrainLogo />
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                LectureAI
              </h1>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">System Online</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* MAIN GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* INPUT SECTION (LEFT) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6 print:hidden"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                Supercharge <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient">
                  Your Studies.
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Transform raw lecture audio or messy transcripts into structured, exam-ready notes in seconds.
              </p>
            </div>

            {/* CONTROL PANEL */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors duration-500">
              
              {/* Note Type Selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
                  <Languages className="w-3 h-3" /> Note Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setLanguage('english')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left relative overflow-hidden
                      ${language === 'english' ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
                  >
                    🇬🇧 Standard English
                  </button>
                  <button 
                    onClick={() => setLanguage('bangla')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                      ${language === 'bangla' ? 'bg-green-500/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
                  >
                    🇧🇩 Bangla + English
                  </button>
                </div>
              </div>

              {/* Input Tabs */}
              <div className="flex p-1.5 bg-black/60 rounded-xl mb-6 relative">
                <motion.div 
                  className="absolute top-1.5 bottom-1.5 rounded-lg bg-gray-800 border border-white/5"
                  initial={false}
                  animate={{ 
                    x: mode === 'audio' ? 0 : '100%',
                    width: '50%'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                
                <button onClick={() => setMode('audio')} className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === 'audio' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                  <FileAudio className="w-4 h-4" /> Audio Upload
                </button>
                <button onClick={() => setMode('text')} className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === 'text' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                  <FileText className="w-4 h-4" /> Text Input
                </button>
              </div>

              <div className="min-h-[250px] relative">
                <AnimatePresence mode="wait">
                  {mode === 'audio' ? (
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col"
                    >
                        <label className={`flex-1 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 gap-4 group/drop relative overflow-hidden
                          ${file ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-gray-800 hover:border-gray-600 hover:bg-white/5'}`}>
                          
                          {/* Scanline Effect */}
                          {file && <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-scan" />}

                          <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFile(e.target.files[0])} />
                          
                          {file ? (
                            <div className="text-center z-10">
                               <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-lg shadow-cyan-500/20">
                                  <FileAudio className="w-8 h-8" />
                               </div>
                               <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                               <p className="text-xs text-cyan-400 mt-1">Ready to process</p>
                               <button onClick={(e) => {e.preventDefault(); setFile(null)}} onMouseDown={handleRipple} className="mt-4 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-transform active:scale-95">
                                Cancel
                               </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center group-hover/drop:scale-110 transition-transform duration-300">
                                <Upload className="w-6 h-6 text-gray-400 group-hover/drop:text-white" />
                              </div>
                              <div className="text-center">
                                <p className="text-gray-300 font-medium group-hover/drop:text-white transition-colors">Click to upload or drag audio</p>
                                <p className="text-xs text-gray-600 mt-1">MP3, WAV, M4A (Max 20MB)</p>
                              </div>
                            </>
                          )}
                        </label>

                        {/* --- REAL PROGRESS BAR --- */}
                        {uploadProgress > 0 && (
                          <div className="mt-4 mb-2">
                             <div className="flex justify-between text-[10px] text-cyan-400 mb-1 font-mono">
                                <span className="uppercase">{uploadProgress < 60 ? "Uploading" : "Processing"}</span>
                                <span>{uploadProgress}%</span>
                             </div>
                             <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_#06b6d4] progress-glow" 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ type: "spring", stiffness: 50 }} 
                                />
                             </div>
                          </div>
                        )}

                        <motion.button
                         onClick={handleAudioSubmit}
                         disabled={!file || loading}
                         onMouseDown={handleRipple}
                         whileHover={{ scale: 1.03, y: -3 }}
                         whileTap={{ scale: 0.98 }}
                         transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                         className="mt-4 w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 glow-hover"
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                          {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />}
                          <span className="relative">{loading ? "Listening..." : "Transcribe & Analyze"}</span>
                        </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col"
                    >
                      <textarea
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        placeholder="Paste your lecture notes or transcript here..."
                        className="w-full flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none mb-4 font-mono leading-relaxed"
                      />
                      <motion.button
                        onClick={handleTextSubmit}
                        disabled={!manualTranscript.trim() || loading}
                        onMouseDown={handleRipple}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 glow-hover"
                      >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                          {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />}
                          <span className="relative">{loading ? "Analyzing..." : "Generate Notes"}</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* OUTPUT SECTION (RIGHT) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-7 flex flex-col h-full min-h-[500px]"
          >
             <div id="printable-area" className="bg-[#0A0A0C]/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden relative print:bg-white print:text-black print:border-none print:shadow-none hover:border-white/20 transition-colors duration-500">
                
                {/* Header Line - Hidden on Print, Visible on Screen */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5 print:hidden">
                   <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-gray-200">
                        {language === 'bangla' ? 'Lecture Notes (Bangla Mix)' : 'Lecture Notes (English)'}
                      </span>
                   </div>
                   
                   {notes && (
                     <button 
                       onClick={handlePrint}
                       onMouseDown={handleRipple}
                       className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors border border-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 glow-hover"
                     >
                        <Printer className="w-3.5 h-3.5" />
                        Download PDF
                     </button>
                   )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar print:overflow-visible print:p-0">
                   {loading ? (
                     <div className="h-full flex flex-col items-center justify-center gap-6 print:hidden">
                        <div className="relative">
                           <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Wand2 className="w-6 h-6 text-cyan-500 animate-pulse" />
                           </div>
                        </div>
                        <div className="text-center space-y-1">
                           <p className="text-lg font-medium text-white">Synthesizing Knowledge</p>
                           <p className="text-sm text-gray-500 animate-pulse">Extracting key concepts and exam patterns...</p>
                        </div>
                     </div>
                   ) : notes ? (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       whileHover={{ scale: 1.01, y: -6 }}
                       transition={{ duration: 0.5 }}
                       className="prose prose-invert prose-sm md:prose-base max-w-none
                       prose-headings:text-transparent prose-headings:bg-clip-text prose-headings:bg-gradient-to-r prose-headings:from-cyan-100 prose-headings:to-blue-100
                       prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                       prose-strong:text-cyan-400 prose-li:text-gray-300
                       prose-blockquote:border-l-cyan-500 prose-blockquote:bg-cyan-900/10 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                        
                       /* PRINT OPTIMIZATIONS */
                       print:prose-headings:!text-black print:prose-headings:!bg-none 
                       print:prose-h2:!border-black print:prose-h2:!border-b-2
                       print:prose-strong:!text-black print:prose-strong:!font-extrabold
                       print:prose-li:!text-black print:[&_li::marker]:!text-black
                       print:text-black print:prose-p:text-black 
                       print:prose-blockquote:!bg-transparent print:prose-blockquote:!text-black print:prose-blockquote:!border-l-black
                       print:prose-code:!text-black print:prose-code:!bg-transparent"
                     >
                        {/* --- DYNAMIC HEADER --- */}
                        <div className="mb-8 border-b border-white/10 pb-6 print:border-black print:mb-6">
                           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                               <div>
                                  {/* SINGLE H1 with "pdf-header-title" class to override styles in print */}
                                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight uppercase
                                    text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 
                                    pdf-header-title">
                                    {title || "Lecture Analysis"}
                                  </h1>

                                  <div className="flex items-center gap-3 text-sm font-mono text-gray-400 print:!text-black">
                                     <span className="px-2 py-0.5 rounded bg-white/10 print:bg-transparent border border-white/5 print:border-black font-bold">
                                       {language === 'bangla' ? '🇧🇩 Bangla Mix' : '🇬🇧 English'}
                                     </span>
                                     <span>•</span>
                                     <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  </div>
                               </div>
                               
                               {/* Logo (Visible on desktop & print) */}
                               <div className="hidden md:block print:block text-right opacity-50 print:opacity-100">
                                  <div className="flex items-center justify-end gap-2 text-sm font-bold text-gray-300 print:!text-black">
                                      <Brain className="w-4 h-4 print:text-black" /> LectureAI
                                  </div>
                               </div>
                           </div>
                        </div>

                        <ReactMarkdown>{notes}</ReactMarkdown>
                     </motion.div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none pointer-events-none print:hidden">
                        <Activity className="w-24 h-24 text-white mb-6 animate-pulse" strokeWidth={1} />
                        <h3 className="text-xl font-bold text-white mb-2">Awaiting Data</h3>
                        <p className="max-w-xs text-gray-400">
                           Upload a lecture audio file to begin the neural analysis.
                        </p>
                     </div>
                   )}
                </div>
             </div>
          </motion.div>

        </div>
      </div>
      
      {/* --- FOOTER --- */}
      <footer className="w-full print:hidden backdrop-blur-sm mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-300 bg-black/20 border-t border-white/5 rounded-t-lg">
          <p className="flex items-center gap-3 text-gray-400">
            <span>Made by</span>
            <span className="text-cyan-400 font-semibold tracking-wide">Mahmud Hasan Ratul</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="ml-1 text-xs text-gray-400">2026</span>
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a href="mailto:m.h.ratul18@gmail.com" aria-label="Email Mahmud Hasan Ratul" className="flex items-center gap-2 text-cyan-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded">
                <Mail className="w-4 h-4" />
                <span className="underline">m.h.ratul18@gmail.com</span>
              </a>
              <button onClick={copyEmail} onMouseDown={handleRipple} aria-label="Copy email" className="ml-2 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-sm text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 glow-hover">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {copiedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 bg-cyan-700/95 text-white px-4 py-2 rounded-lg shadow-2xl z-50 flex items-center gap-2"
          >
            <span className="text-sm font-medium">Email copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded-full border border-red-500 shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 print:hidden"
          >
            <X className="w-4 h-4" onClick={() => setError("")} />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, 30px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes float-delayed {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -20px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite reverse; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-scan { animation: scan 2s linear infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        /* Ripple effect for buttons */
        .ripple { position: absolute; border-radius: 50%; transform: scale(0); pointer-events: none; background: rgba(255,255,255,0.14); mix-blend-mode: overlay; animation: ripple 650ms linear; }
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }

        /* Glow & micro-interaction for primary CTAs */
        .glow-hover { transition: transform 220ms ease, box-shadow 220ms ease; }
        .glow-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(6,182,212,0.08), 0 6px 20px rgba(99,102,241,0.06); }
        .glow-hover:active { transform: translateY(0); }

        /* Progress bar animated gradient */
        .progress-glow { background-size: 200% 100%; animation: gradientShift 3s linear infinite; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: auto !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 40px !important; 
          }
          /* Ensure inner scrollable regions expand when printing */
          #printable-area * {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          /* Allow text and blocks to flow across pages */
          #printable-area img, #printable-area pre, #printable-area code {
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }
          ::-webkit-scrollbar {
             display: none;
          }
          
          /* FORCE TITLE VISIBILITY & COLOR OVERRIDE */
          .pdf-header-title {
             color: black !important;
             -webkit-text-fill-color: black !important;
             background: none !important;
             text-fill-color: black !important;
             visibility: visible !important;
             opacity: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}