// constants/interview.ts

// ─── Assistant IDs (set these in .env.local) ───────────────────────────────
// Replace the right-hand values with your actual Vapi Assistant IDs
export const INTERVIEW_TYPE_ASSISTANTS: Record<string, string> = {
    "Frontend Technical": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_FRONTEND ?? "",
    "Backend Technical": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_BACKEND ?? "",
    "HR Round": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_HR ?? "",
    "System Design": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_SYSTEM ?? "",
    "DevOps": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_DEVOPS ?? "",
    "DSA Round": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_DSA ?? "",
    "Full Stack": process.env.NEXT_PUBLIC_VAPI_ASSISTANT_FULLSTACK ?? "",
};

export const INTERVIEW_TYPES = Object.keys(INTERVIEW_TYPE_ASSISTANTS);

export const INTERVIEW_TYPE_META: Record<string, {
    icon: string; color: string; description: string;
}> = {
    "Frontend Technical": { icon: "◈", color: "#3b82f6", description: "React, CSS, browser APIs, performance" },
    "Backend Technical": { icon: "◉", color: "#6366f1", description: "APIs, databases, scalability, Node.js" },
    "HR Round": { icon: "◎", color: "#10b981", description: "Culture fit, communication, leadership" },
    "System Design": { icon: "⬡", color: "#f59e0b", description: "Architecture, trade-offs, scalability" },
    "DevOps": { icon: "◌", color: "#ef4444", description: "CI/CD, Docker, Kubernetes, cloud infra" },
    "DSA Round": { icon: "◆", color: "#8b5cf6", description: "Algorithms, data structures, complexity" },
    "Full Stack": { icon: "◈", color: "#06b6d4", description: "End-to-end: React + Node + DB + deploy" },
};

export const COMPANY_INTERVIEWS = [
    { name: "Google", color: "#4285f4", focus: "DSA + System Design + Behavioral" },
    { name: "Microsoft", color: "#00a4ef", focus: "DSA + Architecture + Leadership" },
    { name: "Amazon", color: "#ff9900", focus: "Leadership Principles + System Design" },
    { name: "Meta", color: "#0866ff", focus: "Product Sense + DSA + Behavioral" },
    { name: "Netflix", color: "#e50914", focus: "System Design + Culture + Leadership" },
    { name: "Startup", color: "#10b981", focus: "Full Stack + Problem Solving + Culture" },
];

// Company → assistant ID mapping
export const COMPANY_ASSISTANT_MAP: Record<string, string> = {
    Google: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_DSA ?? "",
    Microsoft: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_SYSTEM ?? "",
    Amazon: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_HR ?? "",
    Meta: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_SYSTEM ?? "",
    Netflix: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_SYSTEM ?? "",
    Startup: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_FULLSTACK ?? "",
};

export const EXPERIENCE_LEVELS = [
    { value: "fresher", label: "Fresher", sub: "0–1 yrs" },
    { value: "junior", label: "Junior", sub: "1–3 yrs" },
    { value: "mid", label: "Mid-level", sub: "3–5 yrs" },
    { value: "senior", label: "Senior", sub: "5–8 yrs" },
    { value: "staff", label: "Staff / Lead", sub: "8+ yrs" },
];

export const INTERVIEW_DURATIONS = [
    { value: 15, label: "15 min", sub: "Quick screen" },
    { value: 30, label: "30 min", sub: "Standard round" },
    { value: 45, label: "45 min", sub: "Full interview" },
    { value: 60, label: "60 min", sub: "Deep dive" },
];

export const TECH_STACKS = [
    "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript",
    "Node.js", "Python", "Java", "Go", "Rust", "C++",
    "PostgreSQL", "MongoDB", "Redis", "MySQL",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes",
    "GraphQL", "REST", "gRPC",
];