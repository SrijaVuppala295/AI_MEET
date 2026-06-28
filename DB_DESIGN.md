# Database Design for AI Interview Agent

## 1. Overview
This project uses Firebase Firestore as its database. Firestore is a NoSQL document database that stores data in collections and documents, which fits the structure of this application very well.

The app stores user-related data such as:
- user profiles
- interview sessions
- quiz results
- prep-hub analysis results
- feedback and history

Because the application is built with Next.js and Firebase, Firestore is a natural choice for fast development and seamless integration.

---

## 2. Why Firestore Was Chosen

### Reasons
1. Easy integration with Firebase Authentication
   - The app already uses Firebase Auth for login and signup.
   - Firestore works smoothly with Firebase Auth.

2. Good fit for a startup-style project
   - The app is growing step by step.
   - Firestore allows quick setup without managing a heavy database server.

3. Flexible schema
   - Interview sessions and quiz sessions do not always follow the same strict structure.
   - Firestore documents can easily store different fields for different modules.

4. Real-time capabilities
   - Firestore supports real-time updates.
   - This is useful for future features like live dashboards and live interview progress.

5. Serverless-friendly
   - The app is deployed in a serverless environment.
   - Firestore is ideal for such architecture.

### Why this is suitable for this project
The project mainly stores user activity history, session details, and AI-generated results. These are document-like records and do not require complex joins or heavy relational modeling.

---

## 3. Why Not Other Databases?

### Why not SQL databases like MySQL or PostgreSQL?
SQL databases are great for structured data and complex relationships, but for this project:
- the data model is not highly relational,
- the app does not need complex table joins at the beginning,
- and a NoSQL approach is simpler and faster to implement.

Example:
- A user can have many interview sessions.
- Each session can have different fields depending on the interview type.
- In SQL, this often needs more planning and relation tables.
- In Firestore, it can be represented naturally as nested collections.

### Why not MongoDB?
MongoDB is also a NoSQL database, but it was not chosen because:
- Firebase provides a more complete backend ecosystem for this project,
- authentication and database are tightly integrated,
- and the project already uses Firebase services.

### Why not Redis?
Redis is mainly used for:
- caching,
- sessions,
- quick key-value operations.

It is not ideal as the primary database for storing application records like interviews, quizzes, and user history.

---

## 4. Why Different Databases Exist
Different databases exist because different applications have different needs.

### Common database types
- SQL databases: best for structured, relational data
- NoSQL databases: best for flexible, document-based, or large-scale unstructured data
- Graph databases: best for connected data
- In-memory databases: best for fast caching and temporary storage

### Simple rule
Choose a database based on:
- data structure,
- query complexity,
- scalability need,
- real-time requirements,
- development speed,
- and cost.

---

## 5. How to Select a Database
When selecting a database, ask these questions:

1. Is the data strongly related?
   - If yes, SQL may be better.

2. Is the data flexible and changing often?
   - If yes, NoSQL may be better.

3. Do we need real-time updates?
   - Firestore is a strong option.

4. Is the project small or medium-sized?
   - Firebase/Firestore is ideal for faster development.

5. Will the app need heavy analytics or complex joins?
   - A relational database may be better later.

### For this project
Firestore was selected because the application is mainly a user-driven AI platform with modular records and moderate data complexity.

---

## 6. How the Database Is Actually Used in This Project
The project uses Firestore with a user-centric structure.

### Main pattern
Data is stored under each user document in subcollections:
- users/{userId}/interview_sessions
- users/{userId}/quiz_sessions
- users/{userId}/prep_sessions

This approach makes it easy to:
- fetch a user’s history,
- isolate data per account,
- and keep data organized.

---

## 7. Proposed Database Schema

### A. users collection
This is the main user collection.

#### Document structure
```json
{
  "id": "uid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-06-12T10:00:00.000Z",
  "profile": {
    "role": "Software Engineer",
    "experienceLevel": "Mid",
    "skills": ["React", "Node.js", "TypeScript"],
    "bio": "Interested in frontend and system design"
  },
  "preferences": {
    "darkMode": true,
    "notifications": true
  }
}
```

### B. users/{userId}/interview_sessions collection
Stores each mock interview session.

#### Document structure
```json
{
  "id": "session-id",
  "userId": "uid",
  "userName": "John Doe",
  "type": "tech-stack",
  "interviewType": "Technical",
  "company": "",
  "role": "Frontend Developer",
  "experienceLevel": "Mid",
  "techStack": ["React", "TypeScript"],
  "durationMinutes": 30,
  "resumeText": "Candidate resume summary",
  "assistantId": "assistant-id",
  "status": "completed",
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T10:20:00.000Z",
  "feedback": {
    "overallScore": 82,
    "summary": "Good communication",
    "strengths": ["Clear explanations", "Structured answers"],
    "improvements": ["Need more depth in problem solving"],
    "categories": {
      "communication": 85,
      "technical": 80,
      "problemSolving": 78,
      "culturalFit": 84,
      "confidence": 81
    }
  },
  "transcript": [
    {
      "speaker": "candidate",
      "text": "I have experience with React."
    },
    {
      "speaker": "interviewer",
      "text": "Can you explain state management?"
    }
  ],
  "questionsAsked": [
    "Explain React state management",
    "What is useEffect used for?"
  ]
}
```

### C. users/{userId}/quiz_sessions collection
Stores quiz attempts.

#### Document structure
```json
{
  "id": "quiz-session-id",
  "topic": "React",
  "level": "Intermediate",
  "correct": 8,
  "total": 10,
  "score": 80,
  "feedback": "Focus more on hooks and state management.",
  "durationSeconds": 180,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "answers": [
    {
      "question": "What is useState?",
      "selectedAnswer": "A hook for managing state",
      "isCorrect": true
    }
  ]
}
```

### D. users/{userId}/prep_sessions collection
Stores prep-hub analysis results.

#### Document structure
```json
{
  "id": "prep-session-id",
  "fileName": "resume.pdf",
  "hasJD": true,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "role": "Software Engineer",
  "qa": [
    {
      "q": "What is React state?",
      "a": "State is used to manage component data.",
      "category": "Technical"
    }
  ],
  "topics": ["React", "JavaScript"],
  "tips": [
    {
      "type": "improve",
      "text": "Add measurable achievements to your resume."
    }
  ],
  "jobDescription": "Build scalable frontend applications with React and TypeScript",
  "resumeSummary": "Candidate has experience in frontend development"
}
```

### E. feedback collection (optional/helper usage)
Used by some helper actions and general utilities.

#### Document structure
```json
{
  "id": "feedback-id",
  "userId": "uid",
  "interviewId": "session-id",
  "rating": 4,
  "comment": "Very useful interview experience",
  "createdAt": "2026-06-12T10:00:00.000Z"
}
```

### F. contacts collection (if used by general actions)
Stores contact or support messages.

#### Document structure
```json
{
  "id": "contact-id",
  "name": "Alice",
  "email": "alice@example.com",
  "message": "I need help with interview prep",
  "createdAt": "2026-06-12T10:00:00.000Z"
}
```

---

## 8. Relationships and Data Flow

### Relationship style in Firestore
Firestore does not use traditional relational joins like SQL. Instead, it uses:
- documents for records,
- subcollections for related data,
- and document IDs to link information.

### Example
- A user document is the parent.
- All that user’s interviews, quizzes, and prep sessions are stored in subcollections under that user.
- This is a practical one-to-many design.

### Why this model works here
- each user has many sessions,
- each session belongs to one user,
- and the data is naturally grouped by account.

---

## 9. Indexing and Querying Considerations
Firestore works efficiently for simple reads and writes, but for better performance:
- use document IDs like userId and sessionId directly,
- keep documents not too large,
- avoid deeply nested data when unnecessary,
- and use queries carefully for history and analytics.

### Common queries in this project
- get all interview sessions of a user
- get the latest quiz sessions for analytics
- get prep sessions for a specific user
- fetch one interview session by ID

---

## 10. Interview Questions and Answers on Database Choice

### Q1. Why did you choose Firestore for this project?
A. Firestore was chosen because the project needs a fast, flexible, and easy-to-integrate database. It works well with Firebase Auth and suits the app’s document-based data structure.

### Q2. Why not use MySQL or PostgreSQL?
A. SQL databases are more suitable when the data is highly structured and relational. This project mainly stores user sessions and AI-generated results, which fit better with a NoSQL document model.

### Q3. What is the difference between SQL and NoSQL?
A. SQL databases use tables and relations, while NoSQL databases use documents, collections, key-value pairs, or graphs. SQL is better for complex relationships, while NoSQL is better for flexibility and rapid development.

### Q4. Why are there different databases?
A. Different databases are built for different use cases. Some are optimized for transactions, some for analytics, some for caching, and some for real-time applications.

### Q5. How do you decide which database to use?
A. I choose the database based on the application’s data model, scalability, performance needs, and development requirements.

### Q6. Can this project later migrate to PostgreSQL?
A. Yes, if the project grows and needs complex reports, analytics, or heavy relational queries, a migration to PostgreSQL could be considered.

---

## 9. Summary
The database design of this project is centered around Firestore because it is simple, scalable, flexible, and well-suited for a modern AI-powered web application. It stores user data and session history in an organized structure using subcollections, which makes the application easier to maintain and extend.
