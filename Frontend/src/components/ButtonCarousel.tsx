"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface ButtonCarouselProps {
    items: string[];
    onItemClick: (text: string) => void;
    direction?: "left" | "right";
    duration?: number;
}

export default function ButtonCarousel({
    items,
    onItemClick,
    direction = "left",
    duration = 30
}: ButtonCarouselProps) {
    const [isPaused, setIsPaused] = useState(false);

    // Create 3 sets for smooth infinite loop
    const carouselItems = [...items, ...items, ...items];

    // Estimate width of one set (average button width + gap)
    const avgButtonWidth = 200;
    const gap = 16; // 1rem
    const singleSetWidth = items.length * (avgButtonWidth + gap);

    // Animation values based on direction
    const animateX = direction === "left"
        ? [-singleSetWidth, 0]
        : [0, -singleSetWidth];

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{
                maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <motion.div
                className="flex gap-4"
                animate={{
                    x: isPaused ? undefined : animateX,
                }}
                transition={{
                    x: {
                        duration,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "loop",
                    },
                }}
            >
                {carouselItems.map((text, index) => (
                    <button
                        key={`${text}-${index}`}
                        onClick={() => onItemClick(text)}
                        className="flex-shrink-0 h-10 px-4 py-1 border border-muted/50 text-foreground cursor-pointer whitespace-nowrap transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0_0_10px_rgba(255,77,0,0.2)]"
                    >
                        {text}
                    </button>
                ))}
            </motion.div>
        </div>
    );
}
