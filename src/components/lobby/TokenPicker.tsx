"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FREE_TOKENS, SEMI_PREMIUM_TOKENS, PREMIUM_TOKENS, type TokenType } from "@/types/game";

const TOKEN_LABELS: Record<string, string> = {
  doge: "Doge", pepe: "Pepe", trollface: "Trollface", "nyan-cat": "Nyan Cat",
  wojak: "Wojak", "stonks-man": "Stonks", gigachad: "Gigachad",
  amogus: "Amogus", harambe: "Harambe", rickroll: "Rickroll",
  "golden-doge": "Golden Doge", "neon-pepe": "Neon Pepe",
  "glitch-trollface": "Glitch Troll", "rainbow-nyan": "Rainbow Nyan",
  "chad-wojak": "Chad Wojak", "diamond-doge": "Diamond Doge",
  "galaxy-pepe": "Galaxy Pepe", "holo-gigachad": "Holo Chad",
  "pixel-set": "Pixel Set", "animated-set": "Animated",
};

const TOKEN_EMOJI: Record<string, string> = {
  doge: "🐕", pepe: "🐸", trollface: "😈", "nyan-cat": "🌈",
  wojak: "😢", "stonks-man": "📈", gigachad: "💪",
  amogus: "🔴", harambe: "🦍", rickroll: "🎵",
  "golden-doge": "✨🐕", "neon-pepe": "💜🐸",
  "glitch-trollface": "⚡😈", "rainbow-nyan": "🌈✨",
  "chad-wojak": "😎", "diamond-doge": "💎🐕",
  "galaxy-pepe": "🌌🐸", "holo-gigachad": "🌟💪",
  "pixel-set": "👾", "animated-set": "🎬",
};

interface TokenPickerProps {
  selected: TokenType | null;
  onSelect: (token: TokenType) => void;
  takenTokens: TokenType[];
}

type Tab = "free" | "semi" | "premium";

export default function TokenPicker({ selected, onSelect, takenTokens }: TokenPickerProps) {
  const [tab, setTab] = useState<Tab>("free");

  const tokens = tab === "free" ? FREE_TOKENS
    : tab === "semi" ? SEMI_PREMIUM_TOKENS
    : PREMIUM_TOKENS;

  return (
    <div className="glass-panel p-4">
      <div className="text-xs text-[var(--text-dim)] font-mono mb-3">PICK YOUR TOKEN</div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["free", "semi", "premium"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              tab === t
                ? "bg-[rgba(0,255,100,0.1)] text-[#00ff64] border border-[rgba(0,255,100,0.3)]"
                : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t === "free" ? "FREE" : t === "semi" ? "SEMI ✨" : "PREMIUM 💎"}
          </button>
        ))}
      </div>

      {/* Token grid */}
      <div className="grid grid-cols-5 gap-2">
        {tokens.map((token) => {
          const taken = takenTokens.includes(token) && selected !== token;
          const isSelected = selected === token;

          return (
            <motion.button
              key={token}
              whileHover={taken ? {} : { scale: 1.05 }}
              whileTap={taken ? {} : { scale: 0.95 }}
              onClick={() => !taken && onSelect(token)}
              disabled={taken}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all text-xs font-mono ${
                isSelected
                  ? "bg-[rgba(0,255,100,0.15)] border border-[rgba(0,255,100,0.4)] glow-green"
                  : taken
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
              }`}
            >
              <span className="text-xl">{TOKEN_EMOJI[token] ?? "❓"}</span>
              <span className="text-[10px] truncate w-full text-center">{TOKEN_LABELS[token] ?? token}</span>
            </motion.button>
          );
        })}
      </div>

      {tab === "semi" && (
        <p className="text-[10px] text-[var(--text-dim)] mt-3 font-mono">
          Watch a 30-60s ad to unlock for this session
        </p>
      )}
      {tab === "premium" && (
        <p className="text-[10px] text-[var(--text-dim)] mt-3 font-mono">
          $0.99-$2.99 — permanent unlock (coming soon)
        </p>
      )}
    </div>
  );
}
