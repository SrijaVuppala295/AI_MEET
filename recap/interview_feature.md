# 🛡️ AI Mock Interview Feature: The Perfect & Proper Deep Dive

This is the definitive mapping of the **AI Mock Interview** feature. It covers every layer of the system—from the core environment variables to the high-performance background webhooks.

---

## 1. ⚙️ Configuration & Environment (The Foundation)
*   **[ .env ]**: **Critical Hidden File**. Stores the Vapi Public/Private keys, Groq API keys, and Firebase service accounts. Without this, the AI cannot speak and the database cannot save.
*   **[firebase/client.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/firebase/client.ts)**: Configures the Firebase listener for the browser.
*   **[firebase/admin.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/firebase/admin.ts)**: The privileged backend instance used by all Interview APIs to bypass frontend restrictions.
*   **[constants/interview.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/constants/interview.ts)**: **The Brain of Config**. Maps track names (Frontend, DSA, System Design) to their specific Vapi Assistant IDs. It also defines company-specific interview metadata.
*   **[lib/key-rotator.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/key-rotator.ts)**: A vital utility that cycles through different AI API keys to ensure the Feedback Engine never hits a "Rate Limit" during peak usage.

---

## 2. 🛣️ Routing & Engagement (The Entry Points)
*   **[app/(root)/interview/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/interview/page.tsx)**: **The Interview Hub**. Handles track selection, allows users to configure role/experience, and displays the "Performance Dashboard" (Charts and History).
*   **[lib/actions/history.action.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/actions/history.action.ts)**: Contains `getUserHistory`, the logic specifically responsible for pulling past interview sessions from Firestore into the dashboard.

---

## 3. 🎙️ The Live Session Engine (The Voice AI)
*   **[app/(root)/interview/[sessionId]/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/interview/[sessionId]/page.tsx)**: **The Heart of the System**. Orchestrates the `@vapi-ai/web` SDK connection, handles "Speech Start/Stop" events, and manages the real-time transcript sidebar.
*   **[lib/vapi.sdk.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/vapi.sdk.ts)**: A centralized singleton instance of the Vapi client for consistent interaction across the frontend.
*   **[components/Agent.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/Agent.tsx)**: The visual representation of the AI "Interviewer" with avatar animations and mute/end toggles.

---

## 4. 🛰️ Backend Orchestration (The API Layer)
*   **[app/api/interview/start/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/interview/start/route.ts)**: Initializes the interview state. Validates inputs and creates the session placeholder in the database.
*   **[app/api/interview/end/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/interview/end/route.ts)**: Handles immediate call termination and saves the final local transcript.
*   **[app/api/vapi/webhook/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/vapi/webhook/route.ts)**: **AUTHORITATIVE SOURCE**. Listens to independent events from Vapi's servers to save the finalized transcript and trigger AI analysis, even if the user closes their browser tab.
*   **[app/api/interview/sessions/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/interview/sessions/route.ts)**: Backend aggregator for the history list.

---

## 5. 🧠 The Feedback Engine (Analysis & Results)
*   **[app/api/interview/feedback/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/interview/feedback/route.ts)**: **The Primary Evaluator**. Uses Groq (Llama 3) to perform deep semantic analysis of the transcript and produce the structured JSON feedback.
*   **[lib/actions/general.action.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/actions/general.action.ts)**: Houses `createFeedback`, an alternative Gemini-powered evaluation path used for different interview types.
*   **[app/(root)/interview/[sessionId]/feedback/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/interview/[sessionId]/feedback/page.tsx)**: **The Results Experience**. Displays the scores via `ScoreRing` and `RadarCharts`, and provides the question-by-question "Precision Roadmap."

---

## 6. 🛠️ Shared Models & Reusable UI
*   **[components/InterviewCard.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/InterviewCard.tsx)**: The dashboard component that summarizes past results.
*   **[components/DisplayTechIcons.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/DisplayTechIcons.tsx)**: Automatically renders tech stack logos (React, Python, etc.) inside the interview cards.
*   **[types/interview.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/types/interview.ts)**: Defines the data interfaces for `InterviewSession`, `Transcript`, and `Feedback`.
*   **[types/index.d.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/types/index.d.ts)**: Root type definitions for `Feedback`, `Interview`, and `User`.
