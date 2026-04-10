"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Player, TileState } from "@/types/game";
import { BOARD } from "@/lib/board-data";

interface BankruptWarningProps {
  open: boolean;
  player: Player;
  board: TileState[];
  onMortgage: (tileIndex: number) => void;
  onSellBuilding: (tileIndex: number) => void;
}

export default function BankruptWarning({ open, player, board, onMortgage, onSellBuilding }: BankruptWarningProps) {
  const debt = Math.abs(player.mogz);

  return (
    <Modal open={open} title="Bankruptcy Warning ⚠️">
      <div className="space-y-4 font-mono text-sm">
        <p className="text-red-400 text-center">
          You owe {debt} mogz! Sell or mortgage to cover your debt.
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {player.properties.map((i) => {
            const def = BOARD[i];
            const state = board[i];

            return (
              <div key={i} className="flex items-center justify-between text-xs glass-panel p-2">
                <span className="text-[var(--text-secondary)] truncate">{def.name}</span>
                <div className="flex gap-1">
                  {state.houses > 0 && (
                    <Button size="sm" variant="danger" onClick={() => onSellBuilding(i)}>
                      SELL 🏠
                    </Button>
                  )}
                  {!state.mortgaged && state.houses === 0 && (
                    <Button size="sm" variant="secondary" onClick={() => onMortgage(i)}>
                      MORTGAGE ({def.mortgageValue}M)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
