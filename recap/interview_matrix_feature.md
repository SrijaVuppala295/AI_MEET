# 🕸️ Interview Matrix Feature: Technical Deep Dive

The **Interview Matrix** is the platform's central question repository. It functions as a "LeetCode-style" hub, but tailored specifically for technical interviews, providing categorized expert hints and direct industry standard challenges.

---

## 🚀 Feature Workflow: The Matrix Experience

### Phase 1: Dual-Mode Navigation
1.  **Company Mode**: Users can filter challenges by elite companies (Google, Amazon, Meta, etc.). These questions are linked directly to their **LeetCode** counterparts for live coding practice.
2.  **Category Mode**: Focuses on core engineering domains (Frontend, Backend, System Design, DevOps). Instead of external links, these provide "Expert Hints" built directly into the UI.

### Phase 2: High-Performance Filtering
1.  **Search & Tags**: The main grid uses a multi-layered filtering system. It searches across titles, categories, and specific technical tags (e.g., "Arrays", "DP", "React").
2.  **Difficulty Layer**: Questions are strictly graded as **Easy**, **Medium**, or **Hard**, allowing users to build their skills progressively.

### Phase 3: Expert Hints (The Category Layer)
1.  In "Category Mode," every question has a hidden "Expert Advice" block. This isn't just an answer; it's a strategic hint that teaches the user *how* to approach that specific type of problem in a real interview.

---

## 📂 File-by-File Breakdown

### 1. Frontend & UI
*   **[app/(root)/questions/page.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/(root)/questions/page.tsx)** — **The Matrix Hub**: A massive component that handles the complex state of switching between company logos and technical category icons.

### 2. The Data Layer (The Knowledge Base)
*   **[data/company-questions.json](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/data/company-questions.json)** — Contains the database of FAANG-level coding challenges and their LeetCode URLs.
*   **[data/category-questions.json](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/data/category-questions.json)** — Contains conceptual questions and specialized hints for various engineering tracks.

---

## 🛠️ Tech Stack Rationale

| Tech | Role | Why we used it? |
| :--- | :--- | :--- |
| **JSON Storage** | Data Mobility | Storing the questions in JSON files allows for near-instant search and filtering without needing the overhead of a database call for every character typed in the search bar. |
| **Lucide React** | Visual Identity | Icons are mapped to specific tech categories (e.g., `Palette` for Frontend, `Rocket` for DevOps) to make navigation intuitive. |
| **Recharts / Charts** | Performance (In Profile) | While not in the Matrix page, the results of using the Matrix are plotted in your Profile to show your "Mastery Level." |

---

## 🛣️ Learning Roadmap: Follow the Logic
1.  **Understand the Data**: Open the `.json` files in the `/data` folder first. See how a "Question" is structured.
2.  **Filter Logic**: Look at the `useMemo` block in `questions/page.tsx`. This is a masterclass in handling complex filtering in React without causing UI lag.
3.  **UI Interaction**: Study the `CategoryRow` component. See how it manages its own `open` state for showing expert hints.
