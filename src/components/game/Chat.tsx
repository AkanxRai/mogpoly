"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/types/game";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  myId: string | null;
}

export default function Chat({ messages, onSend, myId }: ChatProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="glass-panel flex flex-col h-full max-h-[300px]">
      <div className="p-2 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-mono text-[var(--text-dim)]">CHAT</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[11px] font-mono ${msg.isSystem ? "text-[var(--text-dim)] italic" : ""}`}
            >
              {!msg.isSystem && (
                <span className={msg.playerId === myId ? "text-[#00ff64]" : "text-[var(--text-secondary)]"}>
                  {msg.playerName}:{" "}
                </span>
              )}
              <span className={msg.isSystem ? "" : "text-[var(--text-secondary)]"}>{msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-[var(--border-subtle)] flex gap-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          placeholder="Type..."
          className="flex-1 bg-transparent text-[11px] font-mono text-[var(--text-primary)]
                     placeholder:text-[var(--text-dim)] focus:outline-none"
        />
        <button type="submit" className="text-[10px] font-mono text-[#00ff64] hover:text-glow">
          SEND
        </button>
      </form>
    </div>
  );
}
