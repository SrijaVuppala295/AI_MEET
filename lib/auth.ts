import { auth, adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { User } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
    await connection();
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userDoc = await adminDb
            .collection("users")
            .doc(decodedClaims.uid)
            .get();

        if (!userDoc.exists) return null;

        return {
            ...userDoc.data(),
            id: userDoc.id,
        } as User;
    } catch {
        return null;
    }
}