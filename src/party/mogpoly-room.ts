import type { Party, Server, Connection } from "partykit/server";
import type {
  GameState, Player, TileState, ClientMessage, ServerMessage,
  Trade, Card, TurnPhase, AuctionState, ChatMessage,
} from "@/types/game";
import { BOARD, getPlatformTiles } from "@/lib/board-data";
import { RNG_CARDS, DMS_CARDS, shuffleDeck } from "@/lib/card-decks";
import {
  calculateRent, calculateNetWorth, calculatePaywallTax,
  canBuild, canSellBuilding, ownsFullPlatform,
} from "@/lib/game-logic";
import {
  STARTING_MOGZ, PASS_HOMEPAGE_BONUS, SUB_FEE_AMOUNT,
  SHADOW_BAN_FEE, MAX_PLAYERS, MIN_PLAYERS,
  MAX_SHADOW_BAN_TURNS, AUCTION_TIMER_SECONDS, HOTEL_VALUE,
  MAX_CHAT_MESSAGES,
} from "@/lib/constants";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export default class MogpolyRoom implements Server {
  state: GameState;
  auctionInterval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party) {
    this.state = this.createInitialState();
  }

  createInitialState(): GameState {
    return {
      id: this.room.id,
      phase: "lobby",
      players: [],
      currentPlayerIndex: 0,
      turnPhase: "waiting-for-roll",
      board: BOARD.map(() => ({ houses: 0, owner: null, mortgaged: false })),
      doublesCount: 0,
      dice: [1, 1],
      lastRollTotal: 0,
      tradeOffers: [],
      auction: null,
      rngDeckIndex: 0,
      dmsDeckIndex: 0,
      currentCard: null,
      winner: null,
      messages: [],
    };
  }

  broadcast(msg: ServerMessage) {
    const data = JSON.stringify(msg);
    for (const conn of this.room.getConnections()) {
      conn.send(data);
    }
  }

  broadcastState() {
    this.broadcast({ type: "game-state", state: this.state });
  }

  sendError(conn: Connection, message: string) {
    conn.send(JSON.stringify({ type: "error", message } satisfies ServerMessage));
  }

  addSystemMessage(text: string) {
    this.state.messages.push({
      id: generateId(),
      playerId: "system",
      playerName: "System",
      text,
      timestamp: Date.now(),
      isSystem: true,
    });
    if (this.state.messages.length > MAX_CHAT_MESSAGES) {
      this.state.messages = this.state.messages.slice(-MAX_CHAT_MESSAGES);
    }
  }

  getCurrentPlayer(): Player | undefined {
    return this.state.players[this.state.currentPlayerIndex];
  }

  onConnect(conn: Connection) {
    conn.send(JSON.stringify({ type: "connected", id: conn.id } satisfies ServerMessage));
    conn.send(JSON.stringify({ type: "game-state", state: this.state } satisfies ServerMessage));
  }

  onClose(conn: Connection) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;

    if (this.state.phase === "lobby") {
      this.state.players = this.state.players.filter((p) => p.id !== conn.id);
      this.addSystemMessage(`${player.name} left the lobby.`);
    } else if (this.state.phase === "playing") {
      player.bankrupt = true;
      this.addSystemMessage(`${player.name} disconnected and went bankrupt.`);
      this.releasePlayerAssets(player);
      this.checkWinCondition();
      if (this.state.phase === "playing" && this.getCurrentPlayer()?.id === conn.id) {
        this.nextTurn();
      }
    }
    this.broadcastState();
  }

  onMessage(message: string, sender: Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      this.sendError(sender, "Invalid message format.");
      return;
    }

    switch (msg.type) {
      case "join": return this.handleJoin(sender, msg.name, msg.token);
      case "start-game": return this.handleStartGame(sender);
      case "roll-dice": return this.handleRollDice(sender);
      case "buy-property": return this.handleBuyProperty(sender);
      case "auction-start": return this.handleAuctionStart(sender);
      case "auction-bid": return this.handleAuctionBid(sender, msg.amount);
      case "auction-pass": return this.handleAuctionPass(sender);
      case "end-turn": return this.handleEndTurn(sender);
      case "trade-propose": return this.handleTradePropose(sender, msg.trade);
      case "trade-accept": return this.handleTradeAccept(sender, msg.tradeId);
      case "trade-reject": return this.handleTradeReject(sender, msg.tradeId);
      case "build": return this.handleBuild(sender, msg.tileIndex);
      case "sell-building": return this.handleSellBuilding(sender, msg.tileIndex);
      case "mortgage": return this.handleMortgage(sender, msg.tileIndex);
      case "unmortgage": return this.handleUnmortgage(sender, msg.tileIndex);
      case "shadow-ban-pay": return this.handleShadowBanPay(sender);
      case "shadow-ban-card": return this.handleShadowBanCard(sender);
      case "chat": return this.handleChat(sender, msg.text);
      default:
        this.sendError(sender, "Unknown message type.");
    }
  }

  // ---- Lobby ----

  handleJoin(conn: Connection, name: string, token: string) {
    if (this.state.phase !== "lobby") {
      return this.sendError(conn, "Game already in progress.");
    }
    if (this.state.players.length >= MAX_PLAYERS) {
      return this.sendError(conn, "Room is full.");
    }
    if (this.state.players.some((p) => p.id === conn.id)) {
      return this.sendError(conn, "Already joined.");
    }
    if (this.state.players.some((p) => p.token === token)) {
      return this.sendError(conn, "Token already taken.");
    }

    const player: Player = {
      id: conn.id,
      name: name.trim().slice(0, 20) || "Anon",
      token: token as any,
      position: 0,
      mogz: STARTING_MOGZ,
      properties: [],
      inShadowBan: false,
      shadowBanTurns: 0,
      bankrupt: false,
      getOutOfBanCards: 0,
    };

    this.state.players.push(player);
    this.addSystemMessage(`${player.name} joined the lobby.`);
    this.broadcastState();
  }

  handleStartGame(conn: Connection) {
    if (this.state.phase !== "lobby") return;
    if (this.state.players.length < MIN_PLAYERS) {
      return this.sendError(conn, `Need at least ${MIN_PLAYERS} players.`);
    }
    // Only first player (host) can start
    if (this.state.players[0]?.id !== conn.id) {
      return this.sendError(conn, "Only the host can start the game.");
    }

    // Shuffle player order
    for (let i = this.state.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.players[i], this.state.players[j]] = [this.state.players[j], this.state.players[i]];
    }

    this.state.phase = "playing";
    this.state.currentPlayerIndex = 0;
    this.state.turnPhase = "waiting-for-roll";
    this.state.rngDeckIndex = 0;
    this.state.dmsDeckIndex = 0;

    const current = this.getCurrentPlayer()!;
    this.addSystemMessage(`Game started! ${current.name}'s turn.`);
    this.broadcastState();
  }

  // ---- Turn Actions ----

  handleRollDice(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id) return;
    if (this.state.turnPhase !== "waiting-for-roll") return;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isDoubles = d1 === d2;

    this.state.dice = [d1, d2];
    this.state.lastRollTotal = total;

    // Shadow Ban escape via doubles
    if (current.inShadowBan) {
      if (isDoubles) {
        current.inShadowBan = false;
        current.shadowBanTurns = 0;
        this.state.doublesCount = 0; // doubles from jail don't chain
        this.addSystemMessage(`${current.name} rolled doubles and escaped Shadow Ban!`);
        this.movePlayer(current, total);
      } else {
        current.shadowBanTurns++;
        if (current.shadowBanTurns >= MAX_SHADOW_BAN_TURNS) {
          current.mogz -= SHADOW_BAN_FEE;
          current.inShadowBan = false;
          current.shadowBanTurns = 0;
          this.addSystemMessage(`${current.name} paid ${SHADOW_BAN_FEE} mogz to leave Shadow Ban.`);
          this.movePlayer(current, total);
        } else {
          this.addSystemMessage(`${current.name} is still in Shadow Ban. (${current.shadowBanTurns}/${MAX_SHADOW_BAN_TURNS})`);
          this.state.turnPhase = "turn-ended";
        }
      }
      this.broadcastState();
      return;
    }

    // 3 doubles = shadow ban
    if (isDoubles) {
      this.state.doublesCount++;
      if (this.state.doublesCount >= 3) {
        this.addSystemMessage(`${current.name} rolled 3 doubles! Shadow Banned!`);
        this.sendToShadowBan(current);
        this.state.turnPhase = "turn-ended";
        this.broadcastState();
        return;
      }
    } else {
      this.state.doublesCount = 0;
    }

    this.movePlayer(current, total);
    this.broadcastState();
  }

  movePlayer(player: Player, spaces: number) {
    const oldPos = player.position;
    const newPos = (oldPos + spaces) % 40;

    // Check if passed Homepage
    if (newPos < oldPos && oldPos !== 0) {
      player.mogz += PASS_HOMEPAGE_BONUS;
      this.addSystemMessage(`${player.name} passed Homepage and collected ${PASS_HOMEPAGE_BONUS} mogz.`);
    }

    player.position = newPos;
    this.resolveLanding(player);
  }

  resolveLanding(player: Player) {
    const tile = BOARD[player.position];
    const tileState = this.state.board[player.position];

    switch (tile.type) {
      case "property":
      case "server-farm":
      case "utility":
        if (!tileState.owner) {
          this.state.turnPhase = "buy-or-auction";
          this.addSystemMessage(`${player.name} landed on ${tile.name}. Buy for ${tile.price} mogz or auction?`);
        } else if (tileState.owner !== player.id && !tileState.mortgaged) {
          const rent = calculateRent(player.position, this.state.board, this.state.lastRollTotal);
          this.payRent(player, tileState.owner, rent, tile.name);
        } else {
          this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
        }
        break;

      case "rng":
        this.drawCard(player, "rng");
        break;

      case "dms":
        this.drawCard(player, "dms");
        break;

      case "tax":
        if (tile.name === "Sub Fee") {
          player.mogz -= SUB_FEE_AMOUNT;
          this.addSystemMessage(`${player.name} paid ${SUB_FEE_AMOUNT} mogz Sub Fee.`);
        } else {
          const tax = calculatePaywallTax(player, this.state.board);
          player.mogz -= tax;
          this.addSystemMessage(`${player.name} hit the Paywall. Paid ${tax} mogz (10% net worth).`);
        }
        this.checkBankruptcy(player, null);
        if (!player.bankrupt) {
          this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
        }
        break;

      case "corner":
        if (tile.name === "Get Reported") {
          this.addSystemMessage(`${player.name} got Reported! Sent to Shadow Ban.`);
          this.sendToShadowBan(player);
          this.state.turnPhase = "turn-ended";
        } else {
          this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
        }
        break;
    }
  }

  // ---- Property Actions ----

  handleBuyProperty(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id) return;
    if (this.state.turnPhase !== "buy-or-auction") return;

    const tile = BOARD[current.position];
    if (!tile.price || current.mogz < tile.price) {
      return this.sendError(conn, "Not enough mogz.");
    }

    current.mogz -= tile.price;
    this.state.board[current.position].owner = current.id;
    current.properties.push(current.position);
    this.addSystemMessage(`${current.name} bought ${tile.name} for ${tile.price} mogz.`);
    this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
    this.broadcastState();
  }

  handleAuctionStart(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id) return;
    if (this.state.turnPhase !== "buy-or-auction") return;

    const activePlayers = this.state.players.filter((p) => !p.bankrupt).map((p) => p.id);
    this.state.auction = {
      tileIndex: current.position,
      currentBid: 0,
      currentBidder: null,
      participants: activePlayers,
      timeRemaining: AUCTION_TIMER_SECONDS,
    };
    this.state.turnPhase = "auctioning";
    this.addSystemMessage(`Auction started for ${BOARD[current.position].name}!`);
    this.startAuctionTimer();
    this.broadcastState();
  }

  handleAuctionBid(conn: Connection, amount: number) {
    if (!this.state.auction || this.state.turnPhase !== "auctioning") return;
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player || player.bankrupt) return;
    if (!this.state.auction.participants.includes(conn.id)) return;
    if (amount <= this.state.auction.currentBid || amount > player.mogz) {
      return this.sendError(conn, "Invalid bid.");
    }

    this.state.auction.currentBid = amount;
    this.state.auction.currentBidder = conn.id;
    this.state.auction.timeRemaining = AUCTION_TIMER_SECONDS; // reset timer
    this.addSystemMessage(`${player.name} bid ${amount} mogz.`);
    this.broadcastState();
  }

  handleAuctionPass(conn: Connection) {
    if (!this.state.auction || this.state.turnPhase !== "auctioning") return;
    this.state.auction.participants = this.state.auction.participants.filter((id) => id !== conn.id);

    const player = this.state.players.find((p) => p.id === conn.id);
    if (player) this.addSystemMessage(`${player.name} passed on the auction.`);

    // If 0 or 1 participants left, end auction
    if (this.state.auction.participants.length <= 1) {
      this.endAuction();
    }
    this.broadcastState();
  }

  startAuctionTimer() {
    if (this.auctionInterval) clearInterval(this.auctionInterval);
    this.auctionInterval = setInterval(() => {
      if (!this.state.auction) {
        if (this.auctionInterval) clearInterval(this.auctionInterval);
        return;
      }
      this.state.auction.timeRemaining--;
      if (this.state.auction.timeRemaining <= 0) {
        this.endAuction();
      }
      this.broadcastState();
    }, 1000);
  }

  endAuction() {
    if (this.auctionInterval) clearInterval(this.auctionInterval);
    if (!this.state.auction) return;

    const { tileIndex, currentBid, currentBidder } = this.state.auction;
    if (currentBidder && currentBid > 0) {
      const winner = this.state.players.find((p) => p.id === currentBidder);
      if (winner) {
        winner.mogz -= currentBid;
        this.state.board[tileIndex].owner = winner.id;
        winner.properties.push(tileIndex);
        this.addSystemMessage(`${winner.name} won the auction for ${BOARD[tileIndex].name} at ${currentBid} mogz.`);
      }
    } else {
      this.addSystemMessage(`No one bid on ${BOARD[tileIndex].name}. Property stays unowned.`);
    }

    this.state.auction = null;
    this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
    this.broadcastState();
  }

  // ---- Rent ----

  payRent(player: Player, ownerId: string, rent: number, tileName: string) {
    const owner = this.state.players.find((p) => p.id === ownerId);
    if (!owner) return;

    player.mogz -= rent;
    owner.mogz += rent;
    this.addSystemMessage(`${player.name} paid ${rent} mogz rent to ${owner.name} for ${tileName}.`);

    this.checkBankruptcy(player, ownerId);
    if (!player.bankrupt) {
      this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
    }
  }

  // ---- Cards ----

  drawCard(player: Player, deckType: "rng" | "dms") {
    const deck = deckType === "rng" ? shuffleDeck(RNG_CARDS) : shuffleDeck(DMS_CARDS);
    const indexKey = deckType === "rng" ? "rngDeckIndex" : "dmsDeckIndex";
    const card = deck[this.state[indexKey] % deck.length];
    this.state[indexKey]++;
    this.state.currentCard = card;
    this.state.turnPhase = "drawing-card";

    this.addSystemMessage(`${player.name} drew: "${card.text}"`);
    this.applyCardEffect(player, card);
    this.broadcastState();
  }

  applyCardEffect(player: Player, card: Card) {
    const effect = card.effect;
    switch (effect.type) {
      case "collect":
        player.mogz += effect.amount;
        break;
      case "pay":
        player.mogz -= effect.amount;
        this.checkBankruptcy(player, null);
        break;
      case "move": {
        const oldPos = player.position;
        player.position = effect.to;
        if (effect.to < oldPos) {
          player.mogz += PASS_HOMEPAGE_BONUS;
          this.addSystemMessage(`${player.name} passed Homepage and collected ${PASS_HOMEPAGE_BONUS} mogz.`);
        }
        this.resolveLanding(player);
        return; // resolveLanding sets turnPhase
      }
      case "move-relative": {
        const newPos = (player.position + effect.by + 40) % 40;
        player.position = newPos;
        this.resolveLanding(player);
        return;
      }
      case "collect-from-each": {
        const others = this.state.players.filter((p) => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          other.mogz -= effect.amount;
          player.mogz += effect.amount;
        }
        break;
      }
      case "pay-each": {
        const others = this.state.players.filter((p) => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          player.mogz -= effect.amount;
          other.mogz += effect.amount;
        }
        this.checkBankruptcy(player, null);
        break;
      }
      case "get-out-of-ban":
        player.getOutOfBanCards++;
        break;
      case "repairs": {
        let cost = 0;
        for (const tileIndex of player.properties) {
          const houses = this.state.board[tileIndex].houses;
          if (houses >= HOTEL_VALUE) {
            cost += effect.perHotel;
          } else {
            cost += houses * effect.perHouse;
          }
        }
        player.mogz -= cost;
        this.addSystemMessage(`${player.name} paid ${cost} mogz in repairs.`);
        this.checkBankruptcy(player, null);
        break;
      }
      case "go-to-shadow-ban":
        this.sendToShadowBan(player);
        this.state.turnPhase = "turn-ended";
        return;
    }

    if (!player.bankrupt) {
      this.state.turnPhase = this.state.doublesCount > 0 ? "waiting-for-roll" : "turn-ended";
    }
  }

  // ---- Shadow Ban ----

  sendToShadowBan(player: Player) {
    player.position = 10; // Shadow Ban tile
    player.inShadowBan = true;
    player.shadowBanTurns = 0;
    this.state.doublesCount = 0;
  }

  handleShadowBanPay(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id || !current.inShadowBan) return;
    if (this.state.turnPhase !== "waiting-for-roll") return;

    if (current.mogz < SHADOW_BAN_FEE) {
      return this.sendError(conn, "Not enough mogz.");
    }

    current.mogz -= SHADOW_BAN_FEE;
    current.inShadowBan = false;
    current.shadowBanTurns = 0;
    this.addSystemMessage(`${current.name} paid ${SHADOW_BAN_FEE} mogz to escape Shadow Ban.`);
    this.state.turnPhase = "waiting-for-roll"; // can now roll normally
    this.broadcastState();
  }

  handleShadowBanCard(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id || !current.inShadowBan) return;
    if (current.getOutOfBanCards <= 0) {
      return this.sendError(conn, "No Get Out of Ban cards.");
    }

    current.getOutOfBanCards--;
    current.inShadowBan = false;
    current.shadowBanTurns = 0;
    this.addSystemMessage(`${current.name} used a Get Out of Ban card!`);
    this.state.turnPhase = "waiting-for-roll";
    this.broadcastState();
  }

  // ---- Building ----

  handleBuild(conn: Connection, tileIndex: number) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;

    if (!canBuild(tileIndex, player.id, this.state.board)) {
      return this.sendError(conn, "Cannot build here.");
    }

    const def = BOARD[tileIndex];
    if (!def.houseCost || player.mogz < def.houseCost) {
      return this.sendError(conn, "Not enough mogz.");
    }

    player.mogz -= def.houseCost;
    this.state.board[tileIndex].houses++;
    const buildingName = this.state.board[tileIndex].houses >= HOTEL_VALUE ? "data center" : "server";
    this.addSystemMessage(`${player.name} built a ${buildingName} on ${def.name}.`);
    this.broadcastState();
  }

  handleSellBuilding(conn: Connection, tileIndex: number) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;

    if (!canSellBuilding(tileIndex, player.id, this.state.board)) {
      return this.sendError(conn, "Cannot sell building here.");
    }

    const def = BOARD[tileIndex];
    const refund = Math.floor((def.houseCost ?? 0) / 2);
    player.mogz += refund;
    this.state.board[tileIndex].houses--;
    this.addSystemMessage(`${player.name} sold a building on ${def.name} for ${refund} mogz.`);
    this.broadcastState();
  }

  // ---- Mortgage ----

  handleMortgage(conn: Connection, tileIndex: number) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;
    const state = this.state.board[tileIndex];
    const def = BOARD[tileIndex];

    if (state.owner !== player.id || state.mortgaged) return;
    if (state.houses > 0) {
      return this.sendError(conn, "Sell all buildings first.");
    }

    state.mortgaged = true;
    player.mogz += def.mortgageValue ?? 0;
    this.addSystemMessage(`${player.name} mortgaged ${def.name} for ${def.mortgageValue} mogz.`);
    this.broadcastState();
  }

  handleUnmortgage(conn: Connection, tileIndex: number) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;
    const state = this.state.board[tileIndex];
    const def = BOARD[tileIndex];

    if (state.owner !== player.id || !state.mortgaged) return;

    const cost = Math.floor((def.mortgageValue ?? 0) * 1.1); // 10% interest
    if (player.mogz < cost) {
      return this.sendError(conn, "Not enough mogz to unmortgage.");
    }

    player.mogz -= cost;
    state.mortgaged = false;
    this.addSystemMessage(`${player.name} unmortgaged ${def.name} for ${cost} mogz.`);
    this.broadcastState();
  }

  // ---- Trading ----

  handleTradePropose(conn: Connection, trade: Omit<Trade, "id">) {
    const from = this.state.players.find((p) => p.id === conn.id);
    const to = this.state.players.find((p) => p.id === trade.to);
    if (!from || !to || to.bankrupt) return;

    // Validate ownership
    if (!trade.offerProperties.every((i) => this.state.board[i].owner === from.id && !this.state.board[i].mortgaged)) {
      return this.sendError(conn, "You don't own those properties.");
    }
    if (!trade.requestProperties.every((i) => this.state.board[i].owner === to.id && !this.state.board[i].mortgaged)) {
      return this.sendError(conn, "They don't own those properties.");
    }
    if (trade.offerMogz > from.mogz || trade.requestMogz > to.mogz) {
      return this.sendError(conn, "Not enough mogz for this trade.");
    }

    const fullTrade: Trade = { ...trade, id: generateId() };
    this.state.tradeOffers.push(fullTrade);
    this.addSystemMessage(`${from.name} proposed a trade to ${to.name}.`);
    this.broadcastState();
  }

  handleTradeAccept(conn: Connection, tradeId: string) {
    const trade = this.state.tradeOffers.find((t) => t.id === tradeId);
    if (!trade || trade.to !== conn.id) return;

    const from = this.state.players.find((p) => p.id === trade.from);
    const to = this.state.players.find((p) => p.id === trade.to);
    if (!from || !to) return;

    // Transfer properties
    for (const idx of trade.offerProperties) {
      this.state.board[idx].owner = to.id;
      from.properties = from.properties.filter((i) => i !== idx);
      to.properties.push(idx);
    }
    for (const idx of trade.requestProperties) {
      this.state.board[idx].owner = from.id;
      to.properties = to.properties.filter((i) => i !== idx);
      from.properties.push(idx);
    }

    // Transfer mogz
    from.mogz -= trade.offerMogz;
    to.mogz += trade.offerMogz;
    to.mogz -= trade.requestMogz;
    from.mogz += trade.requestMogz;

    this.state.tradeOffers = this.state.tradeOffers.filter((t) => t.id !== tradeId);
    this.addSystemMessage(`Trade accepted between ${from.name} and ${to.name}.`);
    this.broadcastState();
  }

  handleTradeReject(conn: Connection, tradeId: string) {
    const trade = this.state.tradeOffers.find((t) => t.id === tradeId);
    if (!trade || trade.to !== conn.id) return;

    this.state.tradeOffers = this.state.tradeOffers.filter((t) => t.id !== tradeId);
    const to = this.state.players.find((p) => p.id === conn.id);
    this.addSystemMessage(`${to?.name} rejected the trade.`);
    this.broadcastState();
  }

  // ---- Turn Management ----

  handleEndTurn(conn: Connection) {
    const current = this.getCurrentPlayer();
    if (!current || current.id !== conn.id) return;
    if (this.state.turnPhase !== "turn-ended" && this.state.turnPhase !== "waiting-for-roll") return;
    if (this.state.doublesCount > 0 && this.state.turnPhase === "waiting-for-roll") {
      return this.sendError(conn, "You rolled doubles — roll again!");
    }

    this.nextTurn();
    this.broadcastState();
  }

  nextTurn() {
    this.state.doublesCount = 0;
    this.state.currentCard = null;
    this.state.tradeOffers = [];

    // Find next non-bankrupt player
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let loops = 0;
    while (this.state.players[nextIndex].bankrupt && loops < this.state.players.length) {
      nextIndex = (nextIndex + 1) % this.state.players.length;
      loops++;
    }

    this.state.currentPlayerIndex = nextIndex;
    this.state.turnPhase = "waiting-for-roll";

    const next = this.getCurrentPlayer()!;
    this.addSystemMessage(`${next.name}'s turn.`);
  }

  // ---- Bankruptcy ----

  checkBankruptcy(player: Player, creditorId: string | null) {
    if (player.mogz >= 0) return;

    const netWorth = calculateNetWorth(player, this.state.board);
    if (netWorth < 0) {
      // Truly bankrupt
      player.bankrupt = true;
      this.addSystemMessage(`${player.name} went bankrupt!`);
      this.releasePlayerAssets(player, creditorId);
      this.state.turnPhase = "turn-ended";
      this.checkWinCondition();
    } else {
      // Can still sell/mortgage to cover debt
      this.state.turnPhase = "bankrupt";
    }
  }

  releasePlayerAssets(player: Player, creditorId?: string | null) {
    for (const tileIndex of player.properties) {
      if (creditorId) {
        // Transfer to creditor
        this.state.board[tileIndex].owner = creditorId;
        const creditor = this.state.players.find((p) => p.id === creditorId);
        creditor?.properties.push(tileIndex);
      } else {
        // Return to bank
        this.state.board[tileIndex].owner = null;
        this.state.board[tileIndex].houses = 0;
        this.state.board[tileIndex].mortgaged = false;
      }
    }
    player.properties = [];
    if (creditorId && player.mogz > 0) {
      const creditor = this.state.players.find((p) => p.id === creditorId);
      if (creditor) creditor.mogz += player.mogz;
    }
    player.mogz = 0;
  }

  checkWinCondition() {
    const activePlayers = this.state.players.filter((p) => !p.bankrupt);
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0].id;
      this.state.phase = "ended";
      this.addSystemMessage(`${activePlayers[0].name} wins! GG!`);
    }
  }

  // ---- Chat ----

  handleChat(conn: Connection, text: string) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (!player) return;

    this.state.messages.push({
      id: generateId(),
      playerId: player.id,
      playerName: player.name,
      text: text.trim().slice(0, 200),
      timestamp: Date.now(),
      isSystem: false,
    });

    if (this.state.messages.length > MAX_CHAT_MESSAGES) {
      this.state.messages = this.state.messages.slice(-MAX_CHAT_MESSAGES);
    }

    this.broadcastState();
  }
}
