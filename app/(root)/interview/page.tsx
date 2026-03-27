// app/(root)/interview/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadarChart,
    Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    INTERVIEW_TYPES, INTERVIEW_TYPE_META, COMPANY_INTERVIEWS,
    EXPERIENCE_LEVELS, INTERVIEW_DURATIONS, TECH_STACKS,
} from "@/constants/interview";
import type { InterviewSession } from "@/types/interview";

/* ─── helpers ─── */
function scoreColor(s: number) {
    if (s >= 80) return "#60a5fa";
    if (s >= 60) return "#fbbf24";
    return "#f87171";
}
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function avgField(sessions: InterviewSession[], field: string): number {
    const vals = sessions.filter(s => s.feedback != null).map(s => (s.feedback as any)[field] as number).filter(v => typeof v === "number");
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#1e293b", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{label}</p>
            <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: 15 }}>{payload[0].value}%</p>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>{label}</p>
            {children}
        </div>
    );
}

/* ─── FORM DIALOG ─── */
interface FormProps {
    open: boolean;
    onClose: () => void;
    mode: "tech-stack" | "company";
    preselect?: string;
}

function InterviewFormDialog({ open, onClose, mode, preselect }: FormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState("");
    const [expLevel, setExpLevel] = useState("");
    const [duration, setDuration] = useState(30);
    const [stack, setStack] = useState<string[]>([]);
    const [iType, setIType] = useState(mode === "tech-stack" ? (preselect ?? "") : "");
    const [company, setCompany] = useState(mode === "company" ? (preselect ?? "") : "");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (open) {
            setStep(1); setRole(""); setExpLevel(""); setDuration(30); setStack([]);
            setIType(mode === "tech-stack" ? (preselect ?? "") : "");
            setCompany(mode === "company" ? (preselect ?? "") : "");
            setResumeFile(null); setResumeText(""); setSubmitting(false); setErr("");
        }
    }, [open, mode, preselect]);

    function toggleStack(t: string) {
        setStack(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);
    }

    async function handleFileUpload(file: File) {
        setResumeFile(file);
        // Read as text for plain text/pdf fallback
        if (file.type === "text/plain") {
            const text = await file.text();
            setResumeText(text);
        } else {
            // For PDF/DOCX just use filename as placeholder — server will handle parsing
            setResumeText(`[Resume file: ${file.name}]`);
        }
    }

    const step1Ready = role.trim() !== "" && expLevel !== "" &&
        (mode === "tech-stack" ? iType !== "" : company !== "");

    async function handleSubmit() {
        setSubmitting(true); setErr("");
        try {
            const formData = new FormData();
            formData.append("mode", mode);
            formData.append("interviewType", iType);
            formData.append("company", company);
            formData.append("role", role);
            formData.append("experienceLevel", expLevel);
            formData.append("techStack", JSON.stringify(stack));
            formData.append("durationMinutes", String(duration));
            if (resumeFile) {
                formData.append("resume", resumeFile);
            } else {
                formData.append("resumeText", resumeText);
            }

            const res = await fetch("/api/interview/start", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to start");
            router.push(`/interview/${data.sessionId}`);
        } catch (e: any) {
            setErr(e.message ?? "Something went wrong.");
            setSubmitting(false);
        }
    }

    const title = mode === "company" ? `${company || "Company"} Interview` : iType || "Configure Interview";

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-[540px] gap-0 p-0 overflow-hidden"
                style={{ background: "#0f172a", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 18 }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#06b6d4)" }} />

                <div className="p-7 max-h-[88vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {/* Step dots */}
                    <div className="flex items-center gap-1.5 mb-5">
                        {[1, 2].map(s => (
                            <div key={s} className="h-1 rounded-full transition-all duration-300"
                                style={{ width: s === step ? 22 : 6, background: s <= step ? "#3b82f6" : "rgba(255,255,255,0.15)" }} />
                        ))}
                    </div>

                    <DialogTitle className="text-xl font-black mb-1" style={{ color: "#f1f5f9" }}>{title}</DialogTitle>
                    <DialogDescription className="text-sm mb-6" style={{ color: "#64748b" }}>
                        {step === 1 ? "Fill in your details to personalise the interview." : "Upload resume and confirm."}
                    </DialogDescription>

                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <div className="space-y-5">

                            {/* Interview type */}
                            {mode === "tech-stack" && !preselect && (
                                <Field label="Interview Type">
                                    <div className="grid grid-cols-2 gap-2">
                                        {INTERVIEW_TYPES.map(t => {
                                            const m = INTERVIEW_TYPE_META[t]; const on = iType === t;
                                            return (
                                                <button key={t} onClick={() => setIType(t)}
                                                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition-all"
                                                    style={{
                                                        background: on ? `${m.color}20` : "rgba(255,255,255,0.04)",
                                                        border: `1px solid ${on ? m.color + "70" : "rgba(255,255,255,0.1)"}`,
                                                    }}>
                                                    <span style={{ color: m.color, fontSize: 16 }}>{m.icon}</span>
                                                    <span className="text-xs font-semibold" style={{ color: on ? "#f1f5f9" : "#94a3b8" }}>{t}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Field>
                            )}

                            {/* Company */}
                            {mode === "company" && !preselect && (
                                <Field label="Company">
                                    <div className="grid grid-cols-3 gap-2">
                                        {COMPANY_INTERVIEWS.map((c: { name: string; color: string; focus: string }) => {
                                            const on = company === c.name;
                                            return (
                                                <button key={c.name} onClick={() => setCompany(c.name)}
                                                    className="rounded-xl px-3 py-2.5 text-sm font-bold transition-all"
                                                    style={{
                                                        background: on ? `${c.color}20` : "rgba(255,255,255,0.04)",
                                                        border: `1px solid ${on ? c.color + "70" : "rgba(255,255,255,0.1)"}`,
                                                        color: on ? c.color : "#94a3b8",
                                                    }}>
                                                    {c.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Field>
                            )}

                            {/* Role */}
                            <Field label="Target Role">
                                <input value={role} onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(96,165,250,0.2)", color: "#f1f5f9" }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)")} />
                            </Field>

                            {/* Experience */}
                            <Field label="Experience Level">
                                <div className="grid grid-cols-5 gap-2">
                                    {EXPERIENCE_LEVELS.map((l: { value: string; label: string; sub: string }) => {
                                        const on = expLevel === l.value;
                                        return (
                                            <button key={l.value} onClick={() => setExpLevel(l.value)}
                                                className="flex flex-col items-center rounded-xl px-2 py-2.5 text-center transition-all"
                                                style={{
                                                    background: on ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                                                    border: `1px solid ${on ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)"}`,
                                                }}>
                                                <span className="text-xs font-bold" style={{ color: on ? "#93c5fd" : "#94a3b8" }}>{l.label}</span>
                                                <span className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{l.sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Duration */}
                            <Field label="Duration">
                                <div className="grid grid-cols-4 gap-2">
                                    {INTERVIEW_DURATIONS.map((d: { value: number; label: string; sub: string }) => {
                                        const on = duration === d.value;
                                        return (
                                            <button key={d.value} onClick={() => setDuration(d.value)}
                                                className="flex flex-col items-center rounded-xl py-2.5 transition-all"
                                                style={{
                                                    background: on ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                                                    border: `1px solid ${on ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)"}`,
                                                }}>
                                                <span className="text-xs font-bold" style={{ color: on ? "#93c5fd" : "#94a3b8" }}>{d.label}</span>
                                                <span className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{d.sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Tech Stack */}
                            <Field label="Tech Stack (optional)">
                                <div className="flex flex-wrap gap-1.5">
                                    {TECH_STACKS.map((t: string) => {
                                        const on = stack.includes(t);
                                        return (
                                            <button key={t} onClick={() => toggleStack(t)}
                                                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                                                style={{
                                                    background: on ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)",
                                                    border: `1px solid ${on ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)"}`,
                                                    color: on ? "#93c5fd" : "#94a3b8",
                                                }}>
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            <button onClick={() => step1Ready && setStep(2)} disabled={!step1Ready}
                                className="w-full h-11 rounded-xl text-sm font-bold text-white disabled:opacity-30 transition-all"
                                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                                Continue
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && (
                        <div className="space-y-4">

                            {/* Resume upload */}
                            <Field label="Resume Upload (optional)">
                                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt"
                                    className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />

                                {!resumeFile ? (
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full rounded-xl p-6 text-center transition-all"
                                        style={{ background: "rgba(59,130,246,0.06)", border: "2px dashed rgba(96,165,250,0.3)" }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)")}>
                                        <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <p className="text-sm font-semibold" style={{ color: "#93c5fd" }}>Click to upload resume</p>
                                        <p className="text-xs mt-1" style={{ color: "#475569" }}>PDF, DOC, DOCX, TXT — max 5MB</p>
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3"
                                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(96,165,250,0.3)" }}>
                                        <div className="flex items-center gap-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{resumeFile.name}</p>
                                                <p className="text-xs" style={{ color: "#64748b" }}>{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setResumeFile(null); setResumeText(""); }}
                                            style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </Field>

                            {/* Summary */}
                            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(96,165,250,0.15)" }}>
                                {[
                                    { label: mode === "tech-stack" ? "Interview Type" : "Company", value: mode === "tech-stack" ? iType : company },
                                    { label: "Role", value: role },
                                    { label: "Experience", value: EXPERIENCE_LEVELS.find((l: { value: string }) => l.value === expLevel)?.label ?? "" },
                                    { label: "Duration", value: `${duration} minutes` },
                                    { label: "Tech Stack", value: stack.length ? stack.join(", ") : "Not specified" },
                                    { label: "Resume", value: resumeFile ? resumeFile.name : "Not provided" },
                                ].map((row, i, arr) => (
                                    <div key={row.label}>
                                        <div className="flex items-start justify-between px-5 py-3">
                                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>{row.label}</span>
                                            <span className="text-xs font-semibold text-right max-w-[60%]" style={{ color: "#cbd5e1" }}>{row.value}</span>
                                        </div>
                                        {i < arr.length - 1 && <div style={{ height: 1, background: "rgba(96,165,250,0.08)" }} />}
                                    </div>
                                ))}
                            </div>

                            {err && (
                                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                                    <p className="text-xs font-semibold" style={{ color: "#fca5a5" }}>{err}</p>
                                </div>
                            )}

                            <button onClick={handleSubmit} disabled={submitting}
                                className="w-full h-12 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                                {submitting ? (
                                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>Starting…</>
                                ) : "Start Interview →"}
                            </button>
                            <button onClick={() => setStep(1)}
                                className="w-full h-10 rounded-xl text-sm font-medium transition-all"
                                style={{ color: "#64748b", background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}>
                                ← Back
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─── SESSION ROW ─── */
function SessionRow({ s, index }: { s: InterviewSession; index: number }) {
    const score = s.feedback?.overallScore ?? null;
    const col = score != null ? scoreColor(score) : "#64748b";
    return (
        <Link href={`/interview/${s.id}/feedback`}>
            <div className="grid grid-cols-12 items-center gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all group"
                style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(96,165,250,0.1)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(96,165,250,0.35)"; el.style.background = "rgba(30,41,59,0.9)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(96,165,250,0.1)"; el.style.background = "rgba(30,41,59,0.6)"; }}>
                <span className="col-span-1 text-xs font-black" style={{ color: "#475569" }}>#{index}</span>
                <div className="col-span-4">
                    <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{s.interviewType || s.company}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{s.role}</p>
                </div>
                <div className="col-span-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                        {s.experienceLevel}
                    </span>
                </div>
                <div className="col-span-2">
                    <p className="text-sm font-black" style={{ color: col }}>
                        {score != null ? `${score}%` : s.status === "active" ? "🔴 Live" : s.status === "completed" ? "Processing…" : "--"}
                    </p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs" style={{ color: "#64748b" }}>{fmtDate(s.createdAt)}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#60a5fa" }}>
                        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

function Sk({ h = 80 }: { h?: number }) {
    return <div className="rounded-2xl animate-pulse" style={{ height: h, background: "rgba(30,41,59,0.5)", border: "1px solid rgba(96,165,250,0.07)" }} />;
}

/* ─── PAGE ─── */
export default function InterviewPage() {
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"tech-stack" | "company">("tech-stack");
    const [preselect, setPreselect] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetch("/api/interview/sessions")
            .then(r => r.ok ? r.json() : { sessions: [] })
            .then(d => setSessions(d.sessions ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    function openForm(mode: "tech-stack" | "company", pre?: string) {
        setFormMode(mode); setPreselect(pre); setFormOpen(true);
    }

    const completed = sessions.filter(s => s.feedback);
    const hasData = completed.length > 0;
    const avgScore = hasData ? Math.round(completed.reduce((a, s) => a + s.feedback!.overallScore, 0) / completed.length) : 0;
    const bestScore = hasData ? Math.max(...completed.map(s => s.feedback!.overallScore)) : 0;

    const chartData = [...completed].reverse().slice(-10).map((s, i) => ({
        name: `#${i + 1}`, score: s.feedback!.overallScore,
    }));
    const radarData = [
        { subject: "Technical", score: avgField(sessions, "technicalScore") },
        { subject: "Communication", score: avgField(sessions, "communicationScore") },
        { subject: "Problem Solving", score: avgField(sessions, "problemSolvingScore") },
        { subject: "Overall", score: avgField(sessions, "overallScore") },
    ];

    return (
        // FIX: pt-20 prevents navbar overlap
        <div style={{ background: "#06080f", minHeight: "100vh", color: "#f1f5f9" }}>
            <InterviewFormDialog open={formOpen} onClose={() => setFormOpen(false)} mode={formMode} preselect={preselect} />

            <main className="mx-auto max-w-6xl px-6 pt-20 pb-12">

                {/* ── HERO ── */}
                <div className="relative rounded-3xl p-10 mb-10 overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#0f172a,#1e293b,#0f172a)", border: "1px solid rgba(96,165,250,0.2)" }}>
                    <div aria-hidden className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "radial-gradient(rgba(96,165,250,0.8) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
                    <div aria-hidden className="absolute top-0 right-1/4 w-96 h-48 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15),transparent 70%)", filter: "blur(40px)" }} />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5"
                                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(96,165,250,0.35)", color: "#93c5fd" }}>
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#60a5fa" }} />
                                AI Interview Platform
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter mb-3" style={{ color: "#f1f5f9" }}>
                                AI Interview
                                <span style={{ background: "linear-gradient(135deg,#60a5fa,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> Hub</span>
                            </h1>
                            <p className="text-base leading-relaxed max-w-md" style={{ color: "#94a3b8" }}>
                                Practice with a real-time AI voice interviewer. Get scored feedback, transcript analysis, and personalised improvement tips after every session.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-5">
                                {["🎙 Voice AI", "📊 Real Feedback", "7 Interview Types", "Company Prep"].map(t => (
                                    <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                                        style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(96,165,250,0.2)", color: "#93c5fd" }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => openForm("tech-stack")}
                            className="flex-shrink-0 py-4 px-10 rounded-2xl text-base font-black text-white tracking-wide transition-all hover:opacity-90 hover:scale-[1.02]"
                            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 0 48px rgba(59,130,246,0.4)", border: "none" }}>
                            Start Interview →
                        </button>
                    </div>
                </div>

                {/* ── STATS ── */}
                {loading ? (
                    <div className="grid grid-cols-3 gap-4 mb-8">{[1, 2, 3].map(i => <Sk key={i} h={100} />)}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Total Interviews", value: sessions.length, sub: "sessions completed", color: "#60a5fa" },
                            { label: "Average Score", value: hasData ? `${avgScore}%` : "--", sub: "across all sessions", color: "#34d399" },
                            { label: "Personal Best", value: hasData ? `${bestScore}%` : "--", sub: "highest score", color: "#fbbf24" },
                        ].map(s => (
                            <div key={s.label} className="rounded-2xl p-6"
                                style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(96,165,250,0.12)" }}>
                                <div className="h-px w-8 rounded-full mb-4" style={{ background: s.color }} />
                                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>{s.label}</p>
                                <p className="text-3xl font-black tracking-tighter" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-xs mt-1.5" style={{ color: "#475569" }}>{s.sub}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── ANALYTICS ── */}
                {hasData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
                        <div className="lg:col-span-2 rounded-2xl p-6"
                            style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(96,165,250,0.12)" }}>
                            <p className="text-sm font-black mb-0.5" style={{ color: "#f1f5f9" }}>Score Progression</p>
                            <p className="text-xs mb-6" style={{ color: "#475569" }}>Last {chartData.length} interviews</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,165,250,0.08)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
                                        fill="url(#blueG)" dot={{ fill: "#60a5fa", r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: "#93c5fd", strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="rounded-2xl p-6"
                            style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(96,165,250,0.12)" }}>
                            <p className="text-sm font-black mb-5" style={{ color: "#f1f5f9" }}>Skill Breakdown</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(96,165,250,0.15)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                                    <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ── INTERVIEW TYPES ── */}
                <div className="mb-10">
                    <h2 className="text-2xl font-black mb-1" style={{ color: "#f1f5f9" }}>Interview Types</h2>
                    <p className="text-sm mb-5" style={{ color: "#64748b" }}>Specialised rounds tailored to your target role</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                        {INTERVIEW_TYPES.map((type: string) => {
                            const meta = INTERVIEW_TYPE_META[type];
                            return (
                                <button key={type} onClick={() => openForm("tech-stack", type)}
                                    className="text-left rounded-2xl p-4 transition-all duration-150 group"
                                    style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(96,165,250,0.1)" }}
                                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = `${meta.color}60`; el.style.background = `${meta.color}10`; }}
                                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "rgba(96,165,250,0.1)"; el.style.background = "rgba(30,41,59,0.6)"; }}>
                                    <span className="text-xl block mb-2" style={{ color: meta.color }}>{meta.icon}</span>
                                    <p className="text-xs font-black mb-1 leading-snug" style={{ color: "#f1f5f9" }}>{type}</p>
                                    <p className="text-[10px] leading-relaxed hidden xl:block" style={{ color: "#64748b" }}>{meta.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── COMPANY PREP ── */}
                <div className="mb-10">
                    <h2 className="text-2xl font-black mb-1" style={{ color: "#f1f5f9" }}>Company-wise Prep</h2>
                    <p className="text-sm mb-2" style={{ color: "#64748b" }}>Practice interviews styled after top companies</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {COMPANY_INTERVIEWS.map((c: { name: string; color: string; focus: string }) => (
                            <button key={c.name} onClick={() => openForm("company", c.name)}
                                className="text-left rounded-2xl p-4 transition-all duration-150 group"
                                style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(96,165,250,0.1)" }}
                                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = `${c.color}50`; el.style.background = `${c.color}0d`; }}
                                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "rgba(96,165,250,0.1)"; el.style.background = "rgba(30,41,59,0.6)"; }}>
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 text-sm font-black"
                                    style={{ background: `${c.color}20`, color: c.color }}>
                                    {c.name[0]}
                                </div>
                                <p className="text-sm font-black mb-1" style={{ color: "#f1f5f9" }}>{c.name}</p>
                                <p className="text-[10px] leading-relaxed" style={{ color: "#64748b" }}>{c.focus}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── PAST SESSIONS ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-2xl font-black" style={{ color: "#f1f5f9" }}>Past Interviews</h2>
                            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                                {sessions.length > 0 ? `${sessions.length} session${sessions.length !== 1 ? "s" : ""}` : "No sessions yet"}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <Sk key={i} h={64} />)}</div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
                            style={{ background: "rgba(30,41,59,0.4)", border: "1px dashed rgba(96,165,250,0.15)" }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: "#475569" }}>No interviews yet</p>
                            <p className="text-xs mb-5" style={{ color: "#334155" }}>Complete your first session to see results here</p>
                            <button onClick={() => openForm("tech-stack")}
                                className="h-10 px-6 rounded-xl text-sm font-bold text-white"
                                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                                Start Interview
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 mb-1 text-xs font-bold uppercase tracking-widest"
                                style={{ color: "#334155" }}>
                                <span className="col-span-1">#</span>
                                <span className="col-span-4">Interview</span>
                                <span className="col-span-2">Level</span>
                                <span className="col-span-2">Score</span>
                                <span className="col-span-2">Date</span>
                                <span className="col-span-1" />
                            </div>
                            <div className="space-y-2">
                                {sessions.map((s, i) => <SessionRow key={s.id} s={s} index={sessions.length - i} />)}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}