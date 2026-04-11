"use client";

import Button from "@/components/ui/Button";
import type { TurnPhase } from "@/types/game";

interface ActionBarProps {
  turnPhase: TurnPhase;
  isMyTurn: boolean;
  inShadowBan: boolean;
  hasGetOutCard: boolean;
  onBuy: () => void;
  onAuction: () => void;
  onEndTurn: () => void;
  onShadowBanPay: () => void;
  onShadowBanCard: () => void;
}

export default function ActionBar({
  turnPhase, isMyTurn, inShadowBan, hasGetOutCard,
  onBuy, onAuction, onEndTurn, onShadowBanPay, onShadowBanCard,
}: ActionBarProps) {
  if (!isMyTurn) {
    return (
      <div className="glass-panel p-3 text-center">
        <p className="text-sm font-mono text-[var(--text-dim)] animate-pulse">Waiting for other player...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 flex flex-wrap gap-2 justify-center">
      {/* Shadow Ban escape options (pay/card) — roll is in the board center */}
      {turnPhase === "waiting-for-roll" && inShadowBan && (
        <>
          <Button variant="secondary" onClick={onShadowBanPay}>PAY 50M</Button>
          {hasGetOutCard && (
            <Button variant="secondary" onClick={onShadowBanCard}>USE CARD</Button>
          )}
        </>
      )}

      {turnPhase === "buy-or-auction" && (
        <>
          <Button onClick={onBuy}>BUY</Button>
          <Button variant="secondary" onClick={onAuction}>AUCTION</Button>
        </>
      )}

      {turnPhase === "turn-ended" && (
        <Button onClick={onEndTurn}>END TURN</Button>
      )}
    </div>
  );
}
