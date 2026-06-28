# 📊 Portfolio & Dashboard: Technical Deep Dive

The **Portfolio & Dashboard** is the connective tissue of AI MEET. It aggregates your performance across the Voice Interview, Quiz, and Prep Hub modules into a single "Career Snapshot."

---

## 🚀 Feature Workflow: The Analytics Hub

### Phase 1: Data Aggregation
1.  **Centralized Fetching**: Instead of fetching data piece-by-piece, the `history.action.ts` performs a massive parallel fetch across three Firestore collections: `interview_sessions`, `quiz_sessions`, and `prep_sessions`.
2.  **User Context**: It cross-references the current Firebase Auth UID to ensure you only see your personal data.

### Phase 2: Visual Summary
1.  **Quick-Stat Tiles**: The top of the profile uses Lucide icons to show your total activity count at a glance.
2.  **Dynamic Filtering**: A tabbed interface allows you to switch between different history lists (Interviews vs. Quizzes vs. Prep) without a page reload.

### Phase 3: Actionable History
1.  **Deep Linking**: Every interview "card" in your profile acts as a portal back to that specific session's feedback, allowing for long-term review of your growth.
2.  **Date Formatting**: Uses the `dayjs` library to convert technical Firestore timestamps into human-readable Indian Standard Time formats.

---

## 📂 File-by-File Breakdown

### 1. Frontend & UI
*   **[app/(root)/profile/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/profile/page.tsx)** — **The Server Shell**: A server component that pre-fetches your entire history before the page even loads.
*   **[components/ProfileUI.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/ProfileUI.tsx)** — **The Analytics Interface**: Handles the client-side state for the tabs and renders the beautiful history cards.

### 2. Backend Logic
*   **[lib/actions/history.action.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/actions/history.action.ts)** — **The Aggregator**: The critical server action that talks to the Firebase Admin SDK to gather your data.

---

## 🛠️ Tech Stack Rationale

| Tech | Role | Why we used it? |
| :--- | :--- | :--- |
| **Day.js** | Date Processing | Lightweight and faster than the native `Intl` API for consistent dashboard date formatting. |
| **Lucide (Briefcase/Brain)** | Symbolic UI | Uses distinct visual metaphors for different assessment types to reduce "Dashboard Fatigue." |
| **Next.js Link** | Instant Nav | Uses client-side pre-fetching to make switching between the Profile and a specific Interview session feel instantaneous. |

---

## 🛣️ Learning Roadmap: Follow the Data
1.  **The Server Action**: Open `history.action.ts` first. Understand how it queries three different collections using the same User ID.
2.  **The State Switcher**: Study how `ProfileUI.tsx` uses `activeTab` to toggle which history list is visible.
3.  **The Component Model**: Look at the `EmptyState` component at the bottom of `ProfileUI.tsx` to see how we guide users who haven't started any tasks yet.
