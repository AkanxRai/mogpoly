# Mogpoly Classic Mode — Design Spec

## Overview

Mogpoly is a browser-based Monopoly-style board game themed around internet platforms and meme culture. Players use **mogz** currency to buy, trade, and develop properties named after iconic internet locations across 8 platform-based color groups. Multiplayer only (2-6 players) via invite link sharing.

**Target:** ~30 initial users, monetized via Monetag/Adsterra ads, rewarded ads, cosmetic token skins, and affiliate board branding.

**Deploy:** Vercel (free tier) + Partykit (free tier).

---

## Architecture

```
Browser (Next.js 14 App Router, TypeScript, Tailwind CSS)
  → Vercel (hosting, static assets, API routes)
  → Partykit (WebSocket rooms, server-authoritative game state)
  → Monetag / Adsterra (client-side ad SDKs)
  → Ko-fi (donation link)
```

### Key Principles

- **Server-authoritative:** Game state lives in Partykit (Cloudflare Durable Objects). Clients send intents (roll, buy, trade), server validates and broadcasts. No cheating possible.
- **No database for MVP:** Game state is ephemeral — lives in Partykit memory during session, gone when room closes. No accounts, no persistence.
- **Animation:** Framer Motion for orchestrated UI animations (dice rolls, token movement, card reveals, modals, glitch effects). Phaser.js available if Canvas-based rendering is needed for complex game visuals (particle systems, advanced board effects). CSS transitions/keyframes for simple hover states and micro-interactions. Must be 60fps smooth.
- **DOM-based rendering:** HTML/CSS/JS, not Canvas. Following richup.io's proven approach.

---

## Visual Design

### Aesthetic: Retro Internet + Heavy Frosted Blur

- **Background:** Near-black (#0a0a0f)
- **Primary text:** Green terminal monospace (#00ff64)
- **Secondary text:** Dim white (rgba(255,255,255,0.3-0.5))
- **Panels/tiles:** Heavy frosted blur (backdrop-filter: blur(20px+)), NOT clean/transparent glass
- **Borders:** Subtle, low-opacity (rgba color, 0.1-0.15 alpha)
- **CRT scanline overlay:** Repeating linear gradient, subtle
- **Glow orbs:** Radial gradients behind panels for depth
- **Platform colors:** Used only on property accent bars (thin color strip at top of tile)
- **Typography:** Courier New / monospace for all game text

### Platform Color Map

| Platform | Brand Color |
| --- | --- |
| Reddit | #ff4500 |
| 4chan | #789922 |
| TikTok | #00f2ea |
| Discord | #5865F2 |
| YouTube | #ff0000 |
| Twitter/X | #1DA1F2 |
| Twitch | #9146FF |
| Instagram | #E1306C |

---

## Game Board (40 Spaces)

### Layout

Classic square board — 10 tiles per side, 4 corner tiles. Center shows game logo, dice, and current action.

### Special Spaces

| Classic Monopoly | Mogpoly Name | Effect |
| --- | --- | --- |
| GO | **Homepage** | Collect 200 mogz when passing |
| Jail | **Shadow Ban** | Skip turns until escape |
| Free Parking | **AFK** | Nothing happens |
| Go to Jail | **Get Reported** | Go directly to Shadow Ban |
| Chance | **RNG** | Random event card (good or bad) |
| Community Chest | **DMs** | Random reward card (usually good) |
| Income Tax | **Sub Fee** | Pay 200 mogz |
| Luxury Tax | **Paywall** | Pay 10% of net worth |
| Railroads | **Server Farms** (×4) | Rent: 25/50/100/200 mogz for 1/2/3/4 owned |
| Utilities | **WiFi** & **VPN** | Rent: dice roll × 4 (one owned) or × 10 (both owned) |

### Property Groups (8 Platforms)

| Color | Platform | Properties (cheap → expensive) |
| --- | --- | --- |
| Brown | Reddit | r/place, Karma Farm |
| Light Blue | 4chan | Greentext Lane, Anon Ave, /b/ Boulevard |
| Pink | TikTok | FYP Street, Duet Drive, Trend Plaza |
| Orange | Discord | Nitro Lane, Mod Abuse Ave, Server Boost Blvd |
| Red | YouTube | Clickbait Court, Demonetized Drive, Algorithm Ave |
| Yellow | Twitter/X | Ratio Road, Main Character Ave, Quote Tweet Blvd |
| Green | Twitch | PogChamp Park, Sub Train Ave, Emote Lane |
| Dark Blue | Instagram | Influencer Ave, Reels Row |

### Full Board Order (position 0-39)

```
 0: Homepage (corner)
 1: r/place (Reddit)
 2: DMs
 3: Karma Farm (Reddit)
 4: Sub Fee (tax)
 5: Server Farm 1
 6: Greentext Lane (4chan)
 7: RNG
 8: Anon Ave (4chan)
 9: /b/ Boulevard (4chan)
10: Shadow Ban (corner)
11: FYP Street (TikTok)
12: WiFi (utility)
13: Duet Drive (TikTok)
14: Trend Plaza (TikTok)
15: Server Farm 2
16: Nitro Lane (Discord)
17: DMs
18: Mod Abuse Ave (Discord)
19: Server Boost Blvd (Discord)
20: AFK (corner)
21: Clickbait Court (YouTube)
22: RNG
23: Demonetized Drive (YouTube)
24: Algorithm Ave (YouTube)
25: Server Farm 3
26: Ratio Road (Twitter/X)
27: Main Character Ave (Twitter/X)
28: VPN (utility)
29: Quote Tweet Blvd (Twitter/X)
30: Get Reported (corner)
31: PogChamp Park (Twitch)
32: Sub Train Ave (Twitch)
33: DMs
34: Emote Lane (Twitch)
35: Server Farm 4
36: RNG
37: Influencer Ave (Instagram)
38: Paywall (tax)
39: Reels Row (Instagram)
```

---

## Data Model

### GameRoom (Partykit server state)

```typescript
interface GameRoom {
  id: string;                    // room code (6 chars)
  phase: "lobby" | "playing" | "ended";
  players: Player[];             // 2-6 players
  currentPlayerIndex: number;
  board: Tile[];                 // 40 tiles
  doublesCount: number;          // consecutive doubles this turn
  dice: [number, number];
  tradeOffers: Trade[];
  rngDeck: Card[];               // shuffled RNG cards
  dmsDeck: Card[];               // shuffled DMs cards
  winner: string | null;
}

interface Player {
  id: string;                    // partykit connection id
  name: string;
  token: TokenType;
  position: number;              // 0-39
  mogz: number;                  // starts at 1500
  properties: number[];          // tile indices owned
  inShadowBan: boolean;
  shadowBanTurns: number;
  bankrupt: boolean;
  getOutOfBanCards: number;      // 0-2
}

interface Tile {
  index: number;
  type: "property" | "server-farm" | "utility" | "rng" | "dms" | "tax" | "corner";
  name: string;
  platform?: string;             // color group
  price?: number;
  rent?: number[];               // [base, 1house, 2house, 3house, 4house, hotel]
  houseCost?: number;
  houses: number;                // 0-5 (5 = hotel)
  owner: string | null;
  mortgaged: boolean;
}

interface Trade {
  from: string;                  // player id
  to: string;                    // player id
  offerProperties: number[];
  offerMogz: number;
  requestProperties: number[];
  requestMogz: number;
}

interface Card {
  text: string;                  // meme-themed description
  effect: CardEffect;
}

type CardEffect =
  | { type: "collect"; amount: number }           // collect mogz from bank
  | { type: "pay"; amount: number }               // pay mogz to bank
  | { type: "move"; to: number }                  // move to specific tile
  | { type: "move-relative"; by: number }         // move forward/backward N tiles
  | { type: "collect-from-each"; amount: number } // collect N mogz from each player
  | { type: "pay-each"; amount: number }          // pay N mogz to each player
  | { type: "get-out-of-ban" }                    // get out of shadow ban free card
  | { type: "repairs"; perHouse: number; perHotel: number } // pay per building
  | { type: "go-to-shadow-ban" };                 // go directly to shadow ban

type TokenType = 
  | "doge" | "pepe" | "trollface" | "nyan-cat" | "wojak"
  | "stonks-man" | "gigachad" | "amogus" | "harambe" | "rickroll"
  // semi-premium (session unlock via 30-60s ad)
  | "golden-doge" | "neon-pepe" | "glitch-trollface" | "rainbow-nyan" | "chad-wojak"
  // premium ($0.99-$2.99 permanent)
  | "diamond-doge" | "galaxy-pepe" | "holo-gigachad" | "pixel-set" | "animated-set";
```

---

## Token Tiers

| Tier | Tokens | Unlock Method |
| --- | --- | --- |
| **Free** | Doge, Pepe, Trollface, Nyan Cat, Wojak, Stonks Man, Gigachad, Amogus, Harambe, Rickroll Speaker | Default |
| **Semi-Premium** | Golden Doge, Neon Pepe, Glitch Trollface, Rainbow Nyan, Chad Wojak | Watch 30-60s rewarded ad (session-only, resets each game) |
| **Premium** | Diamond Doge, Galaxy Pepe, Holographic Gigachad, Pixel Art set, Animated set | $0.99-$2.99 permanent unlock |

---

## Game Flow

### Lobby

1. Player visits mogpoly → landing page
2. Creates room → Partykit spawns party, returns 6-char room code
3. Shareable link generated (mogpoly.vercel.app/room/XXXXXX)
4. Friends open link → auto-join lobby via WebSocket
5. Each player picks name + token
6. Host sees "Start Game" button (enabled at 2+ players)
7. Host starts → all get 1,500 mogz, random turn order

### Turn Sequence

1. Current player rolls dice (CSS animated 3D dice roll)
2. Token moves along board (smooth CSS transition, tile by tile)
3. Landing resolution:
   - **Unowned property** → Buy at listed price, or Auction to all players
   - **Owned by other** → Pay rent (auto-calculated based on houses/hotel/group)
   - **Own property** → Nothing (can manage properties between turns)
   - **RNG tile** → Draw card, apply random event
   - **DMs tile** → Draw card, usually positive reward
   - **Sub Fee** → Pay 200 mogz to bank
   - **Paywall** → Pay 10% of total net worth to bank
   - **Server Farm** → Pay rent based on how many farms owner has
   - **WiFi/VPN** → Pay dice roll × 4 (one utility) or × 10 (both utilities)
   - **Homepage** → Collect 200 mogz (also collected when passing)
   - **AFK** → Nothing
   - **Get Reported** → Move directly to Shadow Ban
4. Doubles → roll again (3 consecutive doubles = Shadow Ban)
5. End turn → next player

### Shadow Ban

- Skip turns until escape:
  - Pay 50 mogz
  - Use "Get Out of Ban" card
  - Roll doubles on your turn
- After 3 failed attempts, forced to pay 50 mogz and move by final roll

### Building

- Own all properties in a platform group → can build
- Even build rule: all properties in group must have equal houses before adding more
- 4 houses → upgrade to hotel (1 hotel replaces 4 houses)
- Must sell houses evenly (reverse of building)

### Trading

- Any player can propose a trade during their turn
- Offer: properties + mogz ↔ properties + mogz
- Other player accepts or rejects
- Cannot trade mortgaged properties (must unmortgage first)

### Bankruptcy

- Can't pay a debt → must sell houses (half price) and mortgage properties (half price)
- Still can't pay → bankrupt, eliminated
- Assets transfer to creditor (or bank if owed to bank, then auctioned)
- **Rewarded ad save:** Before going bankrupt, player can watch 30s ad for an RNG card that might save them

### Winning

- Last player standing wins
- End screen: winner announcement (glitch text animation), final standings
- Monetag interstitial ad
- "Play Again" redirects all players back to the same room lobby (room stays alive, Partykit resets game state)

---

## Property Pricing

Follows standard Monopoly scaling, denominated in mogz:

| Platform | Properties | Price Range | House Cost | Base Rent Range |
| --- | --- | --- | --- | --- |
| Reddit (Brown) | 2 | 60-60 | 50 | 2-4 |
| 4chan (Light Blue) | 3 | 100-120 | 50 | 6-8 |
| TikTok (Pink) | 3 | 140-160 | 100 | 10-12 |
| Discord (Orange) | 3 | 180-200 | 100 | 14-16 |
| YouTube (Red) | 3 | 220-240 | 150 | 18-20 |
| Twitter/X (Yellow) | 3 | 260-280 | 150 | 22-24 |
| Twitch (Green) | 3 | 300-320 | 200 | 26-28 |
| Instagram (Dark Blue) | 2 | 350-400 | 200 | 35-50 |
| Server Farms | 4 | 200 each | — | 25/50/100/200 |
| WiFi / VPN | 2 | 150 each | — | dice × 4 or × 10 |

Detailed rent tables (per house/hotel) defined in `board-data.ts` at implementation time, following standard Monopoly rent curve.

---

## Monetization Touchpoints

| Moment | Ad Type | Service | Feel |
| --- | --- | --- | --- |
| Landing page | "Claim Daily Bonus" SmartLink | Monetag | Opt-in, rewarding |
| Lobby | Semi-premium token unlock | Monetag rewarded video (30-60s) | Player choice, cosmetic flex |
| Facing bankruptcy | "Watch ad for RNG save card" | Monetag rewarded video (30s) | Feels like a lifeline, not interruption |
| Game end (win/lose) | Full-screen interstitial | Monetag | Session is over, low annoyance |
| Board (passive) | Social Bar at top | Adsterra | Non-intrusive, always visible |
| Footer | "Buy the Dev a Coffee" | Ko-fi | Goodwill, small donations |
| Premium property tiles | Affiliate product branding | Affiliate links | Native to board, not disruptive |

---

## Screens

### 1. Landing Page

- Mogpoly logo (retro pixel font + green CRT glow)
- "Create Room" button (primary, green glow)
- "Join Room" text input (paste code/link)
- "Claim Daily Bonus" button (Monetag SmartLink)
- Ko-fi link in footer
- Dark terminal background, CRT scanlines

### 2. Lobby

- Room code display + shareable link + copy button
- Player list (name, token preview, "Host" badge)
- Token picker with 3 tabs: Free / Semi-Premium / Premium
- Semi-premium tab shows "Watch Ad to Unlock" button
- Host: "Start Game" button (enabled at 2+ players)
- Simple text chat
- Player count indicator (e.g., "3/6 players")

### 3. Game Board

- Classic square layout, 40 tiles around perimeter
- Dark terminal aesthetic: near-black bg, green monospace text
- CRT scanline overlay (subtle)
- Tiles: heavy frosted blur panels, platform color accent bar at top
- Player tokens on tiles (meme icons)
- Center: Mogpoly logo, dice area, current action text
- Action buttons: Roll / Buy / Auction / End Turn / Trade / Build
- Player stats bar: all players' mogz + property count + token
- Current player highlight (green glow border)
- Chat sidebar (collapsible)
- Adsterra Social Bar at top (non-intrusive)

### 4. Modals/Popups (frosted blur overlay)

- **Property Card:** Name, platform, price, rent table, Buy/Auction buttons
- **RNG Card:** Meme-themed event text, effect applied
- **DMs Card:** Meme-themed reward text, effect applied
- **Trade Proposal:** Drag properties + enter mogz amounts, Send/Cancel
- **Shadow Ban Screen:** Escape options (pay/card/roll), turn counter
- **Bankruptcy Warning:** Debt amount, sell/mortgage options, rewarded ad offer
- **Auction:** Current bid, 30-second timer, bid increment buttons, all players participate
- **Build Menu:** Select property group, add/remove houses

### 5. End Screen

- Winner announcement (glitch text CSS animation)
- Final standings table (rank, name, mogz, properties)
- Monetag interstitial ad
- "Play Again" button (creates new room, same players)
- "Back to Home" button

---

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | SSR landing page for SEO, client components for game |
| Language | TypeScript (strict) | Type safety for game state |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Animations | Framer Motion + Phaser.js (if needed) + CSS | Framer for UI, Phaser for game canvas if needed |
| Multiplayer | Partykit | Native Vercel, free tier, WebSocket rooms, server-authoritative |
| Hosting | Vercel (free tier) | Zero config, CDN, edge functions |
| Ads (primary) | Monetag | Interstitials, rewarded video, SmartLink |
| Ads (backup) | Adsterra | Social Bar |
| Donations | Ko-fi | Simple link |

---

## File Structure (Planned)

```
mogpoly/
  src/
    app/
      page.tsx                   # Landing page
      room/[code]/page.tsx       # Lobby + game (client component)
      layout.tsx                 # Root layout, fonts, metadata
      globals.css                # Tailwind + CRT scanlines + blur utilities
    components/
      board/
        Board.tsx                # Main square board layout
        Tile.tsx                 # Individual tile component
        Corner.tsx               # Corner tile (Homepage, Shadow Ban, AFK, Get Reported)
        PropertyCard.tsx         # Property detail modal
      game/
        Dice.tsx                 # Animated dice component
        Token.tsx                # Player token (meme icon)
        ActionBar.tsx            # Roll/Buy/Auction/Trade/Build buttons
        PlayerStats.tsx          # Player info bar
        Chat.tsx                 # In-game chat
      modals/
        RNGCard.tsx              # RNG card draw modal
        DMsCard.tsx              # DMs card draw modal
        TradeModal.tsx           # Trade proposal UI
        AuctionModal.tsx         # Auction bidding UI
        BuildModal.tsx           # House/hotel building UI
        BankruptWarning.tsx      # Bankruptcy + ad save modal
        ShadowBanModal.tsx       # Shadow Ban escape UI
      lobby/
        TokenPicker.tsx          # Token selection with tiers
        PlayerList.tsx           # Lobby player list
        RoomLink.tsx             # Shareable link + copy
      ui/
        Button.tsx               # Styled button (green glow)
        Modal.tsx                # Base frosted blur modal
        GlitchText.tsx           # Glitch text animation component
        CRTOverlay.tsx           # Scanline overlay
      ads/
        MonetagInterstitial.tsx  # End-game interstitial
        RewardedAd.tsx           # Rewarded video wrapper
        SmartLink.tsx            # Daily bonus SmartLink
        SocialBar.tsx            # Adsterra top bar
    lib/
      game-logic.ts              # Core game rules (rent calc, bankruptcy check, etc.)
      board-data.ts              # 40-tile board definition with prices/rents
      card-decks.ts              # RNG and DMs card definitions
      constants.ts               # Game constants (starting mogz, tax amounts, etc.)
    party/
      mogpoly-room.ts            # Partykit server — game state machine, WebSocket handlers
    hooks/
      useGameState.ts            # React hook for game state from Partykit
      usePartySocket.ts          # WebSocket connection hook
    types/
      game.ts                    # All TypeScript interfaces (GameRoom, Player, Tile, etc.)
  public/
    tokens/                      # Meme token SVGs/images
    sounds/                      # Dice roll, mogz collect, etc. (optional)
    fonts/                       # Monospace/pixel fonts
  partykit.json                  # Partykit config
  tailwind.config.ts
  next.config.js
  package.json
  tsconfig.json
```

---

## Out of Scope (Future)

- User accounts / authentication
- Persistent stats / leaderboards
- Multiple board maps
- Spectator mode
- Mobile app
- Custom game rules (configurable)
- Room size upgrade (7-8 players as paid feature)
- Chat reactions / emotes
