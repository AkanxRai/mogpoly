"use client";

import type { Player } from "@/types/game";
import Token from "@/components/game/Token";

interface CornerTileProps {
  name: string;
  index: number;
  players: Player[];
  currentPlayerId?: string;
}

const CORNER_ICONS: Record<string, string> = {
  Homepage: "🏠",
  "Shadow Ban": "🚫",
  AFK: "💤",
  "Get Reported": "⚠️",
};

export default function CornerTile({ name, index, players, currentPlayerId }: CornerTileProps) {
  const playersHere = players.filter((p) => p.position === index && !p.bankrupt);

  return (
    <div className="glass-panel flex flex-col items-center justify-center p-2 aspect-square">
      <span className="text-xl mb-1">{CORNER_ICONS[name] ?? "❓"}</span>
      <span className="text-[9px] font-mono text-[var(--text-secondary)] text-center leading-tight">
        {name}
      </span>
      {playersHere.length > 0 && (
        <div className="flex flex-wrap gap-[2px] mt-1 justify-center">
          {playersHere.map((p) => (
            <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
          ))}
        </div>
      )}
    </div>
  );
}
