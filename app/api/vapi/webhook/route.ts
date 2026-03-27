// app/api/vapi/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";

/**
 * Vapi Webhook Handler
 *
 * serverMessages configured in Vapi dashboard:
 *   ["status-update", "end-of-call-report"]
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │ status-update                                           │
 * │   message.status = "in-progress"  → call is live       │
 * │   message.status = "ended"        → call ended         │
 * │                                                         │
 * │ end-of-call-report                                      │
 * │   message.artifact.messages  → structured transcript   │
 * │   message.artifact.transcript → plain text fallback    │
 * │   message.call.id             → vapiCallId             │
 * │   message.analysis.summary    → Vapi summary (bonus)   │
 * └─────────────────────────────────────────────────────────┘
 *
 * sessionId flows like this:
 *   frontend calls vapi.start(assistantId, { variableValues: { sessionId, ... } })
 *   → Vapi passes these through assistantOverrides
 *   → webhook reads: message.call.assistantOverrides.variableValues.sessionId
 */

function extractSessionId(message: any): string | null {
    return (
        message?.call?.assistantOverrides?.variableValues?.sessionId ??
        message?.call?.metadata?.sessionId ??
        message?.assistant?.variableValues?.sessionId ??
        null
    );
}

function extractUserId(message: any): string | null {
    return (
        message?.call?.assistantOverrides?.variableValues?.userId ??
        message?.call?.metadata?.userId ??
        message?.assistant?.variableValues?.userId ??
        null
    );
}

function parseTranscript(artifact: any): { role: string; content: string }[] {
    // 1. Prefer structured messages array — most reliable
    const msgs: any[] = artifact?.messages ?? [];
    if (msgs.length > 0) {
        return msgs
            .filter((m: any) => ["user", "assistant", "bot"].includes(m.role))
            .map((m: any) => ({
                role: m.role === "bot" ? "assistant" : m.role,
                content: String(m.message ?? m.content ?? m.text ?? "").trim(),
            }))
            .filter(m => m.content.length > 0);
    }

    // 2. Fallback: parse plain text transcript
    const text: string = artifact?.transcript ?? "";
    if (!text) return [];

    return text
        .split("\n")
        .filter(l => l.trim())
        .map(line => {
            const ai = line.match(/^(?:AI|Aria|Assistant|Bot):\s*(.+)/i);
            const user = line.match(/^(?:User|Candidate|Human):\s*(.+)/i);
            if (ai) return { role: "assistant", content: ai[1].trim() };
            if (user) return { role: "user", content: user[1].trim() };
            return null;
        })
        .filter(Boolean) as { role: string; content: string }[];
}

async function getSessionDoc(sessionId: string, userId?: string | null) {
    if (userId) {
        const doc = await adminDb
            .collection("users").doc(userId)
            .collection("interview_sessions").doc(sessionId)
            .get();
        return doc.exists ? doc : null;
    }
    // Fallback to collection group searching (less efficient)
    const snap = await adminDb
        .collectionGroup("interview_sessions")
        .where("id", "==", sessionId)
        .limit(1)
        .get();
    return snap.empty ? null : snap.docs[0];
}

/* ── route ── */
export async function POST(req: NextRequest) {
    let body: any;
    try { body = await req.json(); }
    catch { return NextResponse.json({ received: true }); }

    // Log full payload in development
    if (process.env.NODE_ENV !== "production") {
        console.log("[vapi/webhook] payload:", JSON.stringify(body, null, 2));
    }

    const message = body?.message;
    if (!message?.type) return NextResponse.json({ received: true });

    const msgType = message.type as string;
    const vapiCallId = message?.call?.id ?? null;

    try {

        /* ═══════════════════════════════════════
           STATUS-UPDATE
           Fired when call status changes.
        ═══════════════════════════════════════ */
        if (msgType === "status-update") {
            const status = message.status as string;
            const sessionId = extractSessionId(message);
            const userId = extractUserId(message);

            console.log(`[vapi/webhook] status-update → ${status} | session: ${sessionId} | user: ${userId}`);

            if (!sessionId) return NextResponse.json({ received: true });

            const doc = await getSessionDoc(sessionId, userId);
            if (!doc) {
                console.warn(`[vapi/webhook] session not found: ${sessionId}`);
                return NextResponse.json({ received: true });
            }

            if (status === "in-progress") {
                const data = doc.data();
                if (data) {
                    await doc.ref.update({
                        vapiCallId: vapiCallId ?? data.vapiCallId,
                        status: "active",
                        startedAt: new Date().toISOString(),
                    });
                    console.log(`[vapi/webhook] ✓ session ${sessionId} → active`);
                }
            }

            if (status === "ended") {
                const data = doc.data();
                // Don't overwrite if end-of-call-report already completed it
                if (data && data.status !== "completed") {
                    await doc.ref.update({
                        status: "completed",
                        endedAt: new Date().toISOString(),
                    });
                    console.log(`[vapi/webhook] ✓ session ${sessionId} → completed (via status-update)`);
                }
            }

            return NextResponse.json({ received: true });
        }

        /* ═══════════════════════════════════════
           END-OF-CALL-REPORT
           Contains the full transcript — use this
           as the authoritative transcript source.
        ═══════════════════════════════════════ */
        if (msgType === "end-of-call-report") {
            const artifact = message.artifact ?? message.call?.artifact ?? {};
            const sessionId = extractSessionId(message);
            const userId = extractUserId(message);
            const transcript = parseTranscript(artifact);
            const vapiSummary = message.analysis?.summary ?? "";

            console.log(`[vapi/webhook] end-of-call-report | session: ${sessionId} | user: ${userId} | ${transcript.length} lines`);

            if (!sessionId) {
                console.warn("[vapi/webhook] end-of-call-report missing sessionId — check variableValues in vapi.start()");
                return NextResponse.json({ received: true });
            }

            const doc = await getSessionDoc(sessionId, userId);
            if (!doc) {
                console.warn(`[vapi/webhook] session not found: ${sessionId}`);
                return NextResponse.json({ received: true });
            }

            // Save transcript + mark completed
            const data = doc.data();
            if (!data) return NextResponse.json({ received: true });

            const finalUserId = userId || data.userId;
            await doc.ref.update({
                status: "completed",
                endedAt: new Date().toISOString(),
                vapiCallId: vapiCallId ?? data.vapiCallId,
                transcript,
                vapiSummary,
                rawTranscriptText: artifact.transcript ?? "",
            });

            console.log(`[vapi/webhook] ✓ session ${sessionId} saved — ${transcript.length} messages`);

            // Trigger AI feedback generation (async, non-blocking)
            const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            fetch(`${origin}/api/interview/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-internal": "1" },
                body: JSON.stringify({ sessionId, userId: finalUserId }),
            }).catch(e => console.error("[vapi/webhook] feedback trigger failed:", e));

            return NextResponse.json({ received: true });
        }

        // Unknown event — always return 200 so Vapi doesn't retry
        console.log(`[vapi/webhook] unhandled type: ${msgType}`);
        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error("[vapi/webhook] error:", err);
        // Return 200 even on error — prevents Vapi infinite retry
        return NextResponse.json({ received: true, error: err.message });
    }
}