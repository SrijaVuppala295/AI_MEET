# API Documentation for AI Interview Agent

This project uses Next.js App Router API routes to handle authentication, AI interview flow, quiz generation, prep-hub analysis, chatbot responses, and history retrieval.

## API Summary Table

| Method | Route | Purpose | Main Input | Main Output |
|---|---|---|---|---|
| POST | /api/chatbot | Sends user messages to the AI chatbot | `{ message, history }` | `{ reply }` or error |
| POST | /api/vapi/webhook | Receives voice interview webhook events from Vapi | webhook payload | confirmation and session updates |
| POST | /api/interview/start | Starts a new mock interview session | role, experience level, interview type, company, tech stack, resume text | `{ success, sessionId }` |
| POST | /api/interview/feedback | Generates AI feedback for a completed interview | `{ sessionId, userId }` | `{ feedback }` |
| POST | /api/interview/end | Ends an interview session and stores transcript summary | `{ sessionId, transcript, durationSeconds }` | `{ success: true }` |
| GET | /api/interview/sessions | Fetches interview history for the signed-in user | query param `id` optional | `{ sessions }` or `{ session }` |
| POST | /api/quiz/generate | Generates AI quiz questions | `{ topic, level, count }` | `{ questions }` |
| POST | /api/quiz/save | Saves quiz results to Firestore | `{ topic, level, correct, total, durationSeconds }` | `{ success, sessionId }` |
| GET | /api/quiz/sessions | Fetches previous quiz sessions | none | `{ sessions, scoreHistory }` |
| GET | /api/quiz/stats | Returns quiz performance analytics | none | stats object |
| POST | /api/prep-hub/analyze | Analyzes resume and job description to generate interview prep content | form data with resume and optional JD | AI-generated prep result |
| GET | /api/prep-hub/sessions | Fetches past prep-hub sessions | none | `{ sessions }` |
| GET | /sign-out | Signs the user out by clearing the session cookie | none | redirect or success response |

---

## 1. Chatbot API

### Route
- POST /api/chatbot

### Purpose
This API connects the frontend chatbot UI with the Groq AI model. It sends the user’s message and chat history to the AI and returns a helpful response related to interview preparation.

### Request Body
```json
{
  "message": "How should I prepare for a React interview?",
  "history": []
}
```

### Response
```json
{
  "reply": "Here are some useful tips..."
}
```

### Notes
- It uses a system prompt to keep the assistant focused on interview preparation topics.
- It is useful for resume advice, platform guidance, and technical interview help.

---

## 2. Vapi Webhook API

### Route
- POST /api/vapi/webhook

### Purpose
This endpoint receives events from the Vapi voice AI service during mock interviews. It updates the interview session status and saves the transcript once the call ends.

### What It Does
- detects interview status updates such as in-progress and ended,
- stores transcript content,
- marks the interview as completed,
- triggers feedback generation after the call finishes.

### Notes
- It is mainly used by the voice interview system.
- It is not called directly by the user from the frontend.

---

## 3. Interview Start API

### Route
- POST /api/interview/start

### Purpose
This API creates a new interview session when the user begins a mock interview.

### Input Fields
- role
- experienceLevel
- interviewType or company
- techStack
- durationMinutes
- resumeText or uploaded resume

### Output
```json
{
  "success": true,
  "sessionId": "uuid"
}
```

### Notes
- The session is saved in Firestore under the user’s interview_sessions subcollection.
- It also selects the appropriate Vapi assistant based on the interview mode.

---

## 4. Interview Feedback API

### Route
- POST /api/interview/feedback

### Purpose
This API analyzes the interview transcript using AI and generates structured feedback.

### Input
```json
{
  "sessionId": "session-id",
  "userId": "user-id"
}
```

### Output
```json
{
  "feedback": {
    "overallScore": 82,
    "summary": "Good communication",
    "strengths": ["Clear answers"],
    "improvements": ["Be more specific"],
    "questionBreakdown": []
  }
}
```

### Notes
- It uses the stored transcript from the interview session.
- It updates the Firestore document with feedback.

---

## 5. Interview End API

### Route
- POST /api/interview/end

### Purpose
This API closes the interview session and updates its final status.

### Input
```json
{
  "sessionId": "session-id",
  "transcript": [],
  "durationSeconds": 180
}
```

### Output
```json
{
  "success": true
}
```

### Notes
- It is used when the interview ends from the client flow.
- It can also trigger feedback generation as a fallback.

---

## 6. Interview Sessions API

### Route
- GET /api/interview/sessions

### Purpose
This API retrieves interview history for the logged-in user.

### Query Parameters
- `id` : optional, fetch a single interview session

### Response
```json
{
  "sessions": []
}
```

### Notes
- The result is usually ordered by newest first.
- It helps populate the profile or history screens.

---

## 7. Quiz Generate API

### Route
- POST /api/quiz/generate

### Purpose
This API uses an AI model to generate multiple-choice questions for a selected topic and difficulty level.

### Request Body
```json
{
  "topic": "React",
  "level": "intermediate",
  "count": 5
}
```

### Response
```json
{
  "questions": [
    {
      "id": "uuid",
      "question": "What is useState?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}
```

### Notes
- It is used by the quiz module.
- The response is designed to be directly shown in the quiz UI.

---

## 8. Quiz Save API

### Route
- POST /api/quiz/save

### Purpose
This API saves the quiz attempt result into Firestore.

### Request Body
```json
{
  "topic": "React",
  "level": "Intermediate",
  "correct": 8,
  "total": 10,
  "durationSeconds": 180
}
```

### Response
```json
{
  "success": true,
  "sessionId": "quiz-session-id"
}
```

### Notes
- It also generates a short AI-based feedback recommendation.
- The data is stored under the user’s quiz_sessions subcollection.

---

## 9. Quiz Sessions API

### Route
- GET /api/quiz/sessions

### Purpose
This API fetches all past quiz attempts for the logged-in user.

### Response
```json
{
  "sessions": [],
  "scoreHistory": []
}
```

### Notes
- It is used to display quiz history and performance charts.

---

## 10. Quiz Stats API

### Route
- GET /api/quiz/stats

### Purpose
This API calculates quiz analytics such as average score, best score, latest score, total sessions, and improvement trend.

### Response
```json
{
  "avgScore": 80,
  "bestScore": 95,
  "latestScore": 85,
  "totalSessions": 6,
  "improvement": 10
}
```

### Notes
- It is useful for the profile and analytics dashboard.

---

## 11. Prep-Hub Analyze API

### Route
- POST /api/prep-hub/analyze

### Purpose
This API processes the uploaded resume and optional job description, then generates interview Q&A, prep topics, and resume improvement tips.

### Input
- form-data containing `resume`
- optional `jd` or `jdFile`

### Output
A JSON object with:
- role
- qa
- topics
- tips

### Notes
- It uses PDF or DOCX parsing when needed.
- It stores the generated result in Firestore for later viewing.

---

## 12. Prep-Hub Sessions API

### Route
- GET /api/prep-hub/sessions

### Purpose
This API returns the user’s previous prep-hub sessions.

### Response
```json
{
  "sessions": []
}
```

### Notes
- It helps the user revisit prior interview prep results.

---

## 13. Sign-Out API

### Route
- GET /sign-out

### Purpose
This endpoint clears the user session cookie and logs the user out.

### Notes
- It is a simple authentication-related route used by the sign-out flow.

---

## How These APIs Work Together

The APIs are connected like this:
1. The user starts an interview through the interview start API.
2. The voice interview runs through Vapi and the webhook API updates the session.
3. The feedback API generates evaluation after the interview ends.
4. The quiz APIs generate and save quiz attempts.
5. The prep-hub APIs analyze resumes and generate tailored preparation content.
6. The chatbot API provides on-demand AI support.

This makes the project a full-stack AI interview preparation system with both user-facing and backend intelligence.
