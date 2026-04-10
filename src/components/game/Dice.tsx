"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DiceProps {
  values: [number, number];
  rolling?: boolean;
}

export default function Dice({ values, rolling }: DiceProps) {
  return (
    <div className="flex gap-3">
      {values.map((val, i) => (
        <motion.div
          key={i}
          animate={rolling ? {
            rotateX: [0, 360, 720],
            rotateY: [0, 180, 360],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="glass-panel w-14 h-14 flex items-center justify-center text-2xl font-mono font-bold text-glow"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={val}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {val}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
