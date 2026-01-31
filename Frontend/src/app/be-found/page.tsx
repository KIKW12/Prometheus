"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import ProfilePreview from "@/components/ProfilePreview";
import CandidateQuestionnaire, {
  CandidateQuestionnaireData,
} from "@/components/CandidateQuestionnaire";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync, signOut, isAuthenticatedAsync } from "@/lib/auth";


export interface ProfileData {
  personal_info: {
    name: string;
    location: string;
    image: string;
  };
  education: Array<{
    degree: string;
    school: string;
    start_date: string;
    end_date: string;
  }>;
  job_experience: Array<{
    role: string;
    company: string;
    description: string;
    start_date: string;
    end_date: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
  skills: string;
  profileQuestionnaire?: CandidateQuestionnaireData;
}

export default function BeFoundPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "questionnaire" | "preview">("profile");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<CandidateQuestionnaireData>({
    career_goals_2_3_years: "",
    preferred_environment: "",
    work_style: "",
    workplace_values: [],
    ideal_manager: "",
    problem_domain: "",
    growth_priority: "",
    availability: "",
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    personal_info: {
      name: "",
      location: "",
      image: "",
    },
    education: [],
    job_experience: [],
    projects: [],
    skills: "",
  });
  // Sanitize profile data to ensure no null values for controlled inputs
  const sanitizeProfileData = (data: ProfileData): ProfileData => {
    return {
      personal_info: {
        name: data.personal_info?.name || "",
        location: data.personal_info?.location || "",
        image: data.personal_info?.image || "",
      },
      education: (data.education || []).map((edu) => ({
        degree: edu?.degree || "",
        school: edu?.school || "",
        start_date: edu?.start_date || "",
        end_date: edu?.end_date || "",
      })),
      job_experience: (data.job_experience || []).map((exp) => ({
        role: exp?.role || "",
        company: exp?.company || "",
        description: exp?.description || "",
        start_date: exp?.start_date || "",
        end_date: exp?.end_date || "",
      })),
      projects: (data.projects || []).map((proj) => ({
        name: proj?.name || "",
        description: proj?.description || "",
        technologies: proj?.technologies || "",
      })),
      skills: data.skills || "",
    };
  };

  // Check authentication and load profile
  // Check authentication and load profile
  useEffect(() => {
    const loadProfile = async () => {
      const authenticated = await isAuthenticatedAsync();
      if (!authenticated) {
        router.push("/");
        return;
      }

      const user = await getCurrentUserAsync();
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading profile:", error);
          return;
        }

        if (data) {
          const sanitizedData = sanitizeProfileData(data.profile_data);
          setProfileData(sanitizedData);
          setEmail(data.email || "");
          setPhone(data.phone || "");
          // Set original data for change detection
          setOriginalProfileData(JSON.parse(JSON.stringify(sanitizedData)));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [router]);

  const saveProfile = async () => {
    const user = await getCurrentUserAsync();
    if (!user) return;

    setIsSaving(true);
    try {
      const sanitizedData = sanitizeProfileData(profileData);
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.userId,
          profile_data: sanitizedData,
          email,
          phone,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Update original data after successful save
      setOriginalProfileData(JSON.parse(JSON.stringify(sanitizedData)));
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalProfileData) return false;
    return JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
  };

  return (
    <main className="flex w-full flex-1 flex-col min-h-screen bg-background px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="flex items-center gap-4">
            <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
            <p className="text-2xl font-medium leading-6 tracking-base text-foreground font-cormorant">
              <span className="text-primary text-2xl font-averia font-semibold">Prometheus</span>
            </p>
          </a>
          <button
            onClick={handleLogout}
            className="relative inline-flex items-center justify-center text-base font-semibold tracking-base shadow ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 border border-muted hover:bg-background/80 h-[42px] px-8 py-2 text-foreground"
          >
            log out
          </button>
        </div>

        {/* Page Title and Action Buttons */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-inter mb-2">
              {activeTab === "preview"
                ? "profile preview"
                : activeTab === "questionnaire"
                  ? "culture questionnaire"
                  : "edit your profile"}
            </h1>
            <p className="text-lg font-medium leading-6 tracking-base text-muted">
              {activeTab === "preview"
                ? "This is how recruiters will see your profile"
                : activeTab === "questionnaire"
                  ? "Help us match you with the right companies"
                  : "Update your information to stay discoverable"}
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab === "profile" && (
              <button
                onClick={saveProfile}
                disabled={isSaving || !hasUnsavedChanges()}
                className="bg-primary hover:bg-primary/90 text-foreground px-6 py-2 font-semibold text-base transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
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
                  "Save Profile"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-muted mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 font-medium transition-colors ${activeTab === "profile"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-foreground"
              }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("questionnaire")}
            className={`pb-3 px-1 font-medium transition-colors ${activeTab === "questionnaire"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-foreground"
              }`}
          >
            Culture Questionnaire
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 px-1 font-medium transition-colors ${activeTab === "preview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted hover:text-foreground"
              }`}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        {activeTab === "preview" ? (
          <ProfilePreview profileData={profileData} email={email} phone={phone} />
        ) : activeTab === "questionnaire" ? (
          <CandidateQuestionnaire
            data={questionnaireData}
            onChange={(data) => setQuestionnaireData(data)}
            onComplete={() => {
              setProfileData((prev) => ({ ...prev, profileQuestionnaire: questionnaireData }));
              setActiveTab("preview");
            }}
          />
        ) : (
          <ProfileForm
            profileData={profileData}
            setProfileData={setProfileData}
            onSaveProfile={saveProfile}
            isSaving={isSaving}
          />
        )}
      </div>
    </main>
  );

}
