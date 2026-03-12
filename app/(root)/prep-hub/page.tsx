"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
    return (
        <header
            className="sticky top-0 z-40"
            style={{
                background: "rgba(8,9,13,0.92)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 16px rgba(99,102,241,0.4)" }}>
                        <Image src="/logo.svg" alt="AI MEET" width={20} height={20} />
                    </div>
                    <span className="text-lg font-bold"
                        style={{ background: "linear-gradient(135deg, #e0e7ff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        AI MEET
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { href: "/interview", label: "AI Interview" },
                        { href: "/prep-hub", label: "Prep Hub" },
                        { href: "/quiz", label: "Quiz" },
                        { href: "/questions", label: "Questions" },
                    ].map(item => {
                        const active = item.href === "/prep-hub";
                        return (
                            <Link key={item.href} href={item.href}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                style={{
                                    background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                    color: active ? "#a5b4fc" : "#64748b",
                                    border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                                }}>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff" }}>
                    P
                </div> */}
            </div>
        </header>
    );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="mt-24 border-t px-6 py-10"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                        <Image src="/logo.svg" alt="AI MEET" width={14} height={14} />
                    </div>
                    <span className="font-bold text-sm text-white">AI MEET</span>
                </div>
                <p className="text-xs" style={{ color: "#334155" }}>
                    © {new Date().getFullYear()} AI MEET · Personalized interview preparation with AI.
                </p>
                <div className="flex gap-5 text-xs" style={{ color: "#334155" }}>
                    <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
                    <Link href="/interview" className="hover:text-indigo-400 transition-colors">Interview</Link>
                    <Link href="/questions" className="hover:text-indigo-400 transition-colors">Questions</Link>
                </div>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════ */
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

    /* load sessions — Firestore first, localStorage as fallback */
    useEffect(() => {
        async function loadSessions() {
            try {
                const res = await fetch("/api/prep-hub/sessions");
                if (res.ok) {
                    const { sessions: remote } = await res.json();
                    if (remote?.length) { setSessions(remote); return; }
                }
            } catch { }
            // Fallback: localStorage
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

    /* ── Generate ── */
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
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    /* ── File drag helpers ── */
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

    /* ── Derived ── */
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

    /* ═══════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════ */
    return (
        <div style={{ background: "#08090d", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
            <Header />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ══════════════════ SIDEBAR ══════════════════ */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col"
                            style={{
                                width: sidebarOpen ? "100%" : 56,
                                background: "linear-gradient(180deg, #0e0f15 0%, #0a0b10 100%)",
                                border: "1px solid rgba(139,92,246,0.15)",
                                minHeight: "calc(100vh - 120px)",
                            }}
                        >
                            {/* Sidebar header */}
                            <div className="flex items-center justify-between px-3 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                                {sidebarOpen && (
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4f557d" }}>Sessions</span>
                                )}
                                <button
                                    onClick={() => setSidebarOpen(o => !o)}
                                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-white/5"
                                    style={{ color: "#4f557d" }}
                                    title={sidebarOpen ? "Collapse" : "Expand"}
                                >
                                    {sidebarOpen ? (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                    )}
                                </button>
                            </div>

                            {/* New session button */}
                            <div className="px-2 py-3 flex-shrink-0">
                                <button
                                    onClick={() => { setActiveResult(null); setResumeFile(null); setJdText(""); setJdFile(null); setError(""); }}
                                    className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-white/5"
                                    style={{ color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.25)" }}
                                    title="New Session"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                    {sidebarOpen && <span>New Session</span>}
                                </button>
                            </div>

                            {/* Session list */}
                            <div className="flex-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: "none" }}>
                                {sessions.length === 0 && sidebarOpen && (
                                    <p className="text-xs px-2 mt-4" style={{ color: "#2e3148" }}>No sessions yet. Upload a resume to start.</p>
                                )}
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setActiveResult(s); setActiveTab("qa"); setExpandedQ(null); setActiveCategory("All"); }}
                                        className="w-full text-left rounded-xl px-3 py-2.5 mb-1 transition-all hover:bg-white/5 group"
                                        style={{
                                            background: activeResult?.id === s.id ? "rgba(139,92,246,0.12)" : "transparent",
                                            border: `1px solid ${activeResult?.id === s.id ? "rgba(139,92,246,0.3)" : "transparent"}`,
                                        }}
                                        title={s.fileName}
                                    >
                                        {sidebarOpen ? (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base">📄</span>
                                                    <span className="text-xs font-semibold truncate" style={{ color: activeResult?.id === s.id ? "#c4b5fd" : "#9ca3af" }}>
                                                        {shortName(s.fileName)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 ml-6">
                                                    <span className="text-xs" style={{ color: "#2e3148" }}>{formatDate(s.createdAt)}</span>
                                                    {s.hasJD && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>+JD</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-base flex justify-center">📄</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Clear all */}
                            {sessions.length > 0 && sidebarOpen && (
                                <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
                                    <button
                                        onClick={() => { saveSessions([]); setActiveResult(null); }}
                                        className="text-xs w-full text-center transition-all hover:opacity-80"
                                        style={{ color: "#3a3d52" }}
                                    >
                                        Clear all sessions
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ══════════════════ MAIN ══════════════════ */}
                    <main className="flex-1 min-w-0">
                        <div className="max-w-4xl mx-auto px-6 py-10">

                            {/* Header */}
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-4"
                                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#8b5cf6" }} />
                                    AI-Powered Prep Hub
                                </div>
                                <h1 className="text-4xl font-extrabold mb-2"
                                    style={{ background: "linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Interview Prep Hub
                                </h1>
                                <p className="text-sm" style={{ color: "#4f557d" }}>
                                    Upload your resume &amp; job description — get personalized Q&amp;A, topics to prepare, and resume tips powered by AI.
                                </p>
                            </div>

                            {/* ══ UPLOAD FORM (shown when no active result OR explicitly new) ══ */}
                            {!activeResult && (
                                <div className="rounded-3xl p-8 mb-8"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(20,21,30,0.95), rgba(8,9,13,0.98))",
                                        border: "1px solid rgba(139,92,246,0.18)",
                                        boxShadow: "0 0 80px rgba(139,92,246,0.05)",
                                    }}>

                                    {/* ── Two boxes side by side ── */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                                        {/* Resume Upload Box */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4f557d" }}>
                                                    Resume <span style={{ color: "#8b5cf6" }}>*</span>
                                                </label>
                                                {resumeFile && (
                                                    <button onClick={() => setResumeFile(null)} className="text-xs" style={{ color: "#3a3d52" }}>✕ Remove</button>
                                                )}
                                            </div>
                                            <div
                                                onDragOver={e => { e.preventDefault(); setResumeDrag(true); }}
                                                onDragLeave={() => setResumeDrag(false)}
                                                onDrop={onResumeDrop}
                                                onClick={() => resumeRef.current?.click()}
                                                className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 cursor-pointer transition-all"
                                                style={{
                                                    background: resumeDrag ? "rgba(139,92,246,0.1)" : resumeFile ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.02)",
                                                    border: `2px dashed ${resumeFile ? "#8b5cf6" : resumeDrag ? "#a78bfa" : "rgba(255,255,255,0.08)"}`,
                                                    minHeight: 200,
                                                }}
                                            >
                                                {resumeFile ? (
                                                    <>
                                                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                                                            style={{ background: "rgba(139,92,246,0.15)" }}>✅</div>
                                                        <div className="text-center px-4">
                                                            <p className="text-sm font-semibold" style={{ color: "#c4b5fd" }}>{shortName(resumeFile.name, 28)}</p>
                                                            <p className="text-xs mt-1" style={{ color: "#4f557d" }}>
                                                                {(resumeFile.size / 1024).toFixed(0)} KB
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>📄</div>
                                                        <div className="text-center px-4">
                                                            <p className="text-sm font-semibold" style={{ color: "#6870a6" }}>Drop or click to upload</p>
                                                            <p className="text-xs mt-1" style={{ color: "#3a3d52" }}>PDF or DOCX · Max 5 MB</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input ref={resumeRef} type="file" accept=".pdf,.docx" className="hidden"
                                                    onChange={e => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                                            </div>
                                        </div>

                                        {/* JD Box */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4f557d" }}>
                                                    Job Description <span style={{ color: "#3a3d52" }}>(Optional)</span>
                                                </label>
                                                {/* Toggle paste / upload */}
                                                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                                                    {(["paste", "upload"] as const).map(m => (
                                                        <button key={m} onClick={() => setJdMode(m)}
                                                            className="px-3 py-1 text-xs font-semibold transition-all"
                                                            style={{
                                                                background: jdMode === m ? "rgba(139,92,246,0.25)" : "transparent",
                                                                color: jdMode === m ? "#c4b5fd" : "#4f557d",
                                                            }}>
                                                            {m === "paste" ? "✏️ Paste" : "📎 File"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {jdMode === "paste" ? (
                                                <textarea
                                                    rows={8}
                                                    placeholder="Paste the job description here for targeted Q&amp;A and tailored preparation tips..."
                                                    value={jdText}
                                                    onChange={e => setJdText(e.target.value)}
                                                    className="rounded-2xl px-4 py-3 text-sm text-white outline-none resize-none flex-1"
                                                    style={{
                                                        background: "rgba(255,255,255,0.03)",
                                                        border: "1px solid rgba(139,92,246,0.18)",
                                                        minHeight: 200,
                                                        lineHeight: 1.7,
                                                        scrollbarWidth: "none",
                                                    }}
                                                    onFocus={e => (e.currentTarget.style.border = "1px solid rgba(139,92,246,0.55)")}
                                                    onBlur={e => (e.currentTarget.style.border = "1px solid rgba(139,92,246,0.18)")}
                                                />
                                            ) : (
                                                <div
                                                    onDragOver={e => { e.preventDefault(); setJdDrag(true); }}
                                                    onDragLeave={() => setJdDrag(false)}
                                                    onDrop={onJdFileDrop}
                                                    onClick={() => jdFileRef.current?.click()}
                                                    className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all"
                                                    style={{
                                                        background: jdDrag ? "rgba(139,92,246,0.08)" : jdFile ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)",
                                                        border: `2px dashed ${jdFile ? "#8b5cf6" : jdDrag ? "#a78bfa" : "rgba(255,255,255,0.08)"}`,
                                                        minHeight: 200,
                                                    }}
                                                >
                                                    {jdFile ? (
                                                        <>
                                                            <span className="text-3xl">📎</span>
                                                            <div className="text-center px-4">
                                                                <p className="text-sm font-semibold" style={{ color: "#c4b5fd" }}>{shortName(jdFile.name, 28)}</p>
                                                                <p className="text-xs mt-1" style={{ color: "#4f557d" }}>{(jdFile.size / 1024).toFixed(0)} KB</p>
                                                            </div>
                                                            <button onClick={e => { e.stopPropagation(); setJdFile(null); }}
                                                                className="text-xs px-3 py-1 rounded-lg" style={{ color: "#3a3d52", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                                Remove
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-3xl">📋</span>
                                                            <div className="text-center px-4">
                                                                <p className="text-sm font-semibold" style={{ color: "#6870a6" }}>Drop or click to upload JD</p>
                                                                <p className="text-xs mt-1" style={{ color: "#3a3d52" }}>PDF, DOCX, or TXT · Max 2 MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <input ref={jdFileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) setJdFile(f); }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!resumeFile || loading}
                                        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-35 flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Analyzing Resume with AI…
                                            </>
                                        ) : "✨ Generate Prep Plan"}
                                    </button>
                                </div>
                            )}

                            {/* ══ RESULTS ══ */}
                            {activeResult && (
                                <>
                                    {/* Result header bar */}
                                    <div className="flex items-center gap-4 mb-6 rounded-2xl px-5 py-4"
                                        style={{ background: "rgba(20,21,30,0.95)", border: "1px solid rgba(139,92,246,0.18)" }}>
                                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                            style={{ background: "rgba(139,92,246,0.15)" }}>📄</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{activeResult.fileName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs" style={{ color: "#4f557d" }}>{formatDate(activeResult.createdAt)}</p>
                                                {activeResult.hasJD && (
                                                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                                                        style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>+JD</span>
                                                )}
                                                <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                                                    style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7" }}>
                                                    {activeResult.qa.length} Questions
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setActiveResult(null); setResumeFile(null); setJdText(""); setJdFile(null); setError(""); }}
                                            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:bg-white/5"
                                            style={{ color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.25)" }}
                                        >
                                            + New Session
                                        </button>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[
                                            { label: "Questions", value: activeResult.qa.length, color: "#8b5cf6", icon: "❓" },
                                            { label: "Topics", value: activeResult.topics.length, color: "#06b6d4", icon: "📚" },
                                            { label: "Resume Tips", value: activeResult.tips.length, color: "#f59e0b", icon: "💡" },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-2xl px-5 py-4"
                                                style={{ background: "rgba(20,21,30,0.95)", border: `1px solid ${s.color}20` }}>
                                                <p className="text-2xl font-extrabold mb-0.5" style={{ color: s.color }}>{s.value}</p>
                                                <p className="text-xs" style={{ color: "#4f557d" }}>{s.icon} {s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-5">
                                        {([
                                            { key: "qa", label: "📋 Interview Q&A" },
                                            { key: "topics", label: "📚 Topics to Prepare" },
                                            { key: "tips", label: "💡 Resume Tips" },
                                        ] as const).map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                style={{
                                                    background: activeTab === tab.key ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                                                    border: `1px solid ${activeTab === tab.key ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.06)"}`,
                                                    color: activeTab === tab.key ? "#c4b5fd" : "#4f557d",
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ── Q&A Tab ── */}
                                    {activeTab === "qa" && (
                                        <>
                                            {/* Category filter */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {categories.map(cat => (
                                                    <button key={cat} onClick={() => { setActiveCategory(cat); setExpandedQ(null); }}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                                                        style={{
                                                            background: activeCategory === cat ? `${CAT_COLORS[cat] ?? "#8b5cf6"}20` : "rgba(255,255,255,0.03)",
                                                            border: `1px solid ${activeCategory === cat ? (CAT_COLORS[cat] ?? "#8b5cf6") + "55" : "rgba(255,255,255,0.06)"}`,
                                                            color: activeCategory === cat ? (CAT_COLORS[cat] ?? "#c4b5fd") : "#4f557d",
                                                        }}>
                                                        {cat} {cat === "All" ? `(${activeResult.qa.length})` : `(${activeResult.qa.filter(q => q.category === cat).length})`}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                {filteredQA.map((item, i) => (
                                                    <div key={i} className="rounded-2xl overflow-hidden transition-all"
                                                        style={{
                                                            background: "linear-gradient(145deg, rgba(20,21,30,0.95), rgba(8,9,13,0.98))",
                                                            border: `1px solid ${expandedQ === i ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.05)"}`,
                                                        }}>
                                                        <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                                                            onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0"
                                                                    style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>Q{i + 1}</span>
                                                                <span className="text-sm font-semibold text-white truncate">{item.q}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs px-2 py-1 rounded-md font-medium hidden sm:block"
                                                                    style={{ background: `${CAT_COLORS[item.category] ?? "#8b5cf6"}15`, color: CAT_COLORS[item.category] ?? "#c4b5fd" }}>
                                                                    {item.category}
                                                                </span>
                                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                                    className="transition-transform" style={{ transform: expandedQ === i ? "rotate(180deg)" : "rotate(0deg)", color: "#4f557d" }}>
                                                                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                        {expandedQ === i && (
                                                            <div className="px-5 pb-5">
                                                                <div className="h-px mb-4" style={{ background: "rgba(139,92,246,0.12)" }} />
                                                                <div className="flex gap-3">
                                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0"
                                                                        style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7" }}>A</span>
                                                                    <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>{item.a}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* ── Topics Tab ── */}
                                    {activeTab === "topics" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {activeResult.topics.map((topic, i) => (
                                                <div key={i} className="flex items-start gap-3 rounded-2xl p-4"
                                                    style={{
                                                        background: "linear-gradient(145deg, rgba(20,21,30,0.95), rgba(8,9,13,0.98))",
                                                        border: "1px solid rgba(6,182,212,0.15)",
                                                    }}>
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 mt-0.5"
                                                        style={{ background: "rgba(6,182,212,0.15)", color: "#67e8f9" }}>{i + 1}</span>
                                                    <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{topic}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── Tips Tab ── */}
                                    {activeTab === "tips" && (
                                        <>
                                            {/* Summary counts */}
                                            <div className="grid grid-cols-3 gap-3 mb-5">
                                                {[
                                                    { type: "strength", label: "Strengths", color: "#10b981", icon: "✅", count: tipCount.strength },
                                                    { type: "improve", label: "Improve", color: "#f59e0b", icon: "⚠️", count: tipCount.improve },
                                                    { type: "missing", label: "Missing", color: "#ef4444", icon: "❌", count: tipCount.missing },
                                                ].map(s => (
                                                    <div key={s.type} className="rounded-xl px-4 py-3 text-center"
                                                        style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                                                        <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.count}</p>
                                                        <p className="text-xs mt-0.5" style={{ color: "#4f557d" }}>{s.icon} {s.label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-3 mb-6">
                                                {activeResult.tips.map((tip, i) => {
                                                    const cfg = tip.type === "strength"
                                                        ? { color: "#10b981", label: "✅ Strength", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" }
                                                        : tip.type === "improve"
                                                            ? { color: "#f59e0b", label: "⚠️ Improve", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" }
                                                            : { color: "#ef4444", label: "❌ Missing", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
                                                    return (
                                                        <div key={i} className="flex gap-4 rounded-2xl p-5"
                                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                                            <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 h-fit mt-0.5"
                                                                style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                                                            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{tip.text}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* CTA */}
                                            <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))",
                                                    border: "1px solid rgba(245,158,11,0.2)",
                                                }}>
                                                <div>
                                                    <p className="font-bold text-white mb-1">Want a professionally rewritten resume?</p>
                                                    <p className="text-sm" style={{ color: "#4f557d" }}>
                                                        Use Career Elevate — an AI tool that rewrites and enhances your resume end-to-end.
                                                    </p>
                                                </div>
                                                <a
                                                    href="https://career-elevate-gamma.vercel.app/"
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex-shrink-0 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                                                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 0 24px rgba(245,158,11,0.2)", whiteSpace: "nowrap" }}
                                                >
                                                    🚀 Improve My Resume ↗
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}