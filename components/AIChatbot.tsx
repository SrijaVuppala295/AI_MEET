"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

/* ─────────────────────────────────────────────
   SYSTEM PROMPT — topic-restricted
───────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are the AI MEET assistant — a helpful chatbot built into the AI MEET platform, an AI-powered mock interview preparation platform developed by students of Bhoj Reddy Engineering College for Women, Department of Information Technology.

Your role is to assist users with:
- Questions about the AI MEET platform and its features
- Interview preparation tips and strategies
- Technical interview topics (DSA, system design, frontend, backend, DevOps, etc.)
- Resume writing and improvement tips
- How to use the Quiz module, Prep Hub, Question Bank, and AI Interview features
- General career advice for software engineering roles
- Company-specific interview patterns (Google, Amazon, Microsoft, Meta, Spotify, Adobe, Netflix, Uber)
- Behavioral interview tips (STAR method, HR questions)
- Coding interview strategies and common patterns
- System design fundamentals

If the user asks about something completely unrelated (e.g., cooking, sports, politics, movies, news, entertainment, personal life questions), politely decline and say:
"I'm trained to assist with interview preparation and the AI MEET platform only. I can't help with that topic, but I'm happy to help you with interview prep, resume tips, or any platform-related questions!"

Keep responses concise, practical, and encouraging. Use bullet points where helpful. Be warm and supportive — the user is preparing for something important.`;

/* ─────────────────────────────────────────────
   API CALL — Groq via Next.js API route
───────────────────────────────────────────── */
async function sendToGroq(messages: Message[]): Promise<string> {
  // Build conversation history for Groq
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const lastMessage = messages[messages.length - 1];

  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: lastMessage.content,
      history,
    }),
  });

  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.reply;
}

/* ─────────────────────────────────────────────
   SUGGESTED PROMPTS
───────────────────────────────────────────── */
const SUGGESTIONS = [
  "How do I use the AI Interview feature?",
  "Tips for system design interviews",
  "How to answer behavioral questions?",
  "What is the STAR method?",
  "Common DSA patterns for coding rounds",
  "How to improve my resume?",
];

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#6366f1",
            animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      style={{ animation: "chatFadeIn 0.25s ease-out" }}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 mr-2 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            boxShadow: "0 0 10px rgba(99,102,241,0.4)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 8c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <div
        className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #4338ca, #4f46e5)"
            : "rgba(255,255,255,0.07)",
          color: isUser ? "#fff" : "#e2e8f0",
          borderTopRightRadius: isUser ? 6 : undefined,
          borderTopLeftRadius:  isUser ? undefined : 6,
          boxShadow: isUser
            ? "0 4px 16px rgba(79,70,229,0.25)"
            : "none",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {isUser ? (
          msg.content
        ) : (
          <div className="chatbot-markdown">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="flex-shrink-0 ml-2 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
        >
          U
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN CHATBOT COMPONENT
───────────────────────────────────────────── */
export default function AIChatbot() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(true); // show badge on first open
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm the AI MEET assistant. I can help you with interview preparation, platform features, resume tips, and career advice.\n\nWhat can I help you with today?",
        ts: Date.now(),
      },
    ]);
  }, []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendToGroq(updated);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, ts: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        .chatbot-markdown p { margin: 0 0 0.4em 0; }
        .chatbot-markdown p:last-child { margin-bottom: 0; }
        .chatbot-markdown strong { color: #fff; font-weight: 600; }
        .chatbot-markdown ul, .chatbot-markdown ol { margin: 0.3em 0; padding-left: 1.2em; }
        .chatbot-markdown li { margin-bottom: 0.15em; }
        .chatbot-markdown code { background: rgba(99,102,241,0.15); padding: 1px 5px; border-radius: 4px; font-size: 0.9em; color: #a5b4fc; }
        .chatbot-markdown pre { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; overflow-x: auto; margin: 0.4em 0; }
        .chatbot-markdown pre code { background: none; padding: 0; color: #e2e8f0; }
        .chatbot-markdown h1, .chatbot-markdown h2, .chatbot-markdown h3 { color: #fff; font-weight: 700; margin: 0.5em 0 0.25em; }
        .chatbot-markdown h1 { font-size: 1.1em; }
        .chatbot-markdown h2 { font-size: 1.05em; }
        .chatbot-markdown h3 { font-size: 1em; }
      `}</style>

      {/* ── Chat Window ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 360,
            maxWidth: "calc(100vw - 48px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            background: "#0d0f18",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 20,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            animation: "chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              flexShrink: 0,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 14px rgba(99,102,241,0.4)",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3.5 13c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.2 }}>
                  AI MEET Assistant
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "#4ade80" }}>Online · Powered by Groq</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M2 12l10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 14px 6px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <div
                  style={{
                    marginRight: 8,
                    marginTop: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 8c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0 12px 12px 12px",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Suggested prompts */}
            {showSuggestions && !loading && (
              <div style={{ marginTop: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Suggested
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(99,102,241,0.2)",
                        background: "rgba(99,102,241,0.06)",
                        color: "#94a3b8",
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "rgba(99,102,241,0.14)";
                        el.style.color = "#a5b4fc";
                        el.style.borderColor = "rgba(99,102,241,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "rgba(99,102,241,0.06)";
                        el.style.color = "#94a3b8";
                        el.style.borderColor = "rgba(99,102,241,0.2)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "8px 10px 8px 14px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.5)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about interview prep, platform features…"
                rows={1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: 13,
                  lineHeight: 1.5,
                  resize: "none",
                  fontFamily: "inherit",
                  maxHeight: 80,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  padding: 0,
                }}
                onInput={(e) => {
                  const el = e.currentTarget as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 80) + "px";
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #4338ca, #4f46e5)"
                    : "rgba(255,255,255,0.06)",
                  color: input.trim() && !loading ? "#fff" : "#334155",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  boxShadow: input.trim() && !loading ? "0 0 14px rgba(79,70,229,0.3)" : "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12 7H2M8.5 3L12 7l-3.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#1e293b", textAlign: "center", marginTop: 6 }}>
              Trained on AI MEET content only · Press Enter to send
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI MEET chatbot"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 54,
          height: 54,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: open
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #4f46e5, #7c3aed)",
          boxShadow: open
            ? "0 4px 24px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(79,70,229,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          animation: !open ? "chatPulse 2.5s ease-in-out infinite" : "none",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = open ? "rotate(45deg) scale(1.08)" : "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = open ? "rotate(45deg)" : "scale(1)";
        }}
      >
        {/* Unread badge */}
        {unread && !open && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #08090d",
              animation: "chatPop 1s ease-in-out 1s",
            }}
          />
        )}

        {open ? (
          /* X icon when open */
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M3 15l12-12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Chat icon when closed */
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M4 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-5 4V6a2 2 0 0 1 2-2z"
              fill="rgba(255,255,255,0.9)"
            />
            <circle cx="8" cy="11" r="1.2" fill="#4f46e5" />
            <circle cx="11" cy="11" r="1.2" fill="#4f46e5" />
            <circle cx="14" cy="11" r="1.2" fill="#4f46e5" />
          </svg>
        )}
      </button>
    </>
  );
}