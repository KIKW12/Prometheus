"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, ExternalLink } from "lucide-react";
import { ProspectData } from "./ProspectCard";

interface ProspectModalProps {
    prospect: ProspectData | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProspectModal({ prospect, isOpen, onClose }: ProspectModalProps) {
    if (!prospect) return null;

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
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-surface border border-muted/30 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4 p-6 border-b border-muted/20">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {prospect.profileImage ? (
                                    <img
                                        src={prospect.profileImage}
                                        alt={prospect.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-foreground">
                                        {getInitials(prospect.name)}
                                    </div>
                                )}
                            </div>

                            {/* Name + Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-bold text-foreground mb-1">
                                    {prospect.name}
                                </h2>
                                <p className="text-muted capitalize mb-2">
                                    {prospect.experience_level} • {prospect.experience_years} years experience
                                </p>
                                {prospect.location && (
                                    <div className="flex items-center gap-2 text-muted text-sm">
                                        <MapPin size={14} />
                                        <span>{prospect.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Score + Close */}
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-muted" />
                                </button>
                                <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg">
                                    <Star size={16} className={getScoreColor(prospect.score)} />
                                    <span className={`text-lg font-bold ${getScoreColor(prospect.score)}`}>
                                        {Math.round(prospect.score)}%
                                    </span>
                                    <span className="text-xs text-muted">match</span>
                                </div>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Bio */}
                            {prospect.bio && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                                        About
                                    </h3>
                                    <p className="text-foreground leading-relaxed">{prospect.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            <div>
                                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {prospect.matched_skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary border border-primary/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {prospect.skills
                                        .filter((s) => !prospect.matched_skills.includes(s))
                                        .slice(0, 6)
                                        .map((skill, i) => (
                                            <span
                                                key={`other-${i}`}
                                                className="px-3 py-1 text-sm rounded-full bg-muted/20 text-muted border border-muted/30"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                                    Contact
                                </h3>
                                <div className="space-y-2">
                                    {prospect.email && (
                                        <a
                                            href={`mailto:${prospect.email}`}
                                            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                                        >
                                            <Mail size={18} className="text-muted" />
                                            <span>{prospect.email}</span>
                                            <ExternalLink size={14} className="text-muted" />
                                        </a>
                                    )}
                                    {prospect.phone && (
                                        <a
                                            href={`tel:${prospect.phone}`}
                                            className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                                        >
                                            <Phone size={18} className="text-muted" />
                                            <span>{prospect.phone}</span>
                                            <ExternalLink size={14} className="text-muted" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-muted/20 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-all"
                            >
                                Close
                            </button>
                            <a
                                href={`mailto:${prospect.email}`}
                                className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-primary text-foreground hover:bg-primary/80 transition-all text-center"
                            >
                                Send Email
                            </a>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
