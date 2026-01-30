"use client";

import { useState } from "react";

export interface CompanyQuestionnaireData {
    company_stage: string;
    decision_making: string;
    work_life_balance: string;
    failure_handling: string;
    success_definition: string;
    leadership_transparency: string;
    team_dynamic: string;
    company_problem: string;
    why_people_stay: string;
    why_people_leave: string;
    deal_breaker_values: string;
}

interface CompanyQuestionnaireProps {
    data: CompanyQuestionnaireData;
    onChange: (data: CompanyQuestionnaireData) => void;
    onComplete?: () => void;
}

const COMPANY_STAGE_OPTIONS = [
    { value: "pre-seed", label: "Pre-seed / Bootstrapped" },
    { value: "seed", label: "Seed stage (< $5M raised)" },
    { value: "series-a", label: "Series A ($5M - $20M)" },
    { value: "series-b-plus", label: "Series B+ (> $20M)" },
    { value: "enterprise", label: "Enterprise / Public company" },
];

const DECISION_MAKING_OPTIONS = [
    { value: "top-down", label: "Top-down - leadership decides" },
    { value: "consensus", label: "Consensus - team input on decisions" },
    { value: "autonomous", label: "Autonomous - teams self-direct" },
];

const WORK_LIFE_OPTIONS = [
    { value: "intense", label: "High intensity - startup hustle mode" },
    { value: "balanced", label: "Balanced - sustainable pace expected" },
    { value: "flexible", label: "Flexible - results matter, not hours" },
];

const FAILURE_OPTIONS = [
    { value: "learn-fast", label: "Learn fast - failure is part of innovation" },
    { value: "careful", label: "Careful - thorough review, avoid repeats" },
    { value: "post-mortem", label: "Blameless post-mortems focus" },
];

const SUCCESS_OPTIONS = [
    { value: "revenue", label: "Revenue and growth metrics" },
    { value: "impact", label: "Customer/user impact" },
    { value: "innovation", label: "Technical innovation" },
    { value: "team", label: "Team health and retention" },
];

const TRANSPARENCY_OPTIONS = [
    { value: "open-book", label: "Open book - financials, strategy shared" },
    { value: "need-to-know", label: "Need-to-know basis" },
    { value: "moderate", label: "Moderate - key updates shared" },
];

const TEAM_DYNAMIC_OPTIONS = [
    { value: "highly-collaborative", label: "Highly collaborative - lots of pairing" },
    { value: "independent", label: "Independent - own your domain" },
    { value: "hybrid", label: "Hybrid - collaborate then execute solo" },
];

export default function CompanyQuestionnaire({
    data,
    onChange,
    onComplete,
}: CompanyQuestionnaireProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 11;

    const updateField = <K extends keyof CompanyQuestionnaireData>(
        field: K,
        value: CompanyQuestionnaireData[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return data.company_stage !== "";
            case 1:
                return data.company_problem.trim().length > 10;
            case 2:
                return data.decision_making !== "";
            case 3:
                return data.work_life_balance !== "";
            case 4:
                return data.failure_handling !== "";
            case 5:
                return data.success_definition !== "";
            case 6:
                return data.leadership_transparency !== "";
            case 7:
                return data.team_dynamic !== "";
            case 8:
                return data.why_people_stay.trim().length > 5;
            case 9:
                return data.why_people_leave.trim().length > 5;
            case 10:
                return data.deal_breaker_values.trim().length > 5;
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

    const renderRadioGroup = (
        name: string,
        options: { value: string; label: string }[],
        currentValue: string,
        onValueChange: (value: string) => void
    ) => (
        <div className="space-y-3">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className={`flex items-center p-4 border rounded cursor-pointer transition-all ${currentValue === opt.value
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        }`}
                >
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={currentValue === opt.value}
                        onChange={(e) => onValueChange(e.target.value)}
                        className="sr-only"
                    />
                    <span className="text-foreground">{opt.label}</span>
                </label>
            ))}
        </div>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            What stage is your company at?
                        </h3>
                        {renderRadioGroup(
                            "company_stage",
                            COMPANY_STAGE_OPTIONS,
                            data.company_stage,
                            (v) => updateField("company_stage", v)
                        )}
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            What problem is your company solving?
                        </h3>
                        <p className="text-muted text-sm">
                            This helps us match you with candidates passionate about your mission.
                        </p>
                        <textarea
                            value={data.company_problem}
                            onChange={(e) => updateField("company_problem", e.target.value)}
                            rows={4}
                            className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                            placeholder="e.g., We're making developer tools 10x faster, helping teams ship better code..."
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            How does decision-making work at your company?
                        </h3>
                        {renderRadioGroup(
                            "decision_making",
                            DECISION_MAKING_OPTIONS,
                            data.decision_making,
                            (v) => updateField("decision_making", v)
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            What&apos;s the work-life balance like?
                        </h3>
                        {renderRadioGroup(
                            "work_life_balance",
                            WORK_LIFE_OPTIONS,
                            data.work_life_balance,
                            (v) => updateField("work_life_balance", v)
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            How does your company handle failure?
                        </h3>
                        {renderRadioGroup(
                            "failure_handling",
                            FAILURE_OPTIONS,
                            data.failure_handling,
                            (v) => updateField("failure_handling", v)
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            How do you define success?
                        </h3>
                        {renderRadioGroup(
                            "success_definition",
                            SUCCESS_OPTIONS,
                            data.success_definition,
                            (v) => updateField("success_definition", v)
                        )}
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            How transparent is leadership?
                        </h3>
                        {renderRadioGroup(
                            "leadership_transparency",
                            TRANSPARENCY_OPTIONS,
                            data.leadership_transparency,
                            (v) => updateField("leadership_transparency", v)
                        )}
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            What&apos;s the team dynamic like?
                        </h3>
                        {renderRadioGroup(
                            "team_dynamic",
                            TEAM_DYNAMIC_OPTIONS,
                            data.team_dynamic,
                            (v) => updateField("team_dynamic", v)
                        )}
                    </div>
                );

            case 8:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            Why do people stay at your company?
                        </h3>
                        <p className="text-muted text-sm">Be honest - this builds trust with candidates.</p>
                        <textarea
                            value={data.why_people_stay}
                            onChange={(e) => updateField("why_people_stay", e.target.value)}
                            rows={4}
                            className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                            placeholder="e.g., Autonomy to solve hard problems, great people, real equity upside..."
                        />
                    </div>
                );

            case 9:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            Why have people left?
                        </h3>
                        <p className="text-muted text-sm">
                            Transparency here helps set realistic expectations.
                        </p>
                        <textarea
                            value={data.why_people_leave}
                            onChange={(e) => updateField("why_people_leave", e.target.value)}
                            rows={4}
                            className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                            placeholder="e.g., Outgrew their role, wanted bigger company, visa issues..."
                        />
                    </div>
                );

            case 10:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            What&apos;s a deal-breaker for you in a candidate?
                        </h3>
                        <p className="text-muted text-sm">
                            Beyond skills - what values or behaviors won&apos;t work?
                        </p>
                        <textarea
                            value={data.deal_breaker_values}
                            onChange={(e) => updateField("deal_breaker_values", e.target.value)}
                            rows={4}
                            className="w-full bg-background border border-muted px-4 py-3 text-foreground outline-none focus:border-primary transition-colors resize-none rounded"
                            placeholder="e.g., Needs constant direction, not comfortable with ambiguity..."
                        />
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
                    <span>
                        Question {currentStep + 1} of {totalSteps}
                    </span>
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
                    className={`px-6 py-3 rounded font-medium transition-all ${currentStep === 0
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
                    className={`px-6 py-3 rounded font-medium transition-all ${canProceed()
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
