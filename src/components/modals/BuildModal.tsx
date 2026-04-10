"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD, getPlatformTiles } from "@/lib/board-data";
import { canBuild, canSellBuilding } from "@/lib/game-logic";
import { PLATFORM_COLORS, PLATFORM_LABELS, HOTEL_VALUE } from "@/lib/constants";
import type { Player, TileState } from "@/types/game";

interface BuildModalProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  board: TileState[];
  onBuild: (tileIndex: number) => void;
  onSell: (tileIndex: number) => void;
}

export default function BuildModal({ open, onClose, player, board, onBuild, onSell }: BuildModalProps) {
  // Group properties by platform
  const platforms = [...new Set(player.properties.map((i) => BOARD[i].platform).filter(Boolean))] as string[];

  return (
    <Modal open={open} onClose={onClose} title="Build">
      <div className="space-y-4 font-mono text-sm">
        {platforms.map((platform) => {
          const tiles = getPlatformTiles(platform);
          const color = PLATFORM_COLORS[platform];

          return (
            <div key={platform} className="glass-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-xs">{PLATFORM_LABELS[platform]}</span>
              </div>

              <div className="space-y-2">
                {tiles.map((i) => {
                  const def = BOARD[i];
                  const state = board[i];
                  if (state.owner !== player.id) return null;

                  const buildable = canBuild(i, player.id, board);
                  const sellable = canSellBuilding(i, player.id, board);
                  const affordable = (def.houseCost ?? 0) <= player.mogz;

                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{def.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-dim)]">
                          {state.houses >= HOTEL_VALUE ? "🏨" : `${"🏠".repeat(state.houses)}`}
                        </span>
                        <Button size="sm" onClick={() => onSell(i)} disabled={!sellable}>-</Button>
                        <Button size="sm" onClick={() => onBuild(i)} disabled={!buildable || !affordable}>+</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {platforms.length === 0 && (
          <p className="text-[var(--text-dim)] text-center">No complete platform groups owned.</p>
        )}

        <Button variant="secondary" className="w-full" onClick={onClose}>CLOSE</Button>
      </div>
    </Modal>
  );
}
