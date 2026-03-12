// "use client";

// import { useState, useMemo } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import companyData from "@/data/company-questions.json";
// import categoryData from "@/data/category-questions.json";

// // ── Types ─────────────────────────────────────────────────────────────────────
// interface CompanyQuestion {
//     id: number;
//     title: string;
//     difficulty: "Easy" | "Medium" | "Hard";
//     leetcode_url: string;
//     tags: string[];
// }

// interface CategoryQuestion {
//     id: string;
//     title: string;
//     difficulty: "Easy" | "Medium" | "Hard";
//     tags: string[];
//     hint: string;
// }

// type Mode = "category" | "company";
// type Difficulty = "All" | "Easy" | "Medium" | "Hard";

// // ── Constants ─────────────────────────────────────────────────────────────────
// const DIFF_CONFIG = {
//     Easy: { color: "#22d3ee", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.35)" },
//     Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)" },
//     Hard: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)" },
// };

// const CATEGORIES = [
//     { key: "frontend", label: "Frontend", icon: "🎨", color: "#a78bfa" },
//     { key: "backend", label: "Backend", icon: "⚙️", color: "#60a5fa" },
//     { key: "system_design", label: "System Design", icon: "🏗️", color: "#34d399" },
//     { key: "devops", label: "DevOps", icon: "🚀", color: "#fb923c" },
//     { key: "android", label: "Android", icon: "📱", color: "#f472b6" },
//     { key: "hr", label: "HR Round", icon: "🤝", color: "#fbbf24" },
//     { key: "aptitude", label: "Aptitude", icon: "🧮", color: "#4ade80" },
// ];

// const COMPANIES = [
//     { key: "google", label: "Google", logo: "/google.png", color: "#4285F4" },
//     { key: "amazon", label: "Amazon", logo: "/amazon.png", color: "#FF9900" },
//     { key: "microsoft", label: "Microsoft", logo: "/microsoft.png", color: "#00A4EF" },
//     { key: "meta", label: "Meta", logo: "/meta.jpg", color: "#0866FF" },
//     { key: "spotify", label: "Spotify", logo: "/spotify.png", color: "#1DB954" },
//     { key: "adobe", label: "Adobe", logo: "/adobe.jpg", color: "#FF0000" },
//     { key: "netflix", label: "Netflix", logo: "/netflix.png", color: "#E50914" },
//     { key: "uber", label: "Uber", logo: "/uber.png", color: "#000000" },
// ];

// // ── Sub-components ─────────────────────────────────────────────────────────────

// function DiffBadge({ level }: { level: "Easy" | "Medium" | "Hard" }) {
//     const cfg = DIFF_CONFIG[level];
//     return (
//         <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
//             style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
//             {level}
//         </span>
//     );
// }

// function TagChip({ label }: { label: string }) {
//     return (
//         <span className="rounded-md px-2 py-0.5 text-[11px] font-medium"
//             style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8" }}>
//             {label}
//         </span>
//     );
// }

// // ── Company Card ─────────────────────────────────────────────────────────────
// function CompanyCard({ co, active, onClick }: { co: typeof COMPANIES[0]; active: boolean; onClick: () => void }) {
//     return (
//         <button
//             onClick={onClick}
//             className="flex flex-col items-center gap-2.5 rounded-2xl p-4 transition-all duration-200 hover:scale-105"
//             style={{
//                 background: active
//                     ? `linear-gradient(135deg, ${co.color}22, ${co.color}11)`
//                     : "rgba(255,255,255,0.04)",
//                 border: `2px solid ${active ? co.color : "rgba(255,255,255,0.08)"}`,
//                 boxShadow: active ? `0 0 20px ${co.color}30` : "none",
//             }}
//         >
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden"
//                 style={{ background: "rgba(255,255,255,0.1)" }}>
//                 <Image src={co.logo} alt={co.label} width={32} height={32} className="object-contain" onError={() => { }} />
//             </div>
//             <span className="text-xs font-bold" style={{ color: active ? co.color : "#94a3b8" }}>{co.label}</span>
//         </button>
//     );
// }

// // ── Category Card ─────────────────────────────────────────────────────────────
// function CategoryCard({ cat, active, onClick }: { cat: typeof CATEGORIES[0]; active: boolean; onClick: () => void }) {
//     return (
//         <button
//             onClick={onClick}
//             className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-[1.02] w-full"
//             style={{
//                 background: active ? `${cat.color}18` : "rgba(255,255,255,0.04)",
//                 border: `1.5px solid ${active ? cat.color : "rgba(255,255,255,0.08)"}`,
//                 boxShadow: active ? `0 0 16px ${cat.color}25` : "none",
//             }}
//         >
//             <span className="text-xl">{cat.icon}</span>
//             <span className="text-sm font-semibold" style={{ color: active ? cat.color : "#94a3b8" }}>{cat.label}</span>
//             {active && (
//                 <svg className="ml-auto" width="14" height="14" viewBox="0 0 14 14" fill="none">
//                     <circle cx="7" cy="7" r="6" fill={cat.color} />
//                     <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
//                 </svg>
//             )}
//         </button>
//     );
// }

// // ── Question Row — Company (LeetCode link) ────────────────────────────────────
// function CompanyQuestionRow({ q, idx }: { q: CompanyQuestion; idx: number }) {
//     return (
//         <a
//             href={q.leetcode_url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
//             style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 textDecoration: "none",
//             }}
//             onMouseEnter={e => {
//                 const cfg = DIFF_CONFIG[q.difficulty];
//                 (e.currentTarget as HTMLAnchorElement).style.borderColor = cfg.border;
//                 (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 24px ${cfg.color}15`;
//             }}
//             onMouseLeave={e => {
//                 (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
//                 (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
//             }}
//         >
//             {/* Number */}
//             <span className="w-8 text-xs font-bold text-center flex-shrink-0" style={{ color: "#475569" }}>
//                 {String(idx + 1).padStart(2, "0")}
//             </span>

//             {/* LeetCode # */}
//             <span className="w-10 text-xs font-mono flex-shrink-0" style={{ color: "#475569" }}>
//                 #{q.id}
//             </span>

//             {/* Title */}
//             <span className="flex-1 text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
//                 {q.title}
//             </span>

//             {/* Tags */}
//             <div className="hidden md:flex gap-1.5 flex-wrap max-w-[200px]">
//                 {q.tags.slice(0, 2).map(t => <TagChip key={t} label={t} />)}
//             </div>

//             {/* Difficulty */}
//             <div className="flex-shrink-0">
//                 <DiffBadge level={q.difficulty} />
//             </div>

//             {/* LeetCode icon */}
//             <div className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
//                 style={{ color: "#f59e0b" }}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                     <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
//                 </svg>
//             </div>
//         </a>
//     );
// }

// // ── Question Row — Category (expandable hint) ─────────────────────────────────
// function CategoryQuestionRow({ q, idx, accentColor }: { q: CategoryQuestion; idx: number; accentColor: string }) {
//     const [open, setOpen] = useState(false);

//     return (
//         <div
//             className="rounded-2xl overflow-hidden transition-all duration-200"
//             style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: `1px solid ${open ? accentColor + "50" : "rgba(255,255,255,0.07)"}`,
//                 boxShadow: open ? `0 4px 24px ${accentColor}15` : "none",
//             }}
//         >
//             <button
//                 onClick={() => setOpen(!open)}
//                 className="w-full flex items-center gap-4 px-5 py-4 text-left"
//             >
//                 <span className="w-8 text-xs font-bold text-center flex-shrink-0" style={{ color: "#475569" }}>
//                     {String(idx + 1).padStart(2, "0")}
//                 </span>
//                 <span className="flex-1 text-sm font-semibold text-white">{q.title}</span>
//                 <div className="hidden md:flex gap-1.5 flex-wrap max-w-[200px]">
//                     {q.tags.slice(0, 2).map(t => <TagChip key={t} label={t} />)}
//                 </div>
//                 <div className="flex-shrink-0"><DiffBadge level={q.difficulty} /></div>
//                 <svg
//                     width="16" height="16" viewBox="0 0 16 16" fill="none"
//                     className="flex-shrink-0 transition-transform duration-200"
//                     style={{
//                         transform: open ? "rotate(180deg)" : "rotate(0deg)",
//                         color: open ? accentColor : "#475569",
//                     }}
//                 >
//                     <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                 </svg>
//             </button>

//             {open && (
//                 <div className="px-5 pb-5">
//                     <div className="h-px mb-4" style={{ background: `${accentColor}30` }} />
//                     <div className="flex gap-3 rounded-xl p-4"
//                         style={{ background: `${accentColor}0c`, border: `1px solid ${accentColor}20` }}>
//                         <span className="text-lg flex-shrink-0">💡</span>
//                         <div>
//                             <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>Hint</p>
//                             <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{q.hint}</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-2 mt-3 flex-wrap">
//                         {q.tags.map(t => <TagChip key={t} label={t} />)}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // ── Header ────────────────────────────────────────────────────────────────────
// function Header() {
//     return (
//         <header
//             className="sticky top-0 z-40"
//             style={{
//                 background: "rgba(8,9,13,0.92)",
//                 borderBottom: "1px solid rgba(255,255,255,0.07)",
//                 backdropFilter: "blur(20px)",
//             }}
//         >
//             <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
//                 <Link href="/" className="flex items-center gap-2.5">
//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl"
//                         style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 16px rgba(99,102,241,0.4)" }}>
//                         <Image src="/logo.svg" alt="AI MEET" width={20} height={20} />
//                     </div>
//                     <span className="text-lg font-bold"
//                         style={{ background: "linear-gradient(135deg, #e0e7ff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//                         AI MEET
//                     </span>
//                 </Link>

//                 <nav className="hidden md:flex items-center gap-1">
//                     {[
//                         { href: "/interview", label: "AI Interview" },
//                         { href: "/prep-hub", label: "Prep Hub" },
//                         { href: "/quiz", label: "Quiz" },
//                         { href: "/questions", label: "Questions", active: true },
//                     ].map(item => (
//                         <Link key={item.href} href={item.href}
//                             className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                             style={{
//                                 background: item.active ? "rgba(99,102,241,0.15)" : "transparent",
//                                 color: item.active ? "#a5b4fc" : "#64748b",
//                                 border: item.active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
//                             }}>
//                             {item.label}
//                         </Link>
//                     ))}
//                 </nav>

//                 {/* <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
//                     style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff" }}>
//                     P
//                 </div> */}
//             </div>
//         </header>
//     );
// }

// // ── Footer ────────────────────────────────────────────────────────────────────
// function Footer() {
//     return (
//         <footer className="mt-24 border-t px-6 py-10"
//             style={{ borderColor: "rgba(255,255,255,0.06)" }}>
//             <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
//                 <div className="flex items-center gap-2">
//                     <div className="flex h-7 w-7 items-center justify-center rounded-lg"
//                         style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
//                         <Image src="/logo.svg" alt="AI MEET" width={14} height={14} />
//                     </div>
//                     <span className="font-bold text-sm text-white">AI MEET</span>
//                 </div>
//                 <p className="text-xs" style={{ color: "#334155" }}>
//                     © {new Date().getFullYear()} AI MEET · Questions sourced from LeetCode company tags.
//                 </p>
//                 <div className="flex gap-5 text-xs" style={{ color: "#334155" }}>
//                     <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
//                     <Link href="/interview" className="hover:text-indigo-400 transition-colors">Interview</Link>
//                     <Link href="/quiz" className="hover:text-indigo-400 transition-colors">Quiz</Link>
//                 </div>
//             </div>
//         </footer>
//     );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function QuestionsPage() {
//     const [mode, setMode] = useState<Mode>("category");
//     const [selectedCategory, setCategory] = useState(CATEGORIES[0].key);
//     const [selectedCompany, setCompany] = useState(COMPANIES[0].key);
//     const [difficulty, setDiff] = useState<Difficulty>("All");
//     const [search, setSearch] = useState("");

//     const activeCategoryMeta = CATEGORIES.find(c => c.key === selectedCategory)!;
//     const activeCompanyMeta = COMPANIES.find(c => c.key === selectedCompany)!;

//     // Raw questions depending on mode
//     const rawCategoryQs = useMemo<CategoryQuestion[]>(() =>
//         (categoryData.categories as any)[selectedCategory] || [],
//         [selectedCategory]
//     );

//     const rawCompanyQs = useMemo<CompanyQuestion[]>(() =>
//         (companyData.companies as any)[selectedCompany] || [],
//         [selectedCompany]
//     );

//     // Filtered
//     const filteredCategory = useMemo(() =>
//         rawCategoryQs.filter(q => {
//             const matchD = difficulty === "All" || q.difficulty === difficulty;
//             const matchS = !search || q.title.toLowerCase().includes(search.toLowerCase()) ||
//                 q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
//             return matchD && matchS;
//         }),
//         [rawCategoryQs, difficulty, search]
//     );

//     const filteredCompany = useMemo(() =>
//         rawCompanyQs.filter(q => {
//             const matchD = difficulty === "All" || q.difficulty === difficulty;
//             const matchS = !search || q.title.toLowerCase().includes(search.toLowerCase()) ||
//                 q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
//             return matchD && matchS;
//         }),
//         [rawCompanyQs, difficulty, search]
//     );

//     const totalQuestions = mode === "category" ? filteredCategory.length : filteredCompany.length;

//     const diffCounts = useMemo(() => {
//         const src = mode === "category" ? filteredCategory : filteredCompany;
//         return {
//             Easy: src.filter(q => q.difficulty === "Easy").length,
//             Medium: src.filter(q => q.difficulty === "Medium").length,
//             Hard: src.filter(q => q.difficulty === "Hard").length,
//         };
//     }, [mode, filteredCategory, filteredCompany]);

//     return (
//         <div style={{ background: "#08090d", minHeight: "100vh", color: "#fff" }}>
//             <Header />

//             <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

//                 {/* ── Page Title ── */}
//                 <div className="text-center mb-12">
//                     <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-4"
//                         style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}>
//                         <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
//                         1000+ Curated Questions
//                     </div>
//                     <h1 className="text-5xl font-extrabold mb-4"
//                         style={{
//                             background: "linear-gradient(135deg, #fff 0%, #22d3ee 50%, #818cf8 100%)",
//                             WebkitBackgroundClip: "text",
//                             WebkitTextFillColor: "transparent",
//                         }}>
//                         Interview Questions
//                     </h1>
//                     <p className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
//                         Browse company-specific LeetCode problems and category-wise interview questions with hints.
//                         Filter by difficulty and search instantly.
//                     </p>
//                 </div>

//                 {/* ── Mode Toggle ── */}
//                 <div className="flex justify-center mb-10">
//                     <div className="inline-flex rounded-2xl p-1"
//                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
//                         {(["category", "company"] as Mode[]).map(m => (
//                             <button
//                                 key={m}
//                                 onClick={() => { setMode(m); setSearch(""); setDiff("All"); }}
//                                 className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
//                                 style={{
//                                     background: mode === m ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
//                                     color: mode === m ? "#fff" : "#64748b",
//                                     boxShadow: mode === m ? "0 0 20px rgba(99,102,241,0.3)" : "none",
//                                 }}
//                             >
//                                 {m === "category" ? "📚 By Category" : "🏢 By Company"}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="flex flex-col lg:flex-row gap-6">

//                     {/* ── Sidebar ── */}
//                     <aside className="lg:w-56 flex-shrink-0">
//                         <div className="rounded-2xl p-4 sticky top-24"
//                             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
//                             <p className="text-xs font-bold uppercase tracking-widest mb-4"
//                                 style={{ color: "#475569" }}>
//                                 {mode === "category" ? "Categories" : "Companies"}
//                             </p>

//                             {mode === "category" ? (
//                                 <div className="flex flex-col gap-2">
//                                     {CATEGORIES.map(cat => (
//                                         <CategoryCard
//                                             key={cat.key}
//                                             cat={cat}
//                                             active={selectedCategory === cat.key}
//                                             onClick={() => { setCategory(cat.key); setSearch(""); setDiff("All"); }}
//                                         />
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {COMPANIES.map(co => (
//                                         <CompanyCard
//                                             key={co.key}
//                                             co={co}
//                                             active={selectedCompany === co.key}
//                                             onClick={() => { setCompany(co.key); setSearch(""); setDiff("All"); }}
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </aside>

//                     {/* ── Main Panel ── */}
//                     <div className="flex-1 min-w-0">

//                         {/* Active context banner */}
//                         <div className="flex items-center gap-3 mb-5 rounded-2xl px-5 py-3"
//                             style={{
//                                 background: mode === "category"
//                                     ? `${activeCategoryMeta.color}10`
//                                     : `${activeCompanyMeta.color}10`,
//                                 border: `1px solid ${mode === "category" ? activeCategoryMeta.color : activeCompanyMeta.color}30`,
//                             }}>
//                             <span className="text-2xl">
//                                 {mode === "category" ? activeCategoryMeta.icon : "🏢"}
//                             </span>
//                             <div className="flex-1">
//                                 <p className="text-sm font-bold text-white">
//                                     {mode === "category" ? activeCategoryMeta.label : activeCompanyMeta.label}
//                                     {mode === "company" && " · LeetCode Questions"}
//                                 </p>
//                                 <p className="text-xs" style={{ color: "#64748b" }}>
//                                     {totalQuestions} questions
//                                     {mode === "company" && " · Click any question to open on LeetCode ↗"}
//                                 </p>
//                             </div>
//                             {/* Diff breakdown */}
//                             <div className="hidden sm:flex items-center gap-3">
//                                 {(["Easy", "Medium", "Hard"] as Difficulty[]).filter(d => d !== "All").map(d => (
//                                     <div key={d} className="flex items-center gap-1">
//                                         <span className="h-2 w-2 rounded-full" style={{ background: DIFF_CONFIG[d].color }} />
//                                         <span className="text-xs font-medium" style={{ color: DIFF_CONFIG[d].color }}>
//                                             {diffCounts[d]}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Search + Difficulty Filters */}
//                         <div className="flex flex-col sm:flex-row gap-3 mb-5">
//                             {/* Search */}
//                             <div className="relative flex-1">
//                                 <svg className="absolute left-4 top-1/2 -translate-y-1/2 flex-shrink-0"
//                                     width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                     <circle cx="7" cy="7" r="5" stroke="#475569" strokeWidth="1.5" />
//                                     <path d="M11 11l3 3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
//                                 </svg>
//                                 <input
//                                     type="text"
//                                     placeholder="Search questions or tags..."
//                                     value={search}
//                                     onChange={e => setSearch(e.target.value)}
//                                     className="w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white outline-none"
//                                     style={{
//                                         background: "rgba(255,255,255,0.05)",
//                                         border: "1px solid rgba(255,255,255,0.1)",
//                                         transition: "border-color 0.2s",
//                                     }}
//                                     onFocus={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
//                                     onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
//                                 />
//                                 {search && (
//                                     <button className="absolute right-4 top-1/2 -translate-y-1/2"
//                                         style={{ color: "#475569" }} onClick={() => setSearch("")}>
//                                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                                             <path d="M3 3l8 8M3 11l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                                         </svg>
//                                     </button>
//                                 )}
//                             </div>

//                             {/* Difficulty filter */}
//                             <div className="flex gap-2">
//                                 {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map(d => {
//                                     const cfg = d !== "All" ? DIFF_CONFIG[d] : null;
//                                     return (
//                                         <button
//                                             key={d}
//                                             onClick={() => setDiff(d)}
//                                             className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
//                                             style={{
//                                                 background: difficulty === d
//                                                     ? (cfg ? cfg.bg : "rgba(99,102,241,0.2)")
//                                                     : "rgba(255,255,255,0.04)",
//                                                 border: `1px solid ${difficulty === d
//                                                     ? (cfg ? cfg.border : "rgba(99,102,241,0.5)")
//                                                     : "rgba(255,255,255,0.08)"}`,
//                                                 color: difficulty === d
//                                                     ? (cfg ? cfg.color : "#a5b4fc")
//                                                     : "#64748b",
//                                             }}
//                                         >
//                                             {d}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         {/* Results count */}
//                         <div className="flex items-center justify-between mb-4">
//                             <p className="text-xs" style={{ color: "#475569" }}>
//                                 Showing <span className="font-bold text-white">{totalQuestions}</span> questions
//                                 {search && <> matching <span className="font-bold" style={{ color: "#22d3ee" }}>"{search}"</span></>}
//                             </p>
//                             {search && (
//                                 <button onClick={() => setSearch("")}
//                                     className="text-xs font-medium hover:text-white transition-colors"
//                                     style={{ color: "#475569" }}>
//                                     Clear search ×
//                                 </button>
//                             )}
//                         </div>

//                         {/* Questions list */}
//                         {totalQuestions === 0 ? (
//                             <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
//                                 style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
//                                 <span className="text-5xl mb-4">🔍</span>
//                                 <p className="text-base font-semibold text-white mb-1">No questions found</p>
//                                 <p className="text-sm" style={{ color: "#475569" }}>
//                                     Try different filters or clear the search
//                                 </p>
//                             </div>
//                         ) : mode === "company" ? (
//                             <div className="flex flex-col gap-2">
//                                 {filteredCompany.map((q, i) => (
//                                     <CompanyQuestionRow key={q.id} q={q} idx={i} />
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="flex flex-col gap-2">
//                                 {filteredCategory.map((q, i) => (
//                                     <CategoryQuestionRow
//                                         key={q.id}
//                                         q={q}
//                                         idx={i}
//                                         accentColor={activeCategoryMeta.color}
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </main>

//             <Footer />
//         </div>
//     );
// }


"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import companyData from "@/data/company-questions.json";
import categoryData from "@/data/category-questions.json";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─────────────────────────────────────────────
   TYPES & CONFIG
───────────────────────────────────────────── */
type Diff = "Easy" | "Medium" | "Hard";
type Mode = "category" | "company";

interface CompanyQ { id: number; title: string; difficulty: Diff; leetcode_url: string; tags: string[]; }
interface CategoryQ { id: string; title: string; difficulty: Diff; tags: string[]; hint: string; }

const DIFF_STYLE: Record<Diff, { color: string; bg: string }> = {
    Easy: { color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
    Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    Hard: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const CATEGORIES = [
    { key: "frontend", label: "Frontend", accent: "#818cf8" },
    { key: "backend", label: "Backend", accent: "#38bdf8" },
    { key: "system_design", label: "System Design", accent: "#34d399" },
    { key: "devops", label: "DevOps", accent: "#fb923c" },
    { key: "android", label: "Android", accent: "#e879f9" },
    { key: "hr", label: "HR Round", accent: "#fbbf24" },
    { key: "aptitude", label: "Aptitude", accent: "#4ade80" },
];

const COMPANIES = [
    { key: "google", label: "Google", logo: "/google.png", accent: "#4285F4" },
    { key: "amazon", label: "Amazon", logo: "/amazon.png", accent: "#FF9900" },
    { key: "microsoft", label: "Microsoft", logo: "/microsoft.png", accent: "#00A4EF" },
    { key: "meta", label: "Meta", logo: "/facebook.png", accent: "#0866FF" },
    { key: "spotify", label: "Spotify", logo: "/spotify.png", accent: "#1DB954" },
    { key: "adobe", label: "Adobe", logo: "/adobe.png", accent: "#FF0000" },
    { key: "netflix", label: "Netflix", logo: "/netflix.png", accent: "#E50914" },
    { key: "uber", label: "Uber", logo: "/uber.png", accent: "#09091A" },
];

/* ─────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────── */
function DiffBadge({ level }: { level: Diff }) {
    const s = DIFF_STYLE[level];
    return (
        <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold flex-shrink-0"
            style={{ background: s.bg, color: s.color }}
        >
            {level}
        </span>
    );
}

function TagPill({ label }: { label: string }) {
    return (
        <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}
        >
            {label}
        </span>
    );
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
function Header() {
    return (
        <header
            className="sticky top-0 z-40 border-b"
            style={{
                background: "rgba(8,9,13,0.95)",
                borderColor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
            }}
        >
            <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                            boxShadow: "0 0 14px rgba(99,102,241,0.35)",
                        }}
                    >
                        <Image src="/logo.svg" alt="AI MEET" width={18} height={18} />
                    </div>
                    <span
                        className="text-base font-bold tracking-tight"
                        style={{
                            background: "linear-gradient(135deg,#e0e7ff,#c4b5fd)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        AI MEET
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-0.5">
                    {[
                        { href: "/interview", label: "AI Interview" },
                        { href: "/prep-hub", label: "Prep Hub" },
                        { href: "/quiz", label: "Quiz" },
                        { href: "/questions", label: "Questions", active: true },
                    ].map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                            style={{
                                background: n.active ? "rgba(99,102,241,0.14)" : "transparent",
                                color: n.active ? "#a5b4fc" : "#4b5563",
                                border: n.active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                            }}
                        >
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <Link href="/profile">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold select-none cursor-pointer"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff" }}
                    >
                        U
                    </div>
                </Link>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="mt-20 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                        <Image src="/logo.svg" alt="AI MEET" width={12} height={12} />
                    </div>
                    <span className="text-sm font-bold text-white">AI MEET</span>
                </div>
                <p className="text-xs" style={{ color: "#334155" }}>
                    Company problems sourced from LeetCode tags · Category questions curated by AI MEET
                </p>
                <div className="flex gap-5">
                    {[{ href: "/", label: "Home" }, { href: "/interview", label: "Interview" }, { href: "/quiz", label: "Quiz" }].map((l) => (
                        <Link key={l.href} href={l.href} className="text-xs transition-colors hover:text-slate-300" style={{ color: "#334155" }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   COMPANY QUESTION ROW
───────────────────────────────────────────── */
function CompanyRow({ q, idx }: { q: CompanyQ; idx: number }) {
    const s = DIFF_STYLE[q.difficulty];
    return (
        <a
            href={q.leetcode_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl px-5 py-3.5 transition-all duration-150 no-underline"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = `${s.color}40`;
                el.style.background = `${s.color}05`;
                el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(255,255,255,0.06)";
                el.style.background = "rgba(255,255,255,0.025)";
                el.style.transform = "translateY(0)";
            }}
        >
            {/* Index */}
            <span className="w-7 text-xs font-mono font-bold text-center flex-shrink-0" style={{ color: "#334155" }}>
                {String(idx + 1).padStart(2, "0")}
            </span>
            {/* LC ID */}
            <span className="w-10 text-[11px] font-mono flex-shrink-0" style={{ color: "#334155" }}>
                #{q.id}
            </span>
            {/* Title */}
            <span className="flex-1 text-sm font-medium text-white group-hover:text-cyan-300 transition-colors truncate min-w-0">
                {q.title}
            </span>
            {/* Tags */}
            <div className="hidden lg:flex gap-1.5 flex-shrink-0">
                {q.tags.slice(0, 2).map((t) => <TagPill key={t} label={t} />)}
            </div>
            {/* Diff */}
            <DiffBadge level={q.difficulty} />
            {/* External link icon */}
            <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity"
                style={{ color: "#64748b" }}
            >
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </a>
    );
}

/* ─────────────────────────────────────────────
   CATEGORY QUESTION ROW
───────────────────────────────────────────── */
function CategoryRow({ q, idx, accent }: { q: CategoryQ; idx: number; accent: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="rounded-xl overflow-hidden transition-all duration-150"
            style={{
                background: open ? `${accent}08` : "rgba(255,255,255,0.025)",
                border: `1px solid ${open ? `${accent}40` : "rgba(255,255,255,0.06)"}`,
            }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left"
            >
                <span className="w-7 text-xs font-mono font-bold text-center flex-shrink-0" style={{ color: "#334155" }}>
                    {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium text-white min-w-0 pr-2">{q.title}</span>
                <div className="hidden lg:flex gap-1.5 flex-shrink-0">
                    {q.tags.slice(0, 2).map((t) => <TagPill key={t} label={t} />)}
                </div>
                <DiffBadge level={q.difficulty} />
                {/* Chevron */}
                <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: open ? accent : "#334155" }}
                >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div className="px-5 pb-5">
                    <div className="h-px mb-4" style={{ background: `${accent}25` }} />
                    <div
                        className="rounded-xl p-4"
                        style={{ background: `${accent}0b`, border: `1px solid ${accent}20` }}
                    >
                        <p
                            className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5"
                            style={{ color: accent }}
                        >
                            Approach Hint
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{q.hint}</p>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                        {q.tags.map((t) => <TagPill key={t} label={t} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   SIDEBAR NAV ITEM
───────────────────────────────────────────── */
function SideNavItem({
    label, accent, active, onClick,
}: {
    label: string; accent: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150"
            style={{
                background: active ? `${accent}14` : "transparent",
                border: `1px solid ${active ? `${accent}30` : "transparent"}`,
            }}
        >
            <span className="text-sm font-medium" style={{ color: active ? accent : "#64748b" }}>
                {label}
            </span>
            {active && (
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
            )}
        </button>
    );
}

/* ─────────────────────────────────────────────
   COMPANY SIDEBAR ITEM
───────────────────────────────────────────── */
function CompanyNavItem({
    co, active, onClick,
}: {
    co: typeof COMPANIES[0]; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
            style={{
                background: active ? `${co.accent}12` : "transparent",
                border: `1px solid ${active ? `${co.accent}28` : "transparent"}`,
            }}
        >
            <div
                className="h-6 w-6 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
            >
                <Image
                    src={co.logo} alt={co.label} width={16} height={16}
                    className="object-contain"
                    onError={() => { }}
                />
            </div>
            <span className="text-sm font-medium" style={{ color: active ? "#e2e8f0" : "#64748b" }}>
                {co.label}
            </span>
        </button>
    );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function QuestionsPage() {
    const [mode, setMode] = useState<Mode>("category");
    const [selCat, setSelCat] = useState(CATEGORIES[0].key);
    const [selCo, setSelCo] = useState(COMPANIES[0].key);
    const [diff, setDiff] = useState<"All" | Diff>("All");
    const [search, setSearch] = useState("");

    const activeCat = CATEGORIES.find((c) => c.key === selCat)!;
    const activeCo = COMPANIES.find((c) => c.key === selCo)!;

    const rawCatQs = useMemo<CategoryQ[]>(
        () => (categoryData.categories as any)[selCat] || [],
        [selCat],
    );
    const rawCoQs = useMemo<CompanyQ[]>(
        () => (companyData.companies as any)[selCo] || [],
        [selCo],
    );

    function filter<T extends { difficulty: Diff; title: string; tags: string[] }>(arr: T[]) {
        return arr.filter((q) => {
            const dOk = diff === "All" || q.difficulty === diff;
            const sOk =
                !search ||
                q.title.toLowerCase().includes(search.toLowerCase()) ||
                q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
            return dOk && sOk;
        });
    }

    const filtCat = useMemo(() => filter(rawCatQs), [rawCatQs, diff, search]);
    const filtCo = useMemo(() => filter(rawCoQs), [rawCoQs, diff, search]);
    const total = mode === "category" ? filtCat.length : filtCo.length;

    const counts = useMemo(() => {
        const src = mode === "category" ? filtCat : filtCo;
        return {
            Easy: src.filter((q) => q.difficulty === "Easy").length,
            Medium: src.filter((q) => q.difficulty === "Medium").length,
            Hard: src.filter((q) => q.difficulty === "Hard").length,
        };
    }, [mode, filtCat, filtCo]);

    return (
        <div style={{ background: "#08090d", minHeight: "100vh", color: "#fff" }}>
            <Header />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">

                {/* ── Page heading ── */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] mb-5"
                        style={{
                            background: "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.22)",
                            color: "#818cf8",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#6366f1" }} />
                        Curated Question Bank
                    </div>
                    <h1
                        className="text-5xl font-extrabold tracking-tight mb-4"
                        style={{
                            background: "linear-gradient(140deg, #f8fafc 30%, #94a3b8 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Interview Questions
                    </h1>
                    <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#475569" }}>
                        Company-tagged LeetCode problems and category-specific questions with guided hints.
                        Filter by topic, company, and difficulty.
                    </p>
                </div>

                {/* ── Mode Toggle ── */}
                <div className="flex justify-center mb-10">
                    <div
                        className="inline-flex rounded-xl p-1"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        {(["category", "company"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setSearch(""); setDiff("All"); }}
                                className="px-7 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: mode === m ? "rgba(99,102,241,0.18)" : "transparent",
                                    color: mode === m ? "#a5b4fc" : "#475569",
                                    border: mode === m ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
                                    boxShadow: mode === m ? "0 0 16px rgba(99,102,241,0.12)" : "none",
                                }}
                            >
                                {m === "category" ? "By Category" : "By Company"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Sidebar ── */}
                    <aside className="lg:w-52 flex-shrink-0">
                        <div
                            className="rounded-2xl p-3 sticky top-20"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <p
                                className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.1em]"
                                style={{ color: "#334155" }}
                            >
                                {mode === "category" ? "Categories" : "Companies"}
                            </p>

                            <div className="space-y-0.5">
                                {mode === "category"
                                    ? CATEGORIES.map((cat) => (
                                        <SideNavItem
                                            key={cat.key}
                                            label={cat.label}
                                            accent={cat.accent}
                                            active={selCat === cat.key}
                                            onClick={() => { setSelCat(cat.key); setSearch(""); setDiff("All"); }}
                                        />
                                    ))
                                    : COMPANIES.map((co) => (
                                        <CompanyNavItem
                                            key={co.key}
                                            co={co}
                                            active={selCo === co.key}
                                            onClick={() => { setSelCo(co.key); setSearch(""); setDiff("All"); }}
                                        />
                                    ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Main panel ── */}
                    <div className="flex-1 min-w-0">

                        {/* Context strip */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 mb-4"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: `1px solid ${mode === "category" ? `${activeCat.accent}28` : `${activeCo.accent}28`
                                    }`,
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                {mode === "company" && (
                                    <div
                                        className="h-7 w-7 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0"
                                        style={{ background: "rgba(255,255,255,0.08)" }}
                                    >
                                        <Image
                                            src={activeCo.logo} alt={activeCo.label} width={18} height={18}
                                            className="object-contain" onError={() => { }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-semibold text-white">
                                        {mode === "category" ? activeCat.label : activeCo.label}
                                    </span>
                                    {mode === "company" && (
                                        <span className="text-xs ml-2" style={{ color: "#475569" }}>
                                            · Opens on LeetCode
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {(["Easy", "Medium", "Hard"] as Diff[]).map((d) => (
                                    <div key={d} className="flex items-center gap-1.5">
                                        <span
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{ background: DIFF_STYLE[d].color }}
                                        />
                                        <span className="text-xs font-medium" style={{ color: DIFF_STYLE[d].color }}>
                                            {counts[d]}
                                        </span>
                                    </div>
                                ))}
                                <Separator
                                    orientation="vertical"
                                    className="h-4"
                                    style={{ background: "rgba(255,255,255,0.07)" }}
                                />
                                <span className="text-xs font-bold text-white">{total}</span>
                            </div>
                        </div>

                        {/* Search + filter row */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    width="15" height="15" viewBox="0 0 15 15" fill="none"
                                >
                                    <circle cx="6.5" cy="6.5" r="5" stroke="#475569" strokeWidth="1.4" />
                                    <path d="M10 10l3.5 3.5" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <Input
                                    placeholder="Search questions or topics…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 pl-9 pr-9 rounded-xl text-sm border-0 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-indigo-500/50"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                                        style={{ color: "#475569" }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <path d="M2 2l9 9M2 11l9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Difficulty pills */}
                            <div className="flex gap-1.5">
                                {(["All", "Easy", "Medium", "Hard"] as const).map((d) => {
                                    const s = d !== "All" ? DIFF_STYLE[d] : null;
                                    const active = diff === d;
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => setDiff(d)}
                                            className="h-10 px-3.5 rounded-xl text-xs font-bold transition-all duration-150"
                                            style={{
                                                background: active
                                                    ? (s ? s.bg : "rgba(99,102,241,0.15)")
                                                    : "rgba(255,255,255,0.04)",
                                                color: active ? (s ? s.color : "#818cf8") : "#475569",
                                                border: `1px solid ${active
                                                    ? (s ? `${s.color}50` : "rgba(99,102,241,0.4)")
                                                    : "rgba(255,255,255,0.07)"
                                                    }`,
                                            }}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Result count */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <p className="text-xs" style={{ color: "#334155" }}>
                                <span className="font-semibold text-white">{total}</span> questions
                                {search && (
                                    <>
                                        {" matching "}
                                        <span className="font-semibold" style={{ color: "#818cf8" }}>
                                            "{search}"
                                        </span>
                                    </>
                                )}
                            </p>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="text-xs transition-colors hover:text-white"
                                    style={{ color: "#334155" }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Empty state */}
                        {total === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center py-20 rounded-2xl"
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px dashed rgba(255,255,255,0.06)",
                                }}
                            >
                                <svg
                                    width="44" height="44" viewBox="0 0 44 44" fill="none"
                                    className="mb-4 opacity-20"
                                >
                                    <circle cx="20" cy="20" r="14" stroke="#94a3b8" strokeWidth="2" />
                                    <path d="M30 30l10 10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M16 20h8M20 16v8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <p className="text-sm font-semibold text-white mb-1">No questions found</p>
                                <p className="text-xs" style={{ color: "#475569" }}>
                                    Adjust your filters or clear the search
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {mode === "company"
                                    ? filtCo.map((q, i) => <CompanyRow key={q.id} q={q} idx={i} />)
                                    : filtCat.map((q, i) => (
                                        <CategoryRow
                                            key={q.id} q={q} idx={i}
                                            accent={activeCat.accent}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}