// app/api/interview/feedback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import type { InterviewFeedback, TranscriptMessage } from "@/types/interview";

/* ─── AI provider ─── */
async function callAI(prompt: string): Promise<string> {
    if (process.env.GROQ_API_KEY) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 3000,
                }),
            });
            if (res.ok) return (await res.json()).choices?.[0]?.message?.content ?? "";
        } catch (e) { console.warn("[feedback] Groq failed:", e); }
    }
    if (process.env.OPENROUTER_API_KEY) {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
                "X-Title": "AI Meet",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 3000,
            }),
        });
        if (res.ok) return (await res.json()).choices?.[0]?.message?.content ?? "";
    }
    throw new Error("No AI provider configured. Set GROQ_API_KEY or OPENROUTER_API_KEY.");
}

/* ─── prompt ─── */
function buildPrompt(
    transcript: TranscriptMessage[],
    interviewType: string,
    role: string,
    level: string,
): string {
    const convo = transcript
        .map(m => `${m.role === "assistant" ? "AI Interviewer" : "Candidate"}: ${m.content}`)
        .join("\n") || "No transcript available — interview may not have started.";

    return `You are an expert technical interview coach evaluating a ${interviewType} interview for a ${role} position at ${level} level.

INTERVIEW TRANSCRIPT:
${convo}

Analyse the interview and return ONLY a raw JSON object (no markdown, no code fences, no preamble):

{
  "overallScore": <0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvements": [
    "<specific actionable step 1>",
    "<specific actionable step 2>",
    "<specific actionable step 3>",
    "<specific actionable step 4>"
  ],
  "questionBreakdown": [
    {
      "question": "<exact question the AI asked>",
      "answer": "<summary of what the candidate said>",
      "score": <0-10>,
      "feedback": "<2-3 sentence specific feedback on this answer>"
    }
  ]
}

Rules:
- Base scores on actual content. If transcript is empty, give low scores and note it.
- Extract ALL questions the interviewer asked.
- Improvements must be specific and actionable, not generic.
- Return ONLY valid JSON. No markdown fences.`;
}

/* ─── route ─── */
export async function POST(req: NextRequest) {
    try {
        // Allow both authenticated and internal (webhook-triggered) calls
        const isInternal = req.headers.get("x-internal") === "1";
        let userId = "";
        let sessionId = "";

        const body = await req.json();
        sessionId = body.sessionId;

        if (isInternal) {
            userId = body.userId;
        } else {
            const user = await getCurrentUser();
            if (!user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
            userId = user.id;
        }

        if (!sessionId || !userId) {
            return NextResponse.json({ error: "sessionId and userId required." }, { status: 400 });
        }

        const docRef = adminDb
            .collection("users").doc(userId)
            .collection("interview_sessions").doc(sessionId);

        const doc = await docRef.get();
        if (!doc.exists) return NextResponse.json({ error: "Session not found." }, { status: 404 });

        const session = doc.data()!;

        // Return existing feedback if already generated
        if (session.feedback) return NextResponse.json({ feedback: session.feedback });

        const transcript: TranscriptMessage[] = session.transcript ?? [];
        const raw = await callAI(buildPrompt(
            transcript,
            session.interviewType || session.company || "Technical",
            session.role || "Software Engineer",
            session.experienceLevel || "mid",
        ));

        // Strip markdown fences if present
        let cleaned = raw
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const start = cleaned.indexOf("{");
        if (start > 0) cleaned = cleaned.slice(start);

        const parsed = JSON.parse(cleaned);

        const feedback: InterviewFeedback = {
            overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore ?? 50))),
            communicationScore: Math.min(100, Math.max(0, Number(parsed.communicationScore ?? 50))),
            technicalScore: Math.min(100, Math.max(0, Number(parsed.technicalScore ?? 50))),
            problemSolvingScore: Math.min(100, Math.max(0, Number(parsed.problemSolvingScore ?? 50))),
            summary: String(parsed.summary ?? ""),
            strengths: (parsed.strengths ?? []).map(String),
            weaknesses: (parsed.weaknesses ?? []).map(String),
            improvements: (parsed.improvements ?? []).map(String),
            questionBreakdown: (parsed.questionBreakdown ?? []).map((q: any) => ({
                question: String(q.question ?? ""),
                answer: String(q.answer ?? ""),
                score: Math.min(10, Math.max(0, Number(q.score ?? 5))),
                feedback: String(q.feedback ?? ""),
            })),
            generatedAt: new Date().toISOString(),
        };

        await docRef.update({ feedback });
        console.log(`[interview/feedback] generated for session=${sessionId} score=${feedback.overallScore}`);

        return NextResponse.json({ feedback });
    } catch (err: any) {
        console.error("[interview/feedback]", err);
        return NextResponse.json({ error: err.message ?? "Failed to generate feedback." }, { status: 500 });
    }
}