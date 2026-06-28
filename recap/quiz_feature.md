# 🧩 Quiz & Assessment Feature: Technical Deep Dive

The **Quiz Feature** is a gamified learning system that generates dynamic assessments based on a user's chosen topic and difficulty level, tracking their performance over time through visual analytics.

---

## 🚀 Feature Workflow: The Assessment Loop

### Phase 1: Generation & Personalization
1.  **Config**: The user selects a Topic (e.g., JavaScript), Difficulty (Beginner to Advanced), and Question Count.
2.  **AI Lab**: The **Generate API** constructs a specialized prompt and calls **Groq (Llama 3)** or **OpenRouter (DeepSeek)** to create a brand-new, non-repetitive set of multiple-choice questions.
3.  **Strict Schema**: The AI is forced to return a JSON array with questions, options, the `correctIndex`, and a clear explanation.

### Phase 2: Engagement (The Overlay)
1.  **Active Quiz**: An "Overlay" component takes over the screen. It tracks the user's progress through a percentage-based bar.
2.  **Instant Gratification**: For every question, as soon as the user selects an answer, the UI reveals the correct one and shows the AI's explanation immediately, making it a powerful learning experience.
3.  **Timer**: The system tracks how long it takes to complete the quiz to calculate "Avg Time per Question."

### Phase 3: Analytics & Persistence
1.  **Save System**: Results are sent to the **Save API**, which stores the final score and metadata in the user's Firestore subcollection.
2.  **Stats Engine**: The **Stats API** calculates aggregate metrics: Average Score, Best Score, and current Streaks.
3.  **Visual Trend**: Recharts is used on the dashboard to plot a "Performance Trend" line graph, visualizing how the user's knowledge is growing.

---

## 📂 File-by-File Breakdown

### 1. Frontend & UI
*   **[app/(root)/quiz/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/quiz/page.tsx)** — **The Quiz Hub**: A monolithic, highly-optimized file containing the Dashboard, the `QuizConfigDialog`, and the `ActiveQuizOverlay`.

### 2. Backend Logic (APIs)
*   **[api/quiz/generate/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/api/quiz/generate/route.ts)** — **The Question Creator**: The core AI logic that switches between Groq and OpenRouter to generate questions.
*   **[api/quiz/save/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/api/quiz/save/route.ts)** — **Persistence**: Handles saving individual session results to Firestore.
*   **[api/quiz/stats/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/api/quiz/stats/route.ts)** — **Data Aggregator**: Performs server-side calculations to provide the dashboard stats.

---
!!!! SESSSION FILE U HAVE MISSED !!!!!

## 🛠️ Tech Stack Rationale

| Tech | Role | Why we used it? |
| :--- | :--- | :--- |
| **DeepSeek (OpenRouter)** | Fallback Brain | Used for technical accuracy when generating coding-specific questions. |
| **Recharts** | Visual Analytics | The standard for React charting. Efficiently plots scores over time to motivate the user. |
| **Framer Motion / Transitions** | User Experience | Smooth CSS transitions for the progress bar and "Revealed" answer states to make the quiz feel like a premium game. |
| **Firestore (Admin SDK)** | Secure Storage | Allows for subcollection nesting (`users/{uid}/quiz_sessions`), ensuring lightning-fast history lookups. |

---

## 🛣️ Learning Roadmap: Follow the Data
To master the Quiz logic, follow this sequence:
1.  **The Generation Prompt**: Look at `buildPrompt` in `quiz/generate/route.ts`. It's a masterclass in forcing an LLM to return valid JSON.
2.  **The State Management**: Study `ActiveQuizOverlay` in `quiz/page.tsx`. Notice how it tracks the `current` question index and the `revealed` state.
3.  **The Scoring Engine**: See how `handleFinish` calculates the final percentage and sends it to the server.
4.  **The Visualizer**: Look at the `LineChart` component at the bottom of the page to see how raw session dates are converted into a visual trend.
