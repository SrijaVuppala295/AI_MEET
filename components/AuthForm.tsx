"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { auth } from "@/firebase/client";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, signUp, signInWithOAuth } from "@/lib/actions/auth.action";

type FormType = "sign-up" | "sign-in";

const AuthFormSchema = (type: FormType) =>
    z.object({
        name:
            type === "sign-up"
                ? z.string().min(3, "Name must be at least 3 characters.")
                : z.string().optional(),
        email: z.string().email("Invalid email address."),
        password: z.string().min(3, "Password must be at least 3 characters."),
    });

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const isSignIn = type === "sign-in";
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isGithubLoading, setIsGithubLoading] = useState(false);

    const formSchema = AuthFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (type === "sign-up") {
                const { name, email, password } = values;
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                });
                if (!result?.success) {
                    toast.error(result?.message || "Account creation failed.");
                    return;
                }
                const idToken = await userCredentials.user.getIdToken();
                await signIn({ email, idToken });
                toast.success("Account created successfully.");
                router.push("/");
            } else {
                const { email, password } = values;
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken();
                await signIn({ email, idToken });
                toast.success("Signed in successfully.");
                router.push("/");
            }
        } catch (error: any) {
            console.error("Authentication error:", error);
            if (error.code === "auth/email-already-in-use") {
                toast.error("Account already exists. Please sign in.");
                router.push("/sign-in");
                return;
            }
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                toast.error("Invalid email or password.");
                return;
            }
            if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format.");
                return;
            }
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            const response = await signInWithOAuth({
                idToken,
                name: user.displayName || "User",
                email: user.email || "",
                provider: "Google",
            });

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success("Signed in with Google successfully.");
            router.push("/");
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            if (error.code === "auth/popup-closed-by-user") {
                return; // User cancelled, no error needed
            }
            toast.error("Google sign-in failed. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
    }

    async function handleGithubSignIn() {
        setIsGithubLoading(true);
        try {
            const provider = new GithubAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            const response = await signInWithOAuth({
                idToken,
                name: user.displayName || user.email?.split("@")[0] || "User",
                email: user.email || "",
                provider: "GitHub",
            });

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success("Signed in with GitHub successfully.");
            router.push("/");
        } catch (error: any) {
            console.error("GitHub sign-in error:", error);
            if (error.code === "auth/popup-closed-by-user") {
                return; // User cancelled, no error needed
            }
            toast.error("GitHub sign-in failed. Please try again.");
        } finally {
            setIsGithubLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark-100">

            {/* ── Ambient glow blobs ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            {/* ── Dot-grid pattern overlay ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
            />

            {/* ── Card ── */}
            <div
                className="relative z-10 w-full max-w-[440px] mx-4"
                style={{
                    background: "linear-gradient(145deg, rgba(36,38,51,0.95) 0%, rgba(8,9,13,0.98) 100%)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: "24px",
                    boxShadow: "0 0 0 1px rgba(99,102,241,0.05), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)",
                    padding: "40px 36px 36px",
                }}
            >
                {/* Top accent line */}
                <div
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-2/3 rounded-b-full"
                    style={{ background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)" }}
                />

                {/* ── Header ── */}
                <header className="mb-8 flex flex-col items-center gap-3 text-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div
                            className="flex items-center justify-center rounded-xl"
                            style={{
                                width: 44,
                                height: 44,
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                            }}
                        >
                            <Image src="/logo.svg" alt="AI MEET logo" width={24} height={24} />
                        </div>
                        <span
                            className="text-2xl font-bold tracking-tight"
                            style={{
                                background: "linear-gradient(135deg, #e0e7ff, #c4b5fd)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            AI MEET
                        </span>
                    </Link>

                    <div className="mt-1">
                        <h1 className="text-xl font-semibold text-white">
                            {isSignIn ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: "#6870a6" }}>
                            {isSignIn
                                ? "Sign in to continue your interview prep"
                                : "Start practicing with AI-powered mock interviews"}
                        </p>
                    </div>
                </header>

                {/* ── Form ── */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6870a6" }}>
                                            Full Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                                className="auth-input"
                                                style={inputStyle}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" style={{ color: "#f75353" }} />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6870a6" }}>
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            type="email"
                                            {...field}
                                            style={inputStyle}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" style={{ color: "#f75353" }} />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6870a6" }}>
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="••••••••"
                                            type="password"
                                            {...field}
                                            style={inputStyle}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" style={{ color: "#f75353" }} />
                                </FormItem>
                            )}
                        />

                        {/* ── Submit ── */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full font-bold text-sm tracking-wide"
                            style={{
                                height: 48,
                                borderRadius: 12,
                                background: isLoading
                                    ? "rgba(99,102,241,0.5)"
                                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                border: "none",
                                color: "#fff",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                boxShadow: isLoading ? "none" : "0 0 24px rgba(99,102,241,0.35)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    {isSignIn ? "Signing in…" : "Creating account…"}
                                </span>
                            ) : (
                                isSignIn ? "Sign In" : "Create Account"
                            )}
                        </Button>
                    </form>
                </Form>

                {/* ── Divider ── */}
                <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-xs" style={{ color: "#4f557d" }}>or</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>

                {/* ── Social Sign-In ── */}
                <div className="flex flex-row gap-3 mb-6">
                    {/* Google */}
                    <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isGithubLoading || isLoading}
                        className="flex-1 font-semibold text-sm tracking-wide"
                        style={{
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(99,102,241,0.15)",
                            color: "#e0e7ff",
                            cursor: (isGoogleLoading || isGithubLoading || isLoading) ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        {isGoogleLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                Google
                            </>
                        )}
                    </Button>

                    {/* GitHub */}
                    <Button
                        type="button"
                        onClick={handleGithubSignIn}
                        disabled={isGoogleLoading || isGithubLoading || isLoading}
                        className="flex-1 font-semibold text-sm tracking-wide"
                        style={{
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(99,102,241,0.15)",
                            color: "#e0e7ff",
                            cursor: (isGoogleLoading || isGithubLoading || isLoading) ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        {isGithubLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                GitHub
                            </>
                        )}
                    </Button>
                </div>

                {/* ── Footer ── */}
                <p className="text-center text-sm" style={{ color: "#6870a6" }}>
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <Link
                        href={isSignIn ? "/sign-up" : "/sign-in"}
                        className="font-semibold transition-colors hover:text-indigo-300"
                        style={{ color: "#818cf8" }}
                    >
                        {isSignIn ? "Sign up free" : "Sign in"}
                    </Link>
                </p>

                {/* ── Trust badges ── */}
                <div className="mt-6 flex items-center justify-center gap-4">
                    {["AI-Powered", "Free to Start", "No Credit Card"].map((badge) => (
                        <span
                            key={badge}
                            className="flex items-center gap-1 text-[10px] font-medium"
                            style={{ color: "#4f557d" }}
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <circle cx="5" cy="5" r="4" stroke="#4f557d" strokeWidth="1" />
                                <path d="M3 5l1.5 1.5L7 3.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            {badge}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    height: 48,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,102,241,0.15)",
    color: "#e0e7ff",
    fontSize: 14,
    paddingLeft: 16,
    paddingRight: 16,
    transition: "border-color 0.2s, box-shadow 0.2s",
};

export default AuthForm;