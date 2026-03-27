// app/api/interview/start/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";
import { INTERVIEW_TYPE_ASSISTANTS, COMPANY_ASSISTANT_MAP } from "@/constants/interview";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const contentType = req.headers.get("content-type") ?? "";
        let mode = "", interviewType = "", company = "", role = "";
        let experienceLevel = "", techStack: string[] = [], durationMinutes = 30;
        let resumeText = "";

        if (contentType.includes("multipart/form-data")) {
            const form = await req.formData();
            mode = String(form.get("mode") ?? "tech-stack");
            interviewType = String(form.get("interviewType") ?? "");
            company = String(form.get("company") ?? "");
            role = String(form.get("role") ?? "");
            experienceLevel = String(form.get("experienceLevel") ?? "");
            durationMinutes = Number(form.get("durationMinutes") ?? 30);
            try { techStack = JSON.parse(String(form.get("techStack") ?? "[]")); } catch { techStack = []; }

            const resumeFile = form.get("resume") as File | null;
            if (resumeFile && resumeFile.size > 0) {
                resumeText = resumeFile.type === "text/plain"
                    ? await resumeFile.text()
                    : `Resume: ${resumeFile.name}`;
            } else {
                resumeText = String(form.get("resumeText") ?? "");
            }
        } else {
            const body = await req.json();
            mode = body.mode ?? "tech-stack";
            interviewType = body.interviewType ?? "";
            company = body.company ?? "";
            role = body.role ?? "";
            experienceLevel = body.experienceLevel ?? "";
            techStack = Array.isArray(body.techStack) ? body.techStack : [];
            durationMinutes = Number(body.durationMinutes ?? 30);
            resumeText = body.resumeText ?? "";
        }

        if (!role?.trim()) return NextResponse.json({ error: "Role is required." }, { status: 400 });
        if (!experienceLevel) return NextResponse.json({ error: "Experience level is required." }, { status: 400 });

        let assistantId = "";
        if (mode === "tech-stack" && interviewType) {
            assistantId = INTERVIEW_TYPE_ASSISTANTS[interviewType] ?? "";
        } else if (mode === "company" && company) {
            assistantId = COMPANY_ASSISTANT_MAP[company] ?? INTERVIEW_TYPE_ASSISTANTS["HR Round"] ?? "";
        }

        if (!assistantId) {
            return NextResponse.json(
                { error: `No assistant ID for "${interviewType || company}". Check NEXT_PUBLIC_VAPI_ASSISTANT_* in .env.local` },
                { status: 400 }
            );
        }

        const sessionId = uuidv4();
        const userName = user.name ?? user.email?.split("@")[0] ?? "Candidate";

        const session = {
            id: sessionId, userId: user.id, userName, type: mode,
            interviewType: mode === "tech-stack" ? interviewType : "",
            company: mode === "company" ? company : "",
            role: role.trim(), experienceLevel,
            techStack: Array.isArray(techStack) ? techStack : [],
            durationMinutes: Number(durationMinutes),
            resumeText: resumeText.trim(),
            assistantId, status: "pending",
            createdAt: new Date().toISOString(),
        };
        /* 5. Save to Firestore */
        try {
            console.log("[interview/start] Saving session to Firestore for user:", user.id);
            await adminDb.collection("users").doc(user.id)
                .collection("interview_sessions").doc(sessionId).set(session);
            console.log("[interview/start] ✓ Session created successfully");
        } catch (dbError: any) {
            console.error("[interview/start] ❌ Failed to create session in Firestore:", dbError);
            return NextResponse.json({ error: "Failed to initialize session in database." }, { status: 500 });
        }

        return NextResponse.json({ success: true, sessionId });
    } catch (err: any) {
        console.error("[interview/start] Critical error:", err);
        return NextResponse.json({ error: err.message ?? "Failed to start interview." }, { status: 500 });
    }
}