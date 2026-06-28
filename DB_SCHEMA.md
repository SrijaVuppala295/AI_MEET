# Database Schema for AI Interview Agent

## 1. Overview
This project uses Firebase Firestore as its database. The schema is designed around a user-centric, document-based structure.

## 2. Collection Structure

```text
users/
  {userId}/
    interview_sessions/
      {sessionId}
    quiz_sessions/
      {sessionId}
    prep_sessions/
      {sessionId}
```

## 3. Schema Details

### A. users
Main user document.

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "createdAt": "timestamp",
  "profile": {
    "role": "string",
    "experienceLevel": "string",
    "skills": ["string"],
    "bio": "string"
  },
  "preferences": {
    "darkMode": "boolean",
    "notifications": "boolean"
  }
}
```

### B. users/{userId}/interview_sessions
Stores every mock interview attempt.

```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "type": "string",
  "interviewType": "string",
  "company": "string",
  "role": "string",
  "experienceLevel": "string",
  "techStack": ["string"],
  "durationMinutes": "number",
  "resumeText": "string",
  "assistantId": "string",
  "status": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "feedback": {
    "overallScore": "number",
    "summary": "string",
    "strengths": ["string"],
    "improvements": ["string"],
    "categories": {
      "communication": "number",
      "technical": "number",
      "problemSolving": "number",
      "culturalFit": "number",
      "confidence": "number"
    }
  },
  "transcript": [
    {
      "speaker": "string",
      "text": "string"
    }
  ],
  "questionsAsked": ["string"]
}
```

### C. users/{userId}/quiz_sessions
Stores each quiz attempt.

```json
{
  "id": "string",
  "topic": "string",
  "level": "string",
  "correct": "number",
  "total": "number",
  "score": "number",
  "feedback": "string",
  "durationSeconds": "number",
  "createdAt": "timestamp",
  "answers": [
    {
      "question": "string",
      "selectedAnswer": "string",
      "isCorrect": "boolean"
    }
  ]
}
```

### D. users/{userId}/prep_sessions
Stores prep-hub analysis results.

```json
{
  "id": "string",
  "fileName": "string",
  "hasJD": "boolean",
  "createdAt": "timestamp",
  "role": "string",
  "qa": [
    {
      "q": "string",
      "a": "string",
      "category": "string"
    }
  ],
  "topics": ["string"],
  "tips": [
    {
      "type": "string",
      "text": "string"
    }
  ],
  "jobDescription": "string",
  "resumeSummary": "string"
}
```

## 4. Optional Collections

### feedback
```json
{
  "id": "string",
  "userId": "string",
  "interviewId": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "timestamp"
}
```

### contacts
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "message": "string",
  "createdAt": "timestamp"
}
```

## 5. Notes
- This schema is document-based and flexible.
- Each user has separate subcollections for interviews, quizzes, and prep sessions.
- The design is suitable for a Firebase/Firestore-powered AI interview application.
