"use client";

import { useRef, useEffect } from "react";
import { BOARD } from "@/lib/board-data";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants";
import type { GameState, ChatMessage } from "@/types/game";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import Dice from "@/components/game/Dice";
import Button from "@/components/ui/Button";

interface BoardProps {
  gameState: GameState;
  currentPlayerId?: string;
  onTileClick?: (index: number) => void;
  isMyTurn?: boolean;
  onRoll?: () => void;
  onEndTurn?: () => void;
  onBuy?: () => void;
  onAuction?: () => void;
  onShadowBanPay?: () => void;
  onShadowBanCard?: () => void;
  inShadowBan?: boolean;
  hasGetOutCard?: boolean;
  playerMogz?: number;
}

export default function Board({
  gameState, currentPlayerId, onTileClick, isMyTurn,
  onRoll, onEndTurn, onBuy, onAuction,
  onShadowBanPay, onShadowBanCard,
  inShadowBan, hasGetOutCard, playerMogz,
}: BoardProps) {
  const { board, players, dice, messages } = gameState;
  const logRef = useRef<HTMLDivElement>(null);

  const showRollButton = isMyTurn && gameState.turnPhase === "waiting-for-roll";
  const showEndTurnButton = isMyTurn && gameState.turnPhase === "turn-ended";
  const showBuyAuction = isMyTurn && gameState.turnPhase === "buy-or-auction";
  const currentTile = showBuyAuction ? BOARD[players[gameState.currentPlayerIndex]?.position ?? 0] : null;
  const canAfford = currentTile?.price ? (playerMogz ?? 0) >= currentTile.price : false;

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const topRow = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const bottomRow = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const leftCol = [19, 18, 17, 16, 15, 14, 13, 12, 11];
  const rightCol = [31, 32, 33, 34, 35, 36, 37, 38, 39];

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

  // Get last 8 system messages for the log
  const recentLogs = messages.filter((m) => m.isSystem).slice(-8);

  return (
    <div className="grid grid-cols-11 grid-rows-11 gap-[1px] md:gap-[2px] w-full max-w-[700px] max-h-[calc(100dvh-80px)] aspect-square">
      {topRow.map((i) => renderTile(i, "top"))}

      {leftCol.map((leftIdx, row) => (
        <div key={`row-${row}`} className="contents">
          {renderTile(leftIdx, "left")}

          {row === 0 && (
            <div className="col-span-9 row-span-9 flex flex-col items-center justify-between p-2 md:p-4 relative overflow-hidden">
              <div className="glow-orb w-[200px] h-[200px] bg-[rgba(0,255,100,0.03)] absolute" />

              {/* Game Log */}
              <div
                ref={logRef}
                className="w-full flex-1 overflow-y-auto max-h-[30%] mb-2 scrollbar-hide"
              >
                {recentLogs.map((msg) => (
                  <div key={msg.id} className="text-[9px] md:text-[11px] font-mono text-[var(--text-dim)] leading-relaxed truncate">
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Dice */}
              <div className="flex flex-col items-center gap-3 z-10">
                <Dice values={dice} />

                {/* Action buttons directly below dice */}
                {showRollButton && !inShadowBan && (
                  <Button size="md" onClick={onRoll}>ROLL DICE</Button>
                )}

                {showRollButton && inShadowBan && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" onClick={onRoll}>ROLL DOUBLES</Button>
                    <Button size="sm" variant="secondary" onClick={onShadowBanPay}>PAY 50M</Button>
                    {hasGetOutCard && (
                      <Button size="sm" variant="secondary" onClick={onShadowBanCard}>USE CARD</Button>
                    )}
                  </div>
                )}

                {/* Buy/Auction inline (like richup.io) */}
                {showBuyAuction && currentTile && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs font-mono text-[var(--text-secondary)] text-center">
                      <span
                        className="font-bold"
                        style={{ color: currentTile.platform ? PLATFORM_COLORS[currentTile.platform] : "#00ff64" }}
                      >
                        {currentTile.name}
                      </span>
                      {currentTile.platform && (
                        <span className="text-[var(--text-dim)]"> · {PLATFORM_LABELS[currentTile.platform]}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={onBuy} disabled={!canAfford}>
                        BUY {currentTile.price}M
                      </Button>
                      <Button size="sm" variant="secondary" onClick={onAuction}>
                        AUCTION
                      </Button>
                    </div>
                  </div>
                )}

                {showEndTurnButton && (
                  <Button size="md" variant="secondary" onClick={onEndTurn}>END TURN</Button>
                )}

                {!showRollButton && !showEndTurnButton && !showBuyAuction && (
                  <div className="text-[10px] md:text-xs font-mono text-[var(--text-dim)]">
                    {players[gameState.currentPlayerIndex]?.name}&apos;s turn
                  </div>
                )}
              </div>

              {/* Current player indicator */}
              <div className="text-[9px] md:text-[10px] font-mono text-[var(--text-dim)] mt-2">
                {dice[0] + dice[1] > 0 && `Last roll: ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}`}
              </div>
            </div>
          )}

          {renderTile(rightCol[row], "right")}
        </div>
      ))}

      {bottomRow.map((i) => renderTile(i, "bottom"))}
    </div>
  );
}
