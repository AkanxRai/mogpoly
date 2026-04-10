"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ClientMessage, ServerMessage, GameState } from "@/types/game";

interface UsePartySocketOptions {
  roomCode: string;
  host?: string;
  onGameState?: (state: GameState) => void;
  onError?: (message: string) => void;
  onConnected?: (id: string) => void;
}

export function usePartySocket({
  roomCode, host, onGameState, onError, onConnected,
}: UsePartySocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const partyHost = host ?? process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";
    const protocol = partyHost.startsWith("localhost") ? "ws" : "wss";
    const url = `${protocol}://${partyHost}/party/${roomCode}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const msg: ServerMessage = JSON.parse(event.data);
      switch (msg.type) {
        case "game-state":
          onGameState?.(msg.state);
          break;
        case "error":
          onError?.(msg.message);
          break;
        case "connected":
          setMyId(msg.id);
          onConnected?.(msg.id);
          break;
      }
    };

    return () => { ws.close(); };
  }, [roomCode, host]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send, connected, myId };
}
