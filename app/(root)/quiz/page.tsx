"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const TOPICS = [
    "JavaScript", "TypeScript", "React", "Node.js",
    "System Design", "Data Structures & Algorithms",
    "CSS / HTML", "SQL & Databases",
    "Git & Version Control", "Docker & Containers",
    "AWS & Cloud", "HR & Behavioral",
];

const DIFFICULTY_LEVELS = [
    { value: "beginner", label: "Beginner", description: "Foundational concepts" },
    { value: "intermediate", label: "Intermediate", description: "Applied problem solving" },
    { value: "advanced", label: "Advanced", description: "Expert-depth questions" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const SCORE_HISTORY = [
    { date: "Mar 1", score: 55 },
    { date: "Mar 3", score: 62 },
    { date: "Mar 6", score: 58 },
    { date: "Mar 8", score: 74 },
    { date: "Mar 10", score: 68 },
    { date: "Mar 12", score: 81 },
    { date: "Mar 14", score: 87 },
];

const PAST_SESSIONS = [
    { id: "1", topic: "JavaScript", level: "Intermediate", correct: 9, total: 10, date: "2025-03-14" },
    { id: "2", topic: "React", level: "Advanced", correct: 11, total: 15, date: "2025-03-12" },
    { id: "3", topic: "Data Structures & Algorithms", level: "Beginner", correct: 6, total: 10, date: "2025-03-10" },
    { id: "4", topic: "System Design", level: "Intermediate", correct: 5, total: 5, date: "2025-03-08" },
    { id: "5", topic: "TypeScript", level: "Advanced", correct: 14, total: 20, date: "2025-03-05" },
    { id: "6", topic: "SQL & Databases", level: "Beginner", correct: 8, total: 10, date: "2025-03-02" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const scorePct = (c: number, t: number) => Math.round((c / t) * 100);

function scoreColor(s: number) {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
}

function scoreLabel(s: number) {
    if (s >= 90) return "Excellent";
    if (s >= 75) return "Proficient";
    if (s >= 60) return "Adequate";
    return "Needs Review";
}

/* ─────────────────────────────────────────────
   CHART TOOLTIP
───────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const val = payload[0].value as number;
    return (
        <div
            className="rounded-xl px-4 py-3 shadow-2xl"
            style={{
                background: "#111318",
                border: "1px solid rgba(255,255,255,0.1)",
            }}
        >
            <p className="text-[11px] mb-1" style={{ color: "#64748b" }}>{label}</p>
            <p className="text-base font-bold" style={{ color: scoreColor(val) }}>{val}%</p>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SCORE RING
───────────────────────────────────────────── */
function ScoreRing({ value }: { value: number }) {
    const r = 32;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;
    const col = scoreColor(value);

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
                <circle
                    cx={40} cy={40} r={r} fill="none"
                    stroke={col} strokeWidth={5}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-base font-extrabold text-white">{value}%</span>
        </div>
    );
}

/* ─────────────────────────────────────────────
   STEP DOTS
───────────────────────────────────────────── */
function StepDots({ step }: { step: 1 | 2 }) {
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2].map((s) => (
                <div
                    key={s}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                        width: s === step ? 20 : 6,
                        background: s <= step
                            ? "rgba(99,102,241,0.9)"
                            : "rgba(255,255,255,0.15)",
                    }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   QUIZ CONFIG DIALOG
───────────────────────────────────────────── */
function QuizConfigDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("");
    const [count, setCount] = useState(10);

    const ready = topic !== "" && level !== "";

    function reset() {
        setStep(1); setTopic(""); setLevel(""); setCount(10);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); }}>
            <DialogContent
                className="max-w-[440px] gap-0 p-0 border-0 overflow-hidden shadow-2xl"
                style={{ background: "#0c0e15" }}
            >
                {/* Gradient top bar */}
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #4f46e5, #06b6d4, #22c55e)" }} />

                <div className="p-8">
                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-white mb-1">
                                        Configure Quiz
                                    </DialogTitle>
                                    <DialogDescription style={{ color: "#475569" }}>
                                        Choose topic, difficulty, and question count.
                                    </DialogDescription>
                                </div>
                                <StepDots step={1} />
                            </div>

                            <div className="space-y-6">
                                {/* Topic */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] block" style={{ color: "#475569" }}>
                                        Topic
                                    </label>
                                    <Select value={topic} onValueChange={setTopic}>
                                        <SelectTrigger
                                            className="h-11 rounded-xl border-0 text-sm font-medium focus:ring-1 focus:ring-indigo-500/50"
                                            style={{ background: "rgba(255,255,255,0.05)", color: topic ? "#f1f5f9" : "#64748b" }}
                                        >
                                            <SelectValue placeholder="Select a topic" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="rounded-xl border-0"
                                            style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.09)" }}
                                        >
                                            {TOPICS.map((t) => (
                                                <SelectItem
                                                    key={t} value={t}
                                                    className="text-sm font-medium cursor-pointer"
                                                    style={{ color: "#cbd5e1" }}
                                                >
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] block" style={{ color: "#475569" }}>
                                        Difficulty
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DIFFICULTY_LEVELS.map((l) => {
                                            const active = level === l.value;
                                            return (
                                                <button
                                                    key={l.value}
                                                    onClick={() => setLevel(l.value)}
                                                    className="flex flex-col items-start gap-1 rounded-xl px-3.5 py-3 text-left transition-all duration-150"
                                                    style={{
                                                        background: active ? "rgba(99,102,241,0.16)" : "rgba(255,255,255,0.04)",
                                                        border: `1.5px solid ${active ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.07)"}`,
                                                        boxShadow: active ? "0 0 16px rgba(99,102,241,0.12)" : "none",
                                                    }}
                                                >
                                                    <span className="text-xs font-bold" style={{ color: active ? "#a5b4fc" : "#94a3b8" }}>
                                                        {l.label}
                                                    </span>
                                                    <span className="text-[10px] leading-tight" style={{ color: "#475569" }}>
                                                        {l.description}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Count */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] block" style={{ color: "#475569" }}>
                                        Number of Questions
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {QUESTION_COUNTS.map((c) => {
                                            const active = count === c;
                                            return (
                                                <button
                                                    key={c}
                                                    onClick={() => setCount(c)}
                                                    className="h-12 rounded-xl text-sm font-bold transition-all duration-150"
                                                    style={{
                                                        background: active ? "rgba(99,102,241,0.16)" : "rgba(255,255,255,0.04)",
                                                        border: `1.5px solid ${active ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.07)"}`,
                                                        color: active ? "#a5b4fc" : "#64748b",
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Live preview */}
                                {ready && (
                                    <div
                                        className="flex items-center justify-between rounded-xl px-4 py-3"
                                        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}
                                    >
                                        <span className="text-sm font-semibold text-white">{topic}</span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[11px] border-indigo-500/30 text-indigo-300">
                                                {DIFFICULTY_LEVELS.find((l) => l.value === level)?.label}
                                            </Badge>
                                            <Badge variant="outline" className="text-[11px] border-indigo-500/30 text-indigo-300">
                                                {count} Qs
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => ready && setStep(2)}
                                    disabled={!ready}
                                    className="w-full h-12 rounded-xl text-sm font-bold tracking-wide disabled:opacity-25"
                                    style={{
                                        background: ready ? "linear-gradient(135deg, #4338ca, #4f46e5)" : "rgba(255,255,255,0.06)",
                                        color: ready ? "#fff" : "#475569",
                                        boxShadow: ready ? "0 0 28px rgba(79,70,229,0.3)" : "none",
                                        border: "none",
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && (
                        <>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-white mb-1">
                                        Ready to begin
                                    </DialogTitle>
                                    <DialogDescription style={{ color: "#475569" }}>
                                        Review your settings before starting.
                                    </DialogDescription>
                                </div>
                                <StepDots step={2} />
                            </div>

                            <div className="space-y-4">
                                {/* Summary table */}
                                <div
                                    className="rounded-2xl p-5 space-y-4"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                                >
                                    {[
                                        { label: "Topic", value: topic },
                                        { label: "Difficulty", value: DIFFICULTY_LEVELS.find((l) => l.value === level)?.label ?? "" },
                                        { label: "Questions", value: `${count} questions` },
                                        { label: "Est. time", value: `${count * 1.5}–${count * 2} min` },
                                    ].map((row, i, arr) => (
                                        <div key={row.label}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: "#475569" }}>
                                                    {row.label}
                                                </span>
                                                <span className="text-sm font-bold text-white">{row.value}</span>
                                            </div>
                                            {i < arr.length - 1 && (
                                                <Separator className="mt-4" style={{ background: "rgba(255,255,255,0.06)" }} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full h-12 rounded-xl text-sm font-bold"
                                    style={{
                                        background: "linear-gradient(135deg, #4338ca, #4f46e5)",
                                        boxShadow: "0 0 32px rgba(79,70,229,0.3)",
                                        border: "none",
                                        color: "#fff",
                                    }}
                                >
                                    Start Quiz
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="w-full h-11 rounded-xl text-sm font-medium"
                                    style={{ color: "#475569" }}
                                >
                                    Back to settings
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */
function KpiCard({ label, value, sub, accentColor }: {
    label: string; value: string | number; sub: string; accentColor: string;
}) {
    return (
        <Card
            className="border-0 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
            <CardContent className="p-5">
                <div className="h-0.5 w-8 rounded-full mb-4" style={{ background: accentColor }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: "#475569" }}>
                    {label}
                </p>
                <p className="text-3xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                    {value}
                </p>
                <p className="text-[11px] mt-1.5" style={{ color: "#334155" }}>{sub}</p>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────
   SESSION ROW
───────────────────────────────────────────── */
function SessionRow({ s }: { s: typeof PAST_SESSIONS[0] }) {
    const pct = scorePct(s.correct, s.total);
    const col = scoreColor(pct);
    const grade = scoreLabel(pct);
    const fmtDate = new Date(s.date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "2-digit",
    });

    return (
        <div
            className="group grid grid-cols-12 items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-150"
            style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = `${col}35`;
                el.style.background = `${col}06`;
                el.style.transform = "translateY(-1px)";
                el.style.boxShadow = `0 6px 24px ${col}0c`;
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.background = "rgba(255,255,255,0.025)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
            }}
        >
            <div className="col-span-4">
                <p className="text-sm font-semibold text-white">{s.topic}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{s.level}</p>
            </div>

            <div className="col-span-2">
                <ScoreRing value={pct} />
            </div>

            <div className="col-span-3">
                <Progress
                    value={pct}
                    className="h-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)" } as React.CSSProperties}
                />
                <p className="text-[11px] mt-1.5" style={{ color: "#334155" }}>
                    {s.correct}/{s.total} correct
                </p>
            </div>

            <div className="col-span-2">
                <Badge
                    variant="outline"
                    className="text-[11px] font-semibold border-0 rounded-lg px-2.5 py-1"
                    style={{ background: `${col}18`, color: col }}
                >
                    {grade}
                </Badge>
                <p className="text-[11px] mt-1.5" style={{ color: "#334155" }}>{fmtDate}</p>
            </div>

            <div className="col-span-1 flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
                    style={{ color: "#6366f1" }}
                >
                    Retry
                </Button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
function Header() {
    return (
        <header
            className="sticky top-0 z-40 border-b"
            style={{
                background: "rgba(8,9,13,0.95)",
                borderColor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
            }}
        >
            <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 0 14px rgba(99,102,241,0.35)" }}
                    >
                        <Image src="/logo.svg" alt="AI MEET" width={18} height={18} />
                    </div>
                    <span
                        className="text-base font-bold tracking-tight"
                        style={{ background: "linear-gradient(135deg,#e0e7ff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                        AI MEET
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-0.5">
                    {[
                        { href: "/interview", label: "AI Interview" },
                        { href: "/prep-hub", label: "Prep Hub" },
                        { href: "/quiz", label: "Quiz", active: true },
                        { href: "/questions", label: "Questions" },
                    ].map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                            style={{
                                background: n.active ? "rgba(99,102,241,0.14)" : "transparent",
                                color: n.active ? "#a5b4fc" : "#4b5563",
                                border: n.active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                            }}
                        >
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <Link href="/profile">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold cursor-pointer select-none"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff" }}
                    >
                        U
                    </div>
                </Link>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="mt-20 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                        <Image src="/logo.svg" alt="AI MEET" width={12} height={12} />
                    </div>
                    <span className="text-sm font-bold text-white">AI MEET</span>
                </div>
                <p className="text-xs" style={{ color: "#334155" }}>
                    Adaptive quizzes powered by Gemini AI · Bhoj Reddy Engineering College
                </p>
                <div className="flex gap-5">
                    {["/", "/interview", "/questions"].map((href) => (
                        <Link key={href} href={href} className="text-xs transition-colors hover:text-slate-300" style={{ color: "#334155" }}>
                            {href === "/" ? "Home" : href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function QuizPage() {
    const [dialogOpen, setDialogOpen] = useState(false);

    const avg = Math.round(SCORE_HISTORY.reduce((s, i) => s + i.score, 0) / SCORE_HISTORY.length);
    const best = Math.max(...SCORE_HISTORY.map((i) => i.score));

    return (
        <div style={{ background: "#08090d", minHeight: "100vh", color: "#fff" }}>
            <Header />
            <QuizConfigDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12">

                {/* ── Heading ── */}
                <div className="mb-10">
                    <div
                        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] mb-5"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", color: "#4ade80" }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                        Quiz Mode
                    </div>
                    <h1
                        className="text-4xl font-extrabold tracking-tight mb-3"
                        style={{
                            background: "linear-gradient(140deg, #f8fafc 30%, #94a3b8 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Knowledge Assessment
                    </h1>
                    <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#64748b" }}>
                        Test your technical depth across 12 topics. Every session generates unique questions graded in real time.
                    </p>
                </div>

                {/* ── KPIs ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <KpiCard label="Average Score" value={`${avg}%`} sub="across all sessions" accentColor="#6366f1" />
                    <KpiCard label="Personal Best" value={`${best}%`} sub="highest single session" accentColor="#22c55e" />
                    <KpiCard label="Sessions" value={PAST_SESSIONS.length} sub="quizzes completed" accentColor="#06b6d4" />
                </div>

                {/* ── Hero CTA ── */}
                <Card
                    className="border-0 rounded-3xl mb-8 overflow-hidden relative"
                    style={{
                        background: "#0b0d14",
                        border: "1px solid rgba(99,102,241,0.18)",
                        boxShadow: "0 0 80px rgba(99,102,241,0.05)",
                    }}
                >
                    {/* Dot-grid texture */}
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    {/* Glow orb */}
                    <div
                        aria-hidden
                        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.2), transparent 70%)", filter: "blur(60px)" }}
                    />

                    <CardContent className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="max-w-md">
                            <Badge
                                className="mb-5 text-[11px] font-semibold border-0"
                                style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
                            >
                                AI-Generated · Gemini Powered
                            </Badge>
                            <h2 className="text-2xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                                Start a new quiz session
                            </h2>
                            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                                Pick a topic and difficulty. Questions are freshly generated for every session —
                                no two quizzes are the same. Results are scored and tracked automatically.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                {["12 Topics", "3 Difficulty Levels", "Instant Scoring", "Progress Tracking"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "#64748b",
                                        }}
                                    >
                                        <span className="h-1 w-1 rounded-full" style={{ background: "#6366f1" }} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => setDialogOpen(true)}
                            size="lg"
                            className="flex-shrink-0 h-14 px-10 rounded-2xl text-sm font-bold tracking-wide"
                            style={{
                                background: "linear-gradient(135deg, #4338ca, #4f46e5 60%, #6366f1)",
                                boxShadow: "0 0 48px rgba(79,70,229,0.35)",
                                color: "#fff",
                                border: "none",
                            }}
                        >
                            Configure Quiz
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                    {/* Area chart */}
                    <Card
                        className="lg:col-span-2 border-0 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <CardHeader className="pb-0 pt-6 px-6">
                            <CardTitle className="text-sm font-bold text-white tracking-tight">Score Progression</CardTitle>
                            <CardDescription style={{ color: "#475569" }}>Last 7 sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4 px-2">
                            <ResponsiveContainer width="100%" height={190}>
                                <AreaChart data={SCORE_HISTORY} margin={{ top: 5, right: 16, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area
                                        type="monotone" dataKey="score"
                                        stroke="#6366f1" strokeWidth={2}
                                        fill="url(#quizGrad)"
                                        dot={{ fill: "#6366f1", r: 3.5, strokeWidth: 0 }}
                                        activeDot={{ r: 5.5, fill: "#a5b4fc", strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Metrics panel */}
                    <Card
                        className="border-0 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <CardHeader className="pt-6 px-6 pb-4">
                            <CardTitle className="text-sm font-bold text-white tracking-tight">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-5">
                            {[
                                { label: "Score improvement", value: "+30%", sub: "since first session", color: "#22c55e" },
                                { label: "Consistency streak", value: "4", sub: "sessions above 70%", color: "#6366f1" },
                                { label: "Topics covered", value: "6/12", sub: "categories attempted", color: "#06b6d4" },
                            ].map((m) => (
                                <div key={m.label} className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#475569" }}>
                                            {m.label}
                                        </p>
                                        <p className="text-[11px] mt-0.5" style={{ color: "#334155" }}>{m.sub}</p>
                                    </div>
                                    <span className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</span>
                                </div>
                            ))}
                            <Separator style={{ background: "rgba(255,255,255,0.06)" }} />
                            <Button
                                onClick={() => setDialogOpen(true)}
                                variant="outline"
                                className="w-full h-10 rounded-xl text-xs font-bold border-0"
                                style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }}
                            >
                                New Session
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Session History ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Session History</h2>
                            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                                All completed quiz sessions with scores and grades
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-white/10 text-slate-500">
                            {PAST_SESSIONS.length} sessions
                        </Badge>
                    </div>

                    {/* Table header */}
                    <div
                        className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 mb-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{ color: "#334155" }}
                    >
                        <span className="col-span-4">Topic</span>
                        <span className="col-span-2">Score</span>
                        <span className="col-span-3">Progress</span>
                        <span className="col-span-2">Grade</span>
                        <span className="col-span-1" />
                    </div>

                    <div className="space-y-2">
                        {PAST_SESSIONS.map((s) => <SessionRow key={s.id} s={s} />)}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}