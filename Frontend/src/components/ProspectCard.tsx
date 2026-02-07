"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Briefcase, Star } from "lucide-react";

export interface ProspectData {
    candidate_id: string;
    name: string;
    email: string;
    phone?: string;
    score: number;
    skills: string[];
    matched_skills: string[];
    experience_years: number;
    experience_level: string;
    location?: string;
    bio?: string;
    profileImage?: string;
}

interface ProspectCardProps {
    prospect: ProspectData;
    index?: number;
    onViewProfile?: (id: string) => void;
    onContact?: (prospect: ProspectData) => void;
}

export default function ProspectCard({
    prospect,
    index = 0,
    onViewProfile,
    onContact
}: ProspectCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400";
        if (score >= 70) return "text-primary";
        if (score >= 50) return "text-yellow-400";
        return "text-muted";
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="glass-card rounded-xl p-5 min-w-[300px] max-w-[340px] flex-shrink-0"
        >
            {/* Header: Avatar + Name + Score */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {prospect.profileImage ? (
                        <img
                            src={prospect.profileImage}
                            alt={prospect.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-surface border-2 border-primary/30 flex items-center justify-center text-lg font-bold text-foreground">
                            {getInitials(prospect.name)}
                        </div>
                    )}
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>

                {/* Name + Level */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                        {prospect.name}
                    </h3>
                    <p className="text-sm text-muted capitalize">
                        {prospect.experience_level} • {prospect.experience_years}y exp
                    </p>
                </div>

                {/* Score Badge */}
                <div className="flex flex-col items-center">
                    <div className={`text-2xl font-bold ${getScoreColor(prospect.score)}`}>
                        {Math.round(prospect.score)}
                    </div>
                    <div className="text-xs text-muted">match</div>
                </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mb-4">
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prospect.score}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                    {prospect.matched_skills.slice(0, 4).map((skill, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30"
                        >
                            {skill}
                        </span>
                    ))}
                    {prospect.matched_skills.length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-surface text-muted">
                            +{prospect.matched_skills.length - 4}
                        </span>
                    )}
                </div>
            </div>

            {/* Info Row */}
            <div className="flex flex-col gap-1.5 mb-4 text-sm">
                {prospect.location && (
                    <div className="flex items-center gap-2 text-muted">
                        <MapPin size={14} />
                        <span className="truncate">{prospect.location}</span>
                    </div>
                )}
                {prospect.email && (
                    <div className="flex items-center gap-2 text-muted">
                        <Mail size={14} />
                        <a
                            href={`mailto:${prospect.email}`}
                            className="truncate hover:text-primary transition-colors"
                        >
                            {prospect.email}
                        </a>
                    </div>
                )}
                {prospect.phone && (
                    <div className="flex items-center gap-2 text-muted">
                        <Phone size={14} />
                        <a
                            href={`tel:${prospect.phone}`}
                            className="hover:text-primary transition-colors"
                        >
                            {prospect.phone}
                        </a>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onViewProfile?.(prospect.candidate_id)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-surface border border-muted/30 text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all"
                >
                    View Profile
                </button>
                <button
                    onClick={() => onContact?.(prospect)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-foreground hover:bg-primary/80 transition-all"
                >
                    Contact
                </button>
            </div>
        </motion.div>
    );
}
