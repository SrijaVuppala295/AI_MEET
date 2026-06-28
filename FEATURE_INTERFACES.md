# Interfaces of Each Feature

This file explains the interfaces used for each feature in the project.

---

## 1. Authentication Feature

### Main interface
```ts
interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}
```

### Purpose
Used to define the structure of login and signup form data.

---

## 2. Interview Feature

### Main interface
```ts
interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  interviewType: string;
  experienceLevel: string;
  techStack: string[];
  durationMinutes: number;
  status: "pending" | "active" | "completed";
  createdAt: string;
}
```

### Purpose
Represents a mock interview session and its basic details.

### Related interface
```ts
interface InterviewFeedback {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  questionBreakdown: QuestionBreakdown[];
}
```

```ts
interface QuestionBreakdown {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}
```

---

## 3. Prep Hub Feature

### Main interface
```ts
interface PrepSession {
  id: string;
  fileName: string;
  hasJD: boolean;
  createdAt: string;
  role: string;
  qa: PrepQuestionAnswer[];
  topics: string[];
  tips: PrepTip[];
}
```

```ts
interface PrepQuestionAnswer {
  q: string;
  a: string;
  category: string;
}
```

```ts
interface PrepTip {
  type: string;
  text: string;
}
```

### Purpose
Defines the structure of personalized interview preparation data generated from resume and job description analysis.

---

## 4. Quiz Feature

### Main interface
```ts
interface QuizSession {
  id: string;
  topic: string;
  level: string;
  correct: number;
  total: number;
  score: number;
  feedback: string;
  durationSeconds: number;
  createdAt: string;
}
```

### Purpose
Represents a completed quiz attempt and its result.

---

## 5. Interview Matrix / Question Bank Feature

### Main interface
```ts
interface CategoryQ {
  id: string;
  title: string;
  difficulty: Diff;
  tags: string[];
  hint: string;
}
```

```ts
type Diff = "Easy" | "Medium" | "Hard";
```

### Purpose
Defines the structure of a question stored in the question bank or interview matrix.

---

## 6. Chatbot Feature

### Main interface
```ts
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

### Purpose
Represents each message in the chatbot conversation.

### Related interface
```ts
interface ChatbotRequest {
  message: string;
  history?: ChatMessage[];
}
```

---

## 7. Profile / History Feature

### Main interface
```ts
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}
```

### Purpose
Represents the authenticated user profile used by the app.

---

## 8. Feedback / Analytics Feature

### Main interface
```ts
interface AnalyticsSummary {
  avgScore: number;
  bestScore: number;
  latestScore: number;
  totalSessions: number;
  improvement: number;
  streak: number;
  topicsCovered: number;
}
```

### Purpose
Defines the analytics structure for quiz performance or user progress.

---

## 9. General Notes

These interfaces are used to make the application more structured and safer by ensuring that data passed between components and APIs has the correct shape.

In short:
- interfaces define the shape of data,
- components use them to receive or send structured objects,
- and the app becomes easier to maintain and debug.
