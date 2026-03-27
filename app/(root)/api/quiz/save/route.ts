
// app/api/quiz/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

/* Generate a short feedback string using AI */
async function generateFeedback(topic: string, score: number): Promise<string> {
    try {
        const prompt = `A student scored ${score}% on a quiz about "${topic}". 
Write a single, concise 1-2 sentence study recommendation for what they should focus on next. 
Be specific to the topic. Return only the recommendation text, no labels or formatting.`;

        const provider = process.env.GROQ_API_KEY ? "groq" : "openrouter";

        if (provider === "groq") {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.4, max_tokens: 128,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices?.[0]?.message?.content?.trim() ?? "";
            }
        } else {
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
                    temperature: 0.4, max_tokens: 128,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices?.[0]?.message?.content?.trim() ?? "";
            }
        }
    } catch (e) {
        console.warn("[quiz/save] feedback generation failed:", e);
    }
    return "";
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const { topic, level, correct, total, durationSeconds } = await req.json();
        if (!topic || !level || correct == null || !total) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const score = Math.round((Number(correct) / Number(total)) * 100);
        const feedback = await generateFeedback(String(topic), score);

        const session = {
            id: uuidv4(),
            topic: String(topic),
            level: String(level),
            correct: Number(correct),
            total: Number(total),
            score,
            feedback,
            durationSeconds: Number(durationSeconds ?? 0),
            createdAt: new Date().toISOString(),
        };
        /* 5. Store in Firestore */
        try {
            console.log("[quiz/save] Saving session to Firestore for user:", user.id);
            await adminDb
                .collection("users").doc(user.id)
                .collection("quiz_sessions").doc(session.id)
                .set(session);
            console.log("[quiz/save] ✓ Session saved successfully");
        } catch (dbError: any) {
            console.error("[quiz/save] ❌ Failed to save to Firestore:", dbError);
            return NextResponse.json({ error: "Failed to persist results to database." }, { status: 500 });
        }

        return NextResponse.json({ success: true, sessionId: session.id });
    } catch (err: any) {
        console.error("[quiz/save] Critical error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}