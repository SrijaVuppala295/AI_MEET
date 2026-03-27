"use server";

import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

export async function getUserHistory() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, message: "User not authenticated" };

        const userId = user.id;

        // 1. Fetch Interviews from users/{uid}/interview_sessions
        const interviewSnap = await adminDb
            .collection("users")
            .doc(userId)
            .collection("interview_sessions")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();
        const interviews = interviewSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 2. Fetch Quizzes from users/{uid}/quiz_sessions
        const quizSnap = await adminDb
            .collection("users")
            .doc(userId)
            .collection("quiz_sessions")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();
        const quizzes = quizSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 3. Fetch Prep Sessions from users/{uid}/prep_sessions
        const prepSnap = await adminDb
            .collection("users")
            .doc(userId)
            .collection("prep_sessions")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();
        const prepSessions = prepSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: {
                user,
                interviews,
                quizzes,
                prepSessions
            }
        };
    } catch (error: any) {
        console.error("Error fetching user history:", error);
        return { success: false, message: "Failed to fetch user history" };
    }
}
