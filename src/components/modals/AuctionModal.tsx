"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import type { AuctionState, Player } from "@/types/game";

interface AuctionModalProps {
  auction: AuctionState;
  players: Player[];
  myId: string | null;
  open: boolean;
  onBid: (amount: number) => void;
  onPass: () => void;
}

export default function AuctionModal({ auction, players, myId, open, onBid, onPass }: AuctionModalProps) {
  const tile = BOARD[auction.tileIndex];
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const me = players.find((p) => p.id === myId);
  const isParticipant = auction.participants.includes(myId ?? "");
  const highBidder = players.find((p) => p.id === auction.currentBidder);

  return (
    <Modal open={open} title={`Auction: ${tile.name}`}>
      <div className="space-y-4 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-dim)]">Current bid</span>
          <span className="text-glow text-lg">{auction.currentBid} mogz</span>
        </div>

        {highBidder && (
          <div className="flex justify-between">
            <span className="text-[var(--text-dim)]">High bidder</span>
            <span className="text-[var(--text-secondary)]">{highBidder.name}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-[var(--text-dim)]">Time left</span>
          <span className={auction.timeRemaining <= 5 ? "text-red-400" : "text-[var(--text-secondary)]"}>
            {auction.timeRemaining}s
          </span>
        </div>

        {isParticipant && me && (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={auction.currentBid + 1}
              max={me.mogz}
              className="glass-panel px-3 py-2 font-mono text-sm w-24 text-[var(--text-primary)] focus:outline-none"
            />
            <Button onClick={() => onBid(bidAmount)} disabled={bidAmount <= auction.currentBid || bidAmount > me.mogz}>
              BID
            </Button>
            <Button variant="danger" onClick={onPass}>PASS</Button>
          </div>
        )}

        {!isParticipant && (
          <p className="text-[var(--text-dim)] text-center">You passed on this auction.</p>
        )}
      </div>
    </Modal>
  );
}
