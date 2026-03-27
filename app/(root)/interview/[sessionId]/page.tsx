// app/(root)/interview/[sessionId]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import type { InterviewSession } from "@/types/interview";
import { getNextApiKey } from "@/lib/key-rotator";

function createVapi(): Vapi {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing");
    return new Vapi(key);
}

type CallStatus = "idle" | "connecting" | "active" | "ending" | "ended" | "reconnecting";
interface Msg { role: "assistant" | "user"; text: string; ts: number }

function AudioWave({ active, color }: { active: boolean; color: string }) {
    return (
        <div className="flex items-end justify-center gap-1 h-8">
            {[0.4, 0.65, 1, 0.75, 0.5, 0.85, 0.6, 0.9, 0.45, 0.7].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-current transition-all duration-200"
                    style={{
                        height: active ? `${h * 100}%` : "15%",
                        color: color,
                        opacity: active ? 0.8 : 0.2,
                        animation: active ? `audiopulse ${0.6 + i * 0.1}s ease-in-out infinite alternate` : "none"
                    }} />
            ))}
            <style>{`@keyframes audiopulse{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}`}</style>
        </div>
    );
}

function ParticipantCard({ label, sublabel, speaking, color, isAI, initial }: {
    label: string; sublabel: string; speaking: boolean;
    color: string; isAI?: boolean; initial: string;
}) {
    return (
        <div className="relative group flex flex-col items-center justify-between p-6 rounded-[2rem] transition-all duration-500 flex-1 overflow-hidden"
            style={{
                background: speaking ? `radial-gradient(circle at top, ${color}15, rgba(15,23,42,0.8))` : "rgba(15,23,42,0.6)",
                border: `1px solid ${speaking ? color + "80" : "rgba(255,255,255,0.08)"}`,
                boxShadow: speaking ? `0 0 40px ${color}15, inset 0 0 20px ${color}10` : "none",
                backdropFilter: "blur(12px)",
            }}>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20 transition-opacity duration-500"
                style={{ background: color, display: speaking ? "block" : "none" }} />

            <div className="relative z-10 flex flex-col items-center gap-4 w-full mt-4">
                <div className="relative">
                    {speaking && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: color, animationDuration: '2s' }} />
                    )}
                    <div className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105 shadow-xl glass"
                        style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, borderColor: `${color}40`, backdropFilter: 'blur(10px)' }}>
                        {isAI ? (
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-[3px] border-dashed animate-[spin_8s_linear_infinite]" style={{ borderColor: `${color}80` }} />
                                <div className="absolute inset-2.5 rounded-full border-2 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_15px_currentColor]" style={{ background: color, borderColor: `${color}90`, color: color }} />
                            </div>
                        ) : (
                            <span className="text-4xl font-black drop-shadow-md" style={{ color }}>{initial}</span>
                        )}
                    </div>
                </div>

                <div className="text-center mt-2">
                    <h3 className="text-2xl font-black text-slate-100 tracking-tight">{label}</h3>
                    <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase mt-1">{sublabel}</p>
                </div>
            </div>

            <div className="relative z-10 w-full mt-8 flex flex-col items-center gap-4">
                <AudioWave active={speaking} color={color} />
                <div className={`px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-lg ${speaking ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}
                    style={{ background: speaking ? `${color}20` : "rgba(255,255,255,0.05)", color: speaking ? color : "#64748b", border: `1px solid ${speaking ? color + "40" : "rgba(255,255,255,0.1)"}` }}>
                    {speaking ? "Speaking" : "Active"}
                </div>
            </div>
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
    const [reconnecting, setReconnecting] = useState(false);
    const [wrapUpTriggered, setWrapUpTriggered] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const transcriptRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRef = useRef(0);
    const endingRef = useRef(false);
    const vapiRef = useRef<Vapi | null>(null);
    const retryCountRef = useRef(0);

    useEffect(() => {
        fetch(`/api/interview/sessions?id=${sessionId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.session) {
                    setSession(d.session);
                    if (!d.session.assistantId) setError("Configuration Error: Missing Assistant ID.");
                } else {
                    setError("Session not found.");
                }
            })
            .catch(() => setError("Network error while loading session."));
    }, [sessionId]);

    const startVapi = useCallback(async () => {
        if (!session || endingRef.current) return;
        
        setCallStatus(reconnecting ? "reconnecting" : "connecting");
        setError(null);

        let vapi: Vapi;
        try { vapi = createVapi(); }
        catch (e: any) { setError(e.message); return; }

        vapiRef.current = vapi;
        vapi.removeAllListeners();

        vapi.on("call-start", () => {
            setCallStatus("active");
            setReconnecting(false);
            retryCountRef.current = 0;
        });

        vapi.on("call-end", () => {
            if (!endingRef.current && !reconnecting) handleEnd();
        });

        vapi.on("error", (e: any) => {
            const rawMsg = e?.error?.message?.msg || e?.message || "Unknown Error";
            console.error("[vapi] error intercepted:", e);

            if (String(rawMsg).toLowerCase().includes("ejected") || String(rawMsg).toLowerCase().includes("meeting has ended")) {
                if (retryCountRef.current < 5) {
                    retryCountRef.current++;
                    setReconnecting(true);
                    setTimeout(() => startVapi(), 1000); // Backoff retry
                } else {
                    console.warn("Connection limits exhausted, ending interview early...");
                    if (!endingRef.current) handleEnd();
                }
            } else {
                console.warn(`Vapi warning intercepted: ${rawMsg}`, e);
                // Do not throw fatal error overlay for typical Vapi internal exceptions, gracefully ignore or end
                if (callStatus === "active" && !endingRef.current) {
                    // If active but throws something terminal, we shouldn't kill UI - just wrap it up.
                }
            }
        });

        vapi.on("speech-start", () => setAiSpeaking(true));
        vapi.on("speech-end", () => setAiSpeaking(false));
        vapi.on("message", (msg: any) => {
            if (msg?.type === "transcript" && msg?.role === "user") {
                setUserSpeaking(msg.transcriptType === "partial");
                if (msg.transcriptType === "final" && msg.transcript?.trim()) {
                    setMessages(prev => [...prev.slice(-49), { role: "user", text: msg.transcript, ts: Date.now() }]);
                }
            }
            if (msg?.type === "transcript" && msg?.role === "assistant" && msg.transcriptType === "final") {
                if (msg.transcript?.trim()) {
                    setMessages(prev => [...prev.slice(-49), { role: "assistant", text: msg.transcript, ts: Date.now() }]);
                }
            }
        });

        try {
            // Initiate the Vapi call using the assigned Assistant ID from the session rather than building an inline model
            await vapi.start(session.assistantId, {
                variableValues: {
                    sessionId,
                    userId: session.userId,
                    role: session.role || "",
                    techStack: (session.techStack || []).join(", "),
                }
            });
        } catch (e: any) {
            console.warn("Init Failed but swallowed to allow graceful end", e);
            if (!endingRef.current) handleEnd();
        }
    }, [session, sessionId, reconnecting]);

    useEffect(() => {
        if (session && callStatus === "idle" && !retryCountRef.current && !endingRef.current) {
            startVapi();
        }
    }, [session, callStatus, startVapi]);

    useEffect(() => {
        if (callStatus === "active") {
            startRef.current = Date.now() - elapsed * 1000;
            timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [callStatus, elapsed]);

    // Handle graceful AI wrap up
    useEffect(() => {
        if (!session || callStatus !== "active" || endingRef.current) return;
        
        const limitSeconds = (session.durationMinutes || 30) * 60;
        
        if (elapsed >= limitSeconds && !wrapUpTriggered && vapiRef.current) {
            setWrapUpTriggered(true);
            try {
                vapiRef.current.send({
                    type: "add-message",
                    message: {
                        role: "system",
                        content: "The required time for this interview has been reached. Please wrap up the interview gracefully now, do NOT ask any new questions, and ask the user if they have any final questions for you about the role or company. Once the user is completely finished and has no more questions, thank them for their time and explicitly instruct them: 'You can now press the red End Call button at the bottom of your screen to conclude the interview and generate your feedback.'"
                    }
                });
            } catch (e) {
                console.error("Failed to send wrap-up message:", e);
            }
        }
    }, [elapsed, session, callStatus, wrapUpTriggered]);

    useEffect(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleEnd = useCallback(async () => {
        if (endingRef.current) return;
        endingRef.current = true;
        setCallStatus("ending");
        if (vapiRef.current) { try { vapiRef.current.stop(); } catch { } }
        try {
            await fetch("/api/interview/end", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, transcript: messages.map(m => ({ role: m.role, content: m.text })), durationSeconds: elapsed }),
            });
        } catch { }
        router.push(`/interview/${sessionId}/feedback`);
    }, [messages, elapsed, sessionId, router]);

    const toggleMute = useCallback(() => {
        if (vapiRef.current && callStatus === "active") {
            try {
                vapiRef.current.setMuted(!muted);
                setMuted(!muted);
            } catch (e) {
                console.warn("Failed to toggle mute:", e);
            }
        }
    }, [muted, callStatus]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    if (error) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
                <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-red-500/20 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Interview Interrupted</h2>
                    <p className="text-slate-400 mb-8 whitespace-pre-wrap">{error}</p>
                    <div className="flex gap-4">
                        <button onClick={() => { retryCountRef.current = 0; startVapi(); }} className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">Try Reconnect</button>
                        <button onClick={() => router.push("/interview")} className="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">Exit</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col min-h-screen pt-[72px] pb-6 w-full bg-[#020617] text-slate-100 font-sans">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
            
            {/* COMPACT HEADER */}
            <header className="relative z-20 h-16 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/30">
                <div className="flex items-center gap-3 w-1/3">
                    <div className={`w-3 h-3 rounded-full ${callStatus === "active" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" : "bg-amber-500 animate-bounce"}`} />
                    <div className="hidden sm:block">
                        <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-blue-400 flex items-center gap-2">
                            {reconnecting ? "Reconnecting..." : session?.interviewType || "Live Mock Session"}
                            {wrapUpTriggered && <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/30">Wrapping up...</span>}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold truncate max-w-[150px] sm:max-w-[250px]">
                            {session?.role}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-white tabular-nums leading-none drop-shadow-md">
                        {formatTime(elapsed)}
                    </span>
                    <div className="w-24 sm:w-32 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${Math.min((elapsed / ((session?.durationMinutes || 30) * 60)) * 100, 100)}%` }} />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-1/3 justify-end">
                    <button onClick={() => setShowTranscript(!showTranscript)} className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase transition-all ${showTranscript ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        {showTranscript ? "Hide Log" : "Transcript"}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="relative z-10 flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col p-4 sm:p-6 gap-6 min-h-0 relative">
                    
                    {/* Status & Meta Info */}
                    <div className="flex flex-col items-center gap-4 mt-2">
                        {(callStatus === "connecting" || reconnecting) && (
                            <div className="px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold backdrop-blur-xl animate-bounce">
                                {reconnecting ? "⚡ Re-aligning Aria's neural pathways..." : "◌ Syncing with AI Interviewer..."}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {["Type", "Experience", "Duration"].map((key, i) => (
                                <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/40 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                    <span className="text-slate-600">{key}:</span>
                                    <span className="text-slate-200">
                                        {i === 0 ? session?.interviewType : i === 1 ? session?.experienceLevel : `${session?.durationMinutes}m`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Participants Grid */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-6 sm:gap-10 min-h-0 items-center justify-center max-w-5xl mx-auto w-full px-4 mt-6">
                        <ParticipantCard 
                            label="Aria" 
                            sublabel="AI Interviewer" 
                            speaking={aiSpeaking} 
                            color="#3b82f6" 
                            initial="A" 
                            isAI 
                        />
                        <ParticipantCard 
                            label={session?.userName || "You"} 
                            sublabel="Candidate" 
                            speaking={userSpeaking} 
                            color="#10b981" 
                            initial={(session?.userName || "Y").charAt(0)} 
                        />
                    </div>

                    {/* ACTION BAR (Under Cards) */}
                    <div className="flex items-center justify-center gap-4 mt-4 mb-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-2xl">
                            {/* Mute Button */}
                            <button onClick={toggleMute} disabled={callStatus !== "active"}
                                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border ${muted ? "bg-amber-500/20 border-amber-500/40 text-amber-500" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/15"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {muted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM1 1l22 22"/></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                                )}
                            </button>

                            {/* End Call Button */}
                            <button onClick={handleEnd} disabled={callStatus === "ended" || callStatus === "ending"} title="End Interview"
                                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group">
                                <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                                    <line x1="22" y1="2" x2="2" y2="22" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* TRANSCRIPT SIDEBAR */}
                <aside className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showTranscript ? "w-80 xl:w-96 border-l border-white/5 opacity-100 translate-x-0" : "w-0 opacity-0 overflow-hidden translate-x-10 border-transparent"} hidden lg:flex flex-shrink-0 flex-col bg-slate-950/60 backdrop-blur-3xl fixed right-0 top-[136px] bottom-0 z-30`}>
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Transcript</h2>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black">{messages.length}</span>
                    </div>
                    
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth" style={{ scrollbarWidth: "none" }}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 gap-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                <p className="text-[10px] font-medium px-4">Synchronizing...</p>
                            </div>
                        ) : messages.map((m, i) => (
                            <div key={i} className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed max-w-[90%] transition-all ${
                                    m.role === "user" 
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-tr-none" 
                                    : "bg-blue-500/10 border border-blue-500/20 text-blue-100 rounded-tl-none"
                                }`}>
                                    <p className="font-black uppercase tracking-widest text-[8px] mb-1 opacity-40">
                                        {m.role === "user" ? session?.userName : "Aria"}
                                    </p>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-900/10 border-t border-white/5">
                        <p className="text-[9px] text-slate-600 text-center font-bold tracking-tight uppercase">Secured Session Gateway</p>
                    </div>
                </aside>
            </main>
        </div>
    );
}