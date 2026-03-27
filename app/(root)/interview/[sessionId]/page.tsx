// app/(root)/interview/[sessionId]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import type { InterviewSession } from "@/types/interview";

// FIX: Fresh instance every time — no stale singleton
function createVapi(): Vapi {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing in .env.local");
    return new Vapi(key);
}

type CallStatus = "idle" | "connecting" | "active" | "ending" | "ended";
interface Msg { role: "assistant" | "user"; text: string; ts: number }

function AudioWave({ active, color }: { active: boolean; color: string }) {
    return (
        <div className="flex items-end justify-center gap-[3px]" style={{ height: 32 }}>
            {[0.4, 0.65, 1, 0.75, 0.5, 0.85, 0.6, 0.9, 0.45, 0.7].map((h, i) => (
                <div key={i} style={{
                    width: 3, borderRadius: 3, background: color,
                    height: active ? `${h * 100}%` : "18%",
                    opacity: active ? 0.9 : 0.25,
                    transition: "height 0.2s ease, opacity 0.3s",
                    animation: active ? `bwave ${0.6 + i * 0.08}s ease-in-out ${i * 0.04}s infinite alternate` : "none",
                }} />
            ))}
            <style>{`@keyframes bwave{from{transform:scaleY(.3)}to{transform:scaleY(1)}}`}</style>
        </div>
    );
}

function AvatarBox({ label, sublabel, speaking, color, isAI, initial }: {
    label: string; sublabel: string; speaking: boolean;
    color: string; isAI?: boolean; initial: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-5 rounded-3xl p-8 flex-1 transition-all duration-300"
            style={{
                background: speaking ? `${color}12` : "rgba(30,41,59,0.6)",
                border: `2px solid ${speaking ? color + "60" : "rgba(96,165,250,0.12)"}`,
                boxShadow: speaking ? `0 0 50px ${color}18` : "none",
                minHeight: 280,
            }}>
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
                {speaking && (
                    <>
                        <div className="absolute inset-0 rounded-full"
                            style={{ border: `2px solid ${color}`, opacity: 0.3, animation: "ring1 1.5s ease-in-out infinite" }} />
                        <div className="absolute rounded-full"
                            style={{ inset: -8, border: `2px solid ${color}`, opacity: 0.15, animation: "ring1 1.5s ease-in-out 0.3s infinite" }} />
                    </>
                )}
                <div className="absolute inset-3 rounded-full flex items-center justify-center"
                    style={{ background: `${color}20`, border: `2px solid ${color}35` }}>
                    {isAI ? (
                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                            <circle cx="19" cy="19" r="11" stroke={color} strokeWidth="2" />
                            <circle cx="19" cy="19" r="4.5" fill={color} />
                            <path d="M19 5v4M19 29v4M5 19h4M29 19h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <span className="text-2xl font-black" style={{ color }}>{initial}</span>
                    )}
                </div>
            </div>
            <AudioWave active={speaking} color={color} />
            <div className="text-center">
                <p className="text-lg font-black mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
                <p className="text-xs" style={{ color: "#64748b" }}>{sublabel}</p>
            </div>
            <div className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{
                    background: speaking ? `${color}20` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${speaking ? color + "50" : "rgba(255,255,255,0.08)"}`,
                    color: speaking ? color : "#64748b",
                }}>
                {speaking ? "● Speaking" : "Listening"}
            </div>
            <style>{`@keyframes ring1{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.12);opacity:.1}}`}</style>
        </div>
    );
}

export default function InterviewCallPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [messages, setMessages] = useState<Msg[]>([]);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [muted, setMuted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const transcriptRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRef = useRef(0);
    const endingRef = useRef(false);
    const startedRef = useRef(false);
    const vapiRef = useRef<Vapi | null>(null);

    useEffect(() => {
        fetch(`/api/interview/sessions?id=${sessionId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.session) {
                    console.log("[interview] session loaded:", {
                        assistantId: d.session.assistantId,
                        interviewType: d.session.interviewType,
                        durationMinutes: d.session.durationMinutes,
                    });
                    if (!d.session.assistantId) {
                        setError("Assistant ID is empty.\n\nCheck these in .env.local:\nNEXT_PUBLIC_VAPI_ASSISTANT_FRONTEND\nNEXT_PUBLIC_VAPI_ASSISTANT_BACKEND etc.\n\nThen restart: npm run dev");
                        return;
                    }
                    setSession(d.session);
                } else {
                    setError("Session not found.");
                }
            })
            .catch(() => setError("Could not load session."));
    }, [sessionId]);

    useEffect(() => {
        if (session && callStatus === "idle" && !startedRef.current) {
            startedRef.current = true;
            startVapi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    useEffect(() => {
        if (callStatus === "active") {
            startRef.current = Date.now() - elapsed * 1000;
            timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callStatus]);

    useEffect(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        return () => {
            const v = vapiRef.current;
            if (v) { try { v.removeAllListeners(); v.stop(); } catch { } vapiRef.current = null; }
        };
    }, []);

    const startVapi = useCallback(async () => {
        if (!session) return;
        setCallStatus("connecting");

        let vapi: Vapi;
        try { vapi = createVapi(); }
        catch (e: any) { setError(e.message); setCallStatus("idle"); return; }

        vapi.removeAllListeners();
        vapiRef.current = vapi;

        vapi.on("call-start", () => { console.log("[vapi] ✓ call-start"); setCallStatus("active"); });
        vapi.on("call-end", () => { console.log("[vapi] call-end"); handleEnd(); });

        vapi.on("error", (e: any) => {
            const msg =
                e?.error?.errorMsg ??
                e?.error?.message?.msg ??
                e?.error?.message ??
                e?.message ??
                (typeof e === "string" ? e : "Unknown error");

            console.error("[vapi] error:", JSON.stringify(e, null, 2));

            if (String(msg).toLowerCase().includes("ejected") || String(msg).toLowerCase().includes("meeting has ended")) {
                setError(
                    "Call ejected by Vapi (\"Meeting has ended\").\n\n" +
                    "Most likely causes:\n" +
                    "1. Your Vapi account has hit the free tier call limit\n" +
                    "   → Check dashboard.vapi.ai → Usage\n\n" +
                    "2. The assistant ID is incorrect\n" +
                    "   → Check .env.local NEXT_PUBLIC_VAPI_ASSISTANT_* values\n\n" +
                    "3. Assistant was deleted or disabled in Vapi dashboard"
                );
            } else {
                setError(`Vapi error: ${msg}`);
            }
            setCallStatus("idle");
        });

        vapi.on("speech-start", () => setAiSpeaking(true));
        vapi.on("speech-end", () => setAiSpeaking(false));

        vapi.on("message", (msg: any) => {
            if (msg?.type === "transcript" && msg?.transcriptType === "partial" && msg?.role === "user") {
                setUserSpeaking(true);
            }
            if (msg?.type === "transcript" && msg?.transcriptType === "final" && msg?.role === "user") {
                setUserSpeaking(false);
                if (msg.transcript?.trim()) setMessages(prev => [...prev, { role: "user", text: msg.transcript, ts: Date.now() }]);
            }
            if (msg?.type === "transcript" && msg?.transcriptType === "final" && msg?.role === "assistant") {
                if (msg.transcript?.trim()) setMessages(prev => [...prev, { role: "assistant", text: msg.transcript, ts: Date.now() }]);
            }
        });

        console.log("[vapi] starting assistantId:", session.assistantId);
        try {
            await vapi.start(session.assistantId, {
                variableValues: {
                    sessionId,
                    userId: session.userId,
                    userName: session.userName ?? "Candidate",
                    interviewType: session.interviewType || session.company || "",
                    role: session.role ?? "",
                    experienceLevel: session.experienceLevel ?? "",
                    techStack: (session.techStack ?? []).join(", ") || "General",
                    durationMinutes: String(session.durationMinutes ?? 30),
                    resumeText: session.resumeText || "No resume provided.",
                },
            });
        } catch (e: any) {
            console.error("[vapi] start() threw:", e);
            setError(`Failed to start: ${e?.message ?? "Check NEXT_PUBLIC_VAPI_PUBLIC_KEY"}`);
            setCallStatus("idle");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, sessionId]);

    const handleEnd = useCallback(async () => {
        if (endingRef.current) return;
        endingRef.current = true;
        setCallStatus("ending");
        const v = vapiRef.current;
        if (v) { try { v.removeAllListeners(); v.stop(); } catch { } vapiRef.current = null; }
        try {
            await fetch("/api/interview/end", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, transcript: messages.map(m => ({ role: m.role, content: m.text })), durationSeconds: elapsed }),
            });
        } catch { }
        router.push(`/interview/${sessionId}/feedback`);
    }, [messages, elapsed, sessionId, router]);

    function toggleMute() {
        const v = vapiRef.current; if (!v) return;
        const next = !muted; v.setMuted(next); setMuted(next);
    }

    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    const maxSecs = (session?.durationMinutes ?? 30) * 60;
    const timeProgress = Math.min((elapsed / maxSecs) * 100, 100);
    const timeColor = timeProgress > 85 ? "#f87171" : timeProgress > 65 ? "#fbbf24" : "#60a5fa";

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen px-6" style={{ background: "#06080f", paddingTop: "64px" }}>
                <div className="text-center max-w-lg w-full p-8 rounded-2xl"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(239,68,68,0.15)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <p className="text-lg font-black mb-4" style={{ color: "#fca5a5" }}>Call Failed</p>
                    <pre className="text-sm text-left mb-6 whitespace-pre-wrap leading-relaxed rounded-xl p-4"
                        style={{ color: "#94a3b8", background: "rgba(0,0,0,0.3)" }}>{error}</pre>
                    <div className="flex gap-3">
                        <button onClick={() => { setError(null); startedRef.current = false; endingRef.current = false; setCallStatus("idle"); if (session) startVapi(); }}
                            className="flex-1 h-11 rounded-xl text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none" }}>
                            Retry
                        </button>
                        <button onClick={() => router.push("/interview")}
                            className="flex-1 h-11 rounded-xl text-sm font-bold"
                            style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", background: "transparent" }}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const userName = session?.userName ?? "You";
    const interviewLabel = session?.interviewType || session?.company || "Interview";

    return (
        <div className="flex flex-col" style={{ background: "#06080f", minHeight: "100vh", color: "#f1f5f9", paddingTop: "64px" }}>

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(96,165,250,0.12)", background: "rgba(6,8,15,0.95)", backdropFilter: "blur(20px)" }}>

                <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{
                        background: callStatus === "active" ? "#34d399"
                            : callStatus === "connecting" ? "#fbbf24"
                                : callStatus === "ending" ? "#f87171" : "#475569",
                        boxShadow: callStatus === "active" ? "0 0 10px #34d399" : "none",
                        animation: callStatus === "active" ? "livepulse 2s ease-in-out infinite" : "none",
                    }} />
                    <div>
                        <p className="text-sm font-black" style={{ color: "#f1f5f9" }}>{interviewLabel}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>{session?.role ?? "Loading…"} · {session?.experienceLevel ?? ""}</p>
                    </div>
                    <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold hidden sm:block"
                        style={{
                            background: callStatus === "active" ? "rgba(52,211,153,0.12)" : callStatus === "connecting" ? "rgba(251,191,36,0.12)" : callStatus === "ending" ? "rgba(248,113,113,0.12)" : "rgba(96,165,250,0.1)",
                            color: callStatus === "active" ? "#34d399" : callStatus === "connecting" ? "#fbbf24" : callStatus === "ending" ? "#f87171" : "#93c5fd",
                            border: "1px solid currentColor",
                        }}>
                        {callStatus === "active" ? "● Live" : callStatus === "connecting" ? "Connecting…" : callStatus === "ending" ? "Ending…" : "Idle"}
                    </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-3xl font-black tabular-nums" style={{ color: timeColor }}>{mm}:{ss}</p>
                    <div className="w-36 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timeProgress}%`, background: timeColor }} />
                    </div>
                    <p className="text-[10px]" style={{ color: "#334155" }}>{session?.durationMinutes ?? 30} min session</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} disabled={callStatus !== "active"} title={muted ? "Unmute" : "Mute"}
                        className="h-10 w-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                        style={{ background: muted ? "rgba(248,113,113,0.15)" : "rgba(96,165,250,0.1)", border: `1px solid ${muted ? "rgba(248,113,113,0.4)" : "rgba(96,165,250,0.25)"}` }}>
                        {muted ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                                <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>
                    <button onClick={() => handleEnd()} disabled={callStatus === "idle" || callStatus === "ended" || callStatus === "ending"}
                        className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", border: "none" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                        </svg>
                        {callStatus === "ending" ? "Ending…" : "End Call"}
                    </button>
                </div>
                <style>{`@keyframes livepulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
            </div>

            {/* MAIN */}
            <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-col justify-center p-8 gap-6 flex-1">
                    {callStatus === "connecting" && (
                        <div className="text-center py-3 px-5 rounded-2xl text-sm font-semibold"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
                            ◌ Connecting to AI Interviewer — allow microphone access if prompted…
                        </div>
                    )}
                    <div className="flex gap-5" style={{ maxHeight: 320 }}>
                        <AvatarBox label="Aria" sublabel={`AI Interviewer · ${interviewLabel}`} speaking={aiSpeaking} color="#3b82f6" initial="A" isAI />
                        <AvatarBox label={userName} sublabel={session?.role ?? "Candidate"} speaking={userSpeaking} color="#34d399" initial={userName.charAt(0).toUpperCase()} />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                            { label: "Type", value: session?.interviewType || session?.company || "--" },
                            { label: "Level", value: session?.experienceLevel ?? "--" },
                            { label: "Time", value: `${session?.durationMinutes ?? 30} min` },
                            ...(session?.techStack?.slice(0, 2).map(t => ({ label: "Stack", value: t })) ?? []),
                        ].map((p, i) => (
                            <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(96,165,250,0.15)", color: "#94a3b8" }}>
                                <span style={{ color: "#475569" }}>{p.label}: </span>{p.value}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="w-80 flex-shrink-0 flex flex-col" style={{ borderLeft: "1px solid rgba(96,165,250,0.12)", background: "rgba(15,23,42,0.8)" }}>
                    <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between"
                        style={{ borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>Transcript</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(96,165,250,0.1)", color: "#93c5fd" }}>{messages.length}</span>
                    </div>
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                {callStatus === "connecting" && (
                                    <div className="h-7 w-7 rounded-full border-2 animate-spin"
                                        style={{ borderColor: "#1e3a5f", borderTopColor: "#3b82f6" }} />
                                )}
                                <p className="text-xs text-center" style={{ color: "#334155" }}>
                                    {callStatus === "connecting" ? "Establishing connection…" : "Transcript will appear here as you speak"}
                                </p>
                            </div>
                        ) : messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5"
                                    style={{
                                        background: m.role === "user" ? "rgba(59,130,246,0.2)" : "rgba(30,41,59,0.8)",
                                        border: `1px solid ${m.role === "user" ? "rgba(96,165,250,0.35)" : "rgba(96,165,250,0.1)"}`,
                                    }}>
                                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wide"
                                        style={{ color: m.role === "user" ? "#93c5fd" : "#475569" }}>
                                        {m.role === "user" ? userName : "Aria"}
                                    </p>
                                    <p className="text-xs leading-relaxed" style={{ color: m.role === "user" ? "#e2e8f0" : "#cbd5e1" }}>
                                        {m.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}