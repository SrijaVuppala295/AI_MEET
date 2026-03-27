
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
    const apps = getApps();

    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Trim potential quotes and handle different newline representations
                privateKey: process.env.FIREBASE_PRIVATE_KEY
                    ?.trim()
                    .replace(/^["']|["']$/g, "") // Remove wrapping quotes
                    .replace(/\\n/g, "\n")      // Handle literal \n
                    .replace(/\n/g, "\n"),       // Ensure internal newlines are preserved
            }),
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
}

export const { auth, db: adminDb } = initFirebaseAdmin();
