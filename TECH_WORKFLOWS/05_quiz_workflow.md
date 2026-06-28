# 🧠 Knowledge Quiz Workflow: Technical Deep Dive

The **Quiz Module** is a dynamic assessment tool that tests a user's technical proficiency across 12+ domains, providing instant feedback and long-term progress tracking.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Question Generation** | Google Gemini | Generates unique, non-repetitive MCQs based on topic and level. |
| **Data Visualisation** | Recharts | Plots "Performance Trends" and "Score Progression" charts. |
| **State Management** | React Hooks | Manages the quiz timer, question indexing, and score calculation. |
| **Persistence** | Firestore | Saves quiz history, stats, and best scores. |

---

## 🚀 End-to-End Workflow

### 1. Configuration (The Lobby)
- The user selects:
    - **Topic**: (e.g., JavaScript, React, System Design).
    - **Difficulty**: (Beginner, Intermediate, Advanced).
    - **Quantity**: (5, 10, 15, or 20 questions).
- Clicking "Start" triggers the AI generation engine.

### 2. AI Question Generation
- The API route `/api/quiz/generate` sends a request to **Gemini**.
- **Constraint-based Prompting**: The AI is instructed to return a JSON array containing:
    - The `Question` text.
    - 4 `Options`.
    - The `CorrectIndex`.
    - A detailed `Explanation` of why that answer is correct.
- This ensures that every quiz is unique and tailored to the chosen difficulty.

### 3. Active Quiz Session
- The frontend renders an "Overlay" that blocks out the rest of the site to focus on the quiz.
- **Micro-Interactions**: When a user selects an option:
    - If **Correct**: Highlighted in Green.
    - If **Wrong**: Highlighted in Red, and the correct answer is shown.
- **Immediate Learning**: The `Explanation` is shown immediately after each answer, transforming a test into a learning experience.

### 4. Results & Grading
- Once completed, the system calculates the percentage score.
- **Grading Logic**:
    - 90%+ : *Excellent*
    - 75%+ : *Proficient*
    - 60%+ : *Adequate*
    - Below 60% : *Needs Work*
- The final score is saved to the Firestore `quiz_sessions` collection.

### 5. Progress Analytics
- The Quiz Dashboard aggregates all past data to show:
    - **Average Score**: Calculated across all topics.
    - **Total Questions**: Sum of all answered questions.
    - **Trend Line**: A chart showing if the user's scores are going up or down over time.

---

## 📡 API Interaction & Responses

### Request: `POST /api/quiz/generate`
**Body**:
```json
{
  "topic": "JavaScript",
  "level": "intermediate",
  "count": 5
}
```

### Response: `Success`
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the result of 1 + '1' in JavaScript?",
      "options": ["2", "11", "undefined", "NaN"],
      "correctIndex": 1,
      "explanation": "JavaScript performs string concatenation when one operand is a string."
    }
  ]
}
```

---

## 💡 Why this approach?
- **Infinite Content**: Traditional quiz apps use a fixed database of questions. By using AI, AI MEET provides an infinite supply of new questions, preventing users from just "memorizing" answers.
- **Explanation-First**: Showing the explanation immediately after the answer is a pedagogical best practice, ensuring the user learns from their mistakes while they are still thinking about the question.
- **Visual Motivation**: Using **Recharts** to show progress helps users visualize their growth, encouraging them to stay consistent.
