"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ShadowBanModalProps {
  open: boolean;
  turnsRemaining: number;
  hasCard: boolean;
  mogz: number;
  onPay: () => void;
  onUseCard: () => void;
  onRoll: () => void;
}

export default function ShadowBanModal({ open, turnsRemaining, hasCard, mogz, onPay, onUseCard, onRoll }: ShadowBanModalProps) {
  return (
    <Modal open={open} title="Shadow Banned 🚫">
      <div className="space-y-4 font-mono text-sm text-center">
        <p className="text-[var(--text-secondary)]">
          You&apos;ve been Shadow Banned! Escape to continue playing.
        </p>
        <p className="text-[var(--text-dim)] text-xs">
          Attempts: {turnsRemaining}/3
        </p>

        <div className="space-y-2">
          <Button className="w-full" onClick={onRoll}>ROLL FOR DOUBLES</Button>
          <Button variant="secondary" className="w-full" onClick={onPay} disabled={mogz < 50}>
            PAY 50 MOGZ
          </Button>
          {hasCard && (
            <Button variant="secondary" className="w-full" onClick={onUseCard}>
              USE GET OUT OF BAN CARD
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
