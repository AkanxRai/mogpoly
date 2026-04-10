"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GlitchText from "@/components/ui/GlitchText";
import { ROOM_CODE_LENGTH } from "@/lib/constants";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = () => {
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length === ROOM_CODE_LENGTH) {
      router.push(`/room/${code}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative px-4">
      <div className="glow-orb w-[500px] h-[500px] bg-[rgba(0,255,100,0.05)] top-[5%] left-[10%] absolute" />
      <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,200,255,0.03)] bottom-[10%] right-[15%] absolute" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 z-10"
      >
        <GlitchText text="MOGPOLY" className="text-6xl md:text-8xl" />
        <p className="text-[var(--text-secondary)] text-sm font-mono tracking-widest uppercase">
          Internet Monopoly
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4 mt-8"
        >
          <Button size="lg" onClick={handleCreate}>
            CREATE ROOM
          </Button>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              placeholder="ROOM CODE"
              maxLength={ROOM_CODE_LENGTH}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="glass-panel px-4 py-2.5 font-mono text-sm text-center tracking-[0.3em] w-40
                         text-[var(--text-primary)] placeholder:text-[var(--text-dim)]
                         focus:outline-none focus:border-[rgba(0,255,100,0.4)]"
            />
            <Button variant="secondary" onClick={handleJoin} disabled={joinCode.length !== ROOM_CODE_LENGTH}>
              JOIN
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-[var(--text-dim)] text-xs font-mono"
        >
          <a href="https://ko-fi.com/" target="_blank" rel="noopener" className="hover:text-[var(--text-secondary)] transition-colors">
            Buy the Dev a Coffee
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}
