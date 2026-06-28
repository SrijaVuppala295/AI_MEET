# 📑 Prep Hub Workflow: Technical Deep Dive

The **Prep Hub** is an AI-powered document analysis engine. It transforms a standard Resume and Job Description (JD) into a personalized interview roadmap.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Document Parsing** | pdf-parse / mammoth | Extracts raw text from PDF and DOCX files. |
| **Analysis Engine** | Google Gemini 2.0 | Analyzes the intersection between resume skills and JD requirements. |
| **Storage** | Firestore | Stores analyzed sessions and generated roadmaps. |
| **Caching** | LocalStorage | Provides instant access to the most recent analysis session. |

---

## 🚀 End-to-End Workflow

### 1. Document Upload
- The user uploads their **Resume** (PDF/DOCX).
- (Optional) The user pastes a **Job Description** or uploads a JD file.
- The frontend uses `FormData` to send these files to the server.

### 2. Text Extraction (Server Side)
- The API route `/api/prep-hub/analyze` receives the files.
- It uses specialized libraries to strip away the styling and formatting, extracting only the raw text content from the documents.

### 3. AI Cross-Analysis
- The extracted text is sent to **Gemini** with a specific set of instructions:
    - *"Compare this Resume with this JD."*
    - *"Identify 8 high-probability interview questions."*
    - *"Find 5 strengths and 3 missing skills in the resume."*
- **Gemini** performs a semantic analysis, understanding that "React" in the resume matches "Frontend experience" in the JD.

### 4. Categorization & Scoring
- The AI categorizes the generated questions into:
    - **Technical**: Skill-based questions.
    - **Behavioral**: Experience and situation-based questions.
    - **System Design**: Architectural questions.
- It also generates **Resume Tips**, classifying them into "Strengths", "Improvements", and "Critical Missing Items".

### 5. Frontend Visualisation
- The results are returned as a structured JSON object.
- The UI renders three main tabs:
    - **Interview Q&A**: An accordion-style list with model answers.
    - **Study Topics**: A bulleted list of topics the user needs to learn.
    - **Resume Tips**: A color-coded feedback section (Green for strengths, Yellow/Red for gaps).

---

## 📡 API Interaction & Responses

### Request: `POST /api/prep-hub/analyze`
**FormData**:
- `resume`: [File]
- `jd`: "Senior React Developer role at Google..."

### Response: `Success`
```json
{
  "id": "prep_789",
  "fileName": "My_Resume.pdf",
  "qa": [
    { "q": "How did you use React in your last project?", "a": "I used it for...", "category": "Technical" }
  ],
  "tips": [
    { "type": "missing", "text": "Missing Docker/Kubernetes experience mentioned in JD." }
  ],
  "topics": ["Microservices", "State Management", "Redux"]
}
```

---

## 💡 Why this approach?
- **JD Tailoring**: Most platforms only analyze the resume. By including the JD, AI MEET provides "target-specific" preparation.
- **Actionable Feedback**: Instead of just saying "your resume is bad," the Prep Hub gives specific missing keywords, helping users bypass ATS (Applicant Tracking Systems).
- **Persistent Progress**: Saving these sessions allows users to track how their resume improvements affect their "readiness" over time.
