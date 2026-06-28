# 🕸️ Interview Matrix Workflow: Technical Deep Dive

The **Interview Matrix** (Question Bank) is the platform's central repository for high-quality technical questions. It is designed for rapid search, company-specific preparation, and strategic learning.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Data Storage** | Local JSON Files | Stores 100+ questions for instant, zero-latency access. |
| **Icons** | Lucide React | Visual cues for different technical domains. |
| **Search Engine** | React useMemo | High-performance client-side filtering logic. |
| **UI Components** | Radix UI / Shadcn | Accessible and responsive layout elements. |

---

## 🚀 End-to-End Workflow

### 1. Dual-Mode Navigation
The Matrix operates in two distinct modes, toggled by a switch at the top of the sidebar:
- **Company Mode**: Focuses on "Where". It lists questions tagged to specific companies like Google, Amazon, or Netflix.
- **Category Mode**: Focuses on "What". It groups questions by technical domain (Frontend, Backend, System Design, etc.).

### 2. High-Performance Search
- As the user types in the search bar, the `useMemo` hook filters the local JSON data.
- **Multi-layered Search**: The system searches through:
    - Question **Titles**.
    - Technical **Tags** (e.g., Arrays, React, SQL).
    - **Difficulty** levels.
- Because the data is local, the search results update instantly without any loading spinners.

### 3. Progressive Difficulty
- Every question is graded as **Easy** (Cyan), **Medium** (Amber), or **Hard** (Red).
- This allows users to build a "study path"—starting with foundational concepts and moving toward FAANG-level complex problems.

### 4. Expert Hints (Category Mode Only)
- In "Category Mode," every question is interactive.
- Clicking a question expands a drawer showing an **Expert Hint**.
- **Strategy vs. Answer**: Unlike the Quiz module, these hints don't just give the answer; they explain the *strategy* needed to solve the problem in an interview setting.

### 5. Direct Practice (Company Mode Only)
- In "Company Mode," questions are linked directly to their **LeetCode** counterparts.
- This creates a bridge between the "knowledge" (AI MEET) and the "practice" (LeetCode), allowing users to immediately try coding the solution.

---

## 📡 API Interaction & Responses

*Note: The Interview Matrix primarily uses local data for speed, so there are no backend API calls for fetching questions. This makes it the fastest feature on the platform.*

### Data Structure: `company-questions.json`
```json
{
  "google": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "leetcode_url": "https://leetcode.com/problems/two-sum/",
      "tags": ["Arrays", "Hash Table"]
    }
  ]
}
```

---

## 💡 Why this approach?
- **Zero Latency**: By using local JSON files instead of a database, the Matrix feels incredibly snappy. There is zero delay when switching between categories or searching.
- **LeetCode Bridge**: We don't try to reinvent the wheel. LeetCode is the industry standard for coding practice, so we provide the "context" (Company tags) and link the user to the "workspace" (LeetCode).
- **Iconography**: Using distinct colors and icons for each category (e.g., Palette for Frontend, Rocket for DevOps) makes the platform visually intuitive and reduces cognitive load.
