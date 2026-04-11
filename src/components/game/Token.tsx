"use client";

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
  size?: "sm" | "md" | "lg";
  isCurrentPlayer?: boolean;
}

export default function Token({ token, size = "sm", isCurrentPlayer }: TokenProps) {
  const sizeClass = size === "sm"
    ? "w-3 h-3 text-[8px]"
    : size === "md"
    ? "w-5 h-5 text-xs"
    : "w-8 h-8 text-base";

  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 ${sizeClass} ${
        isCurrentPlayer ? "ring-1 ring-[#00ff64]" : ""
      }`}
    >
      {TOKEN_EMOJI[token] ?? "❓"}
    </div>
  );
}
