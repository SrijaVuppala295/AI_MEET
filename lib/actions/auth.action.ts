"use server";

import { auth, adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000,
    });

    cookieStore.set("session", sessionCookie, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        await adminDb.collection("users").doc(uid).set({
            name,
            email,
        });

        return {
            success: true,
            message: "Account created successfully. Please sign in.",
        };
    } catch (error: any) {
        console.error("Error creating user:", error);

        if (error.code === "auth/email-already-in-use") {
            return {
                success: false,
                message: "This email is already in use. Please sign in.",
            };
        }

        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord)
            return {
                success: false,
                message: "User does not exist. Create an account.",
            };

        await setSessionCookie(idToken);
        return {
            success: true,
            message: "Signed in successfully.",
        };
    } catch (error: any) {
        console.log("Error signing in:", error);

        return {
            success: false,
            message: "Failed to log into account. Please try again.",
        };
    }
}

export async function signInWithOAuth(params: { idToken: string; name: string; email: string; provider: string }) {
    const { idToken, name, email, provider } = params;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user doc exists, create if not
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            await adminDb.collection("users").doc(uid).set({
                name,
                email,
            });
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message: `Signed in with ${provider} successfully.`,
        };
    } catch (error: any) {
        console.error(`Error signing in with ${provider}:`, error);
        return {
            success: false,
            message: `Failed to sign in with ${provider}. Please try again.`,
        };
    }
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) {
        console.log("[auth] No session cookie found");
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        console.log("[auth] Session verified for uid:", decodedClaims.uid);

        const userRecord = await adminDb
            .collection("users")
            .doc(decodedClaims.uid)
            .get();

        if (!userRecord.exists) {
            console.log("[auth] User document not found in Firestore for uid:", decodedClaims.uid);
            return null;
        }

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (error) {
        // If the session cookie is invalid (e.g. wrong project id, expired), clear it.
        console.log("[auth] Invalid session cookie detected. Clearing it...", error);
        cookieStore.delete("session");
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}