"use client";

import { motion } from "framer-motion";
import type { TileDefinition, TileState, Player } from "@/types/game";
import { PLATFORM_COLORS } from "@/lib/constants";
import Token from "@/components/game/Token";

interface TileProps {
  definition: TileDefinition;
  state: TileState;
  players: Player[];
  currentPlayerId?: string;
  side: "top" | "bottom" | "left" | "right";
  onClick?: () => void;
}

export default function Tile({ definition, state, players, currentPlayerId, side, onClick }: TileProps) {
  const playersOnTile = players.filter((p) => p.position === definition.index && !p.bankrupt);
  const platformColor = definition.platform ? PLATFORM_COLORS[definition.platform] : undefined;
  const isVertical = side === "left" || side === "right";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative glass-panel overflow-hidden cursor-pointer flex ${
        isVertical ? "flex-row" : "flex-col"
      } ${state.owner ? "border-opacity-40" : ""}`}
      style={{ minHeight: isVertical ? undefined : "70px", minWidth: isVertical ? "70px" : undefined }}
    >
      {/* Platform color accent bar */}
      {platformColor && (
        <div
          className={`${isVertical ? "w-1 h-full" : "h-1 w-full"} shrink-0`}
          style={{ background: platformColor, boxShadow: `0 0 8px ${platformColor}40` }}
        />
      )}

      {/* Content */}
      <div className="flex-1 p-1 flex flex-col justify-between min-w-0">
        <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate leading-tight">
          {definition.name}
        </div>

        {definition.price && (
          <div className="text-[9px] font-mono text-[var(--text-dim)]">
            {definition.price}M
          </div>
        )}

        {/* Houses */}
        {state.houses > 0 && (
          <div className="flex gap-[2px] mt-0.5">
            {state.houses >= 5 ? (
              <div className="w-2.5 h-2.5 bg-red-500 rounded-sm text-[6px] flex items-center justify-center">H</div>
            ) : (
              Array.from({ length: state.houses }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-400 rounded-sm" />
              ))
            )}
          </div>
        )}

        {/* Tokens on this tile */}
        {playersOnTile.length > 0 && (
          <div className="flex flex-wrap gap-[2px] mt-0.5">
            {playersOnTile.map((p) => (
              <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
            ))}
          </div>
        )}
      </div>

      {/* Mortgaged overlay */}
      {state.mortgaged && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center">
          <span className="text-[8px] font-mono text-red-400 rotate-[-20deg]">MORTGAGED</span>
        </div>
      )}
    </motion.div>
  );
}
