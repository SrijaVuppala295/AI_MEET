"use client";

import { useState, useEffect, useCallback } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface QuizSession {
    id: string;
    topic: string;
    level: string;
    correct: number;
    total: number;
    score: number;
    createdAt: string;
    feedback?: string;
    durationSeconds?: number;
}
interface QuizStats {
    avgScore: number;
    bestScore: number;
    latestScore: number;
    totalQuestions: number;
    totalSessions: number;
    improvement: number;
    streak: number;
    topicsCovered: number;
}
interface ScorePoint { date: string; score: number; fullDate: string }
interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}
interface ActiveQuiz { topic: string; level: string; questions: Question[] }

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const TOPICS = [
    "JavaScript", "TypeScript", "React", "Node.js",
    "System Design", "Data Structures & Algorithms",
    "CSS & HTML", "SQL & Databases",
    "Git & Version Control", "Docker & Containers",
    "AWS & Cloud", "HR & Behavioral",
];
const DIFFICULTY_LEVELS = [
    { value: "beginner", label: "Beginner", sub: "Foundational concepts" },
    { value: "intermediate", label: "Intermediate", sub: "Applied problem solving" },
    { value: "advanced", label: "Advanced", sub: "Expert-depth questions" },
];
const QUESTION_COUNTS = [5, 10, 15, 20];

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function pct(c: number, t: number) { return t === 0 ? 0 : Math.round((c / t) * 100); }

function scoreColor(s: number) {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
}

function scoreGrade(s: number) {
    if (s >= 90) return "Excellent";
    if (s >= 75) return "Proficient";
    if (s >= 60) return "Adequate";
    return "Needs Work";
}

function fmtDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
        + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/* ══════════════════════════════════════════
   CUSTOM CHART TOOLTIP
══════════════════════════════════════════ */
interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ScorePoint;
    }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    const { score, fullDate } = payload[0].payload;
    return (
        <div style={{
            background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "10px 14px",
        }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Score: {score}%</p>
            <p style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{fullDate}</p>
        </div>
    );
}

/* ══════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════ */
function Steps({ current }: { current: 1 | 2 }) {
    return (
        <div className="flex items-center gap-1.5 mb-6">
            {[1, 2].map(s => (
                <div key={s}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ width: s === current ? 24 : 6, background: s <= current ? "#fff" : "rgba(255,255,255,0.15)" }} />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════
   QUIZ CONFIG DIALOG
══════════════════════════════════════════ */
function QuizConfigDialog({
    open, onClose, onStart,
}: {
    open: boolean;
    onClose: () => void;
    onStart: (topic: string, level: string, count: number) => Promise<void>;
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("");
    const [count, setCount] = useState(10);
    const [loading, setLoading] = useState(false);

    function reset() { setStep(1); setTopic(""); setLevel(""); setCount(10); setLoading(false); onClose(); }
    const ready = topic !== "" && level !== "";

    async function handleStart() {
        setLoading(true);
        await onStart(topic, level, count);
        setLoading(false);
        reset();
    }

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) reset(); }}>
            <DialogContent
                className="max-w-[480px] p-0 overflow-hidden border-none"
                style={{ background: "transparent" }}
            >
                <div className="rounded-[2.5rem] bg-indigo-950/20 border border-white/10 backdrop-blur-3xl p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                    style={{ background: "linear-gradient(145deg, rgba(20,22,32,0.9), rgba(10,11,16,1))" }}>
                    <Steps current={step} />

                    {step === 1 && (
                        <>
                            <DialogTitle className="text-2xl font-black text-white tracking-tight mb-1">
                                Configure Quiz
                            </DialogTitle>
                            <DialogDescription className="text-sm mb-6 font-medium text-slate-400">
                                Choose topic, difficulty, and question count.
                            </DialogDescription>

                            <div className="space-y-5">
                                {/* Topic */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#444" }}>Topic</p>
                                    <Select value={topic} onValueChange={setTopic}>
                                        <SelectTrigger
                                            className="h-11 rounded-xl text-sm border-0"
                                            style={{ background: "rgba(255,255,255,0.06)", color: topic ? "#fff" : "#555" }}
                                        >
                                            <SelectValue placeholder="Select a topic" />
                                        </SelectTrigger>
                                        <SelectContent
                                            style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                                        >
                                            {TOPICS.map(t => (
                                                <SelectItem key={t} value={t} className="text-sm" style={{ color: "#ccc" }}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#444" }}>Difficulty</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DIFFICULTY_LEVELS.map(l => {
                                            const active = level === l.value;
                                            return (
                                                <button
                                                    key={l.value}
                                                    onClick={() => setLevel(l.value)}
                                                    className="flex flex-col items-start rounded-xl px-3.5 py-3 text-left transition-all"
                                                    style={{
                                                        background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                                                        border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                                                    }}
                                                >
                                                    <span className="text-xs font-bold" style={{ color: active ? "#fff" : "#666" }}>{l.label}</span>
                                                    <span className="text-[10px] mt-0.5" style={{ color: "#444" }}>{l.sub}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Count */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#444" }}>Questions</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {QUESTION_COUNTS.map(c => {
                                            const active = count === c;
                                            return (
                                                <button
                                                    key={c}
                                                    onClick={() => setCount(c)}
                                                    className="h-11 rounded-xl text-sm font-bold transition-all"
                                                    style={{
                                                        background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                                                        border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                                                        color: active ? "#fff" : "#555",
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Preview strip */}
                                {ready && (
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <span className="text-sm font-semibold text-white">{topic}</span>
                                        <div className="flex gap-2">
                                            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                                                style={{ background: "rgba(255,255,255,0.08)", color: "#aaa" }}>
                                                {DIFFICULTY_LEVELS.find(l => l.value === level)?.label}
                                            </span>
                                            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                                                style={{ background: "rgba(255,255,255,0.08)", color: "#aaa" }}>
                                                {count}Q
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => ready && setStep(2)}
                                    disabled={!ready}
                                    className="w-full h-12 rounded-xl text-sm font-bold text-black disabled:opacity-25"
                                    style={{ background: "#fff", border: "none" }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <DialogTitle className="text-2xl font-black text-white tracking-tight mb-1">
                                Ready to begin
                            </DialogTitle>
                            <DialogDescription className="text-sm mb-6" style={{ color: "#555" }}>
                                Review your settings before starting.
                            </DialogDescription>

                            <div className="space-y-4">
                                <div className="rounded-2xl overflow-hidden"
                                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                                    {[
                                        { label: "Topic", value: topic },
                                        { label: "Difficulty", value: DIFFICULTY_LEVELS.find(l => l.value === level)?.label ?? "" },
                                        { label: "Questions", value: `${count} questions` },
                                        { label: "Est. time", value: `${count * 1.5}–${count * 2} min` },
                                    ].map((row, i, arr) => (
                                        <div key={row.label}>
                                            <div className="flex items-center justify-between px-5 py-4">
                                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#444" }}>
                                                    {row.label}
                                                </span>
                                                <span className="text-sm font-bold text-white">{row.value}</span>
                                            </div>
                                            {i < arr.length - 1 && <Separator style={{ background: "rgba(255,255,255,0.06)" }} />}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={handleStart}
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-sm font-bold text-black disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: "#fff", border: "none" }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Generating Questions...
                                        </>
                                    ) : "Start Quiz"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="w-full h-11 rounded-xl text-sm font-medium"
                                    style={{ color: "#444" }}
                                >
                                    Back
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ══════════════════════════════════════════
   ACTIVE QUIZ OVERLAY
══════════════════════════════════════════ */
function ActiveQuizOverlay({
    quiz,
    onFinish,
}: {
    quiz: ActiveQuiz;
    onFinish: (correct: number, total: number, duration: number) => void;
}) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
    const [revealed, setRevealed] = useState(false);
    const [startTime] = useState(Date.now());

    const q = quiz.questions[current];
    const isLast = current === quiz.questions.length - 1;
    const progress = Math.round(((current + (revealed ? 1 : 0)) / quiz.questions.length) * 100);

    function choose(i: number) {
        if (revealed) return;
        setSelected(i);
        setRevealed(true);
        const updated = [...answers]; updated[current] = i; setAnswers(updated);
    }

    function next() {
        if (isLast) {
            const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
            onFinish(correct, quiz.questions.length, Math.round((Date.now() - startTime) / 1000));
        } else {
            setCurrent(c => c + 1); setSelected(null); setRevealed(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-6 sm:p-10 overflow-y-auto no-scrollbar"
            style={{ background: "#08090d" }}>
            <div className="w-full max-w-2xl py-8 animate-fadeIn">

                {/* Header Info */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Active Quiz</p>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{quiz.topic} · {quiz.level}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Question</p>
                        <p className="text-sm font-bold text-white">{current + 1} of {quiz.questions.length}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 rounded-full mb-10 overflow-hidden bg-white/5 border border-white/5">
                    <div className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                        style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }} />
                </div>

                {/* Question Block */}
                <div className="mb-6 p-6 rounded-2xl relative overflow-hidden"
                    style={{ 
                        background: "linear-gradient(145deg, rgba(30,32,44,0.4), rgba(15,16,22,0.6))", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                    }}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/30" />
                    <p className="text-lg font-bold text-white leading-relaxed">{q.question}</p>
                </div>

                {/* Options Grid */}
                <div className="space-y-3">
                    {q.options.map((opt, i) => {
                        const isCorrect = i === q.correctIndex;
                        const isSelected = selected === i;
                        let bg = "rgba(255,255,255,0.02)";
                        let border = "rgba(255,255,255,0.06)";
                        let color = "#6870a6";

                        if (revealed) {
                            if (isCorrect) { bg = "rgba(16,185,129,0.08)"; border = "rgba(16,185,129,0.3)"; color = "#6ee7b7"; }
                            else if (isSelected) { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.3)"; color = "#fca5a5"; }
                        } else if (isSelected) {
                            bg = "rgba(99,102,241,0.08)"; border = "rgba(99,102,241,0.4)"; color = "#fff";
                        }

                        return (
                            <button key={i} onClick={() => choose(i)}
                                className="w-full text-left rounded-xl px-5 py-3 text-sm transition-all duration-300 relative group"
                                style={{ background: bg, border: `1px solid ${border}`, color }}>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all"
                                        style={{ 
                                            background: isSelected ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                                            color: isSelected ? "#fff" : "inherit",
                                            border: "1px solid rgba(255,255,255,0.04)"
                                        }}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="font-semibold">{opt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Block */}
                {revealed && (
                    <div className="mt-8 rounded-2xl p-6 animate-slideDown shadow-[0_10px_30px_rgba(99,102,241,0.1)]"
                        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Insight & Explanation</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-indigo-100">{q.explanation}</p>
                    </div>
                )}

                <Button
                    onClick={next}
                    disabled={!revealed}
                    className="w-full mt-8 h-12 rounded-xl text-base font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 shadow-xl"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}
                >
                    {isLast ? "Complete Assessment" : "Proceed to Next ➔"}
                </Button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   RESULT OVERLAY
══════════════════════════════════════════ */
function ResultOverlay({ topic, level, correct, total, onDone }: {
    topic: string; level: string; correct: number; total: number; onDone: () => void;
}) {
    const score = pct(correct, total);
    const col = scoreColor(score);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn"
            style={{ background: "#08090d" }}>
            <div className="w-full max-w-lg text-center p-8 rounded-3xl"
                style={{ 
                    background: "linear-gradient(145deg, rgba(20,22,32,0.8), rgba(10,11,16,0.9))", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 60px 120px rgba(0,0,0,0.5)"
                }}>
                <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <span className="text-3xl text-indigo-400">🏆</span>
                </div>
                <div className="text-6xl font-black mb-4 tracking-tighter" style={{ color: col }}>{score}%</div>
                <h2 className="text-2xl font-extrabold text-white mb-2">{scoreGrade(score)}</h2>
                <div className="flex items-center justify-center gap-3 mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#4f557d" }}>{topic} · {level}</span>
                    <div className="h-1 w-1 rounded-full bg-indigo-500/50" />
                    <span className="text-sm font-bold" style={{ color: col }}>{correct} / {total} Correct</span>
                </div>
                <Button
                    onClick={onDone}
                    className="w-full h-12 rounded-xl text-base font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}
                >
                    Back to Dashboard ➔
                </Button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════ */
function StatCard({ label, value, sub, icon, color }: {
    label: string; value: string | number; sub: string; icon: React.ReactNode; color: string;
}) {
    return (
        <Card style={{ 
            background: "linear-gradient(145deg, rgba(25,27,38,0.7), rgba(15,16,22,0.8))", 
            border: `1px solid ${color}50`, 
            borderRadius: 28,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }} className="transition-all hover:translate-y-[-4px] hover:bg-white/5">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">{label}</p>
                    <p className="text-4xl font-black text-white tracking-tight">{value}</p>
                    <p className="text-[11px] mt-2 font-bold text-indigo-300/60 transition-colors group-hover:text-indigo-300">{sub}</p>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${color}15`, color: color, boxShadow: `0 0 15px ${color}20` }}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

/* ══════════════════════════════════════════
   QUIZ HISTORY CARD
══════════════════════════════════════════ */
function QuizCard({ session, index }: { session: QuizSession; index: number }) {
    const col = scoreColor(session.score);
    return (
        <Card style={{ 
            background: "rgba(25,27,38,0.4)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: 20,
            backdropFilter: "blur(10px)"
        }} className="transition-all hover:bg-white/5 group">
            <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl bg-white/10 border border-white/20">📄</div>
                        <div>
                            <h3 className="text-lg font-black text-white">Quiz #{index}</h3>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">{fmtDateTime(session.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                            {session.topic}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white/10 border-white/20 text-slate-300">
                            {session.level}
                        </Badge>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-3xl font-black mb-1" style={{ color: col }}>{session.score.toFixed(0)}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accuracy</p>
                </div>
            </CardContent>
        </Card>
    );
}

/* ══════════════════════════════════════════
   PAGE SKELETON
══════════════════════════════════════════ */
function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-2xl animate-pulse"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                ))}
            </div>
            <div className="h-80 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
        </div>
    );
}

/* ══════════════════════════════════════════
   SVG ICONS (inline, no deps)
══════════════════════════════════════════ */
const TrophyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4M12 17v4M8 21h8M12 3v14" />
        <path d="M6 3h12v6a6 6 0 01-12 0V3z" />
    </svg>
);
const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function QuizPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
    const [resultData, setResultData] = useState<{ topic: string; level: string; correct: number; total: number } | null>(null);

    const [sessions, setSessions] = useState<QuizSession[]>([]);
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
    const [loading, setLoading] = useState(true);

    /* ── Fetch real data ── */
    const fetchData = useCallback(async () => {
        try {
            // Parallel fetch stats and sessions
            const [statsRes, sessionsRes] = await Promise.all([
                fetch("/api/quiz/stats"),
                fetch("/api/quiz/sessions")
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData || null);
            }

            if (sessionsRes.ok) {
                const sessionData = await sessionsRes.json();
                setSessions(sessionData.sessions || []);
                setScoreHistory(sessionData.scoreHistory || []);
            }
        } catch (e) {
            console.error("Fetch data error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Generate questions ── */
    async function handleStartQuiz(topic: string, level: string, count: number) {
        setLoading(true);
        const res = await fetch("/api/quiz/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, level, count }),
        });
        if (!res.ok) { alert("Failed to generate questions. Please try again."); setLoading(false); return; }
        const { questions } = await res.json();
        setActiveQuiz({ topic, level, questions });
        setLoading(false);
    }

    /* ── Save result ── */
    async function handleFinish(correct: number, total: number, duration: number) {
        if (!activeQuiz) return;
        setResultData({ topic: activeQuiz.topic, level: activeQuiz.level, correct, total });
        setActiveQuiz(null);
        try {
            await fetch("/api/quiz/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: activeQuiz.topic, level: activeQuiz.level,
                    correct, total, durationSeconds: duration,
                }),
            });
            await fetchData();
        } catch (e) { console.error(e); }
    }

    const hasData = sessions.length > 0;

    /* ── Y-axis domain with padding ── */
    const yMin = scoreHistory.length
        ? Math.max(0, Math.min(...scoreHistory.map(h => h.score)) - 15)
        : 0;

    return (
        <div className="min-h-screen" style={{ color: "#fff" }}>

            {/* Overlays */}
            {activeQuiz && <ActiveQuizOverlay quiz={activeQuiz} onFinish={handleFinish} />}
            {resultData && <ResultOverlay {...resultData} onDone={() => { setResultData(null); }} />}
            <QuizConfigDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onStart={handleStartQuiz} />

            <main className="mx-auto max-w-5xl px-6 pt-32 pb-20">

                {/* ── Page heading ── */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-4"
                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        AI-Powered Skill Assessment
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-3"
                        style={{ background: "linear-gradient(135deg, #fff 30%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Knowledge Quiz
                    </h1>
                    <p className="text-base" style={{ color: "#6870a6" }}>
                        Test your technical depth and track your progress across different domains.
                    </p>
                </div>

                {/* ── Stats cards ── */}
                {loading ? <PageSkeleton /> : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                label="Average Score"
                                value={hasData ? `${stats?.avgScore ?? 0}%` : "--"}
                                sub="Across all assessments"
                                icon={<TrophyIcon />}
                                color="#8b5cf6"
                            />
                            <StatCard
                                label="Total Questions"
                                value={hasData ? (stats?.totalQuestions ?? 0) : "--"}
                                sub="Total questions answered"
                                icon={<TargetIcon />}
                                color="#6366f1"
                            />
                            <StatCard
                                label="Latest Score"
                                value={hasData ? `${stats?.latestScore ?? 0}%` : "--"}
                                sub="Most recent quiz result"
                                icon={<ClockIcon />}
                                color="#06b6d4"
                            />
                        </div>

                        {/* ── Performance Trend ── */}
                        <Card className="mb-10 overflow-hidden"
                            style={{ 
                                background: "linear-gradient(145deg, rgba(20,22,32,0.8), rgba(10,11,16,0.9))", 
                                border: "1px solid rgba(99,102,241,0.2)", 
                                borderRadius: 32,
                                boxShadow: "0 40px 80px rgba(0,0,0,0.4)"
                            }}>
                            <CardContent className="p-7">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-white">Performance Trend</h2>
                                        <p className="text-sm mt-1" style={{ color: "#6870a6" }}>Track your progress over time</p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                                </div>

                                {!hasData ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl"
                                        style={{ height: 300, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                                        <div className="text-center p-8">
                                            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20">📈</div>
                                            <p className="text-sm font-bold text-white mb-2 uppercase tracking-wide">No score history yet</p>
                                            <p className="text-xs mb-6 max-w-[200px] mx-auto text-slate-400 font-medium">Complete your first quiz to see your performance visualized.</p>
                                            <Button onClick={() => setDialogOpen(true)}
                                                className="h-11 px-8 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                                                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}>
                                                Start New Quiz
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={scoreHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                                axisLine={false} tickLine={false}
                                            />
                                            <YAxis
                                                domain={[yMin, 100]}
                                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                                axisLine={false} tickLine={false}
                                            />
                                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                                            <ReferenceLine y={75} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                                            <Line
                                                type="linear"
                                                dataKey="score"
                                                stroke="#fff"
                                                strokeWidth={2}
                                                dot={{ fill: "#fff", r: 4, strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: "#fff", strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Recent Quizzes ── */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white">Recent Assessments</h2>
                                    <p className="text-sm mt-1" style={{ color: "#6870a6" }}>Review your past performance history</p>
                                </div>
                                <Button
                                    onClick={() => setDialogOpen(true)}
                                    className="h-12 px-8 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none", boxShadow: "0 10px 20px rgba(79,70,229,0.3)" }}
                                >
                                    Start New Quiz
                                </Button>
                            </div>

                            {!hasData ? (
                                <Card style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 14 }}>
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <p className="text-sm font-semibold mb-1" style={{ color: "#333" }}>No sessions yet</p>
                                        <p className="text-xs" style={{ color: "#2a2a2a" }}>Start your first quiz to see results here</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((s, i) => (
                                        <QuizCard key={s.id} session={s} index={sessions.length - i} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}