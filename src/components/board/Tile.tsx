"use client";

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

  // Tile background — subtle tint of platform color
  const tileBg = platformColor
    ? `rgba(${parseInt(platformColor.slice(1, 3), 16)}, ${parseInt(platformColor.slice(3, 5), 16)}, ${parseInt(platformColor.slice(5, 7), 16)}, 0.08)`
    : "rgba(255,255,255,0.02)";

  const ownerBg = state.owner
    ? `rgba(${parseInt((platformColor || "#00ff64").slice(1, 3), 16)}, ${parseInt((platformColor || "#00ff64").slice(3, 5), 16)}, ${parseInt((platformColor || "#00ff64").slice(5, 7), 16)}, 0.15)`
    : tileBg;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer flex w-full h-full border border-[rgba(255,255,255,0.06)] ${
        isVertical ? "flex-row" : "flex-col"
      }`}
      style={{ background: state.owner ? ownerBg : tileBg }}
    >
      {/* Platform color accent bar */}
      {platformColor && (
        <div
          className={`shrink-0 ${isVertical ? "w-[3px]" : "h-[3px] w-full"}`}
          style={{ background: platformColor }}
        />
      )}

      {/* Content */}
      {isVertical ? (
        // Vertical tiles (left/right) — rotated text
        <div className="flex-1 flex flex-col items-center justify-between py-0.5 px-[2px] min-w-0 overflow-hidden">
          <div
            className="text-[7px] md:text-[9px] font-mono text-[var(--text-secondary)] whitespace-nowrap leading-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {definition.name}
          </div>
          {definition.price && (
            <div className="text-[6px] md:text-[8px] font-mono text-[var(--text-dim)]">
              {definition.price}
            </div>
          )}
          {playersOnTile.length > 0 && (
            <div className="flex flex-col gap-[1px]">
              {playersOnTile.map((p) => (
                <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Horizontal tiles (top/bottom)
        <div className="flex-1 p-[2px] md:p-1 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="text-[6px] md:text-[9px] font-mono text-[var(--text-secondary)] truncate leading-tight">
            {definition.name}
          </div>
          {definition.price && (
            <div className="text-[5px] md:text-[8px] font-mono text-[var(--text-dim)]">
              {definition.price}
            </div>
          )}
          {/* Houses */}
          {state.houses > 0 && (
            <div className="flex gap-[1px]">
              {state.houses >= 5 ? (
                <div className="w-2 h-2 bg-red-500 rounded-sm text-[5px] flex items-center justify-center">H</div>
              ) : (
                Array.from({ length: state.houses }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-green-400 rounded-full" />
                ))
              )}
            </div>
          )}
          {playersOnTile.length > 0 && (
            <div className="flex flex-wrap gap-[1px]">
              {playersOnTile.map((p) => (
                <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mortgaged overlay */}
      {state.mortgaged && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center">
          <span className="text-[6px] font-mono text-red-400 rotate-[-20deg]">MTG</span>
        </div>
      )}
    </div>
  );
}
