"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/game";
import Token from "./Token";

interface PlayerStatsProps {
  players: Player[];
  currentPlayerIndex: number;
  myId: string | null;
}

export default function PlayerStats({ players, currentPlayerIndex, myId }: PlayerStatsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player, i) => (
        <motion.div
          key={player.id}
          animate={i === currentPlayerIndex ? { borderColor: "rgba(0,255,100,0.4)" } : {}}
          className={`glass-panel px-3 py-2 flex items-center gap-2 font-mono text-xs ${
            player.bankrupt ? "opacity-30" : ""
          } ${i === currentPlayerIndex ? "glow-green" : ""}`}
        >
          <Token token={player.token} size="sm" isCurrentPlayer={i === currentPlayerIndex} />
          <span className={`truncate max-w-[80px] ${player.id === myId ? "text-[#00ff64]" : "text-[var(--text-secondary)]"}`}>
            {player.name}
          </span>
          <span className="text-[var(--text-dim)]">{player.mogz}M</span>
          <span className="text-[var(--text-dim)]">{player.properties.length}🏠</span>
        </motion.div>
      ))}
    </div>
  );
}
