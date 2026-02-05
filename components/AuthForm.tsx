"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { auth } from "@/firebase/client";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
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

import { signIn, signUp } from "@/lib/actions/auth.action";

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
        try {
            if (type === "sign-up") {
                const { name, email, password } = values;

                const userCredentials = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

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

                toast.success("Account created successfully. Please sign in.");
                router.push("/sign-in");
            } else {
                const { email, password } = values;

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

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

            if (
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password"
            ) {
                toast.error("Invalid email or password.");
                return;
            }

            if (error.code === "auth/invalid-email") {
                toast.error("Invalid email format.");
                return;
            }

            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex w-full max-w-[420px] flex-col gap-8 rounded-lg bg-gray-900 px-8 py-10 shadow-lg text-white">
                <header className="flex flex-col gap-2.5 items-center">
                    <Link href="/" className="flex items-center gap-1">
                        <Image src="/logo.svg" alt="logo" width={34} height={34} />
                        <h1 className="text-2xl font-bold">PrepWise</h1>
                    </Link>
                    <p className="text-sm text-gray-400">
                        {isSignIn
                            ? "Sign in to your account"
                            : "Practice job interviews with AI"}
                    </p>
                </header>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6"
                    >
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <FormControl>
                                            <Input id="name" placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="email">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            placeholder="example@email.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="password">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-indigo-600">
                            {isSignIn ? "Sign In" : "Sign Up"}
                        </Button>
                    </form>
                </Form>

                <footer className="flex justify-center gap-1 text-sm text-gray-400">
                    <p>{isSignIn ? "Don't have an account?" : "Already have an account?"}</p>
                    <Link
                        href={isSignIn ? "/sign-up" : "/sign-in"}
                        className="text-indigo-400"
                    >
                        {isSignIn ? "Sign up" : "Sign in"}
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default AuthForm;
