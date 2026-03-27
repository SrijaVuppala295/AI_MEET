// app/api/interview/sessions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) return NextResponse.json({ sessions: [] });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        /* Single session */
        if (id) {
            const doc = await adminDb
                .collection("users").doc(user.id)
                .collection("interview_sessions").doc(id)
                .get();
            if (!doc.exists) return NextResponse.json({ session: null }, { status: 404 });
            return NextResponse.json({ session: doc.data() });
        }

        /* All sessions — most recent first */
        const snap = await adminDb
            .collection("users").doc(user.id)
            .collection("interview_sessions")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        return NextResponse.json({ sessions: snap.docs.map(d => d.data()) });
    } catch (err: any) {
        console.error("[interview/sessions]", err);
        return NextResponse.json({ sessions: [] });
    }
}