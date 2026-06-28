# 🎙️ AI Mock Interview Workflow: Technical Deep Dive

The **Mock Interview** feature is the core of AI MEET. It provides a real-time, voice-activated interview experience that simulates a professional hiring round.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Voice Processing** | Vapi AI | Handles Speech-to-Text (STT) and Text-to-Speech (TTS) in real-time. |
| **Brain (LLM)** | Gemini (Google) | Generates interview questions and evaluates responses. |
| **Frontend SDK** | @vapi-ai/web | Manages the microphone and audio streaming. |
| **Persistence** | Firestore | Saves transcripts, session metadata, and final feedback. |
| **Real-time UI** | Framer Motion | Provides visual feedback (voice waves) during the call. |

---

## 🚀 End-to-End Workflow

### 1. Configuration (The Lobby)
- The user selects:
    - **Track**: Technical, Behavioral, Mixed, etc.
    - **Role**: (e.g., Software Engineer).
    - **Seniority**: (Junior, Mid, Senior).
    - **Resume**: (Optional) Uploaded for personalising questions.
- **Backend Trigger**: `fetch("/api/interview/start")` creates a new session in Firestore with status `active`.

### 2. Establishing the Call
- The page `/interview/[sessionId]` initializes the **Vapi Web SDK**.
- **Handshake**: The client sends a request to Vapi with a custom **Assistant Configuration**. 
- **Prompt Engineering**: The assistant's prompt is dynamically built using the user's role and resume data. *Example: "You are an interviewer for [Role]. Based on their resume, focus on [Skill]."*

### 3. The Live Interview
- **STT**: When the user speaks, Vapi converts audio to text instantly.
- **Logic**: Vapi sends the transcript to the AI model (Gemini), which generates the next logical follow-up question.
- **TTS**: The AI's text response is converted back to voice and played to the user.
- **Low Latency**: The system is optimized for "interruption-handling," meaning if the user speaks over the AI, it stops and listens.

### 4. Session Conclusion
- When the timer expires or the user clicks "End Interview," the Vapi session is terminated.
- **Webhook Processing**: Vapi sends a final JSON payload to `/api/vapi/webhook` containing the full transcript.

### 5. AI Feedback Generation
- The platform triggers an "Analysis Engine" that sends the full transcript to Gemini.
- **Scoring**: Gemini evaluates the user across 3 pillars:
    - **Technical Knowledge** (Accuracy of answers).
    - **Communication Skills** (Clarity and tone).
    - **Problem Solving** (Approach to difficult questions).
- **Result**: A detailed report with an overall score and "Points for Improvement" is saved to Firestore.

---

## 📡 API Interaction & Responses

### Request: `POST /api/interview/start`
**Body**:
```json
{
  "role": "Frontend Developer",
  "level": "Mid",
  "techStack": ["React", "Next.js"],
  "duration": 15
}
```

### Response: `Success`
```json
{
  "sessionId": "abc-123-session-id",
  "message": "Session initialized"
}
```

---

## 💡 Why this approach?
- **Vapi Integration**: By using Vapi, we offload the complex audio processing and focus on the interview logic.
- **Resume Parsing**: Injecting resume text directly into the AI prompt makes the interview feel highly professional and specific to the user's career.
- **Scalability**: Webhooks ensure that feedback is generated in the background without blocking the UI.
