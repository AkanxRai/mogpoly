"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export default function GlitchText({ text, className = "", as: Tag = "h1" }: GlitchTextProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Tag className="relative font-mono font-bold text-glow">{text}</Tag>
      <Tag
        className="absolute inset-0 font-mono font-bold text-[#ff0040] opacity-70 animate-glitch"
        style={{ clipPath: "inset(20% 0 40% 0)" }}
        aria-hidden
      >{text}</Tag>
      <Tag
        className="absolute inset-0 font-mono font-bold text-[#00ffff] opacity-70 animate-glitch"
        style={{ clipPath: "inset(60% 0 10% 0)", animationDelay: "0.1s" }}
        aria-hidden
      >{text}</Tag>
    </motion.div>
  );
}
