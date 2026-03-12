"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavProps {
    user?: { name: string; email: string } | null;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const INTERVIEW_CATEGORIES = [
    { id: "fullstack", label: "Full Stack", icon: "⚡", color: "#6366f1", desc: "React, Node, DBs & system integration" },
    { id: "frontend", label: "Frontend", icon: "🎨", color: "#8b5cf6", desc: "React, Vue, CSS, Web Performance" },
    { id: "backend", label: "Backend", icon: "⚙️", color: "#3b82f6", desc: "APIs, databases, server architecture" },
    { id: "system-design", label: "System Design", icon: "🏗️", color: "#06b6d4", desc: "Scalability, trade-offs, architecture" },
    { id: "devops", label: "DevOps", icon: "🚀", color: "#10b981", desc: "CI/CD, Docker, Kubernetes, cloud" },
    { id: "dsa", label: "DSA", icon: "🧩", color: "#f59e0b", desc: "Algorithms, data structures, complexity" },
    { id: "android", label: "Android", icon: "📱", color: "#ef4444", desc: "Kotlin, Jetpack Compose, Android SDK" },
    { id: "hr", label: "HR Round", icon: "🤝", color: "#ec4899", desc: "Behavioral, situational, culture fit" },
];

const COMPANIES = [
    { name: "Google", logo: "/google.png", color: "#4285F4" },
    { name: "Amazon", logo: "/amazon.png", color: "#FF9900" },
    { name: "Microsoft", logo: "/microsoft.png", color: "#00A4EF" },
    { name: "Meta", logo: "/meta.jpg", color: "#0866FF" },
    { name: "Spotify", logo: "/spotify.png", color: "#1DB954" },
    { name: "Reddit", logo: "/reddit.jpg", color: "#FF4500" },
    { name: "Pinterest", logo: "/pintrest.png", color: "#E60023" },
    { name: "Adobe", logo: "/adobe.jpg", color: "#FF0000" },
];

const FEATURES = [
    {
        icon: "🤖",
        title: "AI Mock Interviews",
        desc: "Realistic voice-based mock interviews conducted by an AI interviewer tailored to your role and stack.",
        color: "#6366f1",
    },
    {
        icon: "📊",
        title: "Instant AI Feedback",
        desc: "Get scored on communication, technical depth, problem solving, and confidence — right after each session.",
        color: "#8b5cf6",
    },
    {
        icon: "🏢",
        title: "Company-Specific Prep",
        desc: "Practice with curated question banks matched to Google, Amazon, Microsoft, and 50+ top companies.",
        color: "#3b82f6",
    },
    {
        icon: "📚",
        title: "Prep Hub",
        desc: "Upload your resume & JD. Get a personalized Q&A set generated just for your application.",
        color: "#06b6d4",
    },
    {
        icon: "🎯",
        title: "Quiz & Analytics",
        desc: "Sharpen knowledge with randomized quizzes and track your progress over time with visual charts.",
        color: "#10b981",
    },
    {
        icon: "💬",
        title: "24/7 AI Chatbot",
        desc: "Always-on assistant for resume tips, interview guidance, and career advice — whenever you need it.",
        color: "#f59e0b",
    },
];

const STATS = [
    { value: "50K+", label: "Mock Interviews" },
    { value: "200+", label: "Company Question Banks" },
    { value: "94%", label: "Confidence Improvement" },
    { value: "8 types", label: "Interview Tracks" },
];

const TESTIMONIALS = [
    {
        name: "Aarav Mehta",
        role: "SDE-2 @ Amazon",
        avatar: "AM",
        color: "#6366f1",
        text: "AI MEET's system design interviews were spot-on. The AI feedback helped me identify blind spots I didn't even know I had. Cleared my Amazon loop in the first attempt.",
    },
    {
        name: "Priya Sharma",
        role: "Frontend Eng @ Swiggy",
        avatar: "PS",
        color: "#8b5cf6",
        text: "The company-specific prep is a game changer. I practiced 3 rounds of Swiggy-style interviews and walked in knowing exactly what to expect. Got the offer!",
    },
    {
        name: "Rahul Verma",
        role: "Backend Dev @ Razorpay",
        avatar: "RV",
        color: "#3b82f6",
        text: "Instantly fell in love with the feedback scoring. Breaking down communication and technical knowledge separately helped me focus on what actually mattered.",
    },
];

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ user }: NavProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setMobileOpen(false);
    };

    const APP_LINKS = [
        { label: "AI Interview", href: "/interview" },
        { label: "Prep Hub", href: "/prep-hub" },
        { label: "Quiz", href: "/quiz" },
        { label: "Interview Q's", href: "/questions" },
    ];

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? "rgba(8,9,13,0.92)"
                    : "rgba(8,9,13,0.5)",
                borderBottom: scrolled ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div
                            className="flex items-center justify-center rounded-xl"
                            style={{
                                width: 36,
                                height: 36,
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                boxShadow: "0 0 16px rgba(99,102,241,0.4)",
                            }}
                        >
                            <Image src="/logo.svg" alt="logo" width={20} height={20} />
                        </div>
                        <span
                            className="text-xl font-bold tracking-tight"
                            style={{
                                background: "linear-gradient(135deg, #e0e7ff, #c4b5fd)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            AI MEET
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => scrollTo("about")}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-white"
                            style={{ color: "#6870a6" }}
                        >
                            About
                        </button>
                        <button
                            onClick={() => scrollTo("contact")}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-white"
                            style={{ color: "#6870a6" }}
                        >
                            Contact
                        </button>

                        {/* App Features Dropdown */}
                        <div className="relative" ref={dropRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-white"
                                style={{ color: "#6870a6" }}
                            >
                                Features
                                <svg
                                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                                    className="transition-transform duration-200"
                                    style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                                >
                                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div
                                    className="absolute top-full mt-2 right-0 w-52 rounded-2xl overflow-hidden animate-fadeIn"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(36,38,51,0.98), rgba(8,9,13,0.99))",
                                        border: "1px solid rgba(99,102,241,0.2)",
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.08)",
                                    }}
                                >
                                    {APP_LINKS.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={user ? item.href : "/sign-in"}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                                            style={{ color: "#d6e0ff" }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ background: "#6366f1", flexShrink: 0 }}
                                            />
                                            {item.label}
                                            {!user && (
                                                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                                                    Login
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Auth area */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <div
                                    className="flex items-center justify-center rounded-full text-sm font-bold"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                        color: "#fff",
                                        boxShadow: "0 0 16px rgba(99,102,241,0.3)",
                                    }}
                                    title={user.name}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <Link href="/sign-out">
                                    <button
                                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-white/10"
                                        style={{ color: "#6870a6", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        Logout
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in">
                                    <button
                                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-white/5"
                                        style={{ color: "#d6e0ff" }}
                                    >
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/sign-up">
                                    <button
                                        className="px-5 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-90"
                                        style={{
                                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                            color: "#fff",
                                            boxShadow: "0 0 20px rgba(99,102,241,0.3)",
                                        }}
                                    >
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg"
                        style={{ color: "#6870a6" }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            {mobileOpen ? (
                                <path d="M5 5l12 12M5 17L17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            ) : (
                                <>
                                    <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div
                        className="md:hidden py-4 border-t animate-fadeIn"
                        style={{ borderColor: "rgba(99,102,241,0.15)" }}
                    >
                        {["About", "Contact"].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollTo(item.toLowerCase())}
                                className="block w-full text-left px-4 py-3 text-sm font-medium"
                                style={{ color: "#6870a6" }}
                            >
                                {item}
                            </button>
                        ))}
                        <div className="h-px my-2" style={{ background: "rgba(99,102,241,0.1)" }} />
                        {APP_LINKS.map((item) => (
                            <Link
                                key={item.href}
                                href={user ? item.href : "/sign-in"}
                                className="block px-4 py-3 text-sm font-medium"
                                style={{ color: "#d6e0ff" }}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="h-px my-2" style={{ background: "rgba(99,102,241,0.1)" }} />
                        {user ? (
                            <Link href="/sign-out" className="block px-4 py-3 text-sm font-medium" style={{ color: "#f75353" }}>
                                Logout
                            </Link>
                        ) : (
                            <div className="flex gap-3 px-4 pt-2">
                                <Link href="/sign-in" className="flex-1">
                                    <button className="w-full py-2.5 text-sm font-semibold rounded-xl border" style={{ color: "#d6e0ff", borderColor: "rgba(99,102,241,0.3)" }}>
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/sign-up" className="flex-1">
                                    <button className="w-full py-2.5 text-sm font-bold rounded-xl" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff" }}>
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage({ user }: NavProps) {
    return (
        <div className="min-h-screen" style={{ background: "#08090D", color: "#fff" }}>
            <Navbar user={user} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center">
                {/* Background blobs */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)", filter: "blur(80px)" }} />
                    <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(80px)" }} />
                    <div aria-hidden className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                </div>

                {/* Pill badge */}
                <div
                    className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                    style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "#a5b4fc",
                    }}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI-Powered Mock Interviews — Free to Start
                </div>

                {/* Headline */}
                <h1
                    className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                    style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Ace Your Next Interview with AI
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: "#6870a6" }}>
                    Practice real interview questions across 8 specializations and 200+ top companies.
                    Get instant AI feedback on every answer — and land the job you deserve.
                </p>

                {/* CTA buttons */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link href={user ? "/interview" : "/sign-up"}>
                        <button
                            className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                color: "#fff",
                                boxShadow: "0 0 40px rgba(99,102,241,0.35)",
                            }}
                        >
                            Start Practicing Free
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M4 9h10M9 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>
                    </Link>
                    <button
                        onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                        className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold transition-all hover:bg-white/5"
                        style={{
                            color: "#d6e0ff",
                            border: "1px solid rgba(99,102,241,0.25)",
                        }}
                    >
                        See How It Works
                    </button>
                </div>

                {/* Stats bar */}
                <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1">
                            <span
                                className="text-3xl font-extrabold"
                                style={{
                                    background: "linear-gradient(135deg, #e0e7ff, #818cf8)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {stat.value}
                            </span>
                            <span className="text-xs font-medium" style={{ color: "#4f557d" }}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ──────────────────────────────────────────────────── */}
            <section id="features" className="px-6 py-24 mx-auto max-w-7xl">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#6366f1" }}>Platform Features</p>
                    <h2 className="text-4xl font-extrabold" style={{ color: "#fff" }}>Everything you need to prepare</h2>
                    <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#6870a6" }}>
                        From AI voice interviews to personalized prep hubs — one platform for complete interview readiness.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))",
                                border: "1px solid rgba(255,255,255,0.06)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.border = `1px solid ${f.color}40`;
                                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 40px ${f.color}15`;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.06)";
                                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
                            }}
                        >
                            <div
                                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                            >
                                {f.icon}
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "#6870a6" }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── INTERVIEW CATEGORIES ──────────────────────────────────────── */}
            <section id="categories" className="px-6 py-24 mx-auto max-w-7xl">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#8b5cf6" }}>Interview Tracks</p>
                    <h2 className="text-4xl font-extrabold text-white">Pick your specialization</h2>
                    <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#6870a6" }}>
                        8 focused tracks — each with role-specific questions and AI tailored to that domain.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {INTERVIEW_CATEGORIES.map((cat) => (
                        <Link key={cat.id} href={user ? `/interview?type=${cat.id}` : "/sign-in"}>
                            <div
                                className="group relative flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                style={{
                                    background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.border = `1px solid ${cat.color}50`;
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${cat.color}20`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.06)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                }}
                            >
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                                    style={{
                                        background: `${cat.color}15`,
                                        border: `1px solid ${cat.color}30`,
                                        boxShadow: `0 0 20px ${cat.color}15`,
                                    }}
                                >
                                    {cat.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{cat.label}</p>
                                    <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#4f557d" }}>{cat.desc}</p>
                                </div>
                                <div
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: cat.color }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── COMPANY-WISE INTERVIEWS ────────────────────────────────────── */}
            <section id="companies" className="px-6 py-24 mx-auto max-w-7xl">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#06b6d4" }}>Company-Specific</p>
                    <h2 className="text-4xl font-extrabold text-white">Prep for your dream company</h2>
                    <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#6870a6" }}>
                        Curated question banks for 200+ companies. Know exactly what to expect before you walk in.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {COMPANIES.map((co) => (
                        <Link key={co.name} href={user ? `/interview?company=${co.name.toLowerCase()}` : "/sign-in"}>
                            <div
                                className="group flex flex-col items-center gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                style={{
                                    background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.border = `1px solid ${co.color}40`;
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${co.color}15`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.06)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                                }}
                            >
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden"
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                                >
                                    <Image src={co.logo} alt={co.name} width={36} height={36} className="object-contain" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-white text-sm">{co.name}</p>
                                    <p className="text-[11px] mt-0.5" style={{ color: "#4f557d" }}>Interview Prep</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm" style={{ color: "#4f557d" }}>
                        + 190 more companies available after sign in
                    </p>
                </div>
            </section>

            {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
            <section id="testimonials" className="px-6 py-24 mx-auto max-w-7xl">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#ec4899" }}>Success Stories</p>
                    <h2 className="text-4xl font-extrabold text-white">Developers who made it</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <div
                            key={t.name}
                            className="rounded-2xl p-6 flex flex-col gap-4"
                            style={{
                                background: "linear-gradient(145deg, rgba(36,38,51,0.7), rgba(8,9,13,0.8))",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#f59e0b">
                                        <path d="M7 1l1.5 4h4.2l-3.4 2.5 1.3 4L7 9l-3.6 2.5 1.3-4L1.3 5H5.5z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>"{t.text}"</p>

                            <div className="flex items-center gap-3 mt-auto">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
                                >
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.name}</p>
                                    <p className="text-xs" style={{ color: "#4f557d" }}>{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ─────────────────────────────────────────────────────── */}
            <section id="about" className="px-6 py-24 mx-auto max-w-7xl">
                <div
                    className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center"
                    style={{
                        background: "linear-gradient(145deg, rgba(79,70,229,0.1), rgba(124,58,237,0.08))",
                        border: "1px solid rgba(99,102,241,0.2)",
                    }}
                >
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "#6366f1" }}>About AI MEET</p>
                        <h2 className="text-4xl font-extrabold leading-tight text-white mb-6">
                            Built for developers,<br />by developers
                        </h2>
                        <p className="text-base leading-relaxed mb-4" style={{ color: "#6870a6" }}>
                            AI MEET was built to solve a real problem: interview preparation is broken. Scattered YouTube videos, random Leetcode grinds, and one shot at a mock interview with a friend — it's not enough.
                        </p>
                        <p className="text-base leading-relaxed" style={{ color: "#6870a6" }}>
                            We built a platform powered by Gemini AI and Vapi voice agents to simulate real interviews — with real-time speech, instant scoring, and structured feedback. Whether you're targeting your first SDE role or cracking FAANG, AI MEET adapts to your level.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 min-w-[220px]">
                        {[
                            { label: "Voice AI interviews", icon: "🎙️" },
                            { label: "Structured feedback", icon: "📊" },
                            { label: "8 interview tracks", icon: "🗂️" },
                            { label: "200+ company banks", icon: "🏢" },
                            { label: "Resume Q&A generator", icon: "📄" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-medium" style={{ color: "#d6e0ff" }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT ───────────────────────────────────────────────────── */}
            <section id="contact" className="px-6 py-24 mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "#10b981" }}>Contact Us</p>
                <h2 className="text-4xl font-extrabold text-white mb-4">Have questions? We'd love to help.</h2>
                <p className="text-base mb-10" style={{ color: "#6870a6" }}>
                    Reach out for partnership inquiries, feature requests, or just to say hi.
                </p>

                <div
                    className="rounded-3xl p-8 text-left"
                    style={{
                        background: "linear-gradient(145deg, rgba(36,38,51,0.8), rgba(8,9,13,0.9))",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Name</label>
                            <input
                                type="text"
                                placeholder="Your full name"
                                className="rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:ring-2"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(99,102,241,0.15)",
                                    outline: "none",
                                }}
                                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)")}
                                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)")}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="rounded-xl px-4 py-3 text-sm text-white"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(99,102,241,0.15)",
                                    outline: "none",
                                }}
                                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)")}
                                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)")}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4f557d" }}>Message</label>
                            <textarea
                                rows={4}
                                placeholder="Tell us what you need..."
                                className="rounded-xl px-4 py-3 text-sm text-white resize-none"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(99,102,241,0.15)",
                                    outline: "none",
                                }}
                                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)")}
                                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)")}
                            />
                        </div>
                        <button
                            className="mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
                            style={{
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                boxShadow: "0 0 24px rgba(99,102,241,0.3)",
                            }}
                        >
                            Send Message
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6" style={{ color: "#4f557d" }}>
                    <a href="mailto:support@aimeet.io" className="flex items-center gap-2 text-sm hover:text-indigo-400 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        support@aimeet.io
                    </a>
                    <a href="https://github.com/aimeet" className="flex items-center gap-2 text-sm hover:text-indigo-400 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 .5a7.5 7.5 0 00-2.37 14.62c.37.07.5-.16.5-.36v-1.27c-2.1.46-2.54-1.01-2.54-1.01-.34-.87-.84-1.1-.84-1.1-.68-.47.05-.46.05-.46.76.05 1.15.78 1.15.78.67 1.15 1.76.82 2.19.62.07-.48.26-.82.48-1.01-1.67-.19-3.43-.84-3.43-3.72 0-.82.29-1.49.78-2.01-.08-.19-.34-.95.07-1.99 0 0 .64-.2 2.1.78a7.3 7.3 0 013.82 0c1.46-.99 2.1-.78 2.1-.78.41 1.04.15 1.8.07 1.99.49.52.78 1.19.78 2.01 0 2.89-1.76 3.53-3.44 3.71.27.24.51.7.51 1.41v2.1c0 .2.13.43.51.36A7.5 7.5 0 008 .5z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </section>

            {/* ── CTA BANNER ────────────────────────────────────────────────── */}
            <section className="px-6 pb-24 mx-auto max-w-5xl">
                <div
                    className="relative overflow-hidden rounded-3xl p-12 text-center"
                    style={{
                        background: "linear-gradient(135deg, #1e1b4b 0%, #2d1b69 50%, #1e1b4b 100%)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        boxShadow: "0 0 80px rgba(99,102,241,0.15)",
                    }}
                >
                    <div aria-hidden className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <h2 className="text-4xl font-extrabold text-white mb-4">Ready to crack your dream job?</h2>
                    <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "#a5b4fc" }}>
                        Join thousands of developers using AI MEET to land offers at top companies.
                    </p>
                    <Link href={user ? "/interview" : "/sign-up"}>
                        <button
                            className="rounded-2xl px-10 py-4 text-base font-bold text-white transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                boxShadow: "0 0 40px rgba(99,102,241,0.4)",
                            }}
                        >
                            {user ? "Start Interview" : "Create Free Account"}
                        </button>
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────────── */}
            <footer
                className="border-t px-6 py-10"
                style={{ borderColor: "rgba(99,102,241,0.1)" }}
            >
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex items-center justify-center rounded-lg"
                            style={{ width: 28, height: 28, background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                        >
                            <Image src="/logo.svg" alt="logo" width={16} height={16} />
                        </div>
                        <span className="font-bold text-white">AI MEET</span>
                    </div>
                    <p className="text-xs text-center" style={{ color: "#4f557d" }}>
                        © {new Date().getFullYear()} AI MEET. Built for the next generation of developers.
                    </p>
                    <div className="flex gap-5 text-xs" style={{ color: "#4f557d" }}>
                        <Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link>
                        <Link href="/sign-in" className="hover:text-indigo-400 transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}