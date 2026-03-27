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
        <div className="rounded-2xl overflow-hidden transition-all"
            style={{ background: "rgba(59,130,246,0.03)", border: `1px solid ${open ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.08)"}` }}>
            <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                onClick={() => setOpen(o => !o)}>
                <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>Q{index}</span>
                    <span className="text-sm font-semibold text-white truncate">{qb.question}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-black" style={{ color: col }}>{qb.score}/10</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0)", color: "#2a3550" }}>
                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </button>
            {open && (
                <div className="px-5 pb-5 space-y-3">
                    <div className="h-px" style={{ background: "rgba(59,130,246,0.08)" }} />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#2a3550" }}>Your Answer</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{qb.answer || "No response recorded."}</p>
                    </div>
                    <div className="rounded-xl px-4 py-3"
                        style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.14)" }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#3b82f6" }}>Feedback</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{qb.feedback}</p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(59,130,246,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${qb.score * 10}%`, background: col }} />
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
            <div className="flex items-center justify-center min-h-screen" style={{ background: "#06080f" }}>
                <div className="text-center max-w-sm px-8">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-5" />
                    <p className="text-lg font-black text-white mb-2">
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
            <div className="flex items-center justify-center min-h-screen" style={{ background: "#06080f" }}>
                <div className="text-center max-w-sm p-8 rounded-2xl"
                    style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <p className="text-lg font-black text-white mb-2">Feedback Not Ready</p>
                    <p className="text-sm mb-6" style={{ color: "#3d5070" }}>
                        The interview may still be processing. Try again in a moment.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={triggerFeedback}
                            className="flex-1 h-11 rounded-xl text-sm font-bold text-white"
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
        <div style={{ background: "#06080f", minHeight: "100vh", color: "#fff" }}>
            <main className="mx-auto max-w-5xl px-6 py-12">

                {/* Back */}
                <Link href="/interview" className="inline-flex items-center gap-2 mb-8 opacity-70 hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="#3d5070" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm" style={{ color: "#3d5070" }}>Back to Interviews</span>
                </Link>

                {/* Heading */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
                        Interview Feedback
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2"
                        style={{ background: "linear-gradient(135deg,#fff 30%,#60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {session?.interviewType ?? session?.company ?? "Interview"} Results
                    </h1>
                    <p className="text-sm" style={{ color: "#2a3550" }}>
                        {session?.role} · {session?.experienceLevel} · {session ? fmtDate(session.createdAt) : ""}
                    </p>
                </div>

                {/* ── TOP ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                    {/* Overall score */}
                    <div className="flex flex-col items-center justify-center rounded-2xl p-8"
                        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                        <ScoreRing value={feedback.overallScore} size={120} />
                        <p className="text-xl font-black mt-4" style={{ color: col }}>{scoreGrade(feedback.overallScore)}</p>
                        <p className="text-xs mt-1 text-center" style={{ color: "#2a3550" }}>Overall Performance</p>
                        <Badge className="mt-3 text-xs font-semibold border-0"
                            style={{ background: `${col}18`, color: col }}>
                            {feedback.overallScore >= 70 ? "Ready for interviews" : "Needs more practice"}
                        </Badge>
                    </div>
                    {/* Score bars */}
                    <div className="rounded-2xl p-6 space-y-4"
                        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                        <p className="text-sm font-black text-white mb-4">Score Breakdown</p>
                        <ScoreBar label="Overall Score" value={feedback.overallScore} />
                        <ScoreBar label="Technical Accuracy" value={feedback.technicalScore} />
                        <ScoreBar label="Communication" value={feedback.communicationScore} />
                        <ScoreBar label="Problem Solving" value={feedback.problemSolvingScore} />
                    </div>
                    {/* Radar */}
                    <div className="rounded-2xl p-6"
                        style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                        <p className="text-sm font-black text-white mb-4">Skill Radar</p>
                        <ResponsiveContainer width="100%" height={170}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(59,130,246,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#2a3550", fontSize: 10 }} />
                                <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl px-6 py-5 mb-6"
                    style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>Summary</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{feedback.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="rounded-2xl p-6"
                        style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-5 w-5 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(16,185,129,0.15)" }}>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M1.5 5.5l3 3 5-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-black" style={{ color: "#10b981" }}>Strengths</p>
                        </div>
                        <ul className="space-y-2.5">
                            {feedback.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#10b981" }} />
                                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{s}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl p-6"
                        style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-5 w-5 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(239,68,68,0.15)" }}>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M5.5 1v5M5.5 9v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-black" style={{ color: "#ef4444" }}>Areas to Improve</p>
                        </div>
                        <ul className="space-y-2.5">
                            {feedback.weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />
                                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{w}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Plan */}
                <div className="rounded-2xl p-6 mb-8"
                    style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <p className="text-sm font-black text-white mb-4">Action Plan — What to Improve</p>
                    <div className="space-y-3">
                        {feedback.improvements.map((imp, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black flex-shrink-0 mt-0.5"
                                    style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{i + 1}</span>
                                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{imp}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Breakdown */}
                <div>
                    <p className="text-xl font-black text-white mb-4">Per-Question Breakdown</p>
                    <div className="space-y-3">
                        {feedback.questionBreakdown.map((qb, i) => (
                            <QuestionCard key={i} qb={qb} index={i + 1} />
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex items-center gap-4">
                    <Link href="/interview"
                        className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                        Practice Again
                    </Link>
                    <Link href="/interview"
                        className="flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all hover:bg-white/5"
                        style={{ color: "#3d5070", border: "1px solid rgba(59,130,246,0.15)" }}>
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
}