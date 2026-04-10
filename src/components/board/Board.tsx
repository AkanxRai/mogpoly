"use client";

import { BOARD } from "@/lib/board-data";
import type { GameState } from "@/types/game";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import GlitchText from "@/components/ui/GlitchText";

interface BoardProps {
  gameState: GameState;
  currentPlayerId?: string;
  onTileClick?: (index: number) => void;
}

export default function Board({ gameState, currentPlayerId, onTileClick }: BoardProps) {
  const { board, players, dice } = gameState;

  // Board layout: 11x11 grid
  // Corners: (0,0)=AFK  (0,10)=GetReported  (10,0)=ShadowBan  (10,10)=Homepage
  // Top row: positions 21-29 (left to right)
  // Right col: positions 31-39 (top to bottom) — but 30 is Get Reported corner
  // Bottom row: positions 9-1 (left to right, reversed)
  // Left col: positions 11-19 (bottom to top, reversed visually means top to bottom in grid)

  const topRow = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]; // AFK ... Get Reported
  const bottomRow = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]; // Shadow Ban ... Homepage
  const leftCol = [19, 18, 17, 16, 15, 14, 13, 12, 11]; // top-to-bottom
  const rightCol = [31, 32, 33, 34, 35, 36, 37, 38, 39]; // top-to-bottom

  const renderTile = (index: number, side: "top" | "bottom" | "left" | "right") => {
    const def = BOARD[index];
    if (def.type === "corner") {
      return <CornerTile key={index} name={def.name} index={index} players={players} currentPlayerId={currentPlayerId} />;
    }
    return (
      <Tile
        key={index}
        definition={def}
        state={board[index]}
        players={players}
        currentPlayerId={currentPlayerId}
        side={side}
        onClick={() => onTileClick?.(index)}
      />
    );
  };

  return (
    <div className="grid grid-cols-11 grid-rows-11 gap-[2px] w-full max-w-[700px] aspect-square">
      {/* Top row (row 1) */}
      {topRow.map((i) => renderTile(i, "top"))}

      {/* Middle rows (rows 2-10) */}
      {leftCol.map((leftIdx, row) => (
        <div key={`row-${row}`} className="contents">
          {renderTile(leftIdx, "left")}

          {/* Center area (9 cols, only render content in center of grid) */}
          {row === 0 && (
            <div className="col-span-9 row-span-9 flex flex-col items-center justify-center gap-4 relative">
              <div className="glow-orb w-[200px] h-[200px] bg-[rgba(0,255,100,0.03)] absolute" />
              <GlitchText text="MOGPOLY" className="text-2xl md:text-3xl" as="h2" />

              {/* Dice display */}
              <div className="flex gap-3">
                <div className="glass-panel w-12 h-12 flex items-center justify-center text-xl font-mono font-bold text-glow">
                  {dice[0]}
                </div>
                <div className="glass-panel w-12 h-12 flex items-center justify-center text-xl font-mono font-bold text-glow">
                  {dice[1]}
                </div>
              </div>

              <div className="text-xs font-mono text-[var(--text-dim)]">
                {players[gameState.currentPlayerIndex]?.name}&apos;s turn
              </div>
            </div>
          )}

          {renderTile(rightCol[row], "right")}
        </div>
      ))}

      {/* Bottom row (row 11) */}
      {bottomRow.map((i) => renderTile(i, "bottom"))}
    </div>
  );
}
