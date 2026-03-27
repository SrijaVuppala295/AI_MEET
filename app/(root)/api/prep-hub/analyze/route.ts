import { NextRequest, NextResponse } from "next/server";
import { auth, adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";

// Polyfills for pdf-parse-fork in Node environment
if (typeof (global as any).DOMMatrix === "undefined") {
    (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (global as any).Path2D === "undefined") {
    (global as any).Path2D = class Path2D {};
}
if (typeof (global as any).ImageData === "undefined") {
    (global as any).ImageData = class ImageData {};
}

const pdf = require("pdf-parse-fork");
const mammoth = require("mammoth");

/* ─────────── helpers ─────────── */

/** extract text from various file formats for LLM analysis */
async function extractTextFromFile(file: File): Promise<{ text: string }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.name.endsWith(".pdf");
    const isDocx = file.name.endsWith(".docx");
    const isTxt = file.name.endsWith(".txt");

    if (isTxt) {
        return { text: await file.text() };
    }

    if (isPdf) {
        try {
            const data = await pdf(buffer);
            return { text: data.text };
        } catch (error) {
            console.error("PDF parsing error:", error);
            return { text: "" };
        }
    }

    if (isDocx) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return { text: result.value };
        } catch (error) {
            console.error("Docx parsing error:", error);
            return { text: "" };
        }
    }

    // Fallback for other files (treat as plain text)
    return { text: await file.text() };
}

/* ─────────── prompt builder ─────────── */

function buildPrompt(hasJD: boolean): string {
    return `
You are an expert technical career coach and interview preparation specialist.

Analyze the provided resume${hasJD ? " and job description" : ""} and return a JSON object with EXACTLY this structure:

{
  "role": "<detected or inferred job role, e.g. 'Full Stack Developer'>",
  "qa": [
    {
      "q": "<interview question>",
      "a": "<detailed model answer>",
      "category": "<one of: Technical | Behavioral | System Design | HR | Aptitude>"
    }
  ],
  "topics": [
    "<topic/concept to prepare, e.g. 'React hooks lifecycle and optimization'>",
    ...
  ],
  "tips": [
    {
      "type": "<one of: strength | improve | missing>",
      "text": "<specific, actionable tip about the resume>"
    }
  ]
}

Rules:
- Generate 12-16 diverse interview questions (spread across categories) tailored to the resume${hasJD ? " and job description" : ""}.
- Every answer must be 2-4 sentences: concrete, actionable, and interview-ready.
- Generate 8-12 topics to study/prepare — be specific (not just "JavaScript", but "JavaScript event loop and async patterns").
- Generate 6-10 resume tips — mix of strengths, improvements, and missing sections. Be specific and reference the actual resume content.
- Return ONLY valid JSON. No markdown, no code fences, no preamble.
`.trim();
}

/* ─────────── route handler ─────────── */

export async function POST(req: NextRequest) {
    try {
        /* 1. Parse form data */
        const formData = await req.formData();
        const resumeFile = formData.get("resume") as File | null;
        const jdText = formData.get("jd") as string | null;
        const jdFile = formData.get("jdFile") as File | null;

        if (!resumeFile) {
            return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
        }

        /* 2. Validate sizes */
        const MAX_RESUME = 5 * 1024 * 1024; // 5 MB
        const MAX_JD = 2 * 1024 * 1024;     // 2 MB
        if (resumeFile.size > MAX_RESUME) {
            return NextResponse.json({ error: "Resume must be under 5 MB." }, { status: 400 });
        }
        if (jdFile && jdFile.size > MAX_JD) {
            return NextResponse.json({ error: "JD file must be under 2 MB." }, { status: 400 });
        }

        /* 3. Call Groq */
        const resumeData = await extractTextFromFile(resumeFile);
        const hasJD = !!(jdText?.trim() || jdFile);
        
        let jdContent = "";
        if (jdText?.trim()) {
            jdContent = jdText.trim();
        } else if (jdFile) {
            const jdData = await extractTextFromFile(jdFile);
            jdContent = jdData.text || "";
        }

        const prompt = `
${buildPrompt(hasJD)}

RESUME CONTENT:
${resumeData.text || "No text extracted from resume. Please ensure it's a valid text-based file."}

${hasJD ? `JOB DESCRIPTION CONTENT:\n${jdContent}` : ""}
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Groq API call failed");
        }

        const data = await response.json();
        const rawText = data.choices[0].message.content;

        let parsed: { role?: string; qa: any[]; topics: string[]; tips: any[] };
        try {
            parsed = JSON.parse(rawText);
        } catch {
            console.error("Groq raw response:", rawText);
            return NextResponse.json({ error: "AI response could not be parsed. Please try again." }, { status: 500 });
        }

        /* 5. Build result object */
        const prepResult = {
            id: uuidv4(),
            fileName: resumeFile.name,
            hasJD,
            createdAt: new Date().toISOString(),
            role: parsed.role ?? "Software Engineer",
            qa: (parsed.qa ?? []).map((q: any) => ({
                q: q.q ?? "",
                a: q.a ?? "",
                category: q.category ?? "Technical",
            })),
            topics: parsed.topics ?? [],
            tips: (parsed.tips ?? []).map((t: any) => ({
                type: t.type ?? "improve",
                text: t.text ?? "",
            })),
        };

        /* 6. Store in Firestore (if user is authenticated) */
        try {
            const user = await getCurrentUser();
            if (user?.id) {
                console.log("[prep-hub/analyze] Saving session to Firestore for user:", user.id);
                await adminDb
                    .collection("users")
                    .doc(user.id)
                    .collection("prep_sessions")
                    .doc(prepResult.id)
                    .set(prepResult);
                console.log("[prep-hub/analyze] ✓ Session saved successfully");
            } else {
                console.log("[prep-hub/analyze] ⚠ No authenticated user found, skipping Firestore save");
            }
        } catch (dbError: any) {
            console.error("[prep-hub/analyze] ❌ Failed to save to Firestore:", dbError);
            // We still return the results to the user even if DB save fails
        }

        return NextResponse.json(prepResult);
    } catch (err: any) {
        console.error("[prep-hub/analyze] Critical error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}