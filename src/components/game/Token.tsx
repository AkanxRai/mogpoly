"use client";

import { motion } from "framer-motion";
import type { TokenType } from "@/types/game";

const TOKEN_EMOJI: Record<string, string> = {
  doge: "🐕", pepe: "🐸", trollface: "😈", "nyan-cat": "🌈",
  wojak: "😢", "stonks-man": "📈", gigachad: "💪",
  amogus: "🔴", harambe: "🦍", rickroll: "🎵",
  "golden-doge": "✨", "neon-pepe": "💜", "glitch-trollface": "⚡",
  "rainbow-nyan": "🌈", "chad-wojak": "😎", "diamond-doge": "💎",
  "galaxy-pepe": "🌌", "holo-gigachad": "🌟", "pixel-set": "👾",
  "animated-set": "🎬",
};

interface TokenProps {
  token: TokenType;
  size?: "sm" | "md";
  isCurrentPlayer?: boolean;
}

export default function Token({ token, size = "sm", isCurrentPlayer }: TokenProps) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`flex items-center justify-center rounded-full ${
        size === "sm" ? "w-5 h-5 text-xs" : "w-8 h-8 text-base"
      } ${isCurrentPlayer ? "ring-1 ring-[#00ff64] ring-offset-1 ring-offset-[#0a0a0f]" : ""}`}
    >
      {TOKEN_EMOJI[token] ?? "❓"}
    </motion.div>
  );
}
