"use client";

import { useState, useMemo } from "react";
import type { GameState } from "@/types/game";
import { usePartySocket } from "./usePartySocket";

export function useGameState(roomCode: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { send, connected, myId, connectionError } = usePartySocket({
    roomCode,
    onGameState: setGameState,
    onError: (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    },
  });

  const me = useMemo(
    () => gameState?.players.find((p) => p.id === myId) ?? null,
    [gameState, myId]
  );

  const isMyTurn = useMemo(
    () => gameState?.phase === "playing" && gameState.players[gameState.currentPlayerIndex]?.id === myId,
    [gameState, myId]
  );

  const isHost = useMemo(
    () => gameState?.players[0]?.id === myId,
    [gameState, myId]
  );

  return { gameState, me, myId, isMyTurn, isHost, connected, error, connectionError, send };
}
