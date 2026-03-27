"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
    FileText, 
    Sparkles, 
    Upload, 
    ClipboardList, 
    Paperclip, 
    AlertTriangle, 
    HelpCircle, 
    BookOpen, 
    Lightbulb, 
    CheckCircle2, 
    XCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    History,
    File,
    Trash2,
    Briefcase
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */
interface QA { q: string; a: string; category: string }
interface Tip { type: "strength" | "improve" | "missing"; text: string }
interface PrepResult {
    id: string;
    fileName: string;
    hasJD: boolean;
    createdAt: string;
    role?: string;
    qa: QA[];
    tips: Tip[];
    topics: string[];
}

const CAT_COLORS: Record<string, string> = {
    Technical: "#6ee7b7",
    Behavioral: "#93c5fd",
    "System Design": "#f9a8d4",
    HR: "#fde68a",
    Aptitude: "#c4b5fd",
};

/* ─────────────────── Helpers ─────────────────── */
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function shortName(name: string, max = 22) {
    return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

export default function PrepHubPage() {
    /* upload state */
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdMode, setJdMode] = useState<"paste" | "upload">("paste");
    const [jdText, setJdText] = useState("");
    const [jdFile, setJdFile] = useState<File | null>(null);

    /* ui state */
    const [loading, setLoading] = useState(false);
    const [activeResult, setActiveResult] = useState<PrepResult | null>(null);
    const [sessions, setSessions] = useState<PrepResult[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<"qa" | "topics" | "tips">("qa");
    const [expandedQ, setExpandedQ] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [error, setError] = useState("");

    const resumeRef = useRef<HTMLInputElement>(null);
    const jdFileRef = useRef<HTMLInputElement>(null);

    /* load sessions */
    useEffect(() => {
        async function loadSessions() {
            try {
                const res = await fetch("/api/prep-hub/sessions");
                if (res.ok) {
                    const { sessions: remote } = await res.json();
                    if (remote?.length) { setSessions(remote); return; }
                }
            } catch { }
            try {
                const saved = localStorage.getItem("prep_sessions");
                if (saved) setSessions(JSON.parse(saved));
            } catch { }
        }
        loadSessions();
    }, []);

    function saveSessions(updated: PrepResult[]) {
        setSessions(updated);
        try { localStorage.setItem("prep_sessions", JSON.stringify(updated)); } catch { }
    }

    async function handleGenerate() {
        if (!resumeFile) return;
        setError("");
        setLoading(true);
        setActiveResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", resumeFile);
            if (jdMode === "paste" && jdText.trim()) formData.append("jd", jdText.trim());
            if (jdMode === "upload" && jdFile) formData.append("jdFile", jdFile);

            const res = await fetch("/api/prep-hub/analyze", { method: "POST", body: formData });
            if (!res.ok) throw new Error((await res.json()).error || "Analysis failed");
            const data: PrepResult = await res.json();

            const updated = [data, ...sessions];
            saveSessions(updated);
            setActiveResult(data);
            setActiveTab("qa");
            setExpandedQ(null);
            setActiveCategory("All");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const [resumeDrag, setResumeDrag] = useState(false);
    const [jdDrag, setJdDrag] = useState(false);

    function onResumeDrop(e: React.DragEvent) {
        e.preventDefault(); setResumeDrag(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) setResumeFile(f);
    }
    function onJdFileDrop(e: React.DragEvent) {
        e.preventDefault(); setJdDrag(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".txt"))) setJdFile(f);
    }

    const filteredQA = activeResult
        ? activeResult.qa.filter(q => activeCategory === "All" || q.category === activeCategory)
        : [];
    const categories = activeResult
        ? ["All", ...Array.from(new Set(activeResult.qa.map(q => q.category)))]
        : [];

    const tipCount = {
        strength: activeResult?.tips.filter(t => t.type === "strength").length ?? 0,
        improve: activeResult?.tips.filter(t => t.type === "improve").length ?? 0,
        missing: activeResult?.tips.filter(t => t.type === "missing").length ?? 0,
    };

    return (
        <div className="min-h-screen" style={{ color: "#fff" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* SIDEBAR */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-24 rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col"
                            style={{
                                width: sidebarOpen ? "100%" : 72,
                                background: "linear-gradient(145deg, rgba(20,22,32,0.7), rgba(10,11,16,0.8))",
                                border: "1px solid rgba(99,102,241,0.15)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                minHeight: "calc(100vh - 120px)",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.05)",
                            }}
                        >
                            <div className="flex items-center justify-between px-6 py-6 flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                                {sidebarOpen ? (
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4 text-indigo-400" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/80">History</span>
                                    </div>
                                ) : (
                                    <History className="mx-auto h-4 w-4 text-indigo-500 animate-pulse" />
                                )}
                                <button
                                    onClick={() => setSidebarOpen(o => !o)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl transition-all hover:bg-white/10"
                                    style={{ color: "#64748b" }}
                                >
                                    {sidebarOpen ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    )}
                                </button>
                            </div>

                            <div className="px-4 py-4 flex-shrink-0">
                                <button
                                    onClick={() => { setActiveResult(null); setResumeFile(null); setJdText(""); setJdFile(null); setError(""); }}
                                    className="group relative flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold transition-all overflow-hidden"
                                    style={{ 
                                        background: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.15))", 
                                        border: "1px solid rgba(139,92,246,0.3)",
                                        color: "#a5b4fc"
                                    }}
                                >
                                    <div className="absolute inset-0 bg-indigo-500/10 translate-y-full transition-transform group-hover:translate-y-0" />
                                    <Plus className="h-4 w-4" />
                                    {sidebarOpen && <span className="relative z-10">New Session</span>}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-2" style={{ scrollbarWidth: "none" }}>
                                {sessions.length === 0 && sidebarOpen && (
                                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                                        <File className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <p className="text-xs font-black text-slate-500">No history yet.<br/>Start your first analysis.</p>
                                    </div>
                                )}
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setActiveResult(s); setActiveTab("qa"); setExpandedQ(null); setActiveCategory("All"); }}
                                        className="w-full text-left rounded-2xl p-4 transition-all duration-300 group relative overflow-hidden"
                                        style={{
                                            background: activeResult?.id === s.id 
                                                ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))" 
                                                : "transparent",
                                            border: `1px solid ${activeResult?.id === s.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.03)"}`,
                                        }}
                                    >
                                        {activeResult?.id === s.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                                        )}
                                        {sidebarOpen ? (
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" 
                                                        style={{ background: activeResult?.id === s.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)" }}>
                                                        <FileText className={`h-4 w-4 ${activeResult?.id === s.id ? "text-indigo-400" : "text-slate-500"}`} />
                                                    </div>
                                                    <span className="text-xs font-bold truncate flex-1" style={{ color: activeResult?.id === s.id ? "#fff" : "#94a3b8" }}>
                                                        {shortName(s.fileName, 24)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pl-11 mt-0.5">
                                                    <span className="text-[10px] font-black text-slate-500">{formatDate(s.createdAt)}</span>
                                                    {s.hasJD && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-black tracking-tighter" 
                                                            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>JD</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center h-8 items-center">
                                                <FileText className="h-5 w-5 text-slate-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {sessions.length > 0 && sidebarOpen && (
                                <div className="px-6 py-6 mt-auto flex-shrink-0" style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}>
                                    <button
                                        onClick={() => { if(confirm("Clear all sessions?")) { saveSessions([]); setActiveResult(null); } }}
                                        className="text-[10px] font-extrabold uppercase tracking-widest w-full text-center py-2.5 rounded-xl transition-all hover:bg-red-500/10"
                                        style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}
                                    >
                                        Clear History
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* MAIN */}
                    <main className="flex-1 min-w-0">
                        <div className="max-w-4xl mx-auto px-6">
                            
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider mb-4"
                                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                                    <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-indigo-500" />
                                    AI-Powered Prep Hub
                                </div>
                                <h1 className="text-5xl font-extrabold mb-3"
                                    style={{ background: "linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Interview Prep Hub
                                </h1>
                                <p className="text-base font-medium text-indigo-200/60 leading-relaxed">
                                    Upload your resume &amp; JD — we&apos;ll generate personalized Q&amp;A, tailored preparation topics, and expert resume feedback.
                                </p>
                            </div>

                            {!activeResult ? (
                                <div className="rounded-[2.5rem] p-10 mb-8"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(20,22,32,0.8), rgba(10,11,16,0.9))",
                                        border: "1px solid rgba(99,102,241,0.2)",
                                        boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.05)",
                                    }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">
                                                Resume <span className="text-indigo-400">*</span>
                                            </label>
                                            <div
                                                onDragOver={e => { e.preventDefault(); setResumeDrag(true); }}
                                                onDragLeave={() => setResumeDrag(false)}
                                                onDrop={onResumeDrop}
                                                onClick={() => resumeRef.current?.click()}
                                                className="flex flex-col items-center justify-center gap-4 rounded-3xl py-10 cursor-pointer transition-all duration-300"
                                                style={{
                                                    background: resumeDrag ? "rgba(99,102,241,0.1)" : resumeFile ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.02)",
                                                    border: `2px dashed ${resumeFile ? "rgba(99,102,241,0.6)" : resumeDrag ? "#818cf8" : "rgba(255,255,255,0.06)"}`,
                                                    minHeight: 220,
                                                }}
                                            >
                                                {resumeFile ? (
                                                    <>
                                                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                                                            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                                            <FileText className="h-8 w-8 text-indigo-400" />
                                                        </div>
                                                        <div className="text-center px-4">
                                                            <p className="text-sm font-black text-white mb-1">{shortName(resumeFile.name, 28)}</p>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{(resumeFile.size / 1024).toFixed(0)} KB · Ready</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                            <Upload className="h-8 w-8 text-slate-500" />
                                                        </div>
                                                        <div className="text-center px-4">
                                                            <p className="text-sm font-black text-white/80 uppercase tracking-tight">Upload Resume</p>
                                                            <p className="text-[10px] mt-1 font-black text-slate-500 uppercase tracking-widest">PDF or DOCX max 5MB</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input ref={resumeRef} type="file" accept=".pdf,.docx" className="hidden"
                                                    onChange={e => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Job Description <span className="text-[9px] lowercase opacity-50">(optional)</span>
                                                </label>
                                                <div className="flex p-0.5 rounded-xl bg-black/20 border border-white/5">
                                                    {(["paste", "upload"] as const).map(m => (
                                                        <button key={m} onClick={() => setJdMode(m)}
                                                            className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                                                            style={{
                                                                background: jdMode === m ? "rgba(99,102,241,0.2)" : "transparent",
                                                                color: jdMode === m ? "#a5b4fc" : "#64748b",
                                                            }}>
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {jdMode === "paste" ? (
                                                <textarea
                                                    rows={8}
                                                    placeholder="Paste JD for targeted prep..."
                                                    value={jdText}
                                                    onChange={e => setJdText(e.target.value)}
                                                    className="rounded-3xl px-5 py-4 text-sm text-white outline-none resize-none flex-1 transition-all"
                                                    style={{
                                                        background: "rgba(255,255,255,0.02)",
                                                        border: "1px solid rgba(99,102,241,0.15)",
                                                        minHeight: 220,
                                                        scrollbarWidth: "none",
                                                    }}
                                                    onFocus={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)")}
                                                    onBlur={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)")}
                                                />
                                            ) : (
                                                <div
                                                    onDragOver={e => { e.preventDefault(); setJdDrag(true); }}
                                                    onDragLeave={() => setJdDrag(false)}
                                                    onDrop={onJdFileDrop}
                                                    onClick={() => jdFileRef.current?.click()}
                                                    className="flex flex-col items-center justify-center gap-4 rounded-3xl py-10 cursor-pointer transition-all duration-300"
                                                    style={{
                                                        background: jdDrag ? "rgba(99,102,241,0.08)" : jdFile ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.02)",
                                                        border: `2px dashed ${jdFile ? "rgba(99,102,241,0.6)" : jdDrag ? "#818cf8" : "rgba(255,255,255,0.06)"}`,
                                                        minHeight: 220,
                                                    }}
                                                >
                                                    {jdFile ? (
                                                        <>
                                                            <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
                                                                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                                                <ClipboardList className="h-8 w-8 text-indigo-400" />
                                                            </div>
                                                            <p className="text-sm font-black text-white px-6 text-center">{shortName(jdFile.name, 28)}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                                                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                                <Paperclip className="h-8 w-8 text-slate-500" />
                                                            </div>
                                                            <p className="text-sm font-black text-white/50 uppercase tracking-tight">Upload JD</p>
                                                        </>
                                                    )}
                                                    <input ref={jdFileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) setJdFile(f); }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mb-6 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                                            <span>⚠️</span> {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!resumeFile || loading}
                                        className="w-full rounded-2xl py-5 text-lg font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 flex items-center justify-center gap-3 relative overflow-hidden"
                                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 20px 40px rgba(99,102,241,0.3)" }}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Analyzing with AI...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Generate Prep Plan
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Result View */}
                                    <div className="flex items-center gap-6 mb-8 rounded-[2rem] px-8 py-6"
                                        style={{ 
                                            background: "rgba(25,27,38,0.6)", 
                                            border: "1px solid rgba(99,102,241,0.25)",
                                            backdropFilter: "blur(10px)"
                                        }}>
                                        <div className="h-16 w-16 rounded-[1.25rem] flex items-center justify-center flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
                                            <FileText className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-xl truncate mb-1">{activeResult.fileName}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{formatDate(activeResult.createdAt)}</p>
                                                {activeResult.hasJD && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider"
                                                        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>+ JD Tailored</span>
                                                )}
                                                <span className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider"
                                                    style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                    {activeResult.qa.length} Q&A
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setActiveResult(null); setResumeFile(null); setJdText(""); setJdFile(null); setError(""); }}
                                            className="flex-shrink-0 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95"
                                            style={{ color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.2)" }}
                                        >
                                            New
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        {[
                                            { label: "Questions", value: activeResult.qa.length, color: "#8b5cf6", icon: <HelpCircle className="h-3.5 w-3.5" /> },
                                            { label: "Topics", value: activeResult.topics.length, color: "#06b6d4", icon: <BookOpen className="h-3.5 w-3.5" /> },
                                            { label: "Resume Tips", value: activeResult.tips.length, color: "#f59e0b", icon: <Lightbulb className="h-3.5 w-3.5" /> },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-2xl px-5 py-5 transition-all hover:bg-white/5"
                                                style={{ 
                                                    background: "linear-gradient(145deg, rgba(30,32,44,0.4), rgba(15,16,22,0.6))", 
                                                    border: `1px solid ${s.color}40` 
                                                }}>
                                                <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span style={{ color: s.color }}>{s.icon}</span>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 p-1.5 mb-8 rounded-2xl bg-black/30 border border-white/5 w-fit">
                                        {(["qa", "topics", "tips"] as const).map(k => (
                                            <button
                                                key={k}
                                                onClick={() => setActiveTab(k)}
                                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                                style={{
                                                    background: activeTab === k ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
                                                    color: activeTab === k ? "#fff" : "#64748b",
                                                    boxShadow: activeTab === k ? "0 4px 12px rgba(79,70,233,0.3)" : "none"
                                                }}
                                            >
                                                {k === "qa" ? "Interview Q&A" : k === "topics" ? "Study Topics" : "Resume Tips"}
                                            </button>
                                        ))}
                                    </div>

                                    {activeTab === "qa" && (
                                        <div className="animate-fadeIn">
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {categories.map(cat => (
                                                    <button key={cat} onClick={() => { setActiveCategory(cat); setExpandedQ(null); }}
                                                        className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                                                        style={{
                                                            background: activeCategory === cat ? `${CAT_COLORS[cat] ?? "#4f46e5"}20` : "rgba(255,255,255,0.03)",
                                                            border: `1px solid ${activeCategory === cat ? (CAT_COLORS[cat] ?? "#4f46e5") + "55" : "rgba(255,255,255,0.06)"}`,
                                                            color: activeCategory === cat ? (CAT_COLORS[cat] ?? "#c4b5fd") : "#4f557d",
                                                        }}>
                                                        {cat} {cat === "All" ? `(${activeResult.qa.length})` : `(${activeResult.qa.filter(q => q.category === cat).length})`}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {filteredQA.map((item, i) => (
                                                    <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300"
                                                        style={{
                                                            background: expandedQ === i 
                                                                ? "linear-gradient(145deg, rgba(36,38,51,0.6), rgba(8,9,13,0.8))" 
                                                                : "rgba(20,22,32,0.4)",
                                                            border: `1px solid ${expandedQ === i ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.04)"}`,
                                                        }}>
                                                        <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                                                            onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold flex-shrink-0"
                                                                    style={{ 
                                                                        background: expandedQ === i ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "rgba(99,102,241,0.15)", 
                                                                        color: "#fff",
                                                                        boxShadow: expandedQ === i ? "0 0 12px rgba(99,102,241,0.4)" : "none"
                                                                    }}>Q{i + 1}</span>
                                                                <span className="text-sm font-semibold text-white/90 leading-tight">{item.q}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <span className="text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider hidden sm:block"
                                                                    style={{ background: `${CAT_COLORS[item.category] ?? "#8b5cf6"}15`, color: CAT_COLORS[item.category] ?? "#c4b5fd" }}>
                                                                    {item.category}
                                                                </span>
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                                    className="transition-transform duration-300" style={{ transform: expandedQ === i ? "rotate(180deg)" : "rotate(0deg)", color: "#4f557d" }}>
                                                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                        {expandedQ === i && (
                                                            <div className="px-6 pb-6 animate-fadeIn">
                                                                <div className="h-px mb-5" style={{ background: "rgba(99,102,241,0.1)" }} />
                                                                <div className="flex gap-4">
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold flex-shrink-0 mt-0.5"
                                                                        style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7" }}>A</span>
                                                                    <p className="text-sm leading-relaxed" style={{ color: "#a5b4fc" }}>{item.a}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "topics" && (
                                        <div className="animate-fadeIn grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {activeResult.topics.map((topic, i) => (
                                                <div key={i} className="flex items-start gap-4 rounded-3xl p-6"
                                                    style={{
                                                        background: "rgba(20,22,32,0.4)",
                                                        border: "1px solid rgba(6,182,212,0.15)",
                                                    }}>
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold flex-shrink-0 mt-0.5"
                                                        style={{ background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)" }}>{i + 1}</span>
                                                    <p className="text-sm font-medium leading-relaxed" style={{ color: "#e2e8f0" }}>{topic}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === "tips" && (
                                        <div className="animate-fadeIn">
                                            <div className="grid grid-cols-3 gap-4 mb-8">
                                                {[
                                                    { type: "strength", label: "Strengths", color: "#10b981", icon: <CheckCircle2 className="h-3.5 w-3.5" />, count: tipCount.strength },
                                                    { type: "improve", label: "Improve", color: "#f59e0b", icon: <AlertTriangle className="h-3.5 w-3.5" />, count: tipCount.improve },
                                                    { type: "missing", label: "Missing", color: "#ef4444", icon: <XCircle className="h-3.5 w-3.5" />, count: tipCount.missing },
                                                ].map(s => (
                                                    <div key={s.type} className="rounded-2xl px-5 py-4 text-center transition-all hover:bg-white/5"
                                                        style={{ background: `${s.color}08`, border: `1px solid ${s.color}40` }}>
                                                        <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.count}</p>
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span style={{ color: s.color }}>{s.icon}</span>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-4 mb-8">
                                                {activeResult.tips.map((tip, i) => {
                                                    const cfg = tip.type === "strength"
                                                        ? { color: "#10b981", label: "Strength", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)" }
                                                        : tip.type === "improve"
                                                            ? { color: "#f59e0b", label: "Improve", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)" }
                                                            : { color: "#ef4444", label: "Missing", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)" };
                                                    return (
                                                        <div key={i} className="flex gap-5 rounded-3xl p-6 transition-all hover:translate-x-1"
                                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                                            <div className="w-1.5 h-auto rounded-full" style={{ background: cfg.color }} />
                                                            <div>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: cfg.color }}>{cfg.label}</span>
                                                                <p className="text-sm font-medium leading-relaxed" style={{ color: "#e0e7ff" }}>{tip.text}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.08))",
                                                    border: "1px solid rgba(245,158,11,0.2)",
                                                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                                                }}>
                                                <div className="text-center md:text-left">
                                                    <p className="text-xl font-bold text-white mb-2">Want a professionally rewritten resume?</p>
                                                    <p className="text-sm max-w-lg" style={{ color: "#a5b4fc" }}>
                                                        Use Career Elevate — our partner AI tool that analyzes and rewrites your resume for maximum impact.
                                                    </p>
                                                </div>
                                                <a
                                                    href="https://career-elevate-gamma.vercel.app/"
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex-shrink-0 flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                                                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 10px 30px rgba(245,158,11,0.3)" }}
                                                >
                                                    🚀 Improve Resume ↗
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}