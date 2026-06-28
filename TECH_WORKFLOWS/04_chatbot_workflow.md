# 🤖 AI Chatbot Workflow: Technical Deep Dive

The **AI MEET Assistant** is a 24/7 technical consultant built into the platform. It provides instant answers to technical questions, platform queries, and career advice.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Model** | Llama 3.3 (70B) | High-performance, low-latency reasoning. |
| **API Provider** | Groq Cloud | Provides the fastest inference for real-time chat. |
| **Framework** | Next.js API Routes | Securely handles the communication with Groq. |
| **Optimization** | Key Rotator | Manages multiple API keys to prevent rate limiting. |

---

## 🚀 End-to-End Workflow

### 1. User Message (Frontend)
- The user types a message in the chat interface.
- The client-side component maintains a `messages` array (state) to show the conversation history.

### 2. Request Preparation
- The frontend sends the new message along with the last few messages (context) to `/api/chatbot`.
- **Why context?** Without the history, the AI wouldn't remember what the user said in the previous message (e.g., if the user asks "Can you explain that more?").

### 3. Server-Side Processing
- The API route `/api/chatbot` retrieves a valid Groq API key from the `Key Rotator`.
- **System Prompt Injection**: The server attaches a hidden "System Message" before the user's message.
    - *System Message*: "You are the AI MEET assistant. Your goal is to help with interviews. Do not answer questions about cooking or movies."

### 4. AI Inference (Groq)
- The request is sent to Groq's high-speed servers.
- **Llama 3.3** processes the system prompt, the conversation history, and the new query.
- It generates a response that is strictly aligned with the "AI MEET" persona.

### 5. Response & Rendering
- The server returns the AI's response text.
- The frontend adds this response to the message list and uses a "Typing Effect" or markdown rendering (using `react-markdown`) to display it beautifully.

---

## 📡 API Interaction & Responses

### Request: `POST /api/chatbot`
**Body**:
```json
{
  "message": "How do I start a mock interview?",
  "history": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi! I am the AI MEET assistant. How can I help?" }
  ]
}
```

### Response: `Success`
```json
{
  "reply": "To start a mock interview, navigate to the 'Interview' tab on the sidebar. You can choose between a technical or behavioral round and even upload your resume for personalized questions!"
}
```

---

## 💡 Why this approach?
- **Groq + Llama 3.3**: Chosen for speed. Standard LLMs can take 5-10 seconds to respond; Groq responds in less than 1 second, making it feel like a real-time conversation.
- **Strict Persona**: By using a detailed system prompt, we ensure the bot stays professional and doesn't get distracted by unrelated topics.
- **Key Rotation**: High-traffic platforms often hit API limits. The `key-rotator` logic ensures the chatbot stays online even under heavy user load.
