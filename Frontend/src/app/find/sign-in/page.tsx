"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signIn(email, password);
            router.push("/find");
        } catch (err: any) {
            setError(err.message || "Failed to sign in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex w-full flex-1 flex-col min-h-screen bg-background">
            <div className="flex-1 flex flex-col px-4 py-8">
                {/* Logo */}
                <div className="flex justify-center items-center px-4 mb-12">
                    <a href="/" className="flex items-center gap-4">
                        <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
                        <p className="text-2xl font-medium leading-6 tracking-base text-foreground font-cormorant">
                            <span className="text-primary text-2xl font-averia font-semibold">Prometheus</span>
                        </p>
                    </a>
                </div>

                {/* Sign In Form */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-inter mb-2">
                                welcome back
                            </h1>
                            <p className="text-muted">
                                Sign in to continue to Prometheus
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                                    placeholder="you@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-foreground px-8 py-4 font-semibold text-lg hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <p className="text-center text-muted mt-6">
                            Don't have an account?{" "}
                            <Link href="/find/sign-up" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
