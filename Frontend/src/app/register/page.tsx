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
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError("");

    try {
      // 1. Sign up user with Supabase Auth
      try {
        await signUp(email, password);
      } catch (authError: any) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      // Get the user to ensure we have the ID (might be null if email confirmation is required)
      // For a smoother dev experience, we might want to handle the session check
      const { data: { session } } = await supabase.auth.getSession();

      // If email confirmation is enabled, we might not have a session yet. 
      // In this case, we can't save the profile yet effectively without the user_id.
      // However, if we assume auto-confirm or we want to prompt for email check:
      if (!session) {
        alert("Please check your email to confirm your account.");
        return;
      }

      const userId = session.user.id;

      let parsedData = null;

      // 2. If CV is uploaded, parse it
      if (cvFile) {
        const formData = new FormData();
        formData.append("cv", cvFile);

        const response = await fetch("/api/parse-cv", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          parsedData = await response.json();
        } else {
          console.error("Failed to parse CV");
        }
      }

      // 3. Save initial profile data to Supabase
      if (parsedData) {
        // Sanitize the parsed data
        const sanitizedData = {
          personal_info: {
            name: parsedData.personal_info?.name || "",
            location: parsedData.personal_info?.location || "",
            image: parsedData.personal_info?.image || "",
          },
          education: (parsedData.education || []).map((edu: any) => ({
            degree: edu?.degree || "",
            school: edu?.school || "",
            start_date: edu?.start_date || "",
            end_date: edu?.end_date || "",
          })),
          job_experience: (parsedData.job_experience || []).map((exp: any) => ({
            role: exp?.role || "",
            company: exp?.company || "",
            description: exp?.description || "",
            start_date: exp?.start_date || "",
            end_date: exp?.end_date || "",
          })),
          projects: (parsedData.projects || []).map((proj: any) => ({
            name: proj?.name || "",
            description: proj?.description || "",
            technologies: proj?.technologies || "",
          })),
          skills: parsedData.skills || "",
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            email: email,
            phone: phone,
            profile_data: sanitizedData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (profileError) throw profileError;
      } else {
        // Create empty profile if no CV
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
      }

      // Navigate to be-found page after successful registration
      router.push("/be-found");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to process registration.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col px-4 py-8">
        {/* Logo and Login Button */}
        <div className="flex justify-between items-center px-4 mb-12">
          <a href="/" className="flex items-center gap-4">
            <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
            <p className="text-2xl font-medium leading-6 tracking-base text-foreground font-cormorant">
              <span className="text-primary text-2xl font-averia font-semibold">Prometheus</span>
            </p>
          </a>
          <button
            onClick={() => router.push("/find/sign-in")}
            className="relative inline-flex items-center justify-center text-base font-semibold tracking-base shadow ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 border border-muted hover:bg-background/80 h-[42px] px-8 py-2 text-foreground"
          >
            log in
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Title */}
            <div className="text-center mb-12 -mt-16">
              <h1 className="text-8xl font-extrabold tracking-tighter text-foreground font-inter mb-4">
                be found.
              </h1>
              <p className="text-lg font-medium leading-6 tracking-base text-primary">
                Register to let opportunities come to you
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b border-muted px-0 py-3 text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-transparent border-0 border-b border-muted px-0 py-3 text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted"
                    placeholder="••••••••"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b border-muted px-0 py-3 text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Upload Your CV (Optional)
                  </label>
                  <p className="text-sm text-muted mb-3">
                    Upload your CV and we'll automatically parse your information to save you time
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="flex items-center justify-center w-full bg-background border border-muted px-6 py-3 cursor-pointer hover:border-primary hover:bg-surface/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {cvFile ? (
                          <>
                            <svg
                              className="h-8 w-8 text-primary flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div className="text-left">
                              <p className="text-foreground font-semibold">{cvFile.name}</p>
                              <p className="text-sm text-muted">Click to change file</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-8 w-8 text-muted flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <div className="text-left">
                              <p className="text-foreground font-semibold">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-muted">PDF, DOC, DOCX (max 10MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-primary text-foreground px-8 py-4 font-semibold text-lg hover:brightness-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "register & continue"
                  )}
                </button>

                <p className="text-sm text-muted text-center mt-2">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
