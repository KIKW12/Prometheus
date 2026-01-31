"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
      // Redirect to company details after a brief moment
      setTimeout(() => {
        router.push("/find/company-details");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex w-full flex-1 flex-col min-h-screen relative overflow-hidden bg-background items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="glass-card p-12 max-w-md w-full text-center relative z-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/50">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4 font-fjalla uppercase">Check your email</h1>
          <p className="text-muted/80 mb-6 font-inter">
            We've sent a confirmation link to <strong className="text-primary">{email}</strong>
          </p>
          <p className="text-sm text-muted/50 font-inter uppercase tracking-widest">
            Redirecting...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen relative overflow-hidden selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="flex-1 flex flex-col px-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center py-8 animate-fade-in-down">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
              <img src="/prometheus.svg" alt="Logo" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,77,0,0.5)]" />
            </div>
            <p className="text-2xl font-medium tracking-wide text-foreground font-fjalla uppercase">
              <span className="text-primary font-bold">Prometheus</span>
            </p>
          </a>
          <a href="/find/sign-in">
            <button className="relative inline-flex items-center justify-center text-sm uppercase tracking-widest font-bold transition-all focus-visible:outline-none disabled:opacity-50 border border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary h-10 px-8 text-muted/80 hover:shadow-[0_0_20px_rgba(255,77,0,0.15)] rounded-sm font-fjalla glass">
              log in
            </button>
          </a>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-lg animate-fade-in-up delay-200">
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground font-fjalla leading-[0.85] uppercase drop-shadow-2xl mb-4">
                find talent.
              </h1>
              <p className="text-lg font-light tracking-wide text-muted/80 font-inter">
                Join our network. Discover the perfect match.
              </p>
            </div>

            {/* Glass Card Form */}
            <div className="glass-card p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded text-sm font-inter">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="group/input">
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted/60 mb-2 group-focus-within/input:text-primary transition-colors font-fjalla">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="you@company.com"
                  />
                </div>

                {/* Password */}
                <div className="group/input">
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted/60 mb-2 group-focus-within/input:text-primary transition-colors font-fjalla">
                    Password (6+ chars)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="••••••••"
                  />
                </div>

                {/* Confirm Password */}
                <div className="group/input">
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted/60 mb-2 group-focus-within/input:text-primary transition-colors font-fjalla">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="••••••••"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed font-fjalla clip-diagonal"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>

                <p className="text-xs text-muted/40 text-center font-inter mt-2">
                  Already have an account?{" "}
                  <Link href="/find/sign-in" className="text-primary hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}