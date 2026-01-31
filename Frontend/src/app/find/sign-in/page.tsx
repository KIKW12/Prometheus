"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const data = await signIn(email, password);
            if (!data.user) throw new Error("No user found");
            setUserId(data.user.id);

            // Check if user is a candidate
            const { data: candidateData } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', data.user.id)
                .maybeSingle();

            if (candidateData) {
                router.push("/be-found");
                return;
            }

            // Check if user is a company
            const { data: companyData } = await supabase
                .from('company_profiles')
                .select('id')
                .eq('user_id', data.user.id)
                .maybeSingle();

            if (companyData) {
                router.push("/find");
                return;
            }

            // If no profile found, let user select role
            setShowRoleSelection(true);
            setIsLoading(false);

        } catch (err: any) {
            console.error("Sign in error:", err);
            setError(err.message || "Failed to sign in. Please try again.");
            setIsLoading(false);
        }
    };

    const handleRoleSelect = async (role: 'candidate' | 'company') => {
        if (!userId) return;
        setIsLoading(true);

        try {
            if (role === 'candidate') {
                // Create empty candidate profile
                const { error } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: userId,
                        email: email,
                        profile_data: {}
                    });
                if (error) throw error;
                router.push("/be-found");
            } else {
                // Create empty company profile
                const { error } = await supabase
                    .from('company_profiles')
                    .insert({
                        user_id: userId,
                        company_name: 'My Company', // Placeholder
                        user_name: '',
                        user_role: '',
                        company_size: '',
                        industry: '',
                        description: ''
                    });
                if (error) throw error;
                router.push("/find/company-details");
            }
        } catch (err: any) {
            console.error("Error creating profile:", err);
            setError("Failed to create profile. Please contact support.");
            setIsLoading(false);
        }
    };

    if (showRoleSelection) {
        return (
            <main className="flex w-full flex-1 flex-col min-h-screen bg-background items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-3xl font-extrabold tracking-tighter text-foreground font-fjalla mb-4">
                        Account Setup
                    </h1>
                    <p className="text-muted mb-8">
                        We couldn't find a detailed profile for your account. Please select your account type to continue.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleRoleSelect('candidate')}
                            disabled={isLoading}
                            className="w-full glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="text-left">
                                <h3 className="text-xl font-fjalla text-foreground">Talent</h3>
                                <p className="text-sm text-muted">I am looking for work</p>
                            </div>
                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('company')}
                            disabled={isLoading}
                            className="w-full glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="text-left">
                                <h3 className="text-xl font-fjalla text-foreground">Recruiter</h3>
                                <p className="text-sm text-muted">I am hiring talent</p>
                            </div>
                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                    </div>
                    {isLoading && <p className="mt-4 text-primary animate-pulse">Setting up your profile...</p>}
                </div>
            </main>
        );
    }

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
