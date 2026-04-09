"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderProps {
    user?: { name: string; email: string } | null;
}

export default function Header({ user }: HeaderProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

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

    const isHomePage = pathname === "/";

    const scrollTo = (id: string) => {
        if (isHomePage) {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } else {
            window.location.href = `/#${id}`;
        }
        setMobileOpen(false);
    };

    const APP_LINKS = [
        { label: "AI Interview", href: "/interview" },
        { label: "Prep Hub", href: "/prep-hub" },
        { label: "Quiz", href: "/quiz" },
        { label: "Interview Questions", href: "/questions" },
    ];

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? "rgba(255,255,255,0.92)"
                    : "rgba(255,255,255,0.5)",
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
                                background: "linear-gradient(135deg, #4f46e5, #9333ea)",
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
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-slate-900"
                            style={{ color: "#334155" }}
                        >
                            About
                        </button>
                        <button
                            onClick={() => scrollTo("contact")}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-slate-900"
                            style={{ color: "#334155" }}
                        >
                            Contact
                        </button>

                        {/* App Features Dropdown */}
                        <div className="relative" ref={dropRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-slate-900"
                                style={{ color: "#334155" }}
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
                                        background: "#ffffff",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                                    }}
                                >
                                    {APP_LINKS.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={user ? item.href : "/sign-in"}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                                            style={{ color: "#0f172a" }}
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
                                <div className="relative group/profile">
                                    <Link href="/profile">
                                        <div
                                            className="flex items-center justify-center rounded-full text-sm font-bold cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
                                            style={{
                                                width: 38,
                                                height: 38,
                                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                                color: "#ffffff",
                                                boxShadow: "0 0 16px rgba(99,102,241,0.3)",
                                            }}
                                            title="View Profile"
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </Link>
                                </div>
                                <Link href="/sign-out">
                                    <button
                                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-black/5"
                                        style={{ color: "#334155", border: "1px solid rgba(0,0,0,0.03)" }}
                                    >
                                        Logout
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in">
                                    <button
                                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-black/5"
                                        style={{ color: "#0f172a" }}
                                    >
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/sign-up">
                                    <button
                                        className="px-5 py-2 text-sm font-bold rounded-xl transition-all hover:opacity-90"
                                        style={{
                                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                            color: "#ffffff",
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
                        style={{ color: "#334155" }}
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
                                style={{ color: "#334155" }}
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
                                style={{ color: "#0f172a" }}
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
                                    <button className="w-full py-2.5 text-sm font-semibold rounded-xl border" style={{ color: "#1e293b", borderColor: "rgba(99,102,241,0.3)" }}>
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/sign-up" className="flex-1">
                                    <button className="w-full py-2.5 text-sm font-bold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
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
