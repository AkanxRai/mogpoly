"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ClientMessage, ServerMessage, GameState } from "@/types/game";

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "mogpoly.akanxrai.partykit.dev";

interface UsePartySocketOptions {
  roomCode: string;
  onGameState?: (state: GameState) => void;
  onError?: (message: string) => void;
  onConnected?: (id: string) => void;
}

export function usePartySocket({
  roomCode, onGameState, onError, onConnected,
}: UsePartySocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnects = 3;

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      const protocol = PARTYKIT_HOST.includes("localhost") ? "ws" : "wss";
      const url = `${protocol}://${PARTYKIT_HOST}/party/${roomCode}`;

      try {
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setConnectionError(null);
          reconnectAttempts.current = 0;
        };

        ws.onclose = (event) => {
          setConnected(false);
          wsRef.current = null;

          // Auto-reconnect if not intentional close
          if (!event.wasClean && reconnectAttempts.current < maxReconnects) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 5000);
            setConnectionError(`Connection lost. Reconnecting... (${reconnectAttempts.current}/${maxReconnects})`);
            reconnectTimeout = setTimeout(connect, delay);
          } else if (reconnectAttempts.current >= maxReconnects) {
            setConnectionError("Unable to connect to game server. Please refresh the page.");
          }
        };

        ws.onerror = () => {
          setConnectionError("Connection error. Retrying...");
        };

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
      } catch {
        setConnectionError("Failed to connect to game server.");
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [roomCode]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send, connected, myId, connectionError };
}
