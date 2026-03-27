// app/api/interview/end/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const { sessionId, transcript, durationSeconds } = await req.json();
        if (!sessionId) return NextResponse.json({ error: "sessionId is required." }, { status: 400 });

        const docRef = adminDb
            .collection("users").doc(user.id)
            .collection("interview_sessions").doc(sessionId);

        const doc = await docRef.get();
        if (!doc.exists) return NextResponse.json({ error: "Session not found." }, { status: 404 });

        const data = doc.data()!;

        // Only save client transcript if webhook hasn't already saved a better one
        const existingTranscript = data.transcript ?? [];
        const newTranscript = transcript ?? [];
        const shouldUpdate = newTranscript.length > existingTranscript.length;

        await docRef.update({
            status: "completed",
            endedAt: new Date().toISOString(),
            durationSeconds: Number(durationSeconds ?? 0),
            ...(shouldUpdate ? { transcript: newTranscript } : {}),
        });

        console.log(`[interview/end] session=${sessionId} transcript_lines=${newTranscript.length}`);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[interview/end]", err);
        return NextResponse.json({ error: err.message ?? "Failed to end session." }, { status: 500 });
    }
}