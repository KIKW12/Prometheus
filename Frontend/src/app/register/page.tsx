"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Sign up user with Supabase Auth
      try {
        await signUp(email, password);
      } catch (authError: any) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      // Get the user to ensure we have the ID
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Please check your email to confirm your account.");
        return;
      }

      const userId = session.user.id;

      // 2. Create empty profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: email,
          phone: phone,
          profile_data: {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Navigate to be-found page after successful registration
      router.push("/be-found");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to process registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen relative overflow-hidden selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
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
                be found.
              </h1>
              <p className="text-lg font-light tracking-wide text-muted/80 font-inter">
                Create your profile. Let the future find you.
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="name@example.com"
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
                    minLength={6}
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="••••••••"
                  />
                </div>

                {/* Phone */}
                <div className="group/input">
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted/60 mb-2 group-focus-within/input:text-primary transition-colors font-fjalla">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-white/5 border-b border-white/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-inter placeholder:text-muted/20 rounded-t-sm"
                    placeholder="+1 (555) 000-0000"
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
                    "Create Account"
                  )}
                </button>

                <p className="text-xs text-muted/40 text-center font-inter mt-2">
                  By registering, you agree to our Terms of Service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
