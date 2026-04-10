# Mogpoly Classic Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable browser-based Monopoly clone with internet/meme theming, real-time multiplayer via Partykit, and dark terminal aesthetic.

**Architecture:** Next.js 14 (App Router) serves the UI on Vercel. Partykit manages server-authoritative game state via WebSocket rooms. Framer Motion handles animations. No database — game state is ephemeral in Partykit memory.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, Framer Motion, Partykit, Vercel

**Spec:** `docs/superpowers/specs/2026-04-11-mogpoly-classic-mode-design.md`

---

## File Map

```
mogpoly/
  src/
    app/
      layout.tsx                    # Root layout: fonts, metadata, CRT overlay
      page.tsx                      # Landing page: create/join room
      globals.css                   # Tailwind base + CRT scanlines + blur utilities + theme vars
      room/[code]/page.tsx          # Client component: lobby → game → end screen
    components/
      ui/
        Button.tsx                  # Styled terminal button with green glow
        Modal.tsx                   # Base frosted blur modal with Framer Motion
        GlitchText.tsx              # Glitch text animation component
        CRTOverlay.tsx              # CRT scanline overlay
      board/
        Board.tsx                   # 40-tile square board layout
        Tile.tsx                    # Individual tile (property/special)
        CornerTile.tsx              # Corner tiles (Homepage, Shadow Ban, AFK, Get Reported)
      game/
        Dice.tsx                    # Animated 3D dice with Framer Motion
        Token.tsx                   # Player token meme icon
        ActionBar.tsx               # Roll/Buy/Auction/End Turn/Trade/Build buttons
        PlayerStats.tsx             # All players' mogz + properties bar
        Chat.tsx                    # In-game chat sidebar
      modals/
        PropertyCard.tsx            # Buy/auction decision modal
        RNGCard.tsx                 # RNG card draw reveal
        DMsCard.tsx                 # DMs card draw reveal
        TradeModal.tsx              # Trade proposal UI
        AuctionModal.tsx            # Auction bidding with timer
        BuildModal.tsx              # House/hotel building UI
        BankruptWarning.tsx         # Bankruptcy + ad save
        ShadowBanModal.tsx          # Shadow Ban escape options
      lobby/
        TokenPicker.tsx             # Token selection (free/semi-premium/premium tabs)
        PlayerList.tsx              # Lobby player list with tokens
        RoomLink.tsx                # Shareable link + copy button
    lib/
      constants.ts                  # Game constants (STARTING_MOGZ, TAX amounts, etc.)
      board-data.ts                 # Full 40-tile board definition with prices/rents
      card-decks.ts                 # RNG and DMs card definitions
      game-logic.ts                 # Pure functions: rent calc, net worth, bankruptcy check, building validation
    party/
      mogpoly-room.ts               # Partykit server: game state machine + WebSocket handlers
    hooks/
      usePartySocket.ts             # WebSocket connection to Partykit
      useGameState.ts               # Game state management from server messages
    types/
      game.ts                       # All TypeScript interfaces
  public/
    tokens/                         # Meme token SVG files (10 free tokens)
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.js
  partykit.json
```

---

## Phase 1: Project Foundation

### Task 1: Scaffold Next.js + Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `partykit.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /c/Users/akank/Documents/mogpoly
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Select defaults when prompted. If it asks about overwriting existing files, confirm yes.

- [ ] **Step 2: Install game dependencies**

```bash
npm install framer-motion partysocket
npm install -D partykit
```

- [ ] **Step 3: Create Partykit config**

Create `partykit.json`:

```json
{
  "$schema": "https://www.partykit.io/schema.json",
  "name": "mogpoly",
  "main": "src/party/mogpoly-room.ts",
  "compatibilityDate": "2024-09-01"
}
```

- [ ] **Step 4: Create placeholder Partykit server**

Create `src/party/mogpoly-room.ts`:

```typescript
import type { Party, Server, Connection } from "partykit/server";

export default class MogpolyRoom implements Server {
  constructor(readonly room: Party) {}

  onConnect(conn: Connection) {
    conn.send(JSON.stringify({ type: "connected", id: conn.id }));
  }

  onMessage(message: string, sender: Connection) {
    // placeholder — game logic added in Task 8
  }

  onClose(conn: Connection) {
    // placeholder
  }
}
```

- [ ] **Step 5: Update globals.css with theme foundation**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0a0a0f;
  --text-primary: #00ff64;
  --text-secondary: rgba(255, 255, 255, 0.4);
  --text-dim: rgba(255, 255, 255, 0.2);
  --border-subtle: rgba(0, 255, 100, 0.12);
  --glass-bg: rgba(0, 255, 100, 0.04);
  --glass-blur: 20px;
  --glow-green: 0 0 20px rgba(0, 255, 100, 0.15);

  /* Platform colors */
  --color-reddit: #ff4500;
  --color-4chan: #789922;
  --color-tiktok: #00f2ea;
  --color-discord: #5865F2;
  --color-youtube: #ff0000;
  --color-twitter: #1DA1F2;
  --color-twitch: #9146FF;
  --color-instagram: #E1306C;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Courier New', Courier, monospace;
}

/* CRT Scanline overlay */
.crt-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
}

/* Frosted glass panel */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

/* Green glow effect */
.glow-green {
  box-shadow: var(--glow-green);
}

/* Text glow */
.text-glow {
  text-shadow: 0 0 10px rgba(0, 255, 100, 0.5);
}

/* Glitch animation */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.animate-glitch {
  animation: glitch 0.3s ease-in-out infinite;
}

/* Glow orb background */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
}
```

- [ ] **Step 6: Update root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mogpoly — Internet Monopoly",
  description: "A meme-themed Monopoly board game. Play with friends online using mogz currency.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Replace landing page with placeholder**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative">
      <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,255,100,0.06)] top-[10%] left-[20%] absolute" />
      <h1 className="text-5xl font-bold text-glow tracking-wider">MOGPOLY</h1>
      <p className="mt-4 text-[var(--text-secondary)] text-sm">Coming soon...</p>
    </main>
  );
}
```

- [ ] **Step 8: Verify dev server runs**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000, shows "MOGPOLY" with green glow text on dark background with CRT scanlines.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Framer Motion, Partykit, dark terminal theme"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/game.ts`

- [ ] **Step 1: Write all game interfaces**

Create `src/types/game.ts`:

```typescript
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
  rent?: number[];        // [base, 1h, 2h, 3h, 4h, hotel]
  houseCost?: number;
  mortgageValue?: number;
}

export interface TileState {
  houses: number;          // 0-5 (5 = hotel)
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/game.ts
git commit -m "feat: add all TypeScript game interfaces and message types"
```

---

### Task 3: Constants & Board Data

**Files:**
- Create: `src/lib/constants.ts`, `src/lib/board-data.ts`, `src/lib/card-decks.ts`

- [ ] **Step 1: Write game constants**

Create `src/lib/constants.ts`:

```typescript
export const STARTING_MOGZ = 1500;
export const PASS_HOMEPAGE_BONUS = 200;
export const SUB_FEE_AMOUNT = 200;
export const SHADOW_BAN_FEE = 50;
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const MAX_HOUSES = 4;
export const HOTEL_VALUE = 5; // houses value representing a hotel
export const MAX_SHADOW_BAN_TURNS = 3;
export const AUCTION_TIMER_SECONDS = 30;
export const ROOM_CODE_LENGTH = 6;
export const MAX_CHAT_MESSAGES = 50;

export const SERVER_FARM_RENT = [25, 50, 100, 200] as const;

export const PLATFORM_COLORS: Record<string, string> = {
  reddit: "#ff4500",
  "4chan": "#789922",
  tiktok: "#00f2ea",
  discord: "#5865F2",
  youtube: "#ff0000",
  twitter: "#1DA1F2",
  twitch: "#9146FF",
  instagram: "#E1306C",
};

export const PLATFORM_LABELS: Record<string, string> = {
  reddit: "Reddit",
  "4chan": "4chan",
  tiktok: "TikTok",
  discord: "Discord",
  youtube: "YouTube",
  twitter: "Twitter/X",
  twitch: "Twitch",
  instagram: "Instagram",
};
```

- [ ] **Step 2: Write full 40-tile board data**

Create `src/lib/board-data.ts`:

```typescript
import type { TileDefinition } from "@/types/game";

export const BOARD: TileDefinition[] = [
  // --- Bottom row (right to left when facing board) ---
  { index: 0,  type: "corner",      name: "Homepage" },
  { index: 1,  type: "property",    name: "r/place",              platform: "reddit",    price: 60,  rent: [2, 10, 30, 90, 160, 250],     houseCost: 50,  mortgageValue: 30 },
  { index: 2,  type: "dms",         name: "DMs" },
  { index: 3,  type: "property",    name: "Karma Farm",           platform: "reddit",    price: 60,  rent: [4, 20, 60, 180, 320, 450],    houseCost: 50,  mortgageValue: 30 },
  { index: 4,  type: "tax",         name: "Sub Fee" },
  { index: 5,  type: "server-farm", name: "Server Farm 1",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 6,  type: "property",    name: "Greentext Lane",       platform: "4chan",      price: 100, rent: [6, 30, 90, 270, 400, 550],    houseCost: 50,  mortgageValue: 50 },
  { index: 7,  type: "rng",         name: "RNG" },
  { index: 8,  type: "property",    name: "Anon Ave",             platform: "4chan",      price: 100, rent: [6, 30, 90, 270, 400, 550],    houseCost: 50,  mortgageValue: 50 },
  { index: 9,  type: "property",    name: "/b/ Boulevard",        platform: "4chan",      price: 120, rent: [8, 40, 100, 300, 450, 600],   houseCost: 50,  mortgageValue: 60 },

  // --- Left column (bottom to top) ---
  { index: 10, type: "corner",      name: "Shadow Ban" },
  { index: 11, type: "property",    name: "FYP Street",           platform: "tiktok",    price: 140, rent: [10, 50, 150, 450, 625, 750],  houseCost: 100, mortgageValue: 70 },
  { index: 12, type: "utility",     name: "WiFi",                                        price: 150, rent: [4, 10],                       mortgageValue: 75 },
  { index: 13, type: "property",    name: "Duet Drive",           platform: "tiktok",    price: 140, rent: [10, 50, 150, 450, 625, 750],  houseCost: 100, mortgageValue: 70 },
  { index: 14, type: "property",    name: "Trend Plaza",          platform: "tiktok",    price: 160, rent: [12, 60, 180, 500, 700, 900],  houseCost: 100, mortgageValue: 80 },
  { index: 15, type: "server-farm", name: "Server Farm 2",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 16, type: "property",    name: "Nitro Lane",           platform: "discord",   price: 180, rent: [14, 70, 200, 550, 750, 950],  houseCost: 100, mortgageValue: 90 },
  { index: 17, type: "dms",         name: "DMs" },
  { index: 18, type: "property",    name: "Mod Abuse Ave",        platform: "discord",   price: 180, rent: [14, 70, 200, 550, 750, 950],  houseCost: 100, mortgageValue: 90 },
  { index: 19, type: "property",    name: "Server Boost Blvd",    platform: "discord",   price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },

  // --- Top row (left to right) ---
  { index: 20, type: "corner",      name: "AFK" },
  { index: 21, type: "property",    name: "Clickbait Court",      platform: "youtube",   price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 22, type: "rng",         name: "RNG" },
  { index: 23, type: "property",    name: "Demonetized Drive",    platform: "youtube",   price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 24, type: "property",    name: "Algorithm Ave",        platform: "youtube",   price: 240, rent: [20, 100, 300, 750, 925, 1100],houseCost: 150, mortgageValue: 120 },
  { index: 25, type: "server-farm", name: "Server Farm 3",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 26, type: "property",    name: "Ratio Road",           platform: "twitter",   price: 260, rent: [22, 110, 330, 800, 975, 1150],houseCost: 150, mortgageValue: 130 },
  { index: 27, type: "property",    name: "Main Character Ave",   platform: "twitter",   price: 260, rent: [22, 110, 330, 800, 975, 1150],houseCost: 150, mortgageValue: 130 },
  { index: 28, type: "utility",     name: "VPN",                                         price: 150, rent: [4, 10],                       mortgageValue: 75 },
  { index: 29, type: "property",    name: "Quote Tweet Blvd",     platform: "twitter",   price: 280, rent: [24, 120, 360, 850, 1025, 1200],houseCost: 150, mortgageValue: 140 },

  // --- Right column (top to bottom) ---
  { index: 30, type: "corner",      name: "Get Reported" },
  { index: 31, type: "property",    name: "PogChamp Park",        platform: "twitch",    price: 300, rent: [26, 130, 390, 900, 1100, 1275],houseCost: 200, mortgageValue: 150 },
  { index: 32, type: "property",    name: "Sub Train Ave",        platform: "twitch",    price: 300, rent: [26, 130, 390, 900, 1100, 1275],houseCost: 200, mortgageValue: 150 },
  { index: 33, type: "dms",         name: "DMs" },
  { index: 34, type: "property",    name: "Emote Lane",           platform: "twitch",    price: 320, rent: [28, 150, 450, 1000, 1200, 1400],houseCost: 200, mortgageValue: 160 },
  { index: 35, type: "server-farm", name: "Server Farm 4",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 36, type: "rng",         name: "RNG" },
  { index: 37, type: "property",    name: "Influencer Ave",       platform: "instagram", price: 350, rent: [35, 175, 500, 1100, 1300, 1500],houseCost: 200, mortgageValue: 175 },
  { index: 38, type: "tax",         name: "Paywall" },
  { index: 39, type: "property",    name: "Reels Row",            platform: "instagram", price: 400, rent: [50, 200, 600, 1400, 1700, 2000],houseCost: 200, mortgageValue: 200 },
];

/** Get all tile indices for a platform group */
export function getPlatformTiles(platform: string): number[] {
  return BOARD.filter((t) => t.platform === platform).map((t) => t.index);
}

/** Get all server farm indices */
export function getServerFarmIndices(): number[] {
  return BOARD.filter((t) => t.type === "server-farm").map((t) => t.index);
}

/** Get both utility indices */
export function getUtilityIndices(): number[] {
  return BOARD.filter((t) => t.type === "utility").map((t) => t.index);
}
```

- [ ] **Step 3: Write card decks**

Create `src/lib/card-decks.ts`:

```typescript
import type { Card } from "@/types/game";

export const RNG_CARDS: Card[] = [
  { text: "Your meme went viral! Collect 200 mogz.", effect: { type: "collect", amount: 200 } },
  { text: "Server crashed. Pay 100 mogz for hosting.", effect: { type: "pay", amount: 100 } },
  { text: "Algorithm blessed you. Advance to Homepage.", effect: { type: "move", to: 0 } },
  { text: "DMCA strike! Go to Shadow Ban.", effect: { type: "go-to-shadow-ban" } },
  { text: "Your NFT actually sold. Collect 150 mogz.", effect: { type: "collect", amount: 150 } },
  { text: "Bandwidth overage. Pay 50 mogz per server (house) and 200 mogz per data center (hotel).", effect: { type: "repairs", perHouse: 50, perHotel: 200 } },
  { text: "Crypto rug pull! Pay each player 50 mogz.", effect: { type: "pay-each", amount: 50 } },
  { text: "You got a brand deal. Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Get Out of Shadow Ban free. Keep this card.", effect: { type: "get-out-of-ban" } },
  { text: "Go back 3 spaces. RNG is not in your favor.", effect: { type: "move-relative", by: -3 } },
  { text: "Your comment got ratio'd. Pay 75 mogz.", effect: { type: "pay", amount: 75 } },
  { text: "Ad revenue hit! Collect 50 mogz from each player.", effect: { type: "collect-from-each", amount: 50 } },
  { text: "Advance to Trend Plaza. The algorithm favors you.", effect: { type: "move", to: 14 } },
  { text: "Doxxed! Pay 200 mogz for damage control.", effect: { type: "pay", amount: 200 } },
  { text: "Your clip went viral on Twitch. Advance to PogChamp Park.", effect: { type: "move", to: 31 } },
  { text: "Bot attack on your server. Pay 25 mogz per server (house) and 100 mogz per data center (hotel).", effect: { type: "repairs", perHouse: 25, perHotel: 100 } },
];

export const DMS_CARDS: Card[] = [
  { text: "Anonymous tip: you won a giveaway! Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Tax refund from platform. Collect 20 mogz.", effect: { type: "collect", amount: 20 } },
  { text: "Your alt account got verified. Collect 50 mogz.", effect: { type: "collect", amount: 50 } },
  { text: "Someone slid into your DMs with a sponsorship. Collect 200 mogz.", effect: { type: "collect", amount: 200 } },
  { text: "Get Out of Shadow Ban free. Keep this card.", effect: { type: "get-out-of-ban" } },
  { text: "Advance to Homepage. Collect 200 mogz if you pass.", effect: { type: "move", to: 0 } },
  { text: "Birthday donation stream! Collect 10 mogz from each player.", effect: { type: "collect-from-each", amount: 10 } },
  { text: "Platform bug gave you free premium. Collect 75 mogz.", effect: { type: "collect", amount: 75 } },
  { text: "Your merch dropped. Collect 150 mogz.", effect: { type: "collect", amount: 150 } },
  { text: "Internet bill due. Pay 50 mogz.", effect: { type: "pay", amount: 50 } },
  { text: "You won a Discord Nitro giveaway. Collect 25 mogz.", effect: { type: "collect", amount: 25 } },
  { text: "Patreon subscribers came through. Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Server maintenance costs. Pay 100 mogz.", effect: { type: "pay", amount: 100 } },
  { text: "Anonymous crypto donation! Collect 50 mogz.", effect: { type: "collect", amount: 50 } },
  { text: "Your tutorial video blew up. Collect 30 mogz from each player.", effect: { type: "collect-from-each", amount: 30 } },
  { text: "You found a rare Pepe. Collect 45 mogz.", effect: { type: "collect", amount: 45 } },
];

/** Shuffle an array using Fisher-Yates */
export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts src/lib/board-data.ts src/lib/card-decks.ts
git commit -m "feat: add game constants, 40-tile board data, and RNG/DMs card decks"
```

---

### Task 4: Game Logic (Pure Functions)

**Files:**
- Create: `src/lib/game-logic.ts`
- Test: `src/lib/__tests__/game-logic.test.ts`

- [ ] **Step 1: Write game logic tests**

Create `src/lib/__tests__/game-logic.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateRent,
  calculateNetWorth,
  ownsFullPlatform,
  canBuild,
  countOwnedServerFarms,
  countOwnedUtilities,
  calculateUtilityRent,
  calculateServerFarmRent,
  calculatePaywallTax,
} from "../game-logic";
import { BOARD } from "../board-data";
import type { Player, TileState } from "@/types/game";

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Test",
    token: "doge",
    position: 0,
    mogz: 1500,
    properties: [],
    inShadowBan: false,
    shadowBanTurns: 0,
    bankrupt: false,
    getOutOfBanCards: 0,
    ...overrides,
  };
}

function makeBoard(): TileState[] {
  return BOARD.map(() => ({ houses: 0, owner: null, mortgaged: false }));
}

describe("calculateRent", () => {
  it("returns base rent for property with no houses", () => {
    const board = makeBoard();
    board[1].owner = "p2"; // r/place, base rent = 2
    expect(calculateRent(1, board, 7)).toBe(2);
  });

  it("doubles base rent when owner has full platform group", () => {
    const board = makeBoard();
    board[1].owner = "p2"; // r/place
    board[3].owner = "p2"; // Karma Farm — full Reddit group
    expect(calculateRent(1, board, 7)).toBe(4); // 2 * 2
  });

  it("returns house-level rent", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    board[3].owner = "p2";
    board[1].houses = 3;
    expect(calculateRent(1, board, 7)).toBe(90); // rent[3]
  });

  it("returns 0 for mortgaged property", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    board[1].mortgaged = true;
    expect(calculateRent(1, board, 7)).toBe(0);
  });
});

describe("calculateServerFarmRent", () => {
  it("returns 25 for 1 farm owned", () => {
    const board = makeBoard();
    board[5].owner = "p2";
    expect(calculateServerFarmRent("p2", board)).toBe(25);
  });

  it("returns 200 for 4 farms owned", () => {
    const board = makeBoard();
    board[5].owner = "p2";
    board[15].owner = "p2";
    board[25].owner = "p2";
    board[35].owner = "p2";
    expect(calculateServerFarmRent("p2", board)).toBe(200);
  });
});

describe("calculateUtilityRent", () => {
  it("returns diceRoll * 4 for 1 utility", () => {
    const board = makeBoard();
    board[12].owner = "p2"; // WiFi
    expect(calculateUtilityRent("p2", board, 8)).toBe(32);
  });

  it("returns diceRoll * 10 for 2 utilities", () => {
    const board = makeBoard();
    board[12].owner = "p2"; // WiFi
    board[28].owner = "p2"; // VPN
    expect(calculateUtilityRent("p2", board, 8)).toBe(80);
  });
});

describe("calculateNetWorth", () => {
  it("includes mogz, property values, and house values", () => {
    const player = makePlayer({ mogz: 500, properties: [1, 3] });
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].houses = 2;
    // mogz(500) + mortgage values(30+30) + houses(2 * 50)
    expect(calculateNetWorth(player, board)).toBe(660);
  });
});

describe("ownsFullPlatform", () => {
  it("returns true when player owns all tiles in platform", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    expect(ownsFullPlatform("p1", "reddit", board)).toBe(true);
  });

  it("returns false when player is missing one tile", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    expect(ownsFullPlatform("p1", "reddit", board)).toBe(false);
  });
});

describe("canBuild", () => {
  it("returns true when player owns full group and houses are even", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    expect(canBuild(1, "p1", board)).toBe(true);
  });

  it("returns false for uneven build (even build rule)", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].houses = 1; // index 1 has 1 house, index 3 has 0
    expect(canBuild(1, "p1", board)).toBe(false); // can't add to 1 until 3 catches up
  });

  it("returns false for mortgaged property", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].mortgaged = true;
    expect(canBuild(1, "p1", board)).toBe(false);
  });
});

describe("calculatePaywallTax", () => {
  it("returns 10% of net worth", () => {
    const player = makePlayer({ mogz: 1000, properties: [] });
    const board = makeBoard();
    expect(calculatePaywallTax(player, board)).toBe(100);
  });
});
```

- [ ] **Step 2: Install Vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `game-logic` module does not exist yet.

- [ ] **Step 4: Write game-logic implementation**

Create `src/lib/game-logic.ts`:

```typescript
import { BOARD, getPlatformTiles, getServerFarmIndices, getUtilityIndices } from "./board-data";
import { SERVER_FARM_RENT, HOTEL_VALUE } from "./constants";
import type { Player, TileState } from "@/types/game";

/** Check if player owns all tiles in a platform group */
export function ownsFullPlatform(playerId: string, platform: string, board: TileState[]): boolean {
  const tiles = getPlatformTiles(platform);
  return tiles.every((i) => board[i].owner === playerId && !board[i].mortgaged);
}

/** Count how many server farms a player owns (unmortgaged) */
export function countOwnedServerFarms(playerId: string, board: TileState[]): number {
  return getServerFarmIndices().filter((i) => board[i].owner === playerId && !board[i].mortgaged).length;
}

/** Count how many utilities a player owns (unmortgaged) */
export function countOwnedUtilities(playerId: string, board: TileState[]): number {
  return getUtilityIndices().filter((i) => board[i].owner === playerId && !board[i].mortgaged).length;
}

/** Calculate rent for a property tile */
export function calculateRent(tileIndex: number, board: TileState[], diceTotal: number): number {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];

  if (!state.owner || state.mortgaged) return 0;
  if (!def.rent) return 0;

  if (def.type === "server-farm") {
    return calculateServerFarmRent(state.owner, board);
  }

  if (def.type === "utility") {
    return calculateUtilityRent(state.owner, board, diceTotal);
  }

  if (def.type !== "property") return 0;

  // Hotel or houses
  if (state.houses > 0) {
    return def.rent[state.houses] ?? 0;
  }

  // No houses — check if owner has full group for double rent
  const baseRent = def.rent[0];
  if (def.platform && ownsFullPlatform(state.owner, def.platform, board)) {
    return baseRent * 2;
  }

  return baseRent;
}

/** Calculate server farm rent based on count owned */
export function calculateServerFarmRent(ownerId: string, board: TileState[]): number {
  const count = countOwnedServerFarms(ownerId, board);
  if (count === 0) return 0;
  return SERVER_FARM_RENT[count - 1];
}

/** Calculate utility rent: dice × 4 (one) or dice × 10 (both) */
export function calculateUtilityRent(ownerId: string, board: TileState[], diceTotal: number): number {
  const count = countOwnedUtilities(ownerId, board);
  if (count === 0) return 0;
  return diceTotal * (count === 1 ? 4 : 10);
}

/** Calculate net worth: mogz + mortgage values + house values */
export function calculateNetWorth(player: Player, board: TileState[]): number {
  let worth = player.mogz;

  for (const tileIndex of player.properties) {
    const def = BOARD[tileIndex];
    worth += def.mortgageValue ?? 0;

    const state = board[tileIndex];
    if (state.houses > 0 && def.houseCost) {
      const houseCount = state.houses >= HOTEL_VALUE ? 4 : state.houses;
      const hotelCount = state.houses >= HOTEL_VALUE ? 1 : 0;
      worth += houseCount * Math.floor(def.houseCost / 2);
      worth += hotelCount * Math.floor(def.houseCost / 2);
    }
  }

  return worth;
}

/** Calculate Paywall tax (10% of net worth) */
export function calculatePaywallTax(player: Player, board: TileState[]): number {
  return Math.floor(calculateNetWorth(player, board) * 0.1);
}

/** Check if a player can build on a tile (even build rule) */
export function canBuild(tileIndex: number, playerId: string, board: TileState[]): boolean {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];

  if (def.type !== "property" || !def.platform) return false;
  if (state.owner !== playerId || state.mortgaged) return false;
  if (state.houses >= HOTEL_VALUE) return false; // already a hotel

  // Must own full group
  if (!ownsFullPlatform(playerId, def.platform, board)) return false;

  // No mortgaged properties in group
  const groupTiles = getPlatformTiles(def.platform);
  if (groupTiles.some((i) => board[i].mortgaged)) return false;

  // Even build rule: this tile's houses must be <= min in group
  const minHouses = Math.min(...groupTiles.map((i) => board[i].houses));
  return state.houses <= minHouses;
}

/** Check if a player can sell a building from a tile (even sell rule) */
export function canSellBuilding(tileIndex: number, playerId: string, board: TileState[]): boolean {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];

  if (def.type !== "property" || !def.platform) return false;
  if (state.owner !== playerId) return false;
  if (state.houses <= 0) return false;

  // Even sell rule: this tile's houses must be >= max in group
  const groupTiles = getPlatformTiles(def.platform);
  const maxHouses = Math.max(...groupTiles.map((i) => board[i].houses));
  return state.houses >= maxHouses;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/game-logic.ts src/lib/__tests__/game-logic.test.ts vitest.config.ts
git commit -m "feat: add game logic with rent calc, net worth, building rules + tests"
```

---

## Phase 2: Partykit Server

### Task 5: Partykit Game State Machine

**Files:**
- Modify: `src/party/mogpoly-room.ts`

- [ ] **Step 1: Implement full Partykit server**

Replace `src/party/mogpoly-room.ts` with:

```typescript
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
```

- [ ] **Step 2: Verify Partykit server compiles**

```bash
npx partykit dev
```

Expected: Partykit dev server starts without TypeScript errors. Press Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add src/party/mogpoly-room.ts
git commit -m "feat: implement full Partykit game state machine with all game actions"
```

---

## Phase 3: UI Foundation

### Task 6: Base UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/GlitchText.tsx`, `src/components/ui/CRTOverlay.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-[rgba(0,255,100,0.08)] border-[rgba(0,255,100,0.3)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.15)] hover:shadow-[0_0_20px_rgba(0,255,100,0.2)]",
  secondary: "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)]",
  danger: "bg-[rgba(255,0,0,0.08)] border-[rgba(255,0,0,0.3)] text-[#ff4444] hover:bg-[rgba(255,0,0,0.15)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        font-mono border rounded-md transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 2: Create Modal component**

Create `src/components/ui/Modal.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm" />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative z-10 max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            {title && (
              <h2 className="text-lg font-bold text-glow mb-4 font-mono">{title}</h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create GlitchText component**

Create `src/components/ui/GlitchText.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export default function GlitchText({ text, className = "", as: Tag = "h1" }: GlitchTextProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Tag className="relative font-mono font-bold text-glow">
        {text}
      </Tag>
      {/* Glitch layers */}
      <Tag
        className="absolute inset-0 font-mono font-bold text-[#ff0040] opacity-70 animate-glitch"
        style={{ clipPath: "inset(20% 0 40% 0)" }}
        aria-hidden
      >
        {text}
      </Tag>
      <Tag
        className="absolute inset-0 font-mono font-bold text-[#00ffff] opacity-70 animate-glitch"
        style={{ clipPath: "inset(60% 0 10% 0)", animationDelay: "0.1s" }}
        aria-hidden
      >
        {text}
      </Tag>
    </motion.div>
  );
}
```

- [ ] **Step 4: Update CRTOverlay as component**

Create `src/components/ui/CRTOverlay.tsx`:

```tsx
export default function CRTOverlay() {
  return <div className="crt-overlay" aria-hidden />;
}
```

- [ ] **Step 5: Verify components render**

Update `src/app/page.tsx` to test import:

```tsx
import Button from "@/components/ui/Button";
import GlitchText from "@/components/ui/GlitchText";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative gap-6">
      <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,255,100,0.06)] top-[10%] left-[20%] absolute" />
      <GlitchText text="MOGPOLY" className="text-5xl" />
      <p className="text-[var(--text-secondary)] text-sm font-mono">Internet Monopoly</p>
      <div className="flex gap-4">
        <Button>Create Room</Button>
        <Button variant="secondary">Join Room</Button>
      </div>
    </main>
  );
}
```

Run `npm run dev` and verify at http://localhost:3000.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base UI components - Button, Modal, GlitchText, CRTOverlay"
```

---

### Task 7: WebSocket Hooks

**Files:**
- Create: `src/hooks/usePartySocket.ts`, `src/hooks/useGameState.ts`

- [ ] **Step 1: Create Partykit socket hook**

Create `src/hooks/usePartySocket.ts`:

```tsx
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
  roomCode,
  host,
  onGameState,
  onError,
  onConnected,
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

    return () => {
      ws.close();
    };
  }, [roomCode, host]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send, connected, myId };
}
```

- [ ] **Step 2: Create game state hook**

Create `src/hooks/useGameState.ts`:

```tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GameState, ClientMessage } from "@/types/game";
import { usePartySocket } from "./usePartySocket";

export function useGameState(roomCode: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { send, connected, myId } = usePartySocket({
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
    () =>
      gameState?.phase === "playing" &&
      gameState.players[gameState.currentPlayerIndex]?.id === myId,
    [gameState, myId]
  );

  const isHost = useMemo(
    () => gameState?.players[0]?.id === myId,
    [gameState, myId]
  );

  return {
    gameState,
    me,
    myId,
    isMyTurn,
    isHost,
    connected,
    error,
    send,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add WebSocket hooks for Partykit connection and game state"
```

---

## Phase 4: Screens

### Task 8: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement full landing page**

Replace `src/app/page.tsx`:

```tsx
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
      {/* Background glow orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-[rgba(0,255,100,0.05)] top-[5%] left-[10%] absolute" />
      <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,200,255,0.03)] bottom-[10%] right-[15%] absolute" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 z-10"
      >
        {/* Logo */}
        <GlitchText text="MOGPOLY" className="text-6xl md:text-8xl" />
        <p className="text-[var(--text-secondary)] text-sm font-mono tracking-widest uppercase">
          Internet Monopoly
        </p>

        {/* Actions */}
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-[var(--text-dim)] text-xs font-mono"
        >
          <a href="https://ko-fi.com/" target="_blank" rel="noopener" className="hover:text-[var(--text-secondary)] transition-colors">
            Buy the Dev a Coffee ☕
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}
```

- [ ] **Step 2: Verify landing page renders**

Run `npm run dev`, visit http://localhost:3000.
Expected: Dark terminal background, CRT scanlines, glitch "MOGPOLY" text, Create Room and Join Room UI with frosted glass input.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: implement landing page with create/join room, glitch title, terminal aesthetic"
```

---

### Task 9: Room Page Shell (Lobby + Game + End)

**Files:**
- Create: `src/app/room/[code]/page.tsx`
- Create: `src/components/lobby/PlayerList.tsx`, `src/components/lobby/TokenPicker.tsx`, `src/components/lobby/RoomLink.tsx`

- [ ] **Step 1: Create RoomLink component**

Create `src/components/lobby/RoomLink.tsx`:

```tsx
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
```

- [ ] **Step 2: Create TokenPicker component**

Create `src/components/lobby/TokenPicker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FREE_TOKENS, SEMI_PREMIUM_TOKENS, PREMIUM_TOKENS, type TokenType } from "@/types/game";

const TOKEN_LABELS: Record<string, string> = {
  doge: "Doge", pepe: "Pepe", trollface: "Trollface", "nyan-cat": "Nyan Cat",
  wojak: "Wojak", "stonks-man": "Stonks", gigachad: "Gigachad",
  amogus: "Amogus", harambe: "Harambe", rickroll: "Rickroll",
  "golden-doge": "Golden Doge", "neon-pepe": "Neon Pepe",
  "glitch-trollface": "Glitch Troll", "rainbow-nyan": "Rainbow Nyan",
  "chad-wojak": "Chad Wojak", "diamond-doge": "Diamond Doge",
  "galaxy-pepe": "Galaxy Pepe", "holo-gigachad": "Holo Chad",
  "pixel-set": "Pixel Set", "animated-set": "Animated",
};

const TOKEN_EMOJI: Record<string, string> = {
  doge: "🐕", pepe: "🐸", trollface: "😈", "nyan-cat": "🌈",
  wojak: "😢", "stonks-man": "📈", gigachad: "💪",
  amogus: "🔴", harambe: "🦍", rickroll: "🎵",
  "golden-doge": "✨🐕", "neon-pepe": "💜🐸",
  "glitch-trollface": "⚡😈", "rainbow-nyan": "🌈✨",
  "chad-wojak": "😎", "diamond-doge": "💎🐕",
  "galaxy-pepe": "🌌🐸", "holo-gigachad": "🌟💪",
  "pixel-set": "👾", "animated-set": "🎬",
};

interface TokenPickerProps {
  selected: TokenType | null;
  onSelect: (token: TokenType) => void;
  takenTokens: TokenType[];
}

type Tab = "free" | "semi" | "premium";

export default function TokenPicker({ selected, onSelect, takenTokens }: TokenPickerProps) {
  const [tab, setTab] = useState<Tab>("free");

  const tokens = tab === "free" ? FREE_TOKENS
    : tab === "semi" ? SEMI_PREMIUM_TOKENS
    : PREMIUM_TOKENS;

  return (
    <div className="glass-panel p-4">
      <div className="text-xs text-[var(--text-dim)] font-mono mb-3">PICK YOUR TOKEN</div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["free", "semi", "premium"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              tab === t
                ? "bg-[rgba(0,255,100,0.1)] text-[#00ff64] border border-[rgba(0,255,100,0.3)]"
                : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t === "free" ? "FREE" : t === "semi" ? "SEMI ✨" : "PREMIUM 💎"}
          </button>
        ))}
      </div>

      {/* Token grid */}
      <div className="grid grid-cols-5 gap-2">
        {tokens.map((token) => {
          const taken = takenTokens.includes(token) && selected !== token;
          const isSelected = selected === token;

          return (
            <motion.button
              key={token}
              whileHover={taken ? {} : { scale: 1.05 }}
              whileTap={taken ? {} : { scale: 0.95 }}
              onClick={() => !taken && onSelect(token)}
              disabled={taken}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all text-xs font-mono ${
                isSelected
                  ? "bg-[rgba(0,255,100,0.15)] border border-[rgba(0,255,100,0.4)] glow-green"
                  : taken
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
              }`}
            >
              <span className="text-xl">{TOKEN_EMOJI[token] ?? "❓"}</span>
              <span className="text-[10px] truncate w-full text-center">{TOKEN_LABELS[token] ?? token}</span>
            </motion.button>
          );
        })}
      </div>

      {tab === "semi" && (
        <p className="text-[10px] text-[var(--text-dim)] mt-3 font-mono">
          Watch a 30-60s ad to unlock for this session
        </p>
      )}
      {tab === "premium" && (
        <p className="text-[10px] text-[var(--text-dim)] mt-3 font-mono">
          $0.99-$2.99 — permanent unlock (coming soon)
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create PlayerList component**

Create `src/components/lobby/PlayerList.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/types/game";
import { PLATFORM_COLORS } from "@/lib/constants";

const TOKEN_EMOJI: Record<string, string> = {
  doge: "🐕", pepe: "🐸", trollface: "😈", "nyan-cat": "🌈",
  wojak: "😢", "stonks-man": "📈", gigachad: "💪",
  amogus: "🔴", harambe: "🦍", rickroll: "🎵",
  "golden-doge": "✨🐕", "neon-pepe": "💜🐸",
  "glitch-trollface": "⚡😈", "rainbow-nyan": "🌈✨",
  "chad-wojak": "😎", "diamond-doge": "💎🐕",
  "galaxy-pepe": "🌌🐸", "holo-gigachad": "🌟💪",
  "pixel-set": "👾", "animated-set": "🎬",
};

interface PlayerListProps {
  players: Player[];
  hostId?: string;
  myId?: string | null;
}

export default function PlayerList({ players, hostId, myId }: PlayerListProps) {
  return (
    <div className="glass-panel p-4">
      <div className="text-xs text-[var(--text-dim)] font-mono mb-3">
        PLAYERS ({players.length}/6)
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center gap-3 p-2 rounded-md font-mono text-sm ${
                player.id === myId ? "bg-[rgba(0,255,100,0.06)]" : ""
              }`}
            >
              <span className="text-lg">{TOKEN_EMOJI[player.token] ?? "❓"}</span>
              <span className="flex-1 truncate">{player.name}</span>
              {player.id === hostId && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(0,255,100,0.1)] text-[#00ff64] rounded font-mono">
                  HOST
                </span>
              )}
              {player.id === myId && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] rounded font-mono">
                  YOU
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create room page with lobby view**

Create `src/app/room/[code]/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Test lobby flow**

Terminal 1: `npx partykit dev`
Terminal 2: `npm run dev`

Visit http://localhost:3000, click Create Room. Should see lobby with room code, name input, token picker, and join button. Open same room URL in another tab — both should see players join.

- [ ] **Step 6: Commit**

```bash
git add src/app/room/ src/components/lobby/
git commit -m "feat: implement lobby with room link sharing, token picker, player list"
```

---

## Phase 5: Game Board & Interactions

### Task 10: Game Board Component

**Files:**
- Create: `src/components/board/Board.tsx`, `src/components/board/Tile.tsx`, `src/components/board/CornerTile.tsx`
- Create: `src/components/game/Token.tsx`, `src/components/game/Dice.tsx`, `src/components/game/ActionBar.tsx`, `src/components/game/PlayerStats.tsx`, `src/components/game/Chat.tsx`

This is the largest task. The board is a CSS Grid square with tiles around the perimeter.

- [ ] **Step 1: Create Token component**

Create `src/components/game/Token.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { TokenType } from "@/types/game";

const TOKEN_EMOJI: Record<string, string> = {
  doge: "🐕", pepe: "🐸", trollface: "😈", "nyan-cat": "🌈",
  wojak: "😢", "stonks-man": "📈", gigachad: "💪",
  amogus: "🔴", harambe: "🦍", rickroll: "🎵",
  "golden-doge": "✨", "neon-pepe": "💜", "glitch-trollface": "⚡",
  "rainbow-nyan": "🌈", "chad-wojak": "😎", "diamond-doge": "💎",
  "galaxy-pepe": "🌌", "holo-gigachad": "🌟", "pixel-set": "👾",
  "animated-set": "🎬",
};

interface TokenProps {
  token: TokenType;
  size?: "sm" | "md";
  isCurrentPlayer?: boolean;
}

export default function Token({ token, size = "sm", isCurrentPlayer }: TokenProps) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`flex items-center justify-center rounded-full ${
        size === "sm" ? "w-5 h-5 text-xs" : "w-8 h-8 text-base"
      } ${isCurrentPlayer ? "ring-1 ring-[#00ff64] ring-offset-1 ring-offset-[#0a0a0f]" : ""}`}
    >
      {TOKEN_EMOJI[token] ?? "❓"}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create Tile component**

Create `src/components/board/Tile.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { TileDefinition, TileState, Player } from "@/types/game";
import { PLATFORM_COLORS } from "@/lib/constants";
import Token from "@/components/game/Token";

interface TileProps {
  definition: TileDefinition;
  state: TileState;
  players: Player[];
  currentPlayerId?: string;
  side: "top" | "bottom" | "left" | "right";
  onClick?: () => void;
}

export default function Tile({ definition, state, players, currentPlayerId, side, onClick }: TileProps) {
  const playersOnTile = players.filter((p) => p.position === definition.index && !p.bankrupt);
  const platformColor = definition.platform ? PLATFORM_COLORS[definition.platform] : undefined;
  const isVertical = side === "left" || side === "right";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative glass-panel overflow-hidden cursor-pointer flex ${
        isVertical ? "flex-row" : "flex-col"
      } ${state.owner ? "border-opacity-40" : ""}`}
      style={{ minHeight: isVertical ? undefined : "70px", minWidth: isVertical ? "70px" : undefined }}
    >
      {/* Platform color accent bar */}
      {platformColor && (
        <div
          className={`${isVertical ? "w-1 h-full" : "h-1 w-full"} shrink-0`}
          style={{ background: platformColor, boxShadow: `0 0 8px ${platformColor}40` }}
        />
      )}

      {/* Content */}
      <div className="flex-1 p-1 flex flex-col justify-between min-w-0">
        <div className="text-[8px] font-mono text-[var(--text-secondary)] truncate leading-tight">
          {definition.name}
        </div>

        {definition.price && (
          <div className="text-[7px] font-mono text-[var(--text-dim)]">
            {definition.price}M
          </div>
        )}

        {/* Houses */}
        {state.houses > 0 && (
          <div className="flex gap-[2px] mt-0.5">
            {state.houses >= 5 ? (
              <div className="w-2.5 h-2.5 bg-red-500 rounded-sm text-[6px] flex items-center justify-center">H</div>
            ) : (
              Array.from({ length: state.houses }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-400 rounded-sm" />
              ))
            )}
          </div>
        )}

        {/* Tokens on this tile */}
        {playersOnTile.length > 0 && (
          <div className="flex flex-wrap gap-[2px] mt-0.5">
            {playersOnTile.map((p) => (
              <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
            ))}
          </div>
        )}
      </div>

      {/* Mortgaged overlay */}
      {state.mortgaged && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center">
          <span className="text-[8px] font-mono text-red-400 rotate-[-20deg]">MORTGAGED</span>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create CornerTile component**

Create `src/components/board/CornerTile.tsx`:

```tsx
"use client";

import type { Player } from "@/types/game";
import Token from "@/components/game/Token";

interface CornerTileProps {
  name: string;
  index: number;
  players: Player[];
  currentPlayerId?: string;
}

const CORNER_ICONS: Record<string, string> = {
  Homepage: "🏠",
  "Shadow Ban": "🚫",
  AFK: "💤",
  "Get Reported": "⚠️",
};

export default function CornerTile({ name, index, players, currentPlayerId }: CornerTileProps) {
  const playersHere = players.filter((p) => p.position === index && !p.bankrupt);

  return (
    <div className="glass-panel flex flex-col items-center justify-center p-2 aspect-square">
      <span className="text-xl mb-1">{CORNER_ICONS[name] ?? "❓"}</span>
      <span className="text-[9px] font-mono text-[var(--text-secondary)] text-center leading-tight">
        {name}
      </span>
      {playersHere.length > 0 && (
        <div className="flex flex-wrap gap-[2px] mt-1 justify-center">
          {playersHere.map((p) => (
            <Token key={p.id} token={p.token} size="sm" isCurrentPlayer={p.id === currentPlayerId} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create Board component (CSS Grid)**

Create `src/components/board/Board.tsx`:

```tsx
"use client";

import { BOARD } from "@/lib/board-data";
import type { GameState } from "@/types/game";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import GlitchText from "@/components/ui/GlitchText";

interface BoardProps {
  gameState: GameState;
  currentPlayerId?: string;
  onTileClick?: (index: number) => void;
}

export default function Board({ gameState, currentPlayerId, onTileClick }: BoardProps) {
  const { board, players, dice } = gameState;

  // Board layout: 11x11 grid
  // Corners: (0,0)=AFK  (0,10)=GetReported  (10,0)=ShadowBan  (10,10)=Homepage
  // Top row: positions 21-29 (left to right)
  // Right col: positions 31-39 (top to bottom) — but 30 is Get Reported corner
  // Bottom row: positions 9-1 (left to right, reversed)
  // Left col: positions 11-19 (bottom to top, reversed visually means top to bottom in grid)

  const topRow = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]; // AFK ... Get Reported
  const bottomRow = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]; // Shadow Ban ... Homepage
  const leftCol = [19, 18, 17, 16, 15, 14, 13, 12, 11]; // top-to-bottom
  const rightCol = [31, 32, 33, 34, 35, 36, 37, 38, 39]; // top-to-bottom

  const renderTile = (index: number, side: "top" | "bottom" | "left" | "right") => {
    const def = BOARD[index];
    if (def.type === "corner") {
      return <CornerTile key={index} name={def.name} index={index} players={players} currentPlayerId={currentPlayerId} />;
    }
    return (
      <Tile
        key={index}
        definition={def}
        state={board[index]}
        players={players}
        currentPlayerId={currentPlayerId}
        side={side}
        onClick={() => onTileClick?.(index)}
      />
    );
  };

  return (
    <div className="grid grid-cols-11 grid-rows-11 gap-[2px] w-full max-w-[700px] aspect-square">
      {/* Top row (row 1) */}
      {topRow.map((i) => renderTile(i, "top"))}

      {/* Middle rows (rows 2-10) */}
      {leftCol.map((leftIdx, row) => (
        <div key={`row-${row}`} className="contents">
          {renderTile(leftIdx, "left")}

          {/* Center area (9 cols, only render content in center of grid) */}
          {row === 0 && (
            <div className="col-span-9 row-span-9 flex flex-col items-center justify-center gap-4 relative">
              <div className="glow-orb w-[200px] h-[200px] bg-[rgba(0,255,100,0.03)] absolute" />
              <GlitchText text="MOGPOLY" className="text-2xl md:text-3xl" as="h2" />

              {/* Dice display */}
              <div className="flex gap-3">
                <div className="glass-panel w-12 h-12 flex items-center justify-center text-xl font-mono font-bold text-glow">
                  {dice[0]}
                </div>
                <div className="glass-panel w-12 h-12 flex items-center justify-center text-xl font-mono font-bold text-glow">
                  {dice[1]}
                </div>
              </div>

              <div className="text-xs font-mono text-[var(--text-dim)]">
                {players[gameState.currentPlayerIndex]?.name}&apos;s turn
              </div>
            </div>
          )}

          {renderTile(rightCol[row], "right")}
        </div>
      ))}

      {/* Bottom row (row 11) */}
      {bottomRow.map((i) => renderTile(i, "bottom"))}
    </div>
  );
}
```

- [ ] **Step 5: Create Dice component with Framer Motion**

Create `src/components/game/Dice.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DiceProps {
  values: [number, number];
  rolling?: boolean;
}

export default function Dice({ values, rolling }: DiceProps) {
  return (
    <div className="flex gap-3">
      {values.map((val, i) => (
        <motion.div
          key={i}
          animate={rolling ? {
            rotateX: [0, 360, 720],
            rotateY: [0, 180, 360],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="glass-panel w-14 h-14 flex items-center justify-center text-2xl font-mono font-bold text-glow"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={val}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {val}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create ActionBar component**

Create `src/components/game/ActionBar.tsx`:

```tsx
"use client";

import Button from "@/components/ui/Button";
import type { TurnPhase } from "@/types/game";

interface ActionBarProps {
  turnPhase: TurnPhase;
  isMyTurn: boolean;
  inShadowBan: boolean;
  hasGetOutCard: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onAuction: () => void;
  onEndTurn: () => void;
  onShadowBanPay: () => void;
  onShadowBanCard: () => void;
}

export default function ActionBar({
  turnPhase, isMyTurn, inShadowBan, hasGetOutCard,
  onRoll, onBuy, onAuction, onEndTurn, onShadowBanPay, onShadowBanCard,
}: ActionBarProps) {
  if (!isMyTurn) {
    return (
      <div className="glass-panel p-3 text-center">
        <p className="text-sm font-mono text-[var(--text-dim)] animate-pulse">Waiting for other player...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 flex flex-wrap gap-2 justify-center">
      {turnPhase === "waiting-for-roll" && !inShadowBan && (
        <Button onClick={onRoll}>ROLL DICE</Button>
      )}

      {turnPhase === "waiting-for-roll" && inShadowBan && (
        <>
          <Button onClick={onRoll}>ROLL FOR DOUBLES</Button>
          <Button variant="secondary" onClick={onShadowBanPay}>PAY 50M</Button>
          {hasGetOutCard && (
            <Button variant="secondary" onClick={onShadowBanCard}>USE CARD</Button>
          )}
        </>
      )}

      {turnPhase === "buy-or-auction" && (
        <>
          <Button onClick={onBuy}>BUY</Button>
          <Button variant="secondary" onClick={onAuction}>AUCTION</Button>
        </>
      )}

      {turnPhase === "turn-ended" && (
        <Button onClick={onEndTurn}>END TURN</Button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create PlayerStats component**

Create `src/components/game/PlayerStats.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/game";
import Token from "./Token";

interface PlayerStatsProps {
  players: Player[];
  currentPlayerIndex: number;
  myId: string | null;
}

export default function PlayerStats({ players, currentPlayerIndex, myId }: PlayerStatsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player, i) => (
        <motion.div
          key={player.id}
          animate={i === currentPlayerIndex ? { borderColor: "rgba(0,255,100,0.4)" } : {}}
          className={`glass-panel px-3 py-2 flex items-center gap-2 font-mono text-xs ${
            player.bankrupt ? "opacity-30" : ""
          } ${i === currentPlayerIndex ? "glow-green" : ""}`}
        >
          <Token token={player.token} size="sm" isCurrentPlayer={i === currentPlayerIndex} />
          <span className={`truncate max-w-[80px] ${player.id === myId ? "text-[#00ff64]" : "text-[var(--text-secondary)]"}`}>
            {player.name}
          </span>
          <span className="text-[var(--text-dim)]">{player.mogz}M</span>
          <span className="text-[var(--text-dim)]">{player.properties.length}🏠</span>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create Chat component**

Create `src/components/game/Chat.tsx`:

```tsx
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
```

- [ ] **Step 9: Wire board into room page**

Update the "playing" section in `src/app/room/[code]/page.tsx`, replacing the placeholder:

```tsx
  // --- PLAYING ---
  if (gameState?.phase === "playing") {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    return (
      <main className="flex min-h-screen flex-col items-center p-4 gap-4 relative">
        <div className="glow-orb w-[300px] h-[300px] bg-[rgba(0,255,100,0.03)] top-0 left-0 absolute" />

        {/* Player Stats */}
        <PlayerStats players={gameState.players} currentPlayerIndex={gameState.currentPlayerIndex} myId={myId} />

        {/* Board + Chat layout */}
        <div className="flex gap-4 w-full max-w-[900px] justify-center flex-1">
          <div className="flex-1 flex items-center justify-center">
            <Board gameState={gameState} currentPlayerId={currentPlayer?.id} />
          </div>

          <div className="w-[200px] shrink-0 hidden md:block">
            <Chat
              messages={gameState.messages}
              onSend={(text) => send({ type: "chat", text })}
              myId={myId}
            />
          </div>
        </div>

        {/* Action Bar */}
        <ActionBar
          turnPhase={gameState.turnPhase}
          isMyTurn={isMyTurn}
          inShadowBan={me?.inShadowBan ?? false}
          hasGetOutCard={(me?.getOutOfBanCards ?? 0) > 0}
          onRoll={() => send({ type: "roll-dice" })}
          onBuy={() => send({ type: "buy-property" })}
          onAuction={() => send({ type: "auction-start" })}
          onEndTurn={() => send({ type: "end-turn" })}
          onShadowBanPay={() => send({ type: "shadow-ban-pay" })}
          onShadowBanCard={() => send({ type: "shadow-ban-card" })}
        />

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-mono">
            {error}
          </motion.p>
        )}
      </main>
    );
  }
```

Add the missing imports at the top of the file:

```tsx
import Board from "@/components/board/Board";
import ActionBar from "@/components/game/ActionBar";
import PlayerStats from "@/components/game/PlayerStats";
import Chat from "@/components/game/Chat";
```

- [ ] **Step 10: Test game board renders**

Terminal 1: `npx partykit dev`
Terminal 2: `npm run dev`

Create room, join with 2 players (2 tabs), start game. Should see 11x11 grid board with all 40 tiles, player tokens, dice in center, action bar, and chat.

- [ ] **Step 11: Commit**

```bash
git add src/components/board/ src/components/game/ src/app/room/
git commit -m "feat: implement game board, tiles, dice, action bar, player stats, and chat"
```

---

### Task 11: Game Modals (Property, RNG, DMs, Auction, Trade, Build, Shadow Ban, Bankruptcy)

**Files:**
- Create: `src/components/modals/PropertyCard.tsx`, `src/components/modals/RNGCard.tsx`, `src/components/modals/AuctionModal.tsx`, `src/components/modals/TradeModal.tsx`, `src/components/modals/BuildModal.tsx`, `src/components/modals/ShadowBanModal.tsx`, `src/components/modals/BankruptWarning.tsx`

- [ ] **Step 1: Create PropertyCard modal**

Create `src/components/modals/PropertyCard.tsx`:

```tsx
"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants";

interface PropertyCardProps {
  tileIndex: number;
  open: boolean;
  onBuy: () => void;
  onAuction: () => void;
  playerMogz: number;
}

export default function PropertyCard({ tileIndex, open, onBuy, onAuction, playerMogz }: PropertyCardProps) {
  const tile = BOARD[tileIndex];
  if (!tile) return null;

  const color = tile.platform ? PLATFORM_COLORS[tile.platform] : "#00ff64";
  const canAfford = (tile.price ?? 0) <= playerMogz;

  return (
    <Modal open={open} title={tile.name}>
      {/* Color bar */}
      {tile.platform && (
        <div className="h-2 rounded-full mb-4" style={{ background: color, boxShadow: `0 0 12px ${color}40` }} />
      )}

      <div className="space-y-3 font-mono text-sm">
        {tile.platform && (
          <div className="text-xs text-[var(--text-dim)]">{PLATFORM_LABELS[tile.platform]}</div>
        )}

        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Price</span>
          <span className="text-glow">{tile.price} mogz</span>
        </div>

        {tile.rent && tile.type === "property" && (
          <div className="glass-panel p-3 space-y-1 text-xs">
            <div className="flex justify-between"><span>Base rent</span><span>{tile.rent[0]}</span></div>
            <div className="flex justify-between"><span>1 Server</span><span>{tile.rent[1]}</span></div>
            <div className="flex justify-between"><span>2 Servers</span><span>{tile.rent[2]}</span></div>
            <div className="flex justify-between"><span>3 Servers</span><span>{tile.rent[3]}</span></div>
            <div className="flex justify-between"><span>4 Servers</span><span>{tile.rent[4]}</span></div>
            <div className="flex justify-between"><span>Data Center</span><span>{tile.rent[5]}</span></div>
            {tile.houseCost && (
              <div className="flex justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
                <span>Server cost</span><span>{tile.houseCost} each</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={onBuy} disabled={!canAfford}>
            BUY ({tile.price}M)
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onAuction}>
            AUCTION
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Create RNG/DMs card modal**

Create `src/components/modals/RNGCard.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import type { Card } from "@/types/game";

interface RNGCardProps {
  card: Card | null;
  open: boolean;
  deckType: "rng" | "dms";
}

export default function RNGCard({ card, open, deckType }: RNGCardProps) {
  if (!card) return null;

  return (
    <Modal open={open} title={deckType === "rng" ? "RNG" : "DMs"}>
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="glass-panel p-6 text-center"
      >
        <div className="text-3xl mb-4">{deckType === "rng" ? "🎲" : "💌"}</div>
        <p className="font-mono text-sm text-[var(--text-secondary)] leading-relaxed">
          {card.text}
        </p>
      </motion.div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create AuctionModal**

Create `src/components/modals/AuctionModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import type { AuctionState, Player } from "@/types/game";

interface AuctionModalProps {
  auction: AuctionState;
  players: Player[];
  myId: string | null;
  open: boolean;
  onBid: (amount: number) => void;
  onPass: () => void;
}

export default function AuctionModal({ auction, players, myId, open, onBid, onPass }: AuctionModalProps) {
  const tile = BOARD[auction.tileIndex];
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const me = players.find((p) => p.id === myId);
  const isParticipant = auction.participants.includes(myId ?? "");
  const highBidder = players.find((p) => p.id === auction.currentBidder);

  return (
    <Modal open={open} title={`Auction: ${tile.name}`}>
      <div className="space-y-4 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-dim)]">Current bid</span>
          <span className="text-glow text-lg">{auction.currentBid} mogz</span>
        </div>

        {highBidder && (
          <div className="flex justify-between">
            <span className="text-[var(--text-dim)]">High bidder</span>
            <span className="text-[var(--text-secondary)]">{highBidder.name}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-[var(--text-dim)]">Time left</span>
          <span className={auction.timeRemaining <= 5 ? "text-red-400" : "text-[var(--text-secondary)]"}>
            {auction.timeRemaining}s
          </span>
        </div>

        {isParticipant && me && (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={auction.currentBid + 1}
              max={me.mogz}
              className="glass-panel px-3 py-2 font-mono text-sm w-24 text-[var(--text-primary)] focus:outline-none"
            />
            <Button onClick={() => onBid(bidAmount)} disabled={bidAmount <= auction.currentBid || bidAmount > me.mogz}>
              BID
            </Button>
            <Button variant="danger" onClick={onPass}>PASS</Button>
          </div>
        )}

        {!isParticipant && (
          <p className="text-[var(--text-dim)] text-center">You passed on this auction.</p>
        )}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Create TradeModal**

Create `src/components/modals/TradeModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD } from "@/lib/board-data";
import type { Player } from "@/types/game";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  me: Player;
  players: Player[];
  boardState: { owner: string | null; mortgaged: boolean }[];
  onPropose: (to: string, offerProps: number[], offerMogz: number, requestProps: number[], requestMogz: number) => void;
}

export default function TradeModal({ open, onClose, me, players, boardState, onPropose }: TradeModalProps) {
  const [targetId, setTargetId] = useState("");
  const [offerProps, setOfferProps] = useState<number[]>([]);
  const [requestProps, setRequestProps] = useState<number[]>([]);
  const [offerMogz, setOfferMogz] = useState(0);
  const [requestMogz, setRequestMogz] = useState(0);

  const otherPlayers = players.filter((p) => p.id !== me.id && !p.bankrupt);
  const target = players.find((p) => p.id === targetId);

  const myProps = me.properties.filter((i) => !boardState[i].mortgaged);
  const targetProps = target?.properties.filter((i) => !boardState[i].mortgaged) ?? [];

  const toggleProp = (index: number, list: number[], setter: (v: number[]) => void) => {
    setter(list.includes(index) ? list.filter((i) => i !== index) : [...list, index]);
  };

  const handleSend = () => {
    if (!targetId) return;
    onPropose(targetId, offerProps, offerMogz, requestProps, requestMogz);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Propose Trade">
      <div className="space-y-4 font-mono text-sm">
        <div>
          <label className="text-xs text-[var(--text-dim)] block mb-1">TRADE WITH</label>
          <select
            value={targetId}
            onChange={(e) => { setTargetId(e.target.value); setRequestProps([]); }}
            className="glass-panel w-full px-3 py-2 text-[var(--text-primary)] bg-transparent focus:outline-none"
          >
            <option value="">Select player...</option>
            {otherPlayers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Your offer */}
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-2">YOU OFFER</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {myProps.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleProp(i, offerProps, setOfferProps)}
                  className={`w-full text-left text-[10px] px-2 py-1 rounded ${
                    offerProps.includes(i) ? "bg-[rgba(0,255,100,0.1)] text-[#00ff64]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {BOARD[i].name}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={offerMogz}
              onChange={(e) => setOfferMogz(Math.max(0, Number(e.target.value)))}
              max={me.mogz}
              placeholder="Mogz"
              className="glass-panel w-full px-2 py-1 mt-2 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* You request */}
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-2">YOU REQUEST</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {targetProps.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleProp(i, requestProps, setRequestProps)}
                  className={`w-full text-left text-[10px] px-2 py-1 rounded ${
                    requestProps.includes(i) ? "bg-[rgba(255,100,0,0.1)] text-[#ff6b35]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {BOARD[i].name}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={requestMogz}
              onChange={(e) => setRequestMogz(Math.max(0, Number(e.target.value)))}
              placeholder="Mogz"
              className="glass-panel w-full px-2 py-1 mt-2 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSend} disabled={!targetId}>SEND TRADE</Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>CANCEL</Button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 5: Create BuildModal**

Create `src/components/modals/BuildModal.tsx`:

```tsx
"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { BOARD, getPlatformTiles } from "@/lib/board-data";
import { canBuild, canSellBuilding } from "@/lib/game-logic";
import { PLATFORM_COLORS, PLATFORM_LABELS, HOTEL_VALUE } from "@/lib/constants";
import type { Player, TileState } from "@/types/game";

interface BuildModalProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  board: TileState[];
  onBuild: (tileIndex: number) => void;
  onSell: (tileIndex: number) => void;
}

export default function BuildModal({ open, onClose, player, board, onBuild, onSell }: BuildModalProps) {
  // Group properties by platform
  const platforms = [...new Set(player.properties.map((i) => BOARD[i].platform).filter(Boolean))] as string[];

  return (
    <Modal open={open} onClose={onClose} title="Build">
      <div className="space-y-4 font-mono text-sm">
        {platforms.map((platform) => {
          const tiles = getPlatformTiles(platform);
          const color = PLATFORM_COLORS[platform];

          return (
            <div key={platform} className="glass-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-xs">{PLATFORM_LABELS[platform]}</span>
              </div>

              <div className="space-y-2">
                {tiles.map((i) => {
                  const def = BOARD[i];
                  const state = board[i];
                  if (state.owner !== player.id) return null;

                  const buildable = canBuild(i, player.id, board);
                  const sellable = canSellBuilding(i, player.id, board);
                  const affordable = (def.houseCost ?? 0) <= player.mogz;

                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{def.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-dim)]">
                          {state.houses >= HOTEL_VALUE ? "🏨" : `${"🏠".repeat(state.houses)}`}
                        </span>
                        <Button size="sm" onClick={() => onSell(i)} disabled={!sellable}>-</Button>
                        <Button size="sm" onClick={() => onBuild(i)} disabled={!buildable || !affordable}>+</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {platforms.length === 0 && (
          <p className="text-[var(--text-dim)] text-center">No complete platform groups owned.</p>
        )}

        <Button variant="secondary" className="w-full" onClick={onClose}>CLOSE</Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 6: Create ShadowBanModal and BankruptWarning**

Create `src/components/modals/ShadowBanModal.tsx`:

```tsx
"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ShadowBanModalProps {
  open: boolean;
  turnsRemaining: number;
  hasCard: boolean;
  mogz: number;
  onPay: () => void;
  onUseCard: () => void;
  onRoll: () => void;
}

export default function ShadowBanModal({ open, turnsRemaining, hasCard, mogz, onPay, onUseCard, onRoll }: ShadowBanModalProps) {
  return (
    <Modal open={open} title="Shadow Banned 🚫">
      <div className="space-y-4 font-mono text-sm text-center">
        <p className="text-[var(--text-secondary)]">
          You&apos;ve been Shadow Banned! Escape to continue playing.
        </p>
        <p className="text-[var(--text-dim)] text-xs">
          Attempts: {turnsRemaining}/3
        </p>

        <div className="space-y-2">
          <Button className="w-full" onClick={onRoll}>ROLL FOR DOUBLES</Button>
          <Button variant="secondary" className="w-full" onClick={onPay} disabled={mogz < 50}>
            PAY 50 MOGZ
          </Button>
          {hasCard && (
            <Button variant="secondary" className="w-full" onClick={onUseCard}>
              USE GET OUT OF BAN CARD
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
```

Create `src/components/modals/BankruptWarning.tsx`:

```tsx
"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Player, TileState } from "@/types/game";
import { BOARD } from "@/lib/board-data";

interface BankruptWarningProps {
  open: boolean;
  player: Player;
  board: TileState[];
  onMortgage: (tileIndex: number) => void;
  onSellBuilding: (tileIndex: number) => void;
}

export default function BankruptWarning({ open, player, board, onMortgage, onSellBuilding }: BankruptWarningProps) {
  const debt = Math.abs(player.mogz);

  return (
    <Modal open={open} title="Bankruptcy Warning ⚠️">
      <div className="space-y-4 font-mono text-sm">
        <p className="text-red-400 text-center">
          You owe {debt} mogz! Sell or mortgage to cover your debt.
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {player.properties.map((i) => {
            const def = BOARD[i];
            const state = board[i];

            return (
              <div key={i} className="flex items-center justify-between text-xs glass-panel p-2">
                <span className="text-[var(--text-secondary)] truncate">{def.name}</span>
                <div className="flex gap-1">
                  {state.houses > 0 && (
                    <Button size="sm" variant="danger" onClick={() => onSellBuilding(i)}>
                      SELL 🏠
                    </Button>
                  )}
                  {!state.mortgaged && state.houses === 0 && (
                    <Button size="sm" variant="secondary" onClick={() => onMortgage(i)}>
                      MORTGAGE ({def.mortgageValue}M)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/modals/
git commit -m "feat: add all game modals - property card, RNG/DMs, auction, trade, build, shadow ban, bankruptcy"
```

---

### Task 12: End Screen + Wire Modals into Room Page

**Files:**
- Modify: `src/app/room/[code]/page.tsx`

- [ ] **Step 1: Update room page with all modal integrations and end screen**

This step wires modals into the game view and adds the end screen. Update the imports and the playing/ended sections of `src/app/room/[code]/page.tsx`:

Add imports at top:

```tsx
import PropertyCard from "@/components/modals/PropertyCard";
import RNGCard from "@/components/modals/RNGCard";
import AuctionModal from "@/components/modals/AuctionModal";
import TradeModal from "@/components/modals/TradeModal";
import BuildModal from "@/components/modals/BuildModal";
import BankruptWarning from "@/components/modals/BankruptWarning";
```

Add state for modal visibility inside the component (after the existing state declarations):

```tsx
const [showTrade, setShowTrade] = useState(false);
const [showBuild, setShowBuild] = useState(false);
```

Replace the `// --- PLAYING ---` section with full modal integration:

```tsx
  // --- PLAYING ---
  if (gameState?.phase === "playing") {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const landedTile = me ? BOARD[me.position] : null;

    return (
      <main className="flex min-h-screen flex-col items-center p-4 gap-4 relative">
        <div className="glow-orb w-[300px] h-[300px] bg-[rgba(0,255,100,0.03)] top-0 left-0 absolute" />

        <PlayerStats players={gameState.players} currentPlayerIndex={gameState.currentPlayerIndex} myId={myId} />

        <div className="flex gap-4 w-full max-w-[900px] justify-center flex-1">
          <div className="flex-1 flex items-center justify-center">
            <Board gameState={gameState} currentPlayerId={currentPlayer?.id} />
          </div>
          <div className="w-[200px] shrink-0 hidden md:block">
            <Chat messages={gameState.messages} onSend={(text) => send({ type: "chat", text })} myId={myId} />
          </div>
        </div>

        {/* Action Bar with trade/build buttons */}
        <div className="flex gap-2 items-center">
          <ActionBar
            turnPhase={gameState.turnPhase}
            isMyTurn={isMyTurn}
            inShadowBan={me?.inShadowBan ?? false}
            hasGetOutCard={(me?.getOutOfBanCards ?? 0) > 0}
            onRoll={() => send({ type: "roll-dice" })}
            onBuy={() => send({ type: "buy-property" })}
            onAuction={() => send({ type: "auction-start" })}
            onEndTurn={() => send({ type: "end-turn" })}
            onShadowBanPay={() => send({ type: "shadow-ban-pay" })}
            onShadowBanCard={() => send({ type: "shadow-ban-card" })}
          />
          {isMyTurn && me && (
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={() => setShowTrade(true)}>TRADE</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowBuild(true)}>BUILD</Button>
            </div>
          )}
        </div>

        {/* Property Buy/Auction Modal */}
        {isMyTurn && gameState.turnPhase === "buy-or-auction" && me && (
          <PropertyCard
            tileIndex={me.position}
            open
            onBuy={() => send({ type: "buy-property" })}
            onAuction={() => send({ type: "auction-start" })}
            playerMogz={me.mogz}
          />
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
```

Add the BOARD import at top:

```tsx
import { BOARD } from "@/lib/board-data";
```

Replace the `// --- ENDED ---` section:

```tsx
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
```

Add Token import at top:

```tsx
import Token from "@/components/game/Token";
```

- [ ] **Step 2: Test full game loop**

Terminal 1: `npx partykit dev`
Terminal 2: `npm run dev`

Open 2-3 tabs, create room, join, start game. Test: rolling dice, buying properties, paying rent, drawing cards, trading, building houses, auction, bankruptcy, and winning. Full game loop should work.

- [ ] **Step 3: Commit**

```bash
git add src/app/room/ src/components/modals/
git commit -m "feat: wire all modals and end screen into game - full playable game loop"
```

---

## Phase 6: Polish & Deploy

### Task 13: Deploy to Vercel + Partykit

**Files:**
- Modify: `package.json`, `.env.local` (create), `next.config.js`

- [ ] **Step 1: Create .env.local**

Create `.env.local`:

```
NEXT_PUBLIC_PARTYKIT_HOST=mogpoly.YOUR_USERNAME.partykit.dev
```

- [ ] **Step 2: Add .env.local to .gitignore check**

Verify `.env.local` is already in `.gitignore` (it is from the initial setup).

- [ ] **Step 3: Deploy Partykit**

```bash
npx partykit deploy
```

Expected: Partykit deploys and outputs the host URL (e.g., `mogpoly.username.partykit.dev`). Update `.env.local` with this URL.

- [ ] **Step 4: Push to GitHub and deploy to Vercel**

```bash
git add -A
git commit -m "feat: prepare for deployment with env config"
git push origin main
```

Then connect the repo to Vercel:
1. Go to vercel.com → New Project → Import `AkanxRai/mogpoly`
2. Set env var: `NEXT_PUBLIC_PARTYKIT_HOST` = your partykit host
3. Deploy

- [ ] **Step 5: Verify live deployment**

Visit the Vercel URL, create a room, share link, play a game.

- [ ] **Step 6: Commit any deployment fixes**

```bash
git add -A
git commit -m "fix: deployment configuration tweaks"
git push origin main
```

---

## Summary

| Phase | Tasks | What's Built |
| --- | --- | --- |
| 1. Foundation | Tasks 1-4 | Project scaffold, types, board data, card decks, game logic + tests |
| 2. Server | Task 5 | Full Partykit game state machine with all game actions |
| 3. UI Foundation | Tasks 6-7 | Base components (Button, Modal, GlitchText), WebSocket hooks |
| 4. Screens | Tasks 8-9 | Landing page, lobby with room sharing/token picker |
| 5. Game Board | Tasks 10-12 | Full board, all tiles, dice, chat, all modals, end screen |
| 6. Deploy | Task 13 | Live on Vercel + Partykit |

**Total tasks:** 13
**Estimated commits:** 13-15
**Result:** Fully playable multiplayer Mogpoly with all core Monopoly mechanics, meme theming, dark terminal aesthetic, and live deployment.
