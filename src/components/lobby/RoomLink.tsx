"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined"
    ? `${window.location.origin}/room/${code}`
    : `/room/${code}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--text-dim)] font-mono mb-1">ROOM CODE</div>
        <div className="text-2xl font-mono font-bold text-glow tracking-[0.4em]">{code}</div>
        <div className="text-xs text-[var(--text-dim)] font-mono mt-1 truncate">{link}</div>
      </div>
      <button
        onClick={copy}
        className="glass-panel px-3 py-2 text-xs font-mono hover:bg-[rgba(0,255,100,0.1)] transition-colors"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#00ff64]">
              COPIED
            </motion.span>
          ) : (
            <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              COPY
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
