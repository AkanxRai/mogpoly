"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import type { Player } from "@/types/game";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  me: Player;
  players: Player[];
  boardState: { owner: string | null; mortgaged: boolean }[];
  onPropose: (to: string, offerProps: number[], offerMogz: number, requestProps: number[], requestMogz: number) => void;
}

export default function TradeModal({ open, onClose, me, players, boardState, onPropose }: TradeModalProps) {
  const [targetId, setTargetId] = useState("");
  const [offerProps, setOfferProps] = useState<number[]>([]);
  const [requestProps, setRequestProps] = useState<number[]>([]);
  const [offerMogz, setOfferMogz] = useState(0);
  const [requestMogz, setRequestMogz] = useState(0);

  const otherPlayers = players.filter((p) => p.id !== me.id && !p.bankrupt);
  const target = players.find((p) => p.id === targetId);

  const myProps = me.properties.filter((i) => !boardState[i].mortgaged);
  const targetProps = target?.properties.filter((i) => !boardState[i].mortgaged) ?? [];

  const toggleProp = (index: number, list: number[], setter: (v: number[]) => void) => {
    setter(list.includes(index) ? list.filter((i) => i !== index) : [...list, index]);
  };

  const handleSend = () => {
    if (!targetId) return;
    onPropose(targetId, offerProps, offerMogz, requestProps, requestMogz);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Propose Trade">
      <div className="space-y-4 font-mono text-sm">
        <div>
          <label className="text-xs text-[var(--text-dim)] block mb-1">TRADE WITH</label>
          <select
            value={targetId}
            onChange={(e) => { setTargetId(e.target.value); setRequestProps([]); }}
            className="glass-panel w-full px-3 py-2 text-[var(--text-primary)] bg-transparent focus:outline-none"
          >
            <option value="">Select player...</option>
            {otherPlayers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Your offer */}
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-2">YOU OFFER</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {myProps.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleProp(i, offerProps, setOfferProps)}
                  className={`w-full text-left text-[10px] px-2 py-1 rounded ${
                    offerProps.includes(i) ? "bg-[rgba(0,255,100,0.1)] text-[#00ff64]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {BOARD[i].name}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={offerMogz}
              onChange={(e) => setOfferMogz(Math.max(0, Number(e.target.value)))}
              max={me.mogz}
              placeholder="Mogz"
              className="glass-panel w-full px-2 py-1 mt-2 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* You request */}
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-2">YOU REQUEST</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {targetProps.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleProp(i, requestProps, setRequestProps)}
                  className={`w-full text-left text-[10px] px-2 py-1 rounded ${
                    requestProps.includes(i) ? "bg-[rgba(255,100,0,0.1)] text-[#ff6b35]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {BOARD[i].name}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={requestMogz}
              onChange={(e) => setRequestMogz(Math.max(0, Number(e.target.value)))}
              placeholder="Mogz"
              className="glass-panel w-full px-2 py-1 mt-2 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSend} disabled={!targetId}>SEND TRADE</Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>CANCEL</Button>
        </div>
      </div>
    </Modal>
  );
}
