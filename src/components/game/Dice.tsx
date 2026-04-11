"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface DiceProps {
  values: [number, number];
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

export default function Dice({ values }: DiceProps) {
  const [displayValues, setDisplayValues] = useState<[number, number]>(values);
  const [animating, setAnimating] = useState(false);
  const prevValues = useRef<[number, number]>(values);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Detect if dice values actually changed (someone rolled)
    const changed = values[0] !== prevValues.current[0] || values[1] !== prevValues.current[1];
    prevValues.current = values;

    if (!changed) {
      setDisplayValues(values);
      return;
    }

    // Start roll animation
    setAnimating(true);
    let frame = 0;
    const totalFrames = 12;

    if (animationRef.current) clearInterval(animationRef.current);

    animationRef.current = setInterval(() => {
      frame++;
      setDisplayValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      if (frame >= totalFrames) {
        if (animationRef.current) clearInterval(animationRef.current);
        animationRef.current = null;
        setDisplayValues(values);
        setAnimating(false);
      }
    }, 65);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [values[0], values[1]]);

  return (
    <div className="flex gap-4">
      {displayValues.map((val, i) => (
        <motion.div
          key={i}
          animate={animating ? {
            y: [0, -12, 0, -6, 0],
            rotate: [0, -10, 10, -5, 0],
          } : { y: 0, rotate: 0 }}
          transition={animating ? {
            duration: 0.4,
            repeat: 1,
            ease: "easeOut",
          } : { type: "spring", damping: 20, stiffness: 300 }}
          className={`glass-panel w-16 h-16 p-2 transition-shadow duration-200 ${
            animating ? "shadow-[0_0_25px_rgba(0,255,100,0.3)] border-[rgba(0,255,100,0.5)]" : ""
          }`}
        >
          <DieFace value={val} />
        </motion.div>
      ))}
    </div>
  );
}
