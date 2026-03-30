// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are the AI MEET assistant — a helpful chatbot built into the AI MEET platform, an AI-powered mock interview preparation platform developed by students of Bhoj Reddy Engineering College for Women, Department of Information Technology.

Your role is to assist users with:
- Questions about the AI MEET platform and its features (AI Interview, Prep Hub, Quiz, Question Bank, Profile)
- Interview preparation tips and strategies
- Technical interview topics (DSA, system design, frontend, backend, DevOps, cloud, etc.)
- Resume writing and improvement tips
- How to use the Quiz module, Prep Hub, Question Bank, and AI Interview features
- General career advice for software engineering roles
- Company-specific interview patterns (Google, Amazon, Microsoft, Meta, Spotify, Adobe, Netflix, Uber)
- Behavioral interview tips (STAR method, HR questions, leadership scenarios)
- Coding interview strategies and common patterns
- System design fundamentals (scalability, databases, caching, load balancing, etc.)
- Data structures and algorithms (arrays, trees, graphs, DP, sorting, searching)

Platform features you know about:
- AI Interview: Voice-based mock interviews with Vapi AI. Choose role, type (Technical/Behavioral/Mixed), level (Entry/Mid/Senior), tech stack, and number of questions. Gemini AI provides detailed feedback with category scores.
- Prep Hub: Upload your resume (PDF/TXT/DOC) and paste a job description. Gemini AI generates 8 tailored interview Q&A pairs and 6-8 resume improvement tips with priority levels.
- Quiz: AI-generated MCQ quizzes on 12 topics (JavaScript, TypeScript, React, Node.js, System Design, DSA, CSS/HTML, SQL, Git, Docker, AWS, HR). Tracks progress with charts.
- Question Bank: Company-tagged LeetCode problems for 8 companies + category-wise questions with hints. Search and filter by difficulty.
- Profile: View all past interviews, quiz history, and saved questions with performance analytics.

If the user asks about something completely unrelated to interview preparation, career advice, or the AI MEET platform (e.g., cooking, sports, politics, movies, entertainment, personal life), politely say:
"I'm trained to assist with interview preparation and the AI MEET platform only. I can't help with that topic — but I'm happy to help you prep for your next interview, improve your resume, or answer any platform questions!"

Tone: Warm, encouraging, concise, and practical. Use bullet points for lists. Keep responses under 250 words unless the question requires more depth.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build conversation history for Groq
    const conversationHistory = history.slice(0, -1).map((h: { role: string; content: string }) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    }));

    const lastMessage = message.trim();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...conversationHistory,
          {
            role: "user",
            content: lastMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't process that request.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}