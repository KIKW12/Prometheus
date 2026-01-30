"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import CompanyQuestionnaire, {
  CompanyQuestionnaireData,
} from "@/components/CompanyQuestionnaire";

interface CompanyDetails {
  companyName: string;
  userName: string;
  userRole: string;
  companySize: string;
  industry: string;
  description: string;
  cultureQuestionnaire?: CompanyQuestionnaireData;
}


export default function CompanyProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "culture" | "preview">("details");
  const [details, setDetails] = useState<CompanyDetails>({
    companyName: "",
    userName: "",
    userRole: "",
    companySize: "",
    industry: "",
    description: "",
  });
  const [questionnaireData, setQuestionnaireData] = useState<CompanyQuestionnaireData>({
    company_stage: "",
    decision_making: "",
    work_life_balance: "",
    failure_handling: "",
    success_definition: "",
    leadership_transparency: "",
    team_dynamic: "",
    company_problem: "",
    why_people_stay: "",
    why_people_leave: "",
    deal_breaker_values: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadCompanyDetails = async () => {
      try {
        const docRef = doc(db, "companyProfiles", "default");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as CompanyDetails;
          setDetails(data);
        } else {
          // If no company details exist, redirect to sign-up
          router.push("/find/sign-up");
          return;
        }
      } catch (error) {
        console.error("Error loading company details:", error);
        router.push("/find/sign-up");
      }
      setIsLoading(false);
    };

    loadCompanyDetails();
  }, [router]);

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update company details in Firestore
      await setDoc(doc(db, "companyProfiles", "default"), {
        ...details,
        updatedAt: new Date()
      });

      // Navigate back to find page
      router.push("/find");
    } catch (error) {
      console.error("Error updating company details:", error);
      alert("Failed to update details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col px-4 py-8">
        {/* Logo and Back Button */}
        <div className="flex justify-between items-center px-4 mb-12">
          <a href="/" className="flex items-center gap-4">
            <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
            <p className="text-2xl font-medium leading-6 tracking-base text-foreground font-cormorant">
              <span className="text-primary text-2xl font-averia font-semibold">Prometheus</span>
            </p>
          </a>
          <button
            onClick={() => router.push("/find")}
            className="relative inline-flex items-center justify-center text-base font-semibold tracking-base shadow ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 border border-muted hover:bg-background/80 h-[42px] px-8 py-2 text-foreground"
          >
            back
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Title */}
            <div className="text-center mb-12 -mt-16">
              <h1 className="text-5xl font-extrabold tracking-tighter text-foreground font-inter mb-4">
                {activeTab === "culture"
                  ? "culture questionnaire"
                  : "edit company profile"}
              </h1>
              <p className="text-lg font-medium leading-6 tracking-base text-primary">
                {activeTab === "culture"
                  ? "Help candidates understand your culture"
                  : "Update your company information"}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-muted mb-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-3 px-1 font-medium transition-colors ${activeTab === "details"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
                  }`}
              >
                Company Details
              </button>
              <button
                onClick={() => setActiveTab("culture")}
                className={`pb-3 px-1 font-medium transition-colors ${activeTab === "culture"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
                  }`}
              >
                Culture Questionnaire
              </button>
            </div>

            {/* Culture Questionnaire View */}
            {activeTab === "culture" ? (
              <CompanyQuestionnaire
                data={questionnaireData}
                onChange={(data) => setQuestionnaireData(data)}
                onComplete={() => {
                  setDetails((prev) => ({ ...prev, cultureQuestionnaire: questionnaireData }));
                  setActiveTab("details");
                }}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
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
                        Updating...
                      </span>
                    ) : (
                      "update profile"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
