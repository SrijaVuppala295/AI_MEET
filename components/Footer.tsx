"use client";

import Link from "next/image";
import Image from "next/image";
import LinkNext from "next/link";

export default function Footer() {
    return (
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
                    <LinkNext href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</LinkNext>
                    <LinkNext href="/terms" className="hover:text-indigo-400 transition-colors">Terms</LinkNext>
                    <LinkNext href="/sign-in" className="hover:text-indigo-400 transition-colors">Login</LinkNext>
                </div>
            </div>
        </footer>
    );
}
