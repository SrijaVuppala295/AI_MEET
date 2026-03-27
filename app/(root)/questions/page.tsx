"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import companyData from "@/data/company-questions.json";
import categoryData from "@/data/category-questions.json";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Search, 
    Palette, 
    Settings, 
    Layout, 
    Rocket, 
    Smartphone, 
    Users, 
    Calculator,
    ChevronDown,
    ExternalLink,
    Lightbulb
} from "lucide-react";

/* ─────────────────────────────────────────────
   TYPES & CONFIG
───────────────────────────────────────────── */
type Diff = "Easy" | "Medium" | "Hard";
type Mode = "category" | "company";

interface CompanyQ { id: number; title: string; difficulty: Diff; leetcode_url: string; tags: string[]; }
interface CategoryQ { id: string; title: string; difficulty: Diff; tags: string[]; hint: string; }

const DIFF_STYLE: Record<Diff, { color: string; border: string; bg: string }> = {
    Easy: { color: "#22d3ee", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.1)" },
    Medium: { color: "#f59e0b", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.1)" },
    Hard: { color: "#f87171", border: "rgba(248,113,113,0.3)", bg: "rgba(248,113,113,0.1)" },
};

const CATEGORIES = [
    { key: "frontend", label: "Frontend", icon: <Palette className="h-4 w-4" />, accent: "#818cf8" },
    { key: "backend", label: "Backend", icon: <Settings className="h-4 w-4" />, accent: "#38bdf8" },
    { key: "system_design", label: "System Design", icon: <Layout className="h-4 w-4" />, accent: "#34d399" },
    { key: "devops", label: "DevOps", icon: <Rocket className="h-4 w-4" />, accent: "#fb923c" },
    { key: "android", label: "Android", icon: <Smartphone className="h-4 w-4" />, accent: "#e879f9" },
    { key: "hr", label: "HR Round", icon: <Users className="h-4 w-4" />, accent: "#fbbf24" },
    { key: "aptitude", label: "Aptitude", icon: <Calculator className="h-4 w-4" />, accent: "#4ade80" },
];

const COMPANIES = [
    { key: "google", label: "Google", logo: "/google.png", accent: "#4285F4" },
    { key: "amazon", label: "Amazon", logo: "/amazon.png", accent: "#FF9900" },
    { key: "microsoft", label: "Microsoft", logo: "/microsoft.png", accent: "#00A4EF" },
    { key: "meta", label: "Meta", logo: "/meta.jpg", accent: "#0866FF" },
    { key: "spotify", label: "Spotify", logo: "/spotify.png", accent: "#1DB954" },
    { key: "adobe", label: "Adobe", logo: "/adobe.jpg", accent: "#FF0000" },
    { key: "netflix", label: "Netflix", logo: "/netflix.png", accent: "#E50914" },
    { key: "uber", label: "Uber", logo: "/uber.png", accent: "#000000" },
];

/* ─────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────── */
function DiffBadge({ level }: { level: Diff }) {
    const s = DIFF_STYLE[level];
    return (
        <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider flex-shrink-0"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
            {level}
        </span>
    );
}

function TagPill({ label }: { label: string }) {
    return (
        <span
            className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tight"
            style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)" }}
        >
            {label}
        </span>
    );
}

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function CompanyRow({ q, idx }: { q: CompanyQ; idx: number }) {
    const s = DIFF_STYLE[q.difficulty];
    return (
        <a
            href={q.leetcode_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl px-6 py-4 transition-all duration-300 no-underline relative overflow-hidden"
            style={{ 
                background: "rgba(25,27,38,0.4)", 
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)"
            }}
        >
            <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: s.color }} />
            
            <span className="w-8 text-[11px] font-black text-center flex-shrink-0 text-slate-600">
                {String(idx + 1).padStart(2, "0")}
            </span>

            <span className="w-12 text-[10px] font-black font-mono flex-shrink-0 text-slate-500">
                #{q.id}
            </span>

            <span className="flex-1 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {q.title}
            </span>

            <div className="hidden md:flex gap-1.5 flex-wrap max-w-[180px]">
                {q.tags.slice(0, 2).map(t => <TagPill key={t} label={t} />)}
            </div>

            <DiffBadge level={q.difficulty} />

            <div className="flex-shrink-0 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1"
                style={{ color: "#f59e0b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                </svg>
            </div>
        </a>
    );
}

function CategoryRow({ q, idx, accent }: { q: CategoryQ; idx: number; accent: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{ 
                background: "rgba(25,27,38,0.4)", 
                border: `1px solid ${open ? accent + "40" : "rgba(255,255,255,0.05)"}`,
                backdropFilter: "blur(10px)",
                boxShadow: open ? `0 10px 30px ${accent}10` : "none"
            }}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-6 py-4.5 text-left transition-colors hover:bg-white/5">
                <span className="w-8 text-[11px] font-black text-center flex-shrink-0 text-slate-600">
                    {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-black text-white">{q.title}</span>
                <div className="hidden md:flex gap-1.5 flex-wrap max-w-[180px]">
                    {q.tags.slice(0, 2).map(t => <TagPill key={t} label={t} />)}
                </div>
                <DiffBadge level={q.difficulty} />
                <ChevronDown className="h-5 w-5 transition-transform duration-300" 
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: open ? accent : "#475569" }} />
            </button>
            {open && (
                <div className="px-10 pb-8 animate-slideDown">
                    <div className="h-px w-full bg-white/5 mb-6" />
                    <div className="flex gap-4 p-6 rounded-2xl relative overflow-hidden" style={{ background: `${accent}08`, border: `1px solid ${accent}40` }}>
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: accent }} />
                        <Lightbulb className="h-5 w-5" style={{ color: accent }} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: accent }}>Expert Advice</p>
                            <p className="text-sm font-bold leading-relaxed text-indigo-100">{q.hint}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function QuestionsPage() {
    const [mode, setMode] = useState<Mode>("company");
    const [selectedCat, setCat] = useState(CATEGORIES[0].key);
    const [selectedCo, setCo] = useState(COMPANIES[0].key);
    const [search, setSearch] = useState("");
    const [diff, setDiff] = useState<"All" | Diff>("All");

    const activeCat = CATEGORIES.find(c => c.key === selectedCat)!;

    const questions = useMemo(() => {
        const src = mode === "category" 
            ? ((categoryData.categories as Record<string, CategoryQ[]>)[selectedCat] || [])
            : ((companyData.companies as Record<string, CompanyQ[]>)[selectedCo] || []);
        
        return src.filter(q => {
            const matchesDiff = diff === "All" || q.difficulty === diff;
            const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || 
                q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
            return matchesDiff && matchesSearch;
        });
    }, [mode, selectedCat, selectedCo, diff, search]);

    return (
        <div className="min-h-screen pt-32 pb-20">
            <main className="mx-auto max-w-7xl px-6">
                
                {/* Header Section */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-6"
                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Industry-Standard Challenges
                    </div>
                    <h1 className="text-6xl font-black tracking-tight mb-4"
                        style={{ background: "linear-gradient(135deg, #fff 30%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Interview Matrix
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto font-medium text-indigo-300/60 leading-relaxed">
                        Master technical interviews with curated questions from top-tier companies and essential engineering domains.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                    
                    {/* Sidebar Controls */}
                    <aside className="space-y-8">
                        
                        {/* Mode Selector */}
                        <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/5">
                            <button onClick={() => setMode("company")} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === "company" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-slate-500 hover:text-white"}`}>
                                Companies
                            </button>
                            <button onClick={() => setMode("category")} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === "category" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-slate-500 hover:text-white"}`}>
                                Categories
                            </button>
                        </div>

                        {/* List Scroller */}
                        <Card style={{ background: "rgba(25,27,38,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, backdropFilter: "blur(20px)" }}>
                            <CardContent className="p-4 space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                                {mode === "company" ? (
                                    COMPANIES.map(co => (
                                        <button key={co.key} onClick={() => setCo(co.key)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCo === co.key ? "bg-white/10" : "hover:bg-white/5 opacity-40 hover:opacity-100"}`}>
                                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                                                <Image src={co.logo} alt={co.label} width={20} height={20} className="object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-white">{co.label}</span>
                                            {selectedCo === co.key && <div className="ml-auto w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />}
                                        </button>
                                    ))
                                ) : (
                                    CATEGORIES.map(cat => (
                                        <button key={cat.key} onClick={() => setCat(cat.key)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCat === cat.key ? "bg-white/10" : "hover:bg-white/5 opacity-40 hover:opacity-100"}`}>
                                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                                                {cat.icon}
                                            </div>
                                            <span className="text-xs font-bold text-white">{cat.label}</span>
                                            {selectedCat === cat.key && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: cat.accent, boxShadow: `0 0 8px ${cat.accent}` }} />}
                                        </button>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Content Area */}
                    <div className="space-y-6">
                        
                        {/* Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors h-4 w-4" />
                                <Input 
                                    placeholder="Search challenges by title or tags..." 
                                    className="h-12 border-white/5 bg-white/5 pl-12 rounded-2xl text-sm font-medium focus-visible:ring-indigo-500/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/5">
                                {["All", "Easy", "Medium", "Hard"].map((d) => (
                                    <button 
                                        key={d} 
                                        onClick={() => setDiff(d as "All" | Diff)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${diff === d ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                    Found {questions.length} Results
                                </p>
                                {search && <button onClick={() => setSearch("")} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">Clear Search</button>}
                            </div>

                            {questions.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center rounded-[3rem] bg-white/2 border border-dashed border-white/5">
                                    <div className="h-20 w-20 rounded-3xl bg-white/2 flex items-center justify-center mb-6">
                                        <Search className="h-10 w-10 text-slate-700" />
                                    </div>
                                    <p className="text-lg font-black text-white mb-2 uppercase tracking-tight">No Challenges Found</p>
                                    <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {questions.map((q, i) => (
                                        mode === "company" 
                                            ? <CompanyRow key={(q as CompanyQ).id} q={q as CompanyQ} idx={i} />
                                            : <CategoryRow key={(q as CategoryQ).id} q={q as CategoryQ} idx={i} accent={activeCat.accent} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}