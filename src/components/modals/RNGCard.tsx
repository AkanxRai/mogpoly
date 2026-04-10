"use client";

import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import type { Card } from "@/types/game";

interface RNGCardProps {
  card: Card | null;
  open: boolean;
  deckType: "rng" | "dms";
}

export default function RNGCard({ card, open, deckType }: RNGCardProps) {
  if (!card) return null;

  return (
    <Modal open={open} title={deckType === "rng" ? "RNG" : "DMs"}>
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="glass-panel p-6 text-center"
      >
        <div className="text-3xl mb-4">{deckType === "rng" ? "🎲" : "💌"}</div>
        <p className="font-mono text-sm text-[var(--text-secondary)] leading-relaxed">
          {card.text}
        </p>
      </motion.div>
    </Modal>
  );
}
