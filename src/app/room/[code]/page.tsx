"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGameState } from "@/hooks/useGameState";
import Button from "@/components/ui/Button";
import GlitchText from "@/components/ui/GlitchText";
import Modal from "@/components/ui/Modal";
import RoomLink from "@/components/lobby/RoomLink";
import PlayerList from "@/components/lobby/PlayerList";
import TokenPicker from "@/components/lobby/TokenPicker";
import Board from "@/components/board/Board";
import PlayerStats from "@/components/game/PlayerStats";
import Chat from "@/components/game/Chat";
import Token from "@/components/game/Token";
import RNGCard from "@/components/modals/RNGCard";
import AuctionModal from "@/components/modals/AuctionModal";
import TradeModal from "@/components/modals/TradeModal";
import BuildModal from "@/components/modals/BuildModal";
import BankruptWarning from "@/components/modals/BankruptWarning";
import { BOARD } from "@/lib/board-data";
import type { TokenType } from "@/types/game";

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const { gameState, me, myId, isMyTurn, isHost, connected, error, connectionError, send } = useGameState(code);

  const [name, setName] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [joined, setJoined] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [showBuild, setShowBuild] = useState(false);

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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        {connectionError ? (
          <>
            <p className="font-mono text-red-400 text-sm text-center max-w-md">{connectionError}</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-panel px-4 py-2 font-mono text-sm text-[#00ff64] hover:bg-[rgba(0,255,100,0.1)] transition-colors"
            >
              REFRESH
            </button>
          </>
        ) : (
          <p className="font-mono text-[var(--text-secondary)] animate-pulse">Connecting...</p>
        )}
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
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const landedTile = me ? BOARD[me.position] : null;

    return (
      <main className="flex h-dvh flex-col items-center p-1 md:p-4 gap-1 relative overflow-hidden">
        <div className="glow-orb w-[300px] h-[300px] bg-[rgba(0,255,100,0.03)] top-0 left-0 absolute" />

        <PlayerStats players={gameState.players} currentPlayerIndex={gameState.currentPlayerIndex} myId={myId} />

        <div className="flex gap-4 w-full max-w-[900px] justify-center flex-1 min-h-0">
          <div className="flex-1 flex items-start md:items-center justify-center min-h-0">
            <Board
              gameState={gameState}
              currentPlayerId={currentPlayer?.id}
              isMyTurn={isMyTurn}
              onRoll={() => send({ type: "roll-dice" })}
              onEndTurn={() => send({ type: "end-turn" })}
              onBuy={() => send({ type: "buy-property" })}
              onAuction={() => send({ type: "auction-start" })}
              onShadowBanPay={() => send({ type: "shadow-ban-pay" })}
              onShadowBanCard={() => send({ type: "shadow-ban-card" })}
              inShadowBan={me?.inShadowBan ?? false}
              hasGetOutCard={(me?.getOutOfBanCards ?? 0) > 0}
              playerMogz={me?.mogz ?? 0}
            />
          </div>
          <div className="w-[200px] shrink-0 hidden lg:block">
            <Chat messages={gameState.messages} onSend={(text) => send({ type: "chat", text })} myId={myId} />
          </div>
        </div>

        {/* Bottom action bar - only trade/build */}
        {isMyTurn && me && (
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="secondary" onClick={() => setShowTrade(true)}>TRADE</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowBuild(true)}>BUILD</Button>
          </div>
        )}

        {/* RNG/DMs Card Modal */}
        {gameState.turnPhase === "drawing-card" && gameState.currentCard && (
          <RNGCard
            card={gameState.currentCard}
            open
            deckType={BOARD[currentPlayer.position]?.type === "rng" ? "rng" : "dms"}
          />
        )}

        {/* Auction Modal */}
        {gameState.auction && (
          <AuctionModal
            auction={gameState.auction}
            players={gameState.players}
            myId={myId}
            open
            onBid={(amount) => send({ type: "auction-bid", amount })}
            onPass={() => send({ type: "auction-pass" })}
          />
        )}

        {/* Trade Modal */}
        {showTrade && me && (
          <TradeModal
            open
            onClose={() => setShowTrade(false)}
            me={me}
            players={gameState.players}
            boardState={gameState.board}
            onPropose={(to, offerProps, offerMogz, requestProps, requestMogz) => {
              send({
                type: "trade-propose",
                trade: { from: me.id, to, offerProperties: offerProps, offerMogz, requestProperties: requestProps, requestMogz },
              });
            }}
          />
        )}

        {/* Build Modal */}
        {showBuild && me && (
          <BuildModal
            open
            onClose={() => setShowBuild(false)}
            player={me}
            board={gameState.board}
            onBuild={(i) => send({ type: "build", tileIndex: i })}
            onSell={(i) => send({ type: "sell-building", tileIndex: i })}
          />
        )}

        {/* Bankruptcy Warning */}
        {gameState.turnPhase === "bankrupt" && me && (
          <BankruptWarning
            open
            player={me}
            board={gameState.board}
            onMortgage={(i) => send({ type: "mortgage", tileIndex: i })}
            onSellBuilding={(i) => send({ type: "sell-building", tileIndex: i })}
          />
        )}

        {/* Trade offers received */}
        {gameState.tradeOffers
          .filter((t) => t.to === myId)
          .map((trade) => {
            const from = gameState.players.find((p) => p.id === trade.from);
            return (
              <Modal key={trade.id} open title={`Trade from ${from?.name}`}>
                <div className="space-y-3 font-mono text-sm">
                  <div>
                    <div className="text-xs text-[var(--text-dim)]">THEY OFFER</div>
                    {trade.offerProperties.map((i) => <div key={i} className="text-xs">{BOARD[i].name}</div>)}
                    {trade.offerMogz > 0 && <div className="text-xs">{trade.offerMogz} mogz</div>}
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-dim)]">THEY WANT</div>
                    {trade.requestProperties.map((i) => <div key={i} className="text-xs">{BOARD[i].name}</div>)}
                    {trade.requestMogz > 0 && <div className="text-xs">{trade.requestMogz} mogz</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => send({ type: "trade-accept", tradeId: trade.id })}>ACCEPT</Button>
                    <Button variant="danger" className="flex-1" onClick={() => send({ type: "trade-reject", tradeId: trade.id })}>REJECT</Button>
                  </div>
                </div>
              </Modal>
            );
          })}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-mono">
            {error}
          </motion.p>
        )}
      </main>
    );
  }

  // --- ENDED ---
  if (gameState?.phase === "ended") {
    const winner = gameState.players.find((p) => p.id === gameState.winner);
    const sorted = [...gameState.players].sort((a, b) => {
      if (a.bankrupt && !b.bankrupt) return 1;
      if (!a.bankrupt && b.bankrupt) return -1;
      return b.mogz - a.mogz;
    });

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 relative">
        <div className="glow-orb w-[500px] h-[500px] bg-[rgba(0,255,100,0.06)] absolute" />

        <GlitchText text={`${winner?.name ?? "?"} WINS!`} className="text-4xl md:text-6xl" />

        <div className="glass-panel p-6 w-full max-w-md">
          <div className="text-xs text-[var(--text-dim)] font-mono mb-4">FINAL STANDINGS</div>
          <div className="space-y-3">
            {sorted.map((player, i) => (
              <div key={player.id} className="flex items-center gap-3 font-mono text-sm">
                <span className="text-[var(--text-dim)] w-6">#{i + 1}</span>
                <Token token={player.token} size="sm" />
                <span className={`flex-1 ${player.bankrupt ? "line-through text-[var(--text-dim)]" : ""}`}>
                  {player.name}
                </span>
                <span className="text-[var(--text-dim)]">{player.mogz}M</span>
                <span className="text-[var(--text-dim)]">{player.properties.length}🏠</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={() => window.location.reload()}>PLAY AGAIN</Button>
          <Button size="lg" variant="secondary" onClick={() => window.location.href = "/"}>HOME</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-[var(--text-secondary)] animate-pulse">Loading...</p>
    </main>
  );
}
