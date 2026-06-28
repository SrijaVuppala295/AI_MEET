# 📚 Prep Hub Feature: Technical Deep Dive

The **Prep Hub** is a career acceleration tool that analyzes resumes against job descriptions to generate personalized interview questions, study topics, and actionable resume improvement tips.

---

## 🚀 Feature Workflow: The Analysis Pipeline

### Phase 1: Input & Parsing
1.  **File Upload**: The user uploads their resume (PDF or DOCX) and optionally pastes a Job Description (JD).
2.  **Text Extraction**: On the server, the `analyze` route uses specialized libraries (`pdf-parse-fork` for PDFs, `mammoth` for DOCX) to extract raw text content from the files.

### Phase 2: AI Intelligence
1.  **Context Building**: The system combines your resume text and the JD (if provided) into a comprehensive prompt for the AI.
2.  **Llama 3 Interaction**: It calls the **Groq API** (using the `llama-3.3-70b-versatile` model) to perform a deep semantic analysis.
3.  **Structured Output**: The AI returns a precise JSON object containing:
    *   **Q&A**: Tailored questions based on your actual experience.
    *   **Study Topics**: Specific areas you need to brush up on.
    *   **Resume Tips**: Strengths, improvements, and missing sections identified by the AI.

### Phase 3: Persistence & Review
1.  **Firestore Save**: If you are logged in, the analysis result is saved to your `prep_sessions` collection.
2.  **Interactive UI**: The results are rendered in an interactive dashboard with category filtering (Technical, Behavioral, etc.) and expandable Q&A cards.

---

## 📂 File-by-File Breakdown

### 1. Frontend & UI
*   **[app/(root)/prep-hub/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/prep-hub/page.tsx)** — **The Command Center**: Manages file drag-and-drop, tab switching (Q&A vs. Topics vs. Tips), and session history navigation.

### 2. Backend Logic (APIs)
*   **[api/prep-hub/analyze/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/api/prep-hub/analyze/route.ts)** — **The Analysis Engine**: The core backend file responsible for text extraction from PDFs/DOCX and managing the Groq AI lifecycle.
*   **[api/prep-hub/sessions/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/api/prep-hub/sessions/route.ts)** — **The Data Fetcher**: Retrieves your historical prep sessions from Firestore.

### 3. Core Utilities
*   **[lib/key-rotator.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/key-rotator.ts)** — **Reliability Layer**: Ensures the analysis always succeeds by automatically switching between different API keys if one hits a rate limit.

---

## 🛠️ Tech Stack Rationale

| Tech | Role | Why we used it? |
| :--- | :--- | :--- |
| **pdf-parse-fork** | PDF Parsing | Robust Node.js library for extracting text from even complex PDF layouts. |
| **Mammoth** | Word Parsing | The "Standard" for converting `.docx` files to plain text without unnecessary XML noise. |
| **Groq (Llama 3.3)** | Brain | Used for its extreme reasoning capability in understanding professional resumes and matching them to job requirements. |
| **Lucide React** | Iconography | Modern, clean icons used for categorization (Technical, Behavioral, HR). |

---

## 🛣️ Learning Roadmap: Follow the Data
If you want to learn how this works line-by-line, follow this order:
1.  **Start at the UI**: Look at how `handleGenerate` in `prep-hub/page.tsx` packages the files.
2.  **Follow to the API**: See how `analyze/route.ts` identifies file types and extracts text.
3.  **Study the Prompt**: Look at the `buildPrompt` function in the API route to see how we "teach" the AI to behave as a career coach.
4.  **Explore the Result**: See how the frontend maps the JSON response into beautiful, interactive tabs.
