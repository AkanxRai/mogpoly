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

const CORNER_SHORT: Record<string, string> = {
  Homepage: "HOME",
  "Shadow Ban": "BAN",
  AFK: "AFK",
  "Get Reported": "REPORT",
};

export default function CornerTile({ name, index, players, currentPlayerId }: CornerTileProps) {
  const playersHere = players.filter((p) => p.position === index && !p.bankrupt);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
      <span className="text-[10px] md:text-lg">{CORNER_ICONS[name] ?? "❓"}</span>
      <span className="text-[5px] md:text-[7px] font-bold text-white/40 text-center leading-tight">
        {CORNER_SHORT[name] ?? name}
      </span>
      {playersHere.length > 0 && (
        <div className="flex flex-wrap gap-[1px] mt-[1px] justify-center">
          {playersHere.map((p) => (
            <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
          ))}
        </div>
      )}
    </div>
  );
}
