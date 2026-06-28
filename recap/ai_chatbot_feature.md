# 🤖 AI Chatbot Feature: Technical Deep Dive

The **AI Chatbot** is a resident assistant integrated into every page of the platform. Unlike generic bots, it has a "Universal Knowledge" of the AI-InterviewAgent's entire ecosystem, from the Quiz logic to the Vapi voice engine.

---

## 🚀 Feature Workflow: The Conversational Brain

### Phase 1: The "Instruction" Layer
1.  **System Prompt**: Every interaction starts with a massive, 200+ line "System Prompt." This tells the AI precisely who it is (the AI MEET assistant) and what features it must know about (Interview, Prep Hub, etc.).
2.  **Safety Guardrails**: The bot is programmed to "stay on track." If asked about unrelated topics (like cooking or politics), it redirects the user back to interview preparation.

### Phase 2: Contextual Messaging
1.  **History Awareness**: The API sends the entire recent conversation history with every new message. This allows the bot to remember that you "just asked about React" and provide follow-up advice correctly.
2.  **Llama 3 Interaction**: The backend uses the **Groq API** with the `llama-3.3-70b-versatile` model for lightning-fast, highly intelligent responses.

### Phase 3: Seamless Integration
1.  **Floating UI**: The chatbot is an "overlay" that persists as you navigate.
2.  **Auto-Scroll**: The UI automatically scrolls to the bottom for every new AI word, ensuring a smooth, modern messaging experience.

---

## 📂 File-by-File Breakdown

### 1. Frontend & UI
*   **[components/AIChatbot.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/AIChatbot.tsx)** — **The Interface**: Handles the opening/closing of the chat bubble, typing states, and message history rendering.

### 2. Backend Logic (APIs)
*   **[app/api/chatbot/route.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/api/chatbot/route.ts)** — **The Intelligence**: Contains the `SYSTEM_PROMPT` which is essentially the "manual" for the bot. It orchestrates the connection to Groq.

### 3. Core Utilities
*   **[lib/key-rotator.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/key-rotator.ts)** — Again, this file ensures the chatbot is always active by rotating through valid API keys.

---

## 🛠️ Tech Stack Rationale

| Tech | Role | Why we used it? |
| :--- | :--- | :--- |
| **Groq (Llama 3.3)** | Conversational AI | Chosen for its "Versatile" model which is tuned for both technical knowledge and helpful conversation. |
| **Framer Motion** | UI Polishing | (Likely used) for the slide-in and pop-up animations of the chat window. |
| **JSON Serialization** | Context Handling | Conversation history is passed as a simple JSON array, making it lightweight for quick round-trips to the AI. |

---

## 🛣️ Learning Roadmap: Follow the Conversation
1.  **Master the Prompt**: Open `api/chatbot/route.ts` and read the `SYSTEM_PROMPT`. This is the most important part of AI Engineering—instructing the model how to act.
2.  **Follow the API Call**: See how `conversationHistory` is mapped from the user's chat into the format Groq expects.
3.  **UI State**: Study `AIChatbot.tsx` to see how we handle `isLoading` states (the "typing..." indicator) to make the bot feel alive.
