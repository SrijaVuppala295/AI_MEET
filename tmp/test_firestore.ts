import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

async function testConnection() {
    console.log("Testing Firestore Connection...");
    console.log("Project ID:", projectId);
    console.log("Client Email:", clientEmail);

    try {
        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });

        const db = getFirestore();
        console.log("Initialized Firestore. Attempting to write a test document...");

        const testDocRef = db.collection("test_connections").doc("test_at_" + Date.now());
        await testDocRef.set({
            timestamp: new Date().toISOString(),
            message: "Direct test from diagnostic script",
        });

        console.log("SUCCESS: Successfully wrote test document.");

        const doc = await testDocRef.get();
        if (doc.exists) {
            console.log("SUCCESS: Successfully read back test document:", doc.data());
        } else {
            console.log("FAILURE: Could not read back test document.");
        }

        await testDocRef.delete();
        console.log("Cleaned up test document.");

    } catch (error) {
        console.error("ERROR during Firestore test:", error);
    }
}

testConnection();
