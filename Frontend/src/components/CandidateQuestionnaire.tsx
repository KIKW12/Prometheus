"use client";

import { useState } from "react";

export interface CandidateQuestionnaireData {
  career_goals_2_3_years: string;
  preferred_environment: string;
  work_style: string;
  workplace_values: string[];
  ideal_manager: string;
  problem_domain: string;
  growth_priority: string;
  availability: string;
}

interface CandidateQuestionnaireProps {
  data: CandidateQuestionnaireData;
  onChange: (data: CandidateQuestionnaireData) => void;
  onComplete?: () => void;
}

const WORKPLACE_VALUES = [
  "Work-life balance",
  "Career growth",
  "Competitive salary",
  "Remote flexibility",
  "Great team culture",
  "Cutting-edge tech",
  "Clear mission",
  "Autonomy",
  "Learning opportunities",
  "Job security",
];

const ENVIRONMENT_OPTIONS = [
  { value: "startup", label: "Early-stage startup (< 20 people)" },
  { value: "scaleup", label: "Growth-stage company (20-200)" },
  { value: "enterprise", label: "Large enterprise (200+)" },
  { value: "agency", label: "Agency / consultancy" },
  { value: "any", label: "No preference" },
];

const WORK_STYLE_OPTIONS = [
  { value: "autonomous", label: "Highly autonomous - minimal oversight" },
  { value: "collaborative", label: "Highly collaborative - lots of pairing" },
  { value: "balanced", label: "Balanced mix of both" },
];

const MANAGER_STYLE_OPTIONS = [
  { value: "hands-off", label: "Hands-off - trusts me to deliver" },
  { value: "mentor", label: "Mentoring - regular guidance and feedback" },
  { value: "structured", label: "Structured - clear processes and check-ins" },
];

const GROWTH_OPTIONS = [
  { value: "ic-depth", label: "Go deep as an IC / architect" },
  { value: "management", label: "Move into engineering management" },
  { value: "entrepreneurship", label: "Start my own company eventually" },
  { value: "exploring", label: "Still exploring options" },
];

const AVAILABILITY_OPTIONS = [
  { value: "full-time", label: "Full-time employee" },
  { value: "contract", label: "Contract / consulting" },
  { value: "freelance", label: "Freelance / project-based" },
  { value: "part-time", label: "Part-time" },
];

export default function CandidateQuestionnaire({
  data,
  onChange,
  onComplete,
}: CandidateQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 8;

  const updateField = <K extends keyof CandidateQuestionnaireData>(
    field: K,
    value: CandidateQuestionnaireData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const toggleValue = (value: string) => {
    const current = data.workplace_values;
    if (current.includes(value)) {
      updateField(
        "workplace_values",
        current.filter((v) => v !== value)
      );
    } else if (current.length < 3) {
      updateField("workplace_values", [...current, value]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.career_goals_2_3_years.trim().length > 10;
      case 1:
        return data.preferred_environment !== "";
      case 2:
        return data.work_style !== "";
      case 3:
        return data.workplace_values.length >= 1;
      case 4:
        return data.ideal_manager !== "";
      case 5:
        return data.problem_domain.trim().length > 5;
      case 6:
        return data.growth_priority !== "";
      case 7:
        return data.availability !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What are your career goals for the next 2-3 years?
            </h3>
            <p className="text-muted text-sm">
              Be specific about what success looks like for you.
            </p>
            <textarea
              value={data.career_goals_2_3_years}
              onChange={(e) =>
                updateField("career_goals_2_3_years", e.target.value)
              }
              rows={4}
              className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
              placeholder="e.g., Lead a team of 5+, architect systems at scale, go deep on AI/ML..."
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What type of company do you prefer?
            </h3>
            <div className="space-y-3">
              {ENVIRONMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                    data.preferred_environment === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="environment"
                    value={opt.value}
                    checked={data.preferred_environment === opt.value}
                    onChange={(e) =>
                      updateField("preferred_environment", e.target.value)
                    }
                    className="sr-only"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              How do you prefer to work?
            </h3>
            <div className="space-y-3">
              {WORK_STYLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                    data.work_style === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="work_style"
                    value={opt.value}
                    checked={data.work_style === opt.value}
                    onChange={(e) => updateField("work_style", e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What matters most to you at work?
            </h3>
            <p className="text-muted text-sm">
              Select up to 3 values that are most important.
            </p>
            <div className="flex flex-wrap gap-2">
              {WORKPLACE_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleValue(value)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    data.workplace_values.includes(value)
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-muted text-foreground hover:border-primary/50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted">
              Selected: {data.workplace_values.length}/3
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What type of manager helps you thrive?
            </h3>
            <div className="space-y-3">
              {MANAGER_STYLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                    data.ideal_manager === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="ideal_manager"
                    value={opt.value}
                    checked={data.ideal_manager === opt.value}
                    onChange={(e) =>
                      updateField("ideal_manager", e.target.value)
                    }
                    className="sr-only"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What kinds of problems excite you most?
            </h3>
            <p className="text-muted text-sm">
              This helps us match you with companies working on things you care about.
            </p>
            <textarea
              value={data.problem_domain}
              onChange={(e) => updateField("problem_domain", e.target.value)}
              rows={4}
              className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
              placeholder="e.g., Developer tools, healthcare tech, climate solutions, fintech infrastructure..."
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Where do you see your career heading?
            </h3>
            <div className="space-y-3">
              {GROWTH_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                    data.growth_priority === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="growth_priority"
                    value={opt.value}
                    checked={data.growth_priority === opt.value}
                    onChange={(e) =>
                      updateField("growth_priority", e.target.value)
                    }
                    className="sr-only"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              What type of work arrangement are you looking for?
            </h3>
            <div className="space-y-3">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                    data.availability === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="availability"
                    value={opt.value}
                    checked={data.availability === opt.value}
                    onChange={(e) =>
                      updateField("availability", e.target.value)
                    }
                    className="sr-only"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted mb-2">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <div className="min-h-[300px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded font-medium transition-all ${
            currentStep === 0
              ? "text-muted cursor-not-allowed"
              : "text-foreground hover:bg-muted/20"
          }`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-6 py-3 rounded font-medium transition-all ${
            canProceed()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted/30 text-muted cursor-not-allowed"
          }`}
        >
          {currentStep === totalSteps - 1 ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
}
