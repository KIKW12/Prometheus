"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  image: string;
  description: string;
}

interface TeamCarouselProps {
  teamMembers: TeamMember[];
}

export default function TeamCarousel({ teamMembers }: TeamCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Create 3 sets for smoother infinite loop
  const carouselItems = [...teamMembers, ...teamMembers, ...teamMembers];

  // Calculate the width of one set of items (for seamless loop)
  const itemWidth = 160; // px
  const gap = 24; // 1.5rem = 24px
  const singleSetWidth = teamMembers.length * (itemWidth + gap);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex gap-6"
        animate={{
          x: isPaused ? undefined : [-singleSetWidth, 0],
        }}
        transition={{
          x: {
            duration: 25,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          },
        }}
        style={{ x: 0 }}
      >
        {carouselItems.map((member, index) => (
          <div
            key={`${member.name}-${index}`}
            className="flex-shrink-0"
            style={{ width: itemWidth }}
          >
            <div className="border text-foreground group h-56 bg-transparent cursor-pointer border-muted/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,77,0,0.15)]">
              <div className="p-3 flex flex-col gap-0">
                <div className="relative overflow-hidden h-28 mb-2">
                  <img
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    src={member.image}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="tracking-tight line-clamp-1 text-left font-medium text-lg text-foreground">
                  {member.name}
                </h3>
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm text-muted line-clamp-2">
                  {member.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}