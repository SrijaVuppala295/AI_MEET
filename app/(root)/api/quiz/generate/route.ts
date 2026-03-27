// app/api/quiz/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { getNextApiKeyServer } from "@/lib/key-rotator";

async function callGroq(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5, max_tokens: 4096,
        }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
    return (await res.json()).choices?.[0]?.message?.content ?? "";
}

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
            "X-Title": "AI Meet",
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5, max_tokens: 4096,
        }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    return (await res.json()).choices?.[0]?.message?.content ?? "";
}

async function generate(prompt: string): Promise<string> {
    const groqKey = getNextApiKeyServer("groq");
    if (groqKey) {
        try { return await callGroq(prompt, groqKey); } catch (e) { console.warn("[quiz/generate] Groq failed:", e); }
    }
    
    const orKey = getNextApiKeyServer("openrouter");
    if (orKey) {
        try { return await callOpenRouter(prompt, orKey); } catch (e) { console.warn("[quiz/generate] OpenRouter failed:", e); }
    }
    throw new Error("No AI provider configured. Set GROQ_API_KEYS or OPEN_ROUTER_API_KEYS.");
}

function buildPrompt(topic: string, level: string, count: number) {
    const depthGuide = {
        beginner: "definitions, basic syntax, and foundational concepts",
        intermediate: "applied usage, common patterns, and practical problem-solving",
        advanced: "edge cases, internals, performance trade-offs, and architectural decisions",
    }[level] ?? "applied concepts";

    return `You are an expert quiz generator for software engineering interview preparation.

Generate exactly ${count} multiple-choice questions on "${topic}" at "${level}" difficulty.

Return ONLY a raw JSON array (no markdown, no code fences, no extra text):

[
  {
    "question": "<clear, specific question>",
    "options": ["<A>", "<B>", "<C>", "<D>"],
    "correctIndex": <0-3>,
    "explanation": "<2-3 sentence explanation of the correct answer>"
  }
]

Rules:
- Exactly 4 options per question. correctIndex is 0-based.
- Focus on: ${depthGuide}
- All questions must be distinct and cover breadth of the topic.
- Return ONLY the JSON array.`;
}

export async function POST(req: NextRequest) {
    try {
        const { topic, level, count } = await req.json();
        if (!topic || !level || !count) {
            return NextResponse.json({ error: "topic, level, and count are required." }, { status: 400 });
        }

        const raw = await generate(buildPrompt(topic, level, Number(count)));

        let cleaned = raw
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const arrStart = cleaned.indexOf("[");
        if (arrStart > 0) cleaned = cleaned.slice(arrStart);

        const parsed: any[] = JSON.parse(cleaned);
        const questions = parsed.map(q => ({
            id: uuidv4(),
            question: String(q.question ?? ""),
            options: (q.options ?? []).map(String),
            correctIndex: Number(q.correctIndex ?? 0),
            explanation: String(q.explanation ?? ""),
        }));

        return NextResponse.json({ questions });
    } catch (err: any) {
        console.error("[quiz/generate]", err);
        return NextResponse.json({ error: err.message ?? "Failed to generate questions." }, { status: 500 });
    }
}