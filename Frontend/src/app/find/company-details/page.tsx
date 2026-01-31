"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync, isAuthenticatedAsync } from "@/lib/auth";

interface CompanyDetails {
  companyName: string;
  userName: string;
  userRole: string;
  companySize: string;
  industry: string;
  description: string;
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const [details, setDetails] = useState<CompanyDetails>({
    companyName: "",
    userName: "",
    userRole: "",
    companySize: "",
    industry: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticatedAsync();
      if (!authenticated) {
        router.push("/find/sign-up");
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await getCurrentUserAsync();
      if (!user) {
        router.push("/find/sign-up");
        return;
      }

      // Save company details to Supabase using user ID
      const { error } = await supabase
        .from('company_profiles')
        .upsert({
          user_id: user.userId,
          company_name: details.companyName,
          user_name: details.userName,
          user_role: details.userRole,
          company_size: details.companySize,
          industry: details.industry,
          description: details.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Navigate to find page
      router.push("/find");
    } catch (error) {
      console.error("Error saving company details:", error);
      alert("Failed to save details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "E-commerce",
    "Education",
    "SaaS",
    "AI/ML",
    "Blockchain",
    "Clean Energy",
    "Other",
  ];

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col px-4 py-8">
        {/* Logo */}
        <div className="flex justify-start items-center px-4 mb-12">
          <a href="/" className="flex items-center gap-4">
            <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
            <p className="text-2xl font-medium leading-6 tracking-base text-foreground font-cormorant">
              <span className="text-primary text-2xl font-averia font-semibold">Prometheus</span>
            </p>
          </a>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Title */}
            <div className="text-center mb-12 -mt-16">
              <h1 className="text-5xl font-extrabold tracking-tighter text-foreground font-inter mb-4">
                tell us about your company
              </h1>
              <p className="text-lg font-medium leading-6 tracking-base text-primary">
                Help us find the perfect talent for your team
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-inter">
                  your information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={details.userName}
                      onChange={(e) => handleInputChange("userName", e.target.value)}
                      required
                      className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Role at Company *
                    </label>
                    <input
                      type="text"
                      value={details.userRole}
                      onChange={(e) => handleInputChange("userRole", e.target.value)}
                      required
                      className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="CEO, CTO, Head of Engineering..."
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-inter">
                  company details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={details.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    required
                    className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Industry *
                    </label>
                    <select
                      value={details.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      required
                      className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                    >
                      <option value="">Select industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Size *
                    </label>
                    <select
                      value={details.companySize}
                      onChange={(e) => handleInputChange("companySize", e.target.value)}
                      required
                      className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                    >
                      <option value="">Select company size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Brief Company Description
                  </label>
                  <textarea
                    value={details.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                    placeholder="Tell us about your mission, what you do, and what makes your company unique..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !details.companyName || !details.userName || !details.userRole || !details.industry}
                  className="w-full bg-primary text-foreground px-8 py-4 font-semibold text-lg hover:brightness-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
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
                      Saving...
                    </span>
                  ) : (
                    "find talent"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}