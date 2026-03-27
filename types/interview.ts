// types/interview.ts

export interface InterviewSession {
    id: string;
    userId: string;
    userName: string;
    type: "tech-stack" | "company";
    interviewType: string;       // "Frontend Technical" etc.
    company?: string;            // "Google" etc. (company mode only)
    role: string;
    experienceLevel: string;
    techStack: string[];
    durationMinutes: number;
    resumeText?: string;
    assistantId: string;
    vapiCallId?: string;
    status: "pending" | "active" | "completed" | "cancelled";
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
    transcript?: TranscriptMessage[];
    feedback?: InterviewFeedback;
    vapiSummary?: string;
    rawTranscriptText?: string;
}

export interface TranscriptMessage {
    role: "assistant" | "user";
    content: string;
}

export interface InterviewFeedback {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    problemSolvingScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    questionBreakdown: QuestionFeedback[];
    generatedAt: string;
}

export interface QuestionFeedback {
    question: string;
    answer: string;
    score: number;     // 0–10
    feedback: string;
}