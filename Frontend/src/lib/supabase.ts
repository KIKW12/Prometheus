import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Support both legacy anon key and new publishable key format
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for TypeScript
export interface CandidateProfile {
    id?: string
    email: string
    name?: string
    phone?: string
    job_experience: JobExperience[]
    education: Education[]
    projects: Project[]
    skills: string[]
    profile_questionnaire?: CandidateQuestionnaire
    created_at?: string
    updated_at?: string
}

export interface JobExperience {
    role: string
    company: string
    description: string
    start_date: string
    end_date: string
}

export interface Education {
    degree: string
    institution: string
    start_date: string
    end_date: string
}

export interface Project {
    name: string
    description: string
    technologies: string
}

export interface CandidateQuestionnaire {
    career_goals_2_3_years: string
    preferred_environment: string
    work_style: string
    workplace_values: string[]
    ideal_manager: string
    problem_domain: string
    growth_priority: string
    availability: string
}

export interface CompanyProfile {
    id?: string
    company_name: string
    user_name?: string
    user_role?: string
    company_size?: string
    industry?: string
    description?: string
    culture_questionnaire?: CompanyQuestionnaire
    created_at?: string
    updated_at?: string
}

export interface CompanyQuestionnaire {
    company_stage: string
    decision_making: string
    work_life_balance: string
    failure_handling: string
    success_definition: string
    leadership_transparency: string
    team_dynamic: string
    company_problem: string
    why_people_stay: string
    why_people_leave: string
    deal_breaker_values: string
}
