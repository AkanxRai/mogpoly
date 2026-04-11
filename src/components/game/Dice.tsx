"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiceProps {
  values: [number, number];
  rolling?: boolean;
  onRollComplete?: () => void;
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DieFace({ value }: { value: number }) {
  const dots = DOT_POSITIONS[value] ?? [];
  return (
    <div className="relative w-full h-full">
      {dots.map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-[18%] h-[18%] rounded-full bg-[#00ff64] shadow-[0_0_6px_rgba(0,255,100,0.6)]"
          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
        />
      ))}
    </div>
  );
}

export default function Dice({ values, rolling, onRollComplete }: DiceProps) {
  const [displayValues, setDisplayValues] = useState(values);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (rolling && !isAnimating) {
      setIsAnimating(true);
      let frame = 0;
      const totalFrames = 15;
      const interval = setInterval(() => {
        frame++;
        setDisplayValues([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]);
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayValues(values);
          setIsAnimating(false);
          onRollComplete?.();
        }
      }, 60);
      return () => clearInterval(interval);
    }
    if (!rolling) {
      setDisplayValues(values);
    }
  }, [rolling, values]);

  return (
    <div className="flex gap-4">
      {displayValues.map((val, i) => (
        <motion.div
          key={i}
          animate={isAnimating ? {
            rotate: [0, -8, 8, -5, 5, 0],
            y: [0, -6, 4, -3, 2, 0],
            scale: [1, 1.08, 0.95, 1.04, 0.98, 1],
          } : { rotate: 0, y: 0, scale: 1 }}
          transition={isAnimating ? {
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          } : { type: "spring", damping: 12 }}
          className={`glass-panel w-16 h-16 p-2 ${
            isAnimating
              ? "border-[rgba(0,255,100,0.4)] shadow-[0_0_20px_rgba(0,255,100,0.2)]"
              : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${val}-${isAnimating}`}
              initial={{ opacity: 0, scale: 0.6, rotateZ: -20 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotateZ: 20 }}
              transition={{ duration: 0.08 }}
              className="w-full h-full"
            >
              <DieFace value={val} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
