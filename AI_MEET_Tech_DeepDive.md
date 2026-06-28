# AI MEET — Ultimate Technical Deep Dive & Interview Guide

## 1. Project Overview

**AI MEET** is a sophisticated, full-stack AI-powered mock interview platform designed to bridge the gap between candidate preparation and real-world performance. Developed for engineering students and job seekers, it provides an immersive, high-stakes environment to practice interviews under realistic conditions.

The platform uses high-end Voice AI, lightning-fast LLM inference, and structured data analysis to simulate human interviewers, providing real-time voice feedback, resume-based coaching, and technical quizzes to prepare users for top-tier tech roles.

## 2. 📊 Master Technology & Library Table

| Category | Technology / Library | Role in AI MEET |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 15.5** | App Router, Server Actions, & Hybrid Rendering (SSR/Static). |
| **UI Library** | **React 19** | Modern component-based UI rendering. |
| **Language** | **TypeScript 5** | Static typing for enterprise-grade code stability. |
| **Styling** | **Tailwind CSS 4** | Modern utility-first CSS for premium glassmorphic UI. |
| **Voice AI (API)** | **Vapi AI** | Orchestrates STT, LLM, and TTS for no-latency voice calls. |
| **Voice Brain** | **Deepgram Nova-2** | Real-time speech-to-text transcript processing. |
| **Voice Output** | **ElevenLabs** | Ultra-realistic, human-like AI voice generation. |
| **LLM Inference** | **Groq** | Blazing-fast inference engine (LPUs) for Llama 3.3. |
| **LLM Model** | **Llama 3.3 70B** | The "Brain" behind the chatbot and Prep Hub analysis. |
| **AI (Feedback)** | **Google Gemini** | Used for structured feedback and reasoning analysis. |
| **Database** | **Firebase Firestore** | NoSQL cloud database for interviews and quiz history. |
| **Authentication** | **Firebase Auth** | Secure email/password login and session management. |
| **Form Handling** | **React Hook Form** | Efficient, high-performance form state management. |
| **Validation** | **Zod** | Schema-based validation for all user inputs and APIs. |
| **Icons** | **Lucide React** | Large library of consistent, customizable SVG icons. |
| **UI Components** | **Radix UI** | Accessible, headless primitives for high-quality components. |
| **Design System** | **shadcn/ui** | Reusable, styled components built on Radix + Tailwind. |
| **Charts** | **Recharts** | Functional and responsive SVG charting for user analytics. |
| **PDF Parsing** | **pdf-parse-fork** | Extracts text from uploaded PDF resumes. |
| **Word Parsing** | **Mammoth** | Extracts text from uploaded .docx resume files. |
| **Notifications** | **Sonner** | Modern toast notifications for user feedback and alerts. |
| **Date/Time** | **Dayjs** | Lightweight utility for date formatting and manipulation. |
| **Utilities** | **Clsx / TW-Merge** | Handles conditional CSS classes and conflict resolution. |

---

This document is a comprehensive technical encyclopedia for the **AI MEET** platform. It covers every layer of the architecture, explains "The Why" behind each tool, clarifies core web concepts (Frontend/Backend/Languages), and provides a rigorous bank of interview questions for each technology.

---

## 1. Core Concepts: The Foundation

### 1.1 What is Frontend vs. Backend?
In the context of AI MEET:
- **Frontend (The User's Screen)**: Everything you see and interact with. The buttons, the voice-agent animations, the charts, and the forms. In this project, **Next.js (React)** handles the frontend.
- **Backend (The Brain & Memory)**: The logic that users don't see. This includes saving interview data to the database, verifying passwords, and talking to the AI models (Groq/Vapi). In this project, **Next.js (Server Actions/API Routes)** and **Firebase** handle the backend.

### 1.2 "Inbuilt" Technologies (React & TypeScript)
- **React.js**: Is it inbuilt? **Yes.** Next.js is a "Framework" built *on top* of React. You cannot use Next.js without React. React provides the "Components" (like buttons and cards).
- **TypeScript**: Is it inbuilt? **Yes.** While you can use Next.js with plain JavaScript, this project uses TypeScript for "Type Safety," ensuring that a "score" is always a number and not a string, preventing bugs before the code even runs.

---

## 2. The Detailed Tech Stack

### 2.1 Next.js 15.5 (Full-Stack Framework)
Next.js is the "Glue" that holds everything together. It handles both the website (Frontend) and the server logic (Backend).
- **Why?**: It offers SEO optimization, incredibly fast page loads, and "Server Components" which keep the website light for the user.

### 2.2 React 19 (Component Library)
React is used to build the User Interface (UI) by breaking the page into small, reusable pieces called "Components."
- **Why?**: It efficiently updates only the parts of the page that change (e.g., as the AI speaks, only the transcript updates).

### 2.3 TypeScript 5 (Static Typing)
TypeScript is a "Superset" of JavaScript. It adds rules to the coding process.
- **Why?**: Large projects like AI MEET have complex data (transcripts, scores, user profiles). TypeScript ensures that every function gets exactly what it expects, reducing "undefined" errors by 90%.

### 2.4 Firebase (Database & Auth)
- **Auth**: Manages user login/sign-up securely.
- **Firestore**: A NoSQL cloud database that stores interview results.
- **Why?**: It is "Serverless," meaning we don't have to manage a physical server. It scales automatically from 1 user to 1 million.

### 2.5 Vapi AI (Voice Orchestration)
Vapi acts as a "manager" for the voice interview. It connects the microphone (Deepgram) to the AI Brain (Llama) and then to the speakers (ElevenLabs).
- **Why?**: Doing this manually takes seconds. Vapi does it in milliseconds, making the conversation feel human.

### 2.6 Groq & Llama 3.3 (The LLM Engine)
Groq is the world's fastest inference engine. Llama 3.3 is the smart "brain" (LLM) inside it.
- **Why?**: For a chatbot or an interviewer, speed is everything. Groq answers almost instantly.

### 2.7 Tailwind CSS 4 (Styling)
A utility-first CSS framework used for building the premium design.
- **Why?**: It allows us to style the app directly in the code without writing separate, messy CSS files.

### 2.8 Zod & React Hook Form (Validation)
- **React Hook Form**: Manages the complicated data in forms (like the Resume upload).
- **Zod**: Validates that the input is correct (e.g., checking if the email format is valid).

---

## 3. Tech-Specific Interview Questions & Answers

### 🟢 Next.js (5 Questions)
1.  **Q: What is the benefit of the App Router over the Pages Router?** 
    **A:** It supports "React Server Components," allowing for better performance, simpler data fetching, and nested layouts.
2.  **Q: What are Server Actions?**
    **A:** Functions that run on the server but can be called like normal functions from your frontend buttons, eliminating the need for `fetch()` calls.
3.  **Q: Explain SSR (Server-Side Rendering)?**
    **A:** The server generates the HTML for a page on every request, ensuring the user always sees the most up-to-date data (perfect for profiles).
4.  **Q: What is Hydration?**
    **A:** The process where React "attaches" its event listeners (like clicks) to the static HTML sent by the server.
5.  **Q: What is the `next/image` component used for?**
    **A:** It automatically optimizes images (resizing, lazy-loading) to make the website faster.

### 🔵 React 19 (5 Questions)
1.  **Q: What are Hooks?**
    **A:** Special functions (like `useState`, `useEffect`) that let you "hook into" React features from functional components.
2.  **Q: Explain the Virtual DOM?**
    **A:** A lightweight copy of the real DOM. React updates the Virtual DOM first, calculates the difference (diffing), and then updates the real DOM efficiently.
3.  **Q: What is the `useEffect` hook used for?**
    **A:** For "side effects" like fetching data from an API or subscribing to a database listener.
4.  **Q: Difference between Props and State?**
    **A:** Props are inputs passed from a parent to a child (immutable). State is data managed *inside* a component (mutable).
5.  **Q: What is the Context API?**
    **A:** A way to share data (like the User Profile) across the entire app without passing props manually through every level.

### 📘 TypeScript (5 Questions)
1.  **Q: Difference between an Interface and a Type?**
    **A:** Interfaces are mostly for object shapes and can be merged. Types are more flexible (can be used for unions, primitives, and aliases).
2.  **Q: What does `any` vs `unknown` mean?**
    **A:** `any` turns off type checking entirely. `unknown` is safer; you must check the type before using it.
3.  **Q: What is a Generic?**
    **A:** A way to create reusable components that work with a variety of types (like a List that can hold numbers or strings).
4.  **Q: What is Type Inference?**
    **A:** TypeScript "guessing" the type of a variable based on its initial value (e.g., `let x = 5` means `x` is a number).
5.  **Q: How do you handle optional properties?**
    **A:** By using the question mark (`?`) in the definition (e.g., `username?: string`).

### 🟡 Firebase (5 Questions)
1.  **Q: Difference between Firestore and Realtime Database?**
    **A:** Firestore is better for large projects, offering complex queries and a Document-Collection structure. Realtime DB is a giant JSON tree.
2.  **Q: What are Firebase Security Rules?**
    **A:** Server-side logic that controls who can read/write data (e.g., "Only the owner of this profile can edit it").
3.  **Q: How does Firestore scale?**
    **A:** It's "automatically elastic," meaning it handles increased traffic by distributing data across multiple servers without any manual work.
4.  **Q: What is a Snapshot Listener?**
    **A:** A function that keeps a live connection to the database and alerts your app the moment data changes.
5.  **Q: Why use Firebase Auth?**
    **A:** It handles encryption, hashing, and security protocols (like OAuth) so you don't have to build a risky custom login system.

### 🟣 AI & LLMs (Vapi/Groq) (5 Questions)
1.  **Q: What is a System Prompt?**
    **A:** The "Identity" instruction given to an AI (e.g., "You are a professional hiring manager at Google").
2.  **Q: What is Tokenization?**
    **A:** The process of breaking down text into smaller "tokens" (chunks of characters) that the AI understands.
3.  **Q: What is Latency, and why is it bad for Voice AI?**
    **A:** Latency is the delay between speaking and hearing a response. High latency makes a conversation feel robotic.
4.  **Q: Explain the difference between STT and TTS?**
    **A:** STT (Speech-to-Text) converts voice to text. TTS (Text-to-Speech) converts AI text back into a human-like voice.
5.  **Q: What is a "Hallucination" in LLMs?**
    **A:** When an AI confidently provides incorrect or nonsensical information.

---
