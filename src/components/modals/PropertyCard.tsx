"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants";

interface PropertyCardProps {
  tileIndex: number;
  open: boolean;
  onBuy: () => void;
  onAuction: () => void;
  playerMogz: number;
}

export default function PropertyCard({ tileIndex, open, onBuy, onAuction, playerMogz }: PropertyCardProps) {
  const tile = BOARD[tileIndex];
  if (!tile) return null;

  const color = tile.platform ? PLATFORM_COLORS[tile.platform] : "#00ff64";
  const canAfford = (tile.price ?? 0) <= playerMogz;

  return (
    <Modal open={open} title={tile.name}>
      {/* Color bar */}
      {tile.platform && (
        <div className="h-2 rounded-full mb-4" style={{ background: color, boxShadow: `0 0 12px ${color}40` }} />
      )}

      <div className="space-y-3 font-mono text-sm">
        {tile.platform && (
          <div className="text-xs text-[var(--text-dim)]">{PLATFORM_LABELS[tile.platform]}</div>
        )}

        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Price</span>
          <span className="text-glow">{tile.price} mogz</span>
        </div>

        {tile.rent && tile.type === "property" && (
          <div className="glass-panel p-3 space-y-1 text-xs">
            <div className="flex justify-between"><span>Base rent</span><span>{tile.rent[0]}</span></div>
            <div className="flex justify-between"><span>1 Server</span><span>{tile.rent[1]}</span></div>
            <div className="flex justify-between"><span>2 Servers</span><span>{tile.rent[2]}</span></div>
            <div className="flex justify-between"><span>3 Servers</span><span>{tile.rent[3]}</span></div>
            <div className="flex justify-between"><span>4 Servers</span><span>{tile.rent[4]}</span></div>
            <div className="flex justify-between"><span>Data Center</span><span>{tile.rent[5]}</span></div>
            {tile.houseCost && (
              <div className="flex justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
                <span>Server cost</span><span>{tile.houseCost} each</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={onBuy} disabled={!canAfford}>
            BUY ({tile.price}M)
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onAuction}>
            AUCTION
          </Button>
        </div>
      </div>
    </Modal>
  );
}
