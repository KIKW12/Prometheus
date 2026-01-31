"use client";

import { useState } from "react";

import { ProfileData } from "@/app/be-found/page";

interface ProfileFormProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  onSaveProfile?: () => void;
  isSaving?: boolean;
}

export default function ProfileForm({
  profileData,
  setProfileData,
  onSaveProfile,
  isSaving = false,
}: ProfileFormProps) {
  const handlePersonalInfoChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      personal_info: { ...profileData.personal_info, [field]: value || "" },
    });
  };

  const addJobExperience = () => {
    setProfileData({
      ...profileData,
      job_experience: [
        ...profileData.job_experience,
        { role: "", company: "", description: "", start_date: "", end_date: "" },
      ],
    });
  };

  const updateJobExperience = (index: number, field: string, value: string) => {
    const newExperience = [...profileData.job_experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setProfileData({ ...profileData, job_experience: newExperience });
  };

  const removeJobExperience = (index: number) => {
    const newExperience = profileData.job_experience.filter((_, i) => i !== index);
    setProfileData({ ...profileData, job_experience: newExperience });
  };

  const addEducation = () => {
    setProfileData({
      ...profileData,
      education: [
        ...profileData.education,
        { degree: "", school: "", start_date: "", end_date: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...profileData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setProfileData({ ...profileData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    const newEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData({ ...profileData, education: newEducation });
  };

  const addProject = () => {
    setProfileData({
      ...profileData,
      projects: [
        ...profileData.projects,
        { name: "", description: "", technologies: "" },
      ],
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...profileData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProfileData({ ...profileData, projects: newProjects });
  };

  const removeProject = (index: number) => {
    const newProjects = profileData.projects.filter((_, i) => i !== index);
    setProfileData({ ...profileData, projects: newProjects });
  };

  const [isParsing, setIsParsing] = useState(false);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse CV");

      const parsedData = await response.json();

      // Merge parsed data with current profile data
      setProfileData({
        ...profileData,
        personal_info: {
          ...profileData.personal_info,
          name: parsedData.personal_info?.name || profileData.personal_info.name,
          location: parsedData.personal_info?.location || profileData.personal_info.location,
          // Don't overwrite image unless specifically needed, usually CV doesn't have image URL
        },
        // We replace arrays because merging complex lists is usually messy. 
        // User can always manually add back anything that was lost if they prefer.
        // Or better, we could append? Let's replace for now as "Update from Resume" implies a fresh state from the resume.
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
        skills: parsedData.skills || profileData.skills,
      });

      alert("Profile updated from resume! Please review the changes.");
    } catch (error) {
      console.error("Error parsing CV:", error);
      alert("Failed to parse resume. Please try again.");
    } finally {
      setIsParsing(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-4xl">
      <form className="flex flex-col gap-12">
        {/* Auto-fill from Resume Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground font-inter mb-1">Auto-fill from Resume</h3>
            <p className="text-sm text-muted">Upload a new resume to automatically update your profile details.</p>
          </div>
          <div className="relative">
            <input
              type="file"
              id="update-cv-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleCvUpload}
              disabled={isParsing}
              className="hidden"
            />
            <label
              htmlFor="update-cv-upload"
              className={`flex items-center gap-2 bg-primary text-foreground px-4 py-2 font-semibold text-sm rounded cursor-pointer hover:brightness-110 transition-all shadow-sm ${isParsing ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isParsing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Parsing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Resume
                </>
              )}
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 font-inter">
            personal information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.personal_info.name}
                onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                placeholder="John Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <input
                type="text"
                value={profileData.personal_info.location}
                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors rounded"
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Profile Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          handlePersonalInfoChange("image", reader.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="flex items-center justify-center w-full bg-background border border-muted px-4 py-3 cursor-pointer hover:border-primary transition-colors rounded"
                >
                  {profileData.personal_info.image ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={profileData.personal_info.image}
                        alt="Profile preview"
                        className="w-12 h-12 object-cover border border-muted rounded"
                      />
                      <span className="text-foreground">Click to change image</span>
                    </div>
                  ) : (
                    <span className="text-muted">Click to upload profile image</span>
                  )}
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-primary"></div>

        {/* Skills */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 font-inter">
            skills
          </h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Skills (comma-separated)
            </label>
            <textarea
              value={profileData.skills}
              onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              rows={4}
              className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
              placeholder="React, TypeScript, Node.js, Python, AWS, Docker, Kubernetes"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-primary"></div>

        {/* Job Experience */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-inter">
              job experience
            </h2>
            <button
              type="button"
              onClick={addJobExperience}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 px-4 py-2 font-medium transition-all rounded"
            >
              + Add Experience
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {profileData.job_experience.map((exp, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Experience {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeJobExperience(index)}
                    className="text-muted hover:text-primary transition-colors text-lg font-medium px-2 py-1 hover:bg-primary/10 rounded"
                    title="Remove experience"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Role/Position
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) =>
                        updateJobExperience(index, "role", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateJobExperience(index, "company", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) =>
                        updateJobExperience(index, "start_date", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="Jan 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={exp.end_date}
                      onChange={(e) =>
                        updateJobExperience(index, "end_date", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="Present"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateJobExperience(index, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                      placeholder="Describe your role and achievements..."
                    />
                  </div>
                </div>
                {index < profileData.job_experience.length - 1 && (
                  <div className="h-px bg-muted/50 my-6"></div>
                )}
              </div>
            ))}
            {profileData.job_experience.length === 0 && (
              <p className="text-muted text-center py-4">
                No experience added yet. Click "add experience" to get started.
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-primary"></div>

        {/* Education */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-inter">
              education
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 px-4 py-2 font-medium transition-all rounded"
            >
              + Add Education
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {profileData.education.map((edu, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Education {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-muted hover:text-primary transition-colors text-lg font-medium px-2 py-1 hover:bg-primary/10 rounded"
                    title="Remove education"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Degree/Certification
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      School/Institution
                    </label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(index, "school", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Year
                    </label>
                    <input
                      type="text"
                      value={edu.start_date}
                      onChange={(e) =>
                        updateEducation(index, "start_date", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="2016"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Year
                    </label>
                    <input
                      type="text"
                      value={edu.end_date}
                      onChange={(e) =>
                        updateEducation(index, "end_date", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="2020"
                    />
                  </div>
                </div>
                {index < profileData.education.length - 1 && (
                  <div className="h-px bg-muted/50 my-6"></div>
                )}
              </div>
            ))}
            {profileData.education.length === 0 && (
              <p className="text-muted text-center py-4">
                No education added yet. Click "add education" to get started.
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-primary"></div>

        {/* Projects */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-inter">
              projects
            </h2>
            <button
              type="button"
              onClick={addProject}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 px-4 py-2 font-medium transition-all rounded"
            >
              + Add Project
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {profileData.projects.map((project, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Project {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-muted hover:text-primary transition-colors text-lg font-medium px-2 py-1 hover:bg-primary/10 rounded"
                    title="Remove project"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) =>
                        updateProject(index, "name", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="E-commerce Platform"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Technologies Used
                    </label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) =>
                        updateProject(index, "technologies", e.target.value)
                      }
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors rounded"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        updateProject(index, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full bg-background border border-muted px-3 py-2 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                      placeholder="Brief description of the project..."
                    />
                  </div>
                </div>
                {index < profileData.projects.length - 1 && (
                  <div className="h-px bg-muted/50 my-6"></div>
                )}
              </div>
            ))}
            {profileData.projects.length === 0 && (
              <p className="text-muted text-center py-4">
                No projects added yet. Click "add project" to get started.
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        {/* Moved to be-found page header */}
      </form>
    </div>
  );
}
