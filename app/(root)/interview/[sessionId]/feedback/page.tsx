// app/(root)/interview/[sessionId]/feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import type { InterviewSession, InterviewFeedback } from "@/types/interview";

/* ─── helpers ─── */
function scoreColor(s: number) {
    if (s >= 80) return "#3b82f6";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
}
function scoreGrade(s: number) {
    if (s >= 90) return "Outstanding";
    if (s >= 80) return "Excellent";
    if (s >= 70) return "Proficient";
    if (s >= 60) return "Adequate";
    return "Needs Work";
}
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── score ring ─── */
function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
    const r = size * 0.4;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;
    const col = scoreColor(value);
    const cx = size / 2;
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth={6} />
                <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={6}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <div className="absolute text-center">
                <p className="font-black" style={{ fontSize: size * 0.22, color: col, lineHeight: 1 }}>{value}</p>
                <p className="text-xs font-bold" style={{ color: "#2a3550" }}>/ 100</p>
            </div>
        </div>
    );
}

/* ─── score bar ─── */
function ScoreBar({ label, value }: { label: string; value: number }) {
    const col = scoreColor(value);
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold" style={{ color: "#3d5070" }}>{label}</p>
                <p className="text-xs font-black" style={{ color: col }}>{value}%</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(59,130,246,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, background: `linear-gradient(90deg,${col}80,${col})` }} />
            </div>
        </div>
    );
}

/* ─── question card ─── */
function QuestionCard({ qb, index }: { qb: InterviewFeedback["questionBreakdown"][0]; index: number }) {
    const [open, setOpen] = useState(false);
    const col = scoreColor(qb.score * 10);
    return (
        <div className="rounded-2xl overflow-hidden transition-all bg-white"
            style={{ border: `2px solid ${open ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"}`, boxShadow: open ? "0 10px 30px rgba(0,0,0,0.05)" : "none" }}>
            <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                onClick={() => setOpen(o => !o)}>
                <div className="flex items-center gap-4 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black tracking-widest flex-shrink-0"
                        style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", color: "#000" }}>Q{index}</span>
                    <span className="text-sm font-black text-slate-900 truncate">{qb.question}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: `${col}15`, color: col }}>{qb.score} / 10</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0)", color: "#000" }}>
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
            </button>
            {open && (
                <div className="px-6 pb-6 space-y-4">
                    <div className="h-px bg-slate-100" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">Speaker Transcript</p>
                        <p className="text-sm font-bold leading-relaxed text-slate-700">{qb.answer || "No response recorded."}</p>
                    </div>
                    <div className="rounded-2xl px-5 py-4 bg-slate-50"
                        style={{ border: "2px solid rgba(0,0,0,0.05)" }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-indigo-500">AI Feedback</p>
                        <p className="text-sm font-bold leading-relaxed text-slate-700">{qb.feedback}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── PAGE ─── */
export default function FeedbackPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        loadSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    async function loadSession() {
        try {
            const res = await fetch(`/api/interview/sessions?id=${sessionId}`);
            const data = res.ok ? await res.json() : null;
            if (data?.session) {
                setSession(data.session);
                if (data.session.feedback) {
                    setFeedback(data.session.feedback);
                } else if (data.session.status === "completed") {
                    triggerFeedback();
                } else {
                    // Still completing — poll every 3s for up to 30s
                    if (pollCount < 10) {
                        setTimeout(() => { setPollCount(c => c + 1); loadSession(); }, 3000);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function triggerFeedback() {
        setGenerating(true);
        try {
            const res = await fetch("/api/interview/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });
            if (res.ok) {
                const { feedback: fb } = await res.json();
                setFeedback(fb);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    }

    const radarData = feedback ? [
        { subject: "Technical", score: feedback.technicalScore },
        { subject: "Communication", score: feedback.communicationScore },
        { subject: "Problem Solving", score: feedback.problemSolvingScore },
        { subject: "Overall", score: feedback.overallScore },
    ] : [];

    /* ─── loading ─── */
    if (loading || generating) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: "#ffffff" }}>
                <div className="text-center max-w-sm px-8">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-5" />
                    <p className="text-lg font-black text-slate-900 mb-2">
                        {generating ? "Generating Feedback" : "Loading…"}
                    </p>
                    <p className="text-sm" style={{ color: "#3d5070" }}>
                        {generating
                            ? "Analysing your interview transcript and generating personalised feedback…"
                            : "Please wait a moment."}
                    </p>
                </div>
            </div>
        );
    }

    /* ─── no feedback yet ─── */
    if (!feedback) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: "#ffffff" }}>
                <div className="text-center max-w-sm p-8 rounded-2xl"
                    style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <p className="text-lg font-black text-slate-900 mb-2">Feedback Not Ready</p>
                    <p className="text-sm mb-6" style={{ color: "#3d5070" }}>
                        The interview may still be processing. Try again in a moment.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={triggerFeedback}
                            className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-900"
                            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                            Generate Feedback
                        </button>
                        <Link href="/interview"
                            className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center"
                            style={{ color: "#3d5070", border: "1px solid rgba(59,130,246,0.15)" }}>
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const col = scoreColor(feedback.overallScore);

    return (
        <div style={{ background: "#ffffff", minHeight: "100vh", color: "#0f172a" }}>
            <main className="mx-auto max-w-5xl px-6 py-12">

                {/* Back */}
                <Link href="/interview" className="inline-flex items-center gap-2 mb-8 opacity-70 hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="#3d5070" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm" style={{ color: "#3d5070" }}>Back to Interviews</span>
                </Link>

                {/* Heading */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        style={{ background: "#ffffff", border: "2px solid #000000", color: "#000000" }}>
                        Interview Results Analysis
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 leading-[0.9]">
                        Review Your <span style={{ background: "linear-gradient(135deg, #000, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Performance</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                        {session?.role} <span className="h-1 w-1 rounded-full bg-slate-300" /> {session?.experienceLevel} <span className="h-1 w-1 rounded-full bg-slate-300" /> {session ? fmtDate(session.createdAt) : ""}
                    </p>
                </div>

                {/* ── TOP ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Overall score */}
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] p-10 bg-white"
                        style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                        <ScoreRing value={feedback.overallScore} size={140} />
                        <p className="text-2xl font-black mt-6 tracking-tight" style={{ color: col }}>{scoreGrade(feedback.overallScore)}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-400">Total Performance</p>
                        <div className="mt-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                            style={{ background: `${col}15`, color: col, border: `1px solid ${col}30` }}>
                            {feedback.overallScore >= 70 ? "Interview Ready" : "Improvement Needed"}
                        </div>
                    </div>
                    {/* Score bars */}
                    <div className="rounded-[2.5rem] p-8 space-y-6 bg-white"
                        style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 mb-2">Detailed Metrics</p>
                        <ScoreBar label="Communication Skill" value={feedback.communicationScore} />
                        <ScoreBar label="Technical Accuracy" value={feedback.technicalScore} />
                        <ScoreBar label="Problem Solving" value={feedback.problemSolvingScore} />
                        <ScoreBar label="Metric Consistency" value={feedback.overallScore} />
                    </div>
                    {/* Radar */}
                    <div className="rounded-[2.5rem] p-8 bg-white flex flex-col"
                        style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 mb-6">Visual Analysis</p>
                        <div className="flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={180}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                                    <Radar dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={2.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="rounded-3xl px-8 py-8 mb-8 bg-white relative overflow-hidden"
                    style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-black" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-800">Executive Summary</p>
                    <p className="text-lg font-black leading-relaxed text-slate-900">{feedback.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="rounded-[2.5rem] p-8 bg-white"
                        style={{ border: "2px solid #10b981", boxShadow: "0 15px 40px rgba(16,185,129,0.08)" }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl"
                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                                ✓
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-900">Key Strengths</p>
                        </div>
                        <ul className="space-y-4">
                            {feedback.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="h-2 w-2 rounded-full mt-2 flex-shrink-0 bg-emerald-500" />
                                    <p className="text-sm font-black leading-relaxed text-slate-800">{s}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[2.5rem] p-8 bg-white"
                        style={{ border: "2px solid #ef4444", boxShadow: "0 15px 40px rgba(239,68,68,0.08)" }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                !
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-900">Growth Areas</p>
                        </div>
                        <ul className="space-y-4">
                            {feedback.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="h-2 w-2 rounded-full mt-2 flex-shrink-0 bg-red-500" />
                                    <p className="text-sm font-black leading-relaxed text-slate-800">{w}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Plan */}
                <div className="rounded-[2.5rem] p-8 mb-10 bg-white relative overflow-hidden"
                    style={{ border: "2px solid #3b82f6", boxShadow: "0 20px 50px rgba(59,130,246,0.08)" }}>
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-blue-500" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                            ⚡
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-900">Action Plan — Precision Roadmap</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedback.improvements.map((imp, i) => (
                            <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black flex-shrink-0"
                                    style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>{i + 1}</span>
                                <p className="text-sm font-bold leading-relaxed text-slate-700 group-hover:text-slate-900 transition-colors">{imp}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Breakdown */}
                <div>
                    <p className="text-xl font-black text-slate-900 mb-4">Per-Question Breakdown</p>
                    <div className="space-y-3">
                        {feedback.questionBreakdown.map((qb, i) => (
                            <QuestionCard key={i} qb={qb} index={i + 1} />
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 flex items-center gap-6">
                    <Link href="/interview"
                        className="flex-1 h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white flex items-center justify-center transition-all hover:scale-[1.02] shadow-[0_20px_40px_rgba(79,70,229,0.3)]"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none" }}>
                        Practice Again
                    </Link>
                    <Link href="/interview"
                        className="flex-1 h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-50"
                        style={{ color: "#000", border: "2px solid rgba(0,0,0,0.15)" }}>
                        Dashboard Home
                    </Link>
                </div>
            </main>
        </div>
    );
}