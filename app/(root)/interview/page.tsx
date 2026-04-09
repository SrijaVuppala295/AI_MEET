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
        <div style={{ background: "#ffffff", border: "1px solid #fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
            <p style={{ color: "#4f46e5", fontWeight: 900, fontSize: 18 }}>{payload[0].value}%</p>
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
            <DialogContent className="max-w-[560px] gap-0 p-0 overflow-hidden border-none shadow-[0_40px_100px_rgba(0,0,0,0.35)]"
                style={{ background: "#ffffff", borderRadius: 32 }}>
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed,#4f46e5)" }} />

                <div className="p-8 max-h-[88vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {/* Step dots */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2].map(s => (
                            <div key={s} className="h-1.5 rounded-full transition-all duration-500"
                                style={{ width: s === step ? 32 : 8, background: s <= step ? "#4f46e5" : "rgba(0, 0, 0,0.06)" }} />
                        ))}
                    </div>

                    <DialogTitle className="text-4xl font-black tracking-tighter mb-2 text-slate-900 leading-tight">
                        {mode === "company" ? company : iType} <span style={{ background: "linear-gradient(135deg,#000,#4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Session</span>
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-400">
                        {step === 1 ? "Personalise your interview track" : "Final confirmation & start"}
                    </DialogDescription>

                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <div className="space-y-5">

                            {/* Interview type */}
                            {mode === "tech-stack" && !preselect && (
                                <Field label="Interview Track">
                                    <div className="grid grid-cols-2 gap-3">
                                        {INTERVIEW_TYPES.map(t => {
                                            const m = INTERVIEW_TYPE_META[t]; const on = iType === t;
                                            return (
                                                <button key={t} onClick={() => setIType(t)}
                                                    className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-300"
                                                    style={{
                                                        background: on ? "#000000" : "rgba(0, 0, 0,0.03)",
                                                        border: `2px solid ${on ? "#000000" : "rgba(0, 0, 0,0.08)"}`,
                                                    }}>
                                                    <span className="text-2xl transition-transform group-hover:scale-110" style={{ color: on ? "#fff" : m.color }}>{m.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: on ? "#fff" : "#64748b" }}>{t}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Field>
                            )}

                            {/* Company */}
                            {mode === "company" && !preselect && (
                                <Field label="Company Hub">
                                    <div className="grid grid-cols-3 gap-3">
                                        {COMPANY_INTERVIEWS.map((c: { name: string; color: string; focus: string }) => {
                                            const on = company === c.name;
                                            return (
                                                <button key={c.name} onClick={() => setCompany(c.name)}
                                                    className="rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
                                                    style={{
                                                        background: on ? c.color : "rgba(0, 0, 0,0.04)",
                                                        border: `2px solid ${on ? c.color : "rgba(0, 0, 0,0.08)"}`,
                                                        color: on ? "#fff" : "#64748b",
                                                    }}>
                                                    {c.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Field>
                            )}

                            {/* Role */}
                            <Field label="Target Job Role">
                                <input value={role} onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. Senior Product Engineer"
                                    className="w-full h-14 rounded-2xl px-5 text-sm font-bold outline-none transition-all"
                                    style={{ background: "rgba(0, 0, 0,0.05)", border: "2px solid rgba(0,0,0,0.05)", color: "#000" }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#000")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)")} />
                            </Field>

                            {/* Experience */}
                            <Field label="Experience Seniority">
                                <div className="grid grid-cols-5 gap-2">
                                    {EXPERIENCE_LEVELS.map((l: { value: string; label: string; sub: string }) => {
                                        const on = expLevel === l.value;
                                        return (
                                            <button key={l.value} onClick={() => setExpLevel(l.value)}
                                                className="flex flex-col items-center rounded-xl px-2 py-3 text-center transition-all duration-300"
                                                style={{
                                                    background: on ? "#000000" : "rgba(0, 0, 0,0.04)",
                                                    border: `2px solid ${on ? "#000000" : "rgba(0, 0, 0,0.08)"}`,
                                                }}>
                                                <span className="text-xs font-black" style={{ color: on ? "#fff" : "#000" }}>{l.label}</span>
                                                <span className="text-[8px] mt-0.5 font-bold uppercase" style={{ color: on ? "rgba(255,255,255,0.6)" : "#64748b" }}>{l.sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Duration */}
                            <Field label="Session Time">
                                <div className="grid grid-cols-5 gap-2">
                                    {INTERVIEW_DURATIONS.map((d: { value: number; label: string; sub: string }) => {
                                        const on = duration === d.value;
                                        return (
                                            <button key={d.value} onClick={() => setDuration(d.value)}
                                                className="flex flex-col items-center justify-center rounded-xl py-3 transition-all duration-300"
                                                style={{
                                                    background: on ? "#000000" : "rgba(0, 0, 0,0.04)",
                                                    border: `2px solid ${on ? "#000000" : "rgba(0, 0, 0,0.08)"}`,
                                                }}>
                                                <span className="text-xs font-black" style={{ color: on ? "#fff" : "#000" }}>{d.label}</span>
                                                <span className="text-[8px] mt-0.5 font-bold uppercase" style={{ color: on ? "rgba(255,255,255,0.6)" : "#64748b" }}>{d.sub}</span>
                                            </button>
                                        );
                                    })}
                                    <div className="flex flex-col items-center justify-center rounded-xl py-2.5 transition-all text-center"
                                         style={{
                                             background: "rgba(0, 0, 0,0.04)",
                                             border: `2px solid rgba(0,0,0,0.08)`
                                         }}>
                                        <span className="text-[8px] font-black text-slate-400 mb-0.5 uppercase tracking-widest">Custom</span>
                                        <input 
                                            type="number" min="5" max="180"
                                            value={!INTERVIEW_DURATIONS.some(d => d.value === duration) ? duration : ""}
                                            onChange={e => setDuration(Number(e.target.value) || 30)}
                                            placeholder="mins"
                                            className="w-10 bg-transparent text-center outline-none border-b border-black/10 text-[10px] font-bold"
                                        />
                                    </div>
                                </div>
                            </Field>

                            {/* Tech Stack */}
                            <Field label="Required Technologies">
                                <div className="flex flex-wrap gap-2">
                                    {TECH_STACKS.map((t: string) => {
                                        const on = stack.includes(t);
                                        return (
                                            <button key={t} onClick={() => toggleStack(t)}
                                                className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                                                style={{
                                                    background: on ? "#000000" : "rgba(0, 0, 0,0.03)",
                                                    border: `2px solid ${on ? "#000000" : "rgba(0, 0, 0,0.08)"}`,
                                                    color: on ? "#fff" : "#64748b",
                                                }}>
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            <button onClick={() => step1Ready && setStep(2)} disabled={!step1Ready}
                                className="w-full h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white disabled:opacity-20 transition-all duration-300 hover:scale-[1.02] shadow-[0_20px_40px_rgba(79,70,229,0.2)] mt-6"
                                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none" }}>
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
                                                <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{resumeFile.name}</p>
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
                            <div className="rounded-2xl overflow-hidden bg-slate-50" style={{ border: "2px solid rgba(0,0,0,0.08)" }}>
                                {[
                                    { label: mode === "tech-stack" ? "Track" : "Company", value: mode === "tech-stack" ? iType : company },
                                    { label: "Role", value: role },
                                    { label: "Level", value: EXPERIENCE_LEVELS.find((l: { value: string }) => l.value === expLevel)?.label ?? "" },
                                    { label: "Limit", value: `${duration} minutes` },
                                    { label: "Stack", value: stack.length ? stack.join(", ") : "Not specified" },
                                    { label: "Docs", value: resumeFile ? resumeFile.name : "No resume" },
                                ].map((row, i, arr) => (
                                    <div key={row.label}>
                                        <div className="flex items-start justify-between px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                                            <span className="text-xs font-black text-right max-w-[60%] text-slate-900">{row.value}</span>
                                        </div>
                                        {i < arr.length - 1 && <div style={{ height: 1.5, background: "rgba(0,0,0,0.05)" }} />}
                                    </div>
                                ))}
                            </div>

                            {err && (
                                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 mt-4">
                                    <p className="text-xs font-black text-red-600 uppercase tracking-widest">{err}</p>
                                </div>
                            )}

                            <div className="pt-4 space-y-3">
                                <button onClick={handleSubmit} disabled={submitting}
                                    className="w-full h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                                    style={{ background: "#000000", border: "none" }}>
                                    {submitting ? (
                                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>Preparing Assessment…</>
                                    ) : "Begin Interview Now →"}
                                </button>
                                <button onClick={() => setStep(1)}
                                    className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                    style={{ color: "#64748b", background: "transparent", border: "none" }}>
                                    ← Re-configure Settings
                                </button>
                            </div>
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
            <div className="grid grid-cols-12 items-center gap-4 rounded-2xl px-6 py-5 cursor-pointer transition-all hover:translate-x-1 group shadow-sm bg-white"
                style={{ border: "2px solid rgba(0,0,0,0.15)" }}>
                <span className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#{index}</span>
                <div className="col-span-4">
                    <p className="text-sm font-black text-slate-900 leading-tight">{s.interviewType || s.company}</p>
                    <p className="text-[10px] font-bold mt-1 text-slate-500 uppercase tracking-widest">{s.role}</p>
                </div>
                <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(79,70,229,0.1)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}>
                        {s.experienceLevel}
                    </span>
                </div>
                <div className="col-span-2">
                    <p className="text-lg font-black tracking-tighter" style={{ color: col }}>
                        {score != null ? `${score}%` : s.status === "active" ? "🔴 Live" : s.status === "completed" ? "Processing…" : "--"}
                    </p>
                </div>
                <div className="col-span-2">
                    <p className="text-[11px] font-bold text-slate-600">{fmtDate(s.createdAt)}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" style={{ color: "#4f46e5" }}>
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

function Sk({ h = 80 }: { h?: number }) {
    return <div className="rounded-[1.5rem] animate-pulse" style={{ height: h, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }} />;
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
        <div style={{ background: "#ffffff", minHeight: "100vh", color: "#0f172a" }}>
            <InterviewFormDialog open={formOpen} onClose={() => setFormOpen(false)} mode={formMode} preselect={preselect} />

            <main className="mx-auto max-w-6xl px-6 pt-20 pb-12">

                {/* ── HERO ── */}
                <div className="relative rounded-[2.5rem] p-12 mb-12 overflow-hidden"
                    style={{ background: "#ffffff", border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                    <div aria-hidden className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: "radial-gradient(#4f46e5 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
                    <div aria-hidden className="absolute top-0 right-1/4 w-96 h-48 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse,rgba(79,70,229,0.1),transparent 70%)", filter: "blur(60px)" }} />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-6"
                                style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.2)", color: "#4338ca" }}>
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse outline outline-4 outline-indigo-500/20" />
                                AI Interview Experience
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 leading-[0.95]">
                                AI Interview
                                <span className="block" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> Hub</span>
                            </h1>
                            <p className="text-lg font-bold leading-relaxed max-w-lg mb-8 text-slate-700">
                                Practice with a real-time AI voice interviewer. Get scored feedback, transcript analysis, and personalised tips after every session.
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {["🎙 Voice AI", "📈 Real Feedback", "7 Tracks", "Company Prep"].map(t => (
                                    <span key={t} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:translate-y-[-1px]"
                                        style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.05)", color: "#4338ca" }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => openForm("tech-stack")}
                            className="flex-shrink-0 py-5 px-12 rounded-[1.5rem] text-lg font-black text-white tracking-wide transition-all duration-300 hover:scale-[1.05] shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.4)]"
                            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none" }}>
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
                            { label: "Total Interviews", value: sessions.length, sub: "sessions completed", color: "#8b5cf6", icon: "🎙" },
                            { label: "Average Score", value: hasData ? `${avgScore}%` : "--", sub: "across all sessions", color: "#06b6d4", icon: "📈" },
                            { label: "Personal Best", value: hasData ? `${bestScore}%` : "--", sub: "highest score achieved", color: "#10b981", icon: "🏆" },
                        ].map(s => (
                            <div key={s.label} className="group relative rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white"
                                style={{ border: `2px solid ${s.color}60`, boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                                <div className="absolute top-4 right-4 h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                                    <span className="text-lg">{s.icon}</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-800">{s.label}</p>
                                <p className="text-4xl font-black tracking-tighter" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-[10px] mt-2 font-black uppercase tracking-widest text-slate-500">{s.sub}</p>
                                <div className="mt-4 h-1 w-12 rounded-full overflow-hidden bg-slate-100">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: "65%", background: s.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── ANALYTICS ── */}
                {hasData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <div className="lg:col-span-2 rounded-[2rem] p-8 bg-white"
                            style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-lg font-black text-slate-900 leading-tight">Score Progression</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Last {chartData.length} interviews</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.3)]" />
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3}
                                        fill="url(#blueG)" dot={{ fill: "#4f46e5", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 3, stroke: "#fff" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="rounded-[2rem] p-8 bg-white"
                            style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                            <p className="text-lg font-black text-slate-900 mb-8">Skill Breakdown</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                                    <Radar dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={2.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ── INTERVIEW TYPES ── */}
                <div className="mb-14">
                    <h2 className="text-3xl font-black mb-1 text-slate-900 tracking-tight">Interview Types</h2>
                    <p className="text-sm mb-8 font-bold text-slate-500 uppercase tracking-widest">Specialised rounds tailored to your target role</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                        {INTERVIEW_TYPES.map((type: string) => {
                            const meta = INTERVIEW_TYPE_META[type];
                            return (
                                <button key={type} onClick={() => openForm("tech-stack", type)}
                                    className="text-center rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden bg-white"
                                    style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 30px ${meta.color}15`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${meta.color}30`; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#fff"; }}>
                                    <span className="text-3xl block mb-4 transition-transform group-hover:scale-110" style={{ color: meta.color }}>{meta.icon}</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{type}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-14">
                    <h2 className="text-3xl font-black mb-1 text-slate-900 tracking-tight">Company Prep</h2>
                    <p className="text-sm mb-8 font-bold text-slate-500 uppercase tracking-widest">Practice interviews styled after top companies</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {COMPANY_INTERVIEWS.map((c: { name: string; color: string; focus: string }) => (
                            <button key={c.name} onClick={() => openForm("company", c.name)}
                                className="text-left rounded-3xl p-6 transition-all duration-300 relative group overflow-hidden bg-white"
                                style={{ border: "2px solid rgba(0,0,0,0.15)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 30px ${c.color}15`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${c.color}30`; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#fff"; }}>
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 text-lg font-black transition-transform group-hover:scale-110"
                                    style={{ background: `${c.color}10`, color: c.color, border: `1px solid ${c.color}15` }}>
                                    {c.name[0]}
                                </div>
                                <p className="text-sm font-black text-slate-900 mb-1">{c.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.focus}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── PAST SESSIONS ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Past Interviews</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                {sessions.length > 0 ? `${sessions.length} recorded session${sessions.length !== 1 ? "s" : ""}` : "No history found"}
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
                                className="h-10 px-6 rounded-xl text-sm font-bold text-slate-900"
                                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                                Start Interview
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <span className="col-span-1">#</span>
                                <span className="col-span-4">Interview Track</span>
                                <span className="col-span-2">Level</span>
                                <span className="col-span-2">Performance</span>
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