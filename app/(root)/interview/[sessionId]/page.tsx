// app/(root)/interview/[sessionId]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import type { InterviewSession } from "@/types/interview";
import { toast } from "sonner";

function createVapi(): Vapi {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    console.log("[vapi-init] Public Key Presence Check:", !!key, key?.substring(0, 10) + "...");
    
    if (!key) {
        const errorMsg = "NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing from environment. Browser cannot initialize Vapi.";
        toast.error("Vapi Configuration Error", { description: errorMsg });
        throw new Error(errorMsg);
    }
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
        <div className="relative group flex flex-col items-center justify-between p-8 rounded-[3rem] transition-all duration-500 flex-1 overflow-hidden"
            style={{
                background: "#ffffff",
                border: `2.5px solid ${speaking ? color : "rgba(0,0,0,0.3)"}`,
                boxShadow: speaking ? `0 20px 80px ${color}30` : "0 10px 40px rgba(0,0,0,0.06)",
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
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{label}</h3>
                    <p className="text-sm text-slate-600 font-semibold tracking-wide uppercase mt-1">{sublabel}</p>
                </div>
            </div>

            <div className="relative z-10 w-full mt-8 flex flex-col items-center gap-4">
                <AudioWave active={speaking} color={color} />
                <div className={`px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-lg ${speaking ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}
                    style={{ background: speaking ? `${color}20` : "rgba(0, 0, 0,0.05)", color: speaking ? color : "#64748b", border: `1px solid ${speaking ? color + "40" : "rgba(0, 0, 0,0.1)"}` }}>
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
    const hasStartedRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

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

        // Ensure we handle basic events immediately
        vapi.on("call-start", () => {
            console.log("[vapi] call started successfully");
            setCallStatus("active");
            setReconnecting(false);
            retryCountRef.current = 0;
        });

        vapi.on("call-end", () => {
            if (isMountedRef.current && !endingRef.current && !reconnecting) handleEnd();
        });

        vapi.on("error", (e: any) => {
            const rawMsg = e?.error?.message?.msg || e?.message || e?.error?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
            console.error("[vapi] error intercepted:", e);
            
            const isEjection = String(rawMsg).toLowerCase().includes("ejected") || String(rawMsg).toLowerCase().includes("meeting has ended");

            // Buffer ejection alerts - don't show immediately if we might be reconnecting
            if (isEjection) {
                setTimeout(() => {
                    if (isMountedRef.current && !reconnecting && !endingRef.current && callStatus !== "active") {
                        toast.error("Vapi Connection Issue", { description: "Meeting has ended unexpectedly." });
                    }
                }, 1500);
            } else {
                toast.error("Vapi Issue", { description: rawMsg, duration: 4000 });
            }

            if (isEjection) {
                if (retryCountRef.current < 5) {
                    retryCountRef.current++;
                    setReconnecting(true);
                    setTimeout(() => startVapi(), 1000); // Backoff retry
                } else {
                    console.warn("Connection limits exhausted, ending interview early...");
                    if (!endingRef.current) handleEnd();
                }
            }
        });

        vapi.on("speech-start", () => setAiSpeaking(true));
        vapi.on("speech-end", () => setAiSpeaking(false));
        vapi.on("message", (msg: any) => {
            if (msg?.type === "transcript" && msg?.role === "user") {
                setUserSpeaking(msg.transcriptType === "partial");
                if (msg.transcriptType === "final" && msg.transcript?.trim()) {
                    setMessages(prev => {
                        // Anti-duplicate check: don't add if the last message is exact same text
                        if (prev.length > 0 && prev[prev.length - 1].text === msg.transcript) return prev;
                        return [...prev.slice(-49), { role: "user", text: msg.transcript, ts: Date.now() }];
                    });
                }
            }
            if (msg?.type === "transcript" && msg?.role === "assistant" && msg.transcriptType === "final") {
                if (msg.transcript?.trim()) {
                    setMessages(prev => {
                        // Anti-duplicate check
                        if (prev.length > 0 && prev[prev.length - 1].text === msg.transcript) return prev;
                        return [...prev.slice(-49), { role: "assistant", text: msg.transcript, ts: Date.now() }];
                    });
                }
            }
        });

        try {
            // ONLY send firstMessage if we haven't started or the transcript is empty
            // This prevents "Hello Srija!" from repeating during reconnection
            const isFirstStart = messages.length === 0;

            await vapi.start(session.assistantId, {
                ...(isFirstStart && {
                    firstMessage: `Hello ${session.userName}! I am Aria, your AI interviewer today. I've analyzed your background for the ${session.role} position. Let's get started. How are you doing today?`
                }),
                variableValues: {
                    sessionId,
                    userId: session.userId,
                    role: session.role || "",
                    techStack: (session.techStack || []).join(", "),
                }
            });
            if (isFirstStart) {
                toast.success("Connected to Aria", { description: "You are now live. Microphone is active." });
            }
        } catch (e: any) {
            if (isMountedRef.current) {
                console.warn("Init Failed but swallowed to allow graceful end", e);
                if (!endingRef.current) handleEnd();
            }
        }
    }, [session, sessionId, reconnecting]);

    useEffect(() => {
        // Strict guard: Only start if we have a session AND aren't already starting/started
        // This prevents the "Meeting Ended" error caused by duplicate constructors
        if (session && callStatus === "idle" && !retryCountRef.current && !endingRef.current && !hasStartedRef.current) {
            console.log("[vapi-init] Triggering Vapi boot-sequence...");
            hasStartedRef.current = true;
            startVapi();
        }

        return () => {
            isMountedRef.current = false;
            if (vapiRef.current) {
                const sdk = vapiRef.current;
                vapiRef.current = null; // Clear immediately
                
                try {
                    console.log("[vapi-cleanup] Tearing down Vapi and releasing audio ports...");
                    sdk.removeAllListeners();
                    // Non-blocking stop with safe catch for WASM errors
                    Promise.resolve(sdk.stop()).catch(() => {});
                } catch (e) {
                    console.error("Vapi synchronous cleanup error:", e);
                }
            }
        };
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
        
        console.log("[interview] wrapping up session...");
        
        // 1. Silent, safe SDK cleanup
        if (vapiRef.current) { 
            const sdk = vapiRef.current;
            vapiRef.current = null;
            try { 
                sdk.removeAllListeners();
                sdk.stop(); 
            } catch (e) { console.warn("Vapi stop ignored:", e); } 
        }

        const finalize = () => {
            if (isMountedRef.current) {
                console.log("[interview] redirecting to feedback gateway...");
                router.replace(`/interview/${sessionId}/feedback`);
            }
        };

        // 2. Immediate UI feedback
        toast.success("Interview Captured", { description: "Finalizing your precision roadmap..." });

        // 3. NON-BLOCKING Finalization
        // We trigger the API call but DON'T wait for it. The server-side process 
        // will handle it while the user is already looking at their feedback.
        try {
            const transcript = messages.map(m => ({ role: m.role, content: m.text }));
            fetch("/api/interview/end", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, transcript, durationSeconds: elapsed }),
            }).catch(e => console.warn("Background save warning:", e));
            
            finalize();

            // 4. HARD FALLBACK after 1.5s (Emergency Exit)
            setTimeout(() => {
                if (isMountedRef.current) {
                    console.log("[interview] Triggering Hard Window Location Fallback...");
                    window.location.href = `/interview/${sessionId}/feedback`;
                }
            }, 1500);
        } catch (err) {
            console.error("[interview] end flow error:", err);
            finalize();
        }
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

    if (callStatus === "ending") {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-2xl">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-black/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Analyzing Session</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Generating your precision roadmap...</p>
                
                {/* Emergency Fail-safe Button */}
                <button 
                    onClick={() => window.location.href = `/interview/${sessionId}/feedback`}
                    className="mt-12 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-700 underline underline-offset-4 animate-pulse"
                >
                    Not Redirected? Click here to view results
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl">
                <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-red-500/20 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Interrupted</h2>
                    <p className="text-slate-600 mb-8 whitespace-pre-wrap">{error}</p>
                    <div className="flex gap-4">
                        <button onClick={() => { retryCountRef.current = 0; startVapi(); }} className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold transition-colors">Try Reconnect</button>
                        <button onClick={() => router.push("/interview")} className="flex-1 py-3 px-6 rounded-xl bg-slate-200 hover:bg-slate-700 text-slate-700 font-bold transition-colors">Exit</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col min-h-screen pt-[72px] pb-6 w-full bg-white text-slate-900 font-sans">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white pointer-events-none" />
            
            {/* COMPACT HEADER */}
            <header className="relative z-20 h-24 px-10 flex items-center justify-between border-b-2 border-black/20 bg-white">
                <div className="flex items-center gap-3 w-1/3">
                    <div className={`w-3 h-3 rounded-full ${callStatus === "active" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" : "bg-amber-500 animate-bounce"}`} />
                    <div className="hidden sm:block">
                        <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-blue-400 flex items-center gap-2">
                            {reconnecting ? "Reconnecting..." : session?.interviewType || "Live Mock Session"}
                            {wrapUpTriggered && <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/30">Wrapping up...</span>}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] text-slate-600 font-bold truncate max-w-[150px] sm:max-w-[250px]">
                            {session?.role}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-slate-900 tabular-nums leading-none">
                        {formatTime(elapsed)}
                    </span>
                    <div className="w-32 sm:w-48 h-2 bg-slate-100 rounded-full mt-3 overflow-hidden border border-black/5">
                        <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${Math.min((elapsed / ((session?.durationMinutes || 30) * 60)) * 100, 100)}%` }} />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-1/3 justify-end">
                    <button onClick={() => setShowTranscript(!showTranscript)} className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[10px] font-black tracking-widest uppercase transition-all ${showTranscript ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-black/15 text-slate-900 hover:bg-slate-50"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
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
                            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-black/10 text-slate-900 text-[11px] font-black backdrop-blur-xl animate-in fade-in zoom-in duration-300 shadow-xl">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                {reconnecting ? "HEALING CONNECTION..." : "SYNCING WITH ARIA..."}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                            {["Type", "Experience", "Duration"].map((key, i) => (
                                <div key={key} className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-50 border-2 border-black/30 text-[12px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                    <span className="text-slate-500">{key}:</span>
                                    <span>
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
                    <div className="flex items-center justify-center gap-4 mt-8 mb-8">
                        <div className="flex items-center gap-5 px-8 py-5 rounded-full bg-white border-2 border-black/10 shadow-2xl">
                            {/* Mute Button */}
                            <button onClick={toggleMute} disabled={callStatus !== "active"}
                                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all border ${muted ? "bg-red-50 border-red-200 text-red-500" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {muted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM1 1l22 22"/></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                                )}
                            </button>

                            {/* End Call Button */}
                            <button onClick={handleEnd} disabled={callStatus === "ended" || callStatus === "ending"} title="End Interview"
                                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed group">
                                <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                                    <line x1="22" y1="2" x2="2" y2="22" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* TRANSCRIPT SIDEBAR */}
                <aside className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showTranscript ? "w-80 xl:w-96 border-l border-black/10 opacity-100 translate-x-0" : "w-0 opacity-0 overflow-hidden translate-x-10 border-transparent"} hidden lg:flex flex-shrink-0 flex-col bg-white/80 backdrop-blur-3xl fixed right-0 top-[136px] bottom-0 z-30`}>
                    <div className="p-5 border-b border-black/10 flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Live Transcript</h2>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black">{messages.length}</span>
                    </div>
                    
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" style={{ scrollbarWidth: "none" }}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-black/20 animate-spin flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                                </div>
                                <p className="text-[10px] font-black tracking-widest uppercase">Initializing Stream</p>
                            </div>
                        ) : messages.map((m, i) => (
                            <div key={i} className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`group relative px-6 py-4 rounded-3xl text-[13px] leading-relaxed max-w-[92%] transition-all ${
                                    m.role === "user" 
                                    ? "bg-white border-2 border-black text-slate-900 rounded-tr-none shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
                                    : "bg-slate-900 text-white rounded-tl-none shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                                }`}>
                                    <div className="flex items-center justify-between gap-6 mb-2">
                                        <p className={`font-black uppercase tracking-[0.2em] text-[9px] ${m.role === "user" ? "text-blue-500" : "text-emerald-400"}`}>
                                            {m.role === "user" ? (session?.userName || "Candidate") : "Aria"}
                                        </p>
                                        <span className="text-[8px] opacity-40 font-bold">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="block relative z-10 font-medium" 
                                       style={{ color: m.role === 'assistant' ? '#FFFFFF' : '#0F172A' }}>
                                        {m.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-black/10">
                        <p className="text-[9px] text-slate-600 text-center font-bold tracking-tight uppercase">Secured Session Gateway</p>
                    </div>
                </aside>
            </main>
        </div>
    );
}