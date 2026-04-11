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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Tile({ definition, state, players, currentPlayerId, side, onClick }: TileProps) {
  const playersOnTile = players.filter((p) => p.position === definition.index && !p.bankrupt);
  const platformColor = definition.platform ? PLATFORM_COLORS[definition.platform] : undefined;
  const isVertical = side === "left" || side === "right";

  const bg = state.owner
    ? hexToRgba(platformColor || "#00ff64", 0.15)
    : platformColor
    ? hexToRgba(platformColor, 0.06)
    : "rgba(255,255,255,0.02)";

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer flex w-full h-full border border-[rgba(255,255,255,0.06)] ${
        isVertical ? "flex-row" : "flex-col"
      }`}
      style={{ background: bg }}
    >
      {/* Color bar */}
      {platformColor && (
        <div
          className={`shrink-0 ${isVertical ? "w-[3px]" : "h-[3px] w-full"}`}
          style={{ background: platformColor }}
        />
      )}

      {isVertical ? (
        <div className="flex-1 flex flex-col items-center justify-between py-[2px] overflow-hidden">
          {/* Price top */}
          {definition.price && (
            <span className="text-[7px] md:text-[9px] font-bold text-white/80 leading-none">
              {definition.price}
            </span>
          )}
          {/* Name vertical center */}
          <span
            className="text-[6px] md:text-[8px] font-mono text-white/50 leading-none flex-1 flex items-center"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {definition.name}
          </span>
          {/* Tokens bottom */}
          {playersOnTile.length > 0 && (
            <div className="flex flex-col gap-[1px]">
              {playersOnTile.map((p) => (
                <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between p-[2px] overflow-hidden">
          {/* Price top - bold, readable */}
          {definition.price && (
            <span className="text-[7px] md:text-[9px] font-bold text-white/80 leading-none">
              {definition.price}$
            </span>
          )}
          {/* Name */}
          <span className="text-[6px] md:text-[8px] font-mono text-white/50 truncate leading-none">
            {definition.name}
          </span>
          {/* Houses + Tokens bottom row */}
          <div className="flex items-center gap-[1px] mt-auto">
            {state.houses > 0 && (
              <>
                {state.houses >= 5 ? (
                  <div className="w-[6px] h-[6px] bg-red-500 rounded-[1px]" />
                ) : (
                  Array.from({ length: state.houses }).map((_, i) => (
                    <div key={i} className="w-[4px] h-[4px] bg-green-400 rounded-full" />
                  ))
                )}
              </>
            )}
            {playersOnTile.map((p) => (
              <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
            ))}
          </div>
        </div>
      )}

      {state.mortgaged && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-[5px] font-mono text-red-400 rotate-[-20deg]">MTG</span>
        </div>
      )}
    </div>
  );
}
