// app/api/quiz/sessions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json({ sessions: [], scoreHistory: [] });

        const snap = await adminDb
            .collection("users").doc(user.id)
            .collection("quiz_sessions")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const sessions = snap.docs.map((d: any) => d.data());

        /* Score history for line chart — last 10 in chronological order */
        const chronological = [...sessions].reverse().slice(-10);
        const scoreHistory = chronological.map((s: any) => ({
            date: new Date(s.createdAt as string).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            fullDate: new Date(s.createdAt as string).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            score: s.score as number,
        }));

        return NextResponse.json({ sessions, scoreHistory });
    } catch (err: any) {
        console.error("[quiz/sessions]", err);
        return NextResponse.json({ sessions: [], scoreHistory: [] });
    }
}