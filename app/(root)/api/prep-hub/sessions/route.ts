import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

/** GET /api/prep-hub/sessions  — returns all past sessions for the signed-in user */
export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ sessions: [] });
        }

        const snapshot = await db
            .collection("users")
            .doc(user.id)
            .collection("prep_sessions")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const sessions = snapshot.docs.map((doc: any) => doc.data());
        return NextResponse.json({ sessions });
    } catch (err: any) {
        console.error("prep-hub sessions error:", err);
        return NextResponse.json({ sessions: [] });
    }
}