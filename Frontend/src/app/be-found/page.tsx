"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import ProfilePreview from "@/components/ProfilePreview";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getCurrentUser, removeToken, isAuthenticated } from "@/lib/auth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
}

export default function BeFoundPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
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
  const sanitizeProfileData = (data: any): ProfileData => {
    return {
      personal_info: {
        name: String(data.personal_info?.name || ""),
        location: String(data.personal_info?.location || ""),
        image: String(data.personal_info?.image || ""),
      },
      education: (Array.isArray(data.education) ? data.education : []).map((edu: any) => ({
        degree: String(edu?.degree || ""),
        school: String(edu?.school || ""),
        start_date: String(edu?.start_date || ""),
        end_date: String(edu?.end_date || ""),
      })),
      job_experience: (Array.isArray(data.job_experience) ? data.job_experience : []).map((exp: any) => ({
        role: String(exp?.role || ""),
        company: String(exp?.company || ""),
        description: String(exp?.description || ""),
        start_date: String(exp?.start_date || ""),
        end_date: String(exp?.end_date || ""),
      })),
      projects: (Array.isArray(data.projects) ? data.projects : []).map((proj: any) => ({
        name: String(proj?.name || ""),
        description: String(proj?.description || ""),
        technologies: String(proj?.technologies || ""),
      })),
      skills: String(data.skills || ""),
    };
  };

  // Check authentication and load profile
  useEffect(() => {
    if (!isAuthenticated()) {
      // If not authenticated, redirect to home or sign-in
      router.push("/");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }

    const loadProfile = async () => {
      try {
        const docRef = doc(db, "userProfiles", user.userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const sanitizedData = sanitizeProfileData(data.profileData);
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
    const user = getCurrentUser();
    if (!user) return;

    setIsSaving(true);
    try {
      let finalProfileData = { ...profileData };

      // If there's a selected image file, upload it first
      if (selectedImageFile) {
        console.log("Uploading selected image file...");
        const timestamp = Date.now();
        const filename = `profile-images/${timestamp}_${selectedImageFile.name}`;
        const storageRef = ref(storage, filename);
        
        const uploadResult = await uploadBytes(storageRef, selectedImageFile);
        console.log("Image upload completed:", uploadResult);
        
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Got download URL:", downloadURL);
        
        // Update the profile data with the uploaded URL
        finalProfileData.personal_info.image = downloadURL;
        
        // Clear the selected file
        setSelectedImageFile(null);
      }

      // Deep clone and sanitize to ensure clean data
      const cleanData = JSON.parse(JSON.stringify(finalProfileData));
      const sanitizedData = sanitizeProfileData(cleanData);
      
      await setDoc(doc(db, "userProfiles", user.userId), {
        profileData: sanitizedData,
        email,
        phone,
        updatedAt: new Date()
      });
      
      // Update original data after successful save
      setOriginalProfileData(JSON.parse(JSON.stringify(sanitizedData)));
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save profile: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    removeToken();
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
              {showPreview ? "profile preview" : "edit your profile"}
            </h1>
            <p className="text-lg font-medium leading-6 tracking-base text-muted">
              {showPreview
                ? "This is how recruiters will see your profile"
                : "Update your information to stay discoverable"}
            </p>
          </div>
          <div className="flex gap-3">
            {!showPreview && (
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
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-transparent text-foreground relative inline-flex items-center border-2 border-primary justify-center text-primary text-base font-semibold tracking-base ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 shadow-md hover:brightness-95 px-6 py-2"
            >
              {showPreview ? "edit profile" : "preview"}
            </button>
          </div>
        </div>

        {/* Content */}
        {showPreview ? (
          <ProfilePreview profileData={profileData} email={email} phone={phone} />
        ) : (
          <ProfileForm
            profileData={profileData}
            setProfileData={setProfileData}
            onSaveProfile={saveProfile}
            isSaving={isSaving}
            onImageSelected={setSelectedImageFile}
          />
        )}
      </div>
    </main>
  );
}
