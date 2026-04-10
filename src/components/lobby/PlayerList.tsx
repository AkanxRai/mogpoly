"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/types/game";
import { PLATFORM_COLORS } from "@/lib/constants";

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

interface PlayerListProps {
  players: Player[];
  hostId?: string;
  myId?: string | null;
}

export default function PlayerList({ players, hostId, myId }: PlayerListProps) {
  return (
    <div className="glass-panel p-4">
      <div className="text-xs text-[var(--text-dim)] font-mono mb-3">
        PLAYERS ({players.length}/6)
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center gap-3 p-2 rounded-md font-mono text-sm ${
                player.id === myId ? "bg-[rgba(0,255,100,0.06)]" : ""
              }`}
            >
              <span className="text-lg">{TOKEN_EMOJI[player.token] ?? "❓"}</span>
              <span className="flex-1 truncate">{player.name}</span>
              {player.id === hostId && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(0,255,100,0.1)] text-[#00ff64] rounded font-mono">
                  HOST
                </span>
              )}
              {player.id === myId && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] rounded font-mono">
                  YOU
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
