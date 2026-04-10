// ---- Token Types ----

export const FREE_TOKENS = [
  "doge", "pepe", "trollface", "nyan-cat", "wojak",
  "stonks-man", "gigachad", "amogus", "harambe", "rickroll",
] as const;

export const SEMI_PREMIUM_TOKENS = [
  "golden-doge", "neon-pepe", "glitch-trollface", "rainbow-nyan", "chad-wojak",
] as const;

export const PREMIUM_TOKENS = [
  "diamond-doge", "galaxy-pepe", "holo-gigachad", "pixel-set", "animated-set",
] as const;

export type FreeToken = typeof FREE_TOKENS[number];
export type SemiPremiumToken = typeof SEMI_PREMIUM_TOKENS[number];
export type PremiumToken = typeof PREMIUM_TOKENS[number];
export type TokenType = FreeToken | SemiPremiumToken | PremiumToken;

// ---- Card Effects ----

export type CardEffect =
  | { type: "collect"; amount: number }
  | { type: "pay"; amount: number }
  | { type: "move"; to: number }
  | { type: "move-relative"; by: number }
  | { type: "collect-from-each"; amount: number }
  | { type: "pay-each"; amount: number }
  | { type: "get-out-of-ban" }
  | { type: "repairs"; perHouse: number; perHotel: number }
  | { type: "go-to-shadow-ban" };

export interface Card {
  text: string;
  effect: CardEffect;
}

// ---- Tile Types ----

export type TileType = "property" | "server-farm" | "utility" | "rng" | "dms" | "tax" | "corner";

export type Platform = "reddit" | "4chan" | "tiktok" | "discord" | "youtube" | "twitter" | "twitch" | "instagram";

export interface TileDefinition {
  index: number;
  type: TileType;
  name: string;
  platform?: Platform;
  price?: number;
  rent?: number[];
  houseCost?: number;
  mortgageValue?: number;
}

export interface TileState {
  houses: number;
  owner: string | null;
  mortgaged: boolean;
}

// ---- Player ----

export interface Player {
  id: string;
  name: string;
  token: TokenType;
  position: number;
  mogz: number;
  properties: number[];
  inShadowBan: boolean;
  shadowBanTurns: number;
  bankrupt: boolean;
  getOutOfBanCards: number;
}

// ---- Trade ----

export interface Trade {
  id: string;
  from: string;
  to: string;
  offerProperties: number[];
  offerMogz: number;
  requestProperties: number[];
  requestMogz: number;
}

// ---- Game State ----

export type GamePhase = "lobby" | "playing" | "ended";

export type TurnPhase =
  | "waiting-for-roll"
  | "rolling"
  | "moving"
  | "landed"
  | "buy-or-auction"
  | "auctioning"
  | "paying-rent"
  | "drawing-card"
  | "shadow-ban"
  | "trading"
  | "building"
  | "bankrupt"
  | "turn-ended";

export interface AuctionState {
  tileIndex: number;
  currentBid: number;
  currentBidder: string | null;
  participants: string[];
  timeRemaining: number;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  board: TileState[];
  doublesCount: number;
  dice: [number, number];
  lastRollTotal: number;
  tradeOffers: Trade[];
  auction: AuctionState | null;
  rngDeckIndex: number;
  dmsDeckIndex: number;
  currentCard: Card | null;
  winner: string | null;
  messages: ChatMessage[];
}

// ---- Chat ----

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
}

// ---- WebSocket Messages (Client → Server) ----

export type ClientMessage =
  | { type: "join"; name: string; token: TokenType }
  | { type: "start-game" }
  | { type: "roll-dice" }
  | { type: "buy-property" }
  | { type: "auction-start" }
  | { type: "auction-bid"; amount: number }
  | { type: "auction-pass" }
  | { type: "end-turn" }
  | { type: "trade-propose"; trade: Omit<Trade, "id"> }
  | { type: "trade-accept"; tradeId: string }
  | { type: "trade-reject"; tradeId: string }
  | { type: "build"; tileIndex: number }
  | { type: "sell-building"; tileIndex: number }
  | { type: "mortgage"; tileIndex: number }
  | { type: "unmortgage"; tileIndex: number }
  | { type: "shadow-ban-pay" }
  | { type: "shadow-ban-card" }
  | { type: "chat"; text: string };

// ---- WebSocket Messages (Server → Client) ----

export type ServerMessage =
  | { type: "game-state"; state: GameState }
  | { type: "error"; message: string }
  | { type: "connected"; id: string };
