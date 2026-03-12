"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const INTERVIEW_CATEGORIES = [
    { id: "fullstack", label: "Full Stack", icon: "⚡", color: "#6366f1", desc: "React, Node, DBs & APIs" },
    { id: "frontend", label: "Frontend", icon: "🎨", color: "#8b5cf6", desc: "React, CSS, Performance" },
    { id: "backend", label: "Backend", icon: "⚙️", color: "#3b82f6", desc: "APIs, DBs, Architecture" },
    { id: "system-design", label: "System Design", icon: "🏗️", color: "#06b6d4", desc: "Scale, Trade-offs" },
    { id: "devops", label: "DevOps", icon: "🚀", color: "#10b981", desc: "CI/CD, Docker, Cloud" },
    { id: "dsa", label: "DSA", icon: "🧩", color: "#f59e0b", desc: "Algorithms & Complexity" },
    { id: "android", label: "Android", icon: "📱", color: "#ef4444", desc: "Kotlin, Jetpack Compose" },
    { id: "hr", label: "HR Round", icon: "🤝", color: "#ec4899", desc: "Behavioral & Culture Fit" },
];

const COMPANIES = [
    { name: "Google", logo: "/google.png", color: "#4285F4" },
    { name: "Amazon", logo: "/amazon.png", color: "#FF9900" },
    { name: "Microsoft", logo: "/microsoft.png", color: "#00A4EF" },
    { name: "Meta", logo: "/facebook.png", color: "#0866FF" },
    { name: "Spotify", logo: "/spotify.png", color: "#1DB954" },
    { name: "Adobe", logo: "/adobe.png", color: "#FF0000" },
    { name: "Reddit", logo: "/reddit.png", color: "#FF4500" },
    { name: "Pinterest", logo: "/pinterest.png", color: "#E60023" },
];

const DUMMY_PAST = [
    { id: "1", role: "Frontend Developer", type: "Technical", level: "Junior", techstack: ["React", "TypeScript"], createdAt: "2025-03-10", score: 78 },
    { id: "2", role: "Full Stack Developer", type: "Mixed", level: "Senior", techstack: ["Node.js", "MongoDB"], createdAt: "2025-03-08", score: 85 },
];

const LEVELS = ["Beginner", "Junior", "Mid-Level", "Senior", "Principal"];
const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Android Developer", "System Design", "DSA", "HR Round"];

// ── Interview Form Modal ────────────────────────────────────────────────────
function InterviewFormModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "", role: "", experience: "", level: "",
        resume: null as File | null, jd: "", duration: "30",
    });

    const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
            <div
                className="relative w-full max-w-lg rounded-3xl overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, #1a1c2e, #08090d)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    boxShadow: "0 0 80px rgba(99,102,241,0.15)",
                }}
            >
                {/* Top accent */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #06b6d4)" }} />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Configure Your Interview</h2>
                            <p className="text-xs mt-1" style={{ color: "#4f557d" }}>Step {step} of 2</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5 5l10 10M5 15L15 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: step === 1 ? "50%" : "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}
                        />
                    </div>

                    {step === 1 ? (
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "Your Name", key: "name", placeholder: "John Doe", type: "text" },
                                { label: "Years of Experience", key: "experience", placeholder: "e.g. 2", type: "number" },
                            ].map(f => (
                                <div key={f.key} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>{f.label}</label>
                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={(form as any)[f.key]}
                                        onChange={e => update(f.key, e.target.value)}
                                        className="rounded-xl px-4 py-3 text-sm text-white outline-none"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}
                                        onFocus={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.6)")}
                                        onBlur={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.2)")}
                                    />
                                </div>
                            ))}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => update("role", e.target.value)}
                                    className="rounded-xl px-4 py-3 text-sm text-white outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}
                                >
                                    <option value="" style={{ background: "#1a1c2e" }}>Select role...</option>
                                    {ROLES.map(r => <option key={r} value={r} style={{ background: "#1a1c2e" }}>{r}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Level</label>
                                <div className="flex gap-2 flex-wrap">
                                    {LEVELS.map(l => (
                                        <button
                                            key={l}
                                            onClick={() => update("level", l)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                            style={{
                                                background: form.level === l ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
                                                border: `1px solid ${form.level === l ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                                                color: form.level === l ? "#a5b4fc" : "#6870a6",
                                            }}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!form.name || !form.role || !form.level}
                                className="mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                            >
                                Next →
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>
                                    Upload Resume <span style={{ color: "#6366f1" }}>(Required)</span>
                                </label>
                                <label
                                    className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition-all"
                                    style={{
                                        background: form.resume ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                                        border: `2px dashed ${form.resume ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                                    }}
                                >
                                    <span className="text-2xl">{form.resume ? "✅" : "📄"}</span>
                                    <span className="text-xs" style={{ color: "#6870a6" }}>
                                        {form.resume ? form.resume.name : "Click to upload PDF or DOCX"}
                                    </span>
                                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => update("resume", e.target.files?.[0] || null)} />
                                </label>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>
                                    Job Description <span style={{ color: "#4f557d" }}>(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Paste the job description here..."
                                    value={form.jd}
                                    onChange={e => update("jd", e.target.value)}
                                    className="rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}
                                    onFocus={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.6)")}
                                    onBlur={e => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.2)")}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Interview Duration</label>
                                <div className="flex gap-2">
                                    {["15", "30", "45", "60"].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => update("duration", d)}
                                            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: form.duration === d ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
                                                border: `1px solid ${form.duration === d ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                                                color: form.duration === d ? "#a5b4fc" : "#6870a6",
                                            }}
                                        >
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 rounded-xl py-3.5 text-sm font-bold transition-all hover:bg-white/10"
                                    style={{ color: "#6870a6", border: "1px solid rgba(255,255,255,0.1)" }}
                                >
                                    ← Back
                                </button>
                                <button
                                    disabled={!form.resume}
                                    className="flex-1 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 24px rgba(99,102,241,0.3)" }}
                                >
                                    🎙️ Start Interview
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function InterviewPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="min-h-screen px-6 py-10 mx-auto max-w-7xl" style={{ color: "#fff" }}>
            {showForm && <InterviewFormModal onClose={() => setShowForm(false)} />}

            {/* ── 1. Start Interview Hero ── */}
            <section
                className="relative overflow-hidden rounded-3xl p-10 md:p-14 mb-12 flex flex-col md:flex-row items-center justify-between gap-8"
                style={{
                    background: "linear-gradient(135deg, #171532 0%, #1e1040 50%, #08090d 100%)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    boxShadow: "0 0 80px rgba(99,102,241,0.1)",
                }}
            >
                <div aria-hidden className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(40px)" }} />

                <div className="relative z-10 max-w-xl">
                    <div
                        className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        AI Interviewer Ready
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4"
                        style={{ background: "linear-gradient(135deg, #fff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                        Start Your AI Mock Interview
                    </h1>
                    <p className="text-base mb-6" style={{ color: "#6870a6" }}>
                        Configure your role, upload your resume, and get interviewed by a real-time AI voice agent. Get instant feedback after every session.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
                    >
                        🎙️ Start Interview
                    </button>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                    {[
                        { icon: "🎯", label: "Role-specific questions" },
                        { icon: "📊", label: "Instant AI feedback" },
                        { icon: "🔁", label: "Unlimited practice" },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 rounded-xl px-5 py-3"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-medium" style={{ color: "#d6e0ff" }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 2. Past Interviews ── */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Your Interviews</h2>
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                        {DUMMY_PAST.length} sessions
                    </span>
                </div>

                {DUMMY_PAST.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <p className="text-4xl mb-3">🎙️</p>
                        <p className="text-sm" style={{ color: "#4f557d" }}>No interviews yet. Start your first one above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {DUMMY_PAST.map(iv => (
                            <div key={iv.id} className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-1"
                                style={{ background: "linear-gradient(145deg, rgba(36,38,51,0.8), rgba(8,9,13,0.9))", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-white">{iv.role}</p>
                                        <p className="text-xs mt-1" style={{ color: "#4f557d" }}>{iv.level} · {iv.type}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-extrabold" style={{ color: iv.score >= 80 ? "#49de50" : iv.score >= 60 ? "#f59e0b" : "#f75353" }}>
                                            {iv.score}
                                        </span>
                                        <span className="text-[10px]" style={{ color: "#4f557d" }}>score</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {iv.techstack.map(t => (
                                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                                            style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{t}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs" style={{ color: "#4f557d" }}>{new Date(iv.createdAt).toLocaleDateString()}</span>
                                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                        style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                                        View Feedback →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── 3. Interview Categories ── */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Technical Interview Tracks</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {INTERVIEW_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setShowForm(true)}
                            className="group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
                            style={{ background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))", border: "1px solid rgba(255,255,255,0.06)" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${cat.color}50`;
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px ${cat.color}20`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.06)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            }}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                                style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                                {cat.icon}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{cat.label}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#4f557d" }}>{cat.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── 4. Company-wise Interviews ── */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Company-Wise Interviews</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {COMPANIES.map(co => (
                        <button
                            key={co.name}
                            onClick={() => setShowForm(true)}
                            className="group flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                            style={{ background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))", border: "1px solid rgba(255,255,255,0.06)" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${co.color}50`;
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px ${co.color}20`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.06)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            }}
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <Image src={co.logo} alt={co.name} width={36} height={36} className="object-contain" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-white text-sm">{co.name}</p>
                                <p className="text-[11px]" style={{ color: "#4f557d" }}>Interview Prep</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}