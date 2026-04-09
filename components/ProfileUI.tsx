"use client";

import { useState } from "react";
import { User, Mail, Calendar, Briefcase, BookOpen, Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

interface ProfileUIProps {
    data: {
        user: any;
        interviews: any[];
        quizzes: any[];
        prepSessions: any[];
    };
}

export default function ProfileUI({ data }: ProfileUIProps) {
    const [activeTab, setActiveTab] = useState<"interviews" | "quizzes" | "prep">("interviews");
    const { user, interviews, quizzes, prepSessions } = data;

    const stats = [
        { label: "Interviews", value: interviews.length, icon: Briefcase, color: "#6366f1" },
        { label: "Quizzes", value: quizzes.length, icon: Brain, color: "#8b5cf6" },
        { label: "Prep Sessions", value: prepSessions.length, icon: BookOpen, color: "#ec4899" },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 lg:px-8 bg-dark-100">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* --- Profile Header --- */}
                <div 
                    className="relative p-8 rounded-3xl overflow-hidden border border-black/10 shadow-2xl"
                    style={{ background: "#f8fafc" }}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <User size={120} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div 
                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-900 shadow-lg"
                            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-800 text-sm">
                                <span className="flex items-center gap-1.5"><Mail size={14}/> {user.email}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14}/> Joined {dayjs(user.createdAt).format("MMM YYYY")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-black/10">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center md:text-left">
                                <p className="text-xs font-medium text-slate-700 uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <stat.icon size={16} style={{ color: stat.color }} />
                                    <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Content Tabs --- */}
                <div className="space-y-6">
                    <div className="flex p-1 gap-1 rounded-xl bg-black/5 border border-black/10 w-fit">
                        {[
                            { id: "interviews", label: "Interviews", icon: Briefcase },
                            { id: "quizzes", label: "Quizzes", icon: Brain },
                            { id: "prep", label: "Prep Hub", icon: BookOpen },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === tab.id 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                    : "text-slate-800 hover:text-slate-900 hover:bg-black/5"
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* History Lists */}
                    <div className="space-y-4">
                        {activeTab === "interviews" && (
                            <div className="grid gap-4">
                                {interviews.length > 0 ? interviews.map((item: any) => (
                                    <Link key={item.id} href={`/interview/${item.id}`}>
                                        <div className="group flex items-center justify-between p-5 rounded-2xl bg-black/5 border border-black/10 hover:border-indigo-500/30 transition-all hover:bg-white/[0.07]">
                                            <div className="space-y-1">
                                                <h3 className="text-slate-900 font-semibold">{item.role}</h3>
                                                <p className="text-slate-700 text-xs">{dayjs(item.createdAt).format("MMM D, YYYY • h:mm A")}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                                    {item.experienceLevel || "Standard"}
                                                </span>
                                                <ChevronRight size={18} className="text-gray-800 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                )) : <EmptyState message="No interviews yet. Start your first mock interview!" link="/interview" />}
                            </div>
                        )}

                        {activeTab === "quizzes" && (
                            <div className="grid gap-4">
                                {quizzes.length > 0 ? quizzes.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/5 border border-black/10">
                                        <div className="space-y-1">
                                            <h3 className="text-slate-900 font-semibold">{item.topic || "AI Quiz"}</h3>
                                            <p className="text-slate-700 text-xs">{dayjs(item.createdAt).format("MMM D, YYYY")}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-lg font-bold text-slate-900">{item.score}%</span>
                                            <span className="text-[10px] text-slate-700 uppercase tracking-widest font-medium">Score</span>
                                        </div>
                                    </div>
                                )) : <EmptyState message="No quizzes taken yet. Challenge yourself!" link="/quiz" />}
                            </div>
                        )}

                        {activeTab === "prep" && (
                            <div className="grid gap-4">
                                {prepSessions.length > 0 ? prepSessions.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/5 border border-black/10">
                                        <div className="space-y-1">
                                            <h3 className="text-slate-900 font-semibold">{item.role || "Job Prep"}</h3>
                                            <p className="text-slate-700 text-xs">{dayjs(item.createdAt).format("MMM D, YYYY")}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-600 border border-pink-500/20">
                                                Prep Session
                                            </span>
                                        </div>
                                    </div>
                                )) : <EmptyState message="No prep hub sessions found. Get organized!" link="/prep-hub" />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message, link }: { message: string, link: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-black/10 rounded-3xl bg-white/[0.02]">
            <p className="text-slate-800 mb-6">{message}</p>
            <Link href={link}>
                <button className="px-6 py-2.5 bg-black/5 hover:bg-white hover:text-black transition-all rounded-xl font-bold text-sm">
                    Start Now
                </button>
            </Link>
        </div>
    );
}
