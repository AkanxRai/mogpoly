"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGameState } from "@/hooks/useGameState";
import Button from "@/components/ui/Button";
import GlitchText from "@/components/ui/GlitchText";
import RoomLink from "@/components/lobby/RoomLink";
import PlayerList from "@/components/lobby/PlayerList";
import TokenPicker from "@/components/lobby/TokenPicker";
import type { TokenType } from "@/types/game";

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const { gameState, me, myId, isMyTurn, isHost, connected, error, send } = useGameState(code);

  const [name, setName] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (!name.trim() || !selectedToken) return;
    send({ type: "join", name: name.trim(), token: selectedToken });
    setJoined(true);
  };

  const handleStart = () => {
    send({ type: "start-game" });
  };

  if (!connected) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-[var(--text-secondary)] animate-pulse">Connecting...</p>
      </main>
    );
  }

  // --- LOBBY ---
  if (gameState?.phase === "lobby") {
    const takenTokens = gameState.players.map((p) => p.token) as TokenType[];

    if (!joined || !me) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 relative">
          <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,255,100,0.04)] top-[5%] right-[10%] absolute" />

          <GlitchText text="MOGPOLY" className="text-4xl" />
          <RoomLink code={code} />

          <div className="glass-panel p-6 w-full max-w-md space-y-4">
            <div>
              <label className="text-xs text-[var(--text-dim)] font-mono block mb-1">YOUR NAME</label>
              <input
                type="text"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name..."
                className="glass-panel w-full px-4 py-2.5 font-mono text-sm text-[var(--text-primary)]
                           placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[rgba(0,255,100,0.4)]"
              />
            </div>

            <TokenPicker selected={selectedToken} onSelect={setSelectedToken} takenTokens={takenTokens} />

            <Button size="lg" className="w-full" onClick={handleJoin} disabled={!name.trim() || !selectedToken}>
              JOIN GAME
            </Button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-mono">
              {error}
            </motion.p>
          )}
        </main>
      );
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 relative">
        <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,255,100,0.04)] top-[5%] right-[10%] absolute" />

        <GlitchText text="MOGPOLY" className="text-4xl" />
        <RoomLink code={code} />
        <PlayerList players={gameState.players} hostId={gameState.players[0]?.id} myId={myId} />

        {isHost && (
          <Button size="lg" onClick={handleStart} disabled={gameState.players.length < 2}>
            START GAME ({gameState.players.length}/6)
          </Button>
        )}

        {!isHost && (
          <p className="text-[var(--text-secondary)] text-sm font-mono animate-pulse">
            Waiting for host to start...
          </p>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-mono">
            {error}
          </motion.p>
        )}
      </main>
    );
  }

  // --- PLAYING ---
  if (gameState?.phase === "playing") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-[var(--text-secondary)]">Game board coming in Task 10...</p>
      </main>
    );
  }

  // --- ENDED ---
  if (gameState?.phase === "ended") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-[var(--text-secondary)]">End screen coming in Task 12...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-[var(--text-secondary)] animate-pulse">Loading...</p>
    </main>
  );
}
