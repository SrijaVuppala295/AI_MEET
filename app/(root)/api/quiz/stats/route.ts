// app/api/quiz/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

const EMPTY = { avgScore: 0, bestScore: 0, latestScore: 0, totalQuestions: 0, totalSessions: 0, improvement: 0, streak: 0, topicsCovered: 0 };

export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json(EMPTY);

        const snap = await adminDb
            .collection("users").doc(user.id)
            .collection("quiz_sessions")
            .orderBy("createdAt", "asc")
            .get();

        if (snap.empty) return NextResponse.json(EMPTY);

        const sessions = snap.docs.map((d: any) => d.data() as {
            score: number; topic: string; total: number; createdAt: string;
        });

        const scores = sessions.map((s: any) => s.score);
        const totalSessions = sessions.length;
        const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
        const bestScore = Math.max(...scores);
        const latestScore = scores[scores.length - 1];
        const totalQuestions = sessions.reduce((a: number, s: any) => a + (s.total ?? 0), 0);
        const topicsCovered = new Set(sessions.map((s: any) => s.topic)).size;

        /* Improvement: avg of first 3 vs avg of last 3 */
        const slice = Math.min(3, scores.length);
        const firstAvg = scores.slice(0, slice).reduce((a: number, b: number) => a + b, 0) / slice;
        const lastAvg = scores.slice(-slice).reduce((a: number, b: number) => a + b, 0) / slice;
        const improvement = Math.round(lastAvg - firstAvg);

        /* Streak: consecutive sessions ≥ 70% from most recent */
        let streak = 0;
        for (const s of [...scores].reverse()) {
            if (s >= 70) streak++;
            else break;
        }

        return NextResponse.json({
            avgScore, bestScore, latestScore, totalQuestions,
            totalSessions, improvement, streak, topicsCovered,
        });
    } catch (err: any) {
        console.error("[quiz/stats]", err);
        return NextResponse.json(EMPTY);
    }
}