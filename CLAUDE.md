# Mogpoly

## Project Overview

Mogpoly is a browser-based Monopoly-style board game with internet/meme culture theming and "mogz" as the in-game currency. Inspired by richup.io, it features real-time multiplayer, meme-themed properties, and a freemium monetization model. Currently focused on Classic Mode (single board, core Monopoly mechanics).

## Architecture

```
Browser (Next.js + React + TypeScript)
    -> Vercel (hosting, serverless functions)
        -> WebSocket server (real-time multiplayer)
        -> Database (game state, user profiles, cosmetics)
        -> Ad networks (Monetag primary, Adsterra backup)
```

- **Framework:** Next.js 14+ (App Router), React 18, TypeScript
- **Rendering:** DOM-based (HTML/CSS/JS, not Canvas) - following richup.io's approach
- **Multiplayer:** WebSocket (Socket.IO or Partykit for Vercel)
- **Styling:** Tailwind CSS
- **State:** Zustand or React Context for game state
- **Hosting:** Vercel (free tier)
- **Auth:** Simple username/session-based (no registration required for basic play)

## Directory Structure

```
mogpoly/
  docs/                          # Design docs, specs
    superpowers/specs/           # Brainstorming & design specs
  src/                           # Source code (Next.js app)
  public/                        # Static assets (images, sounds)
  CLAUDE.md                      # This file
  .gitignore                     # Git ignore rules
```

## Game Mechanics (Classic Mode)

- **Board:** 40 spaces, meme/internet-themed properties
- **Currency:** Mogz (start with 1,500 mogz)
- **Players:** 2-4 players per game
- **Core rules:** Buy properties, build houses/hotels, collect rent, trade, auctions
- **Win condition:** Last player standing (others bankrupt)

## Monetization Strategy

| Feature | Service | Placement |
|---|---|---|
| Main Ads | Monetag | Interstitial after game ends (win/lose) |
| Backup Ads | Adsterra | Social Bar at top of board |
| Donations | Ko-fi | "Buy the Dev a Coffee" in footer |
| Rewarded Ads | Monetag/CPAlead | "Chance Card save" when facing bankruptcy/tax |
| Cosmetic Skins | Direct purchase | Custom tokens ($0.99-$2.99) |
| Daily Bonus | Monetag SmartLink | "Claim Daily Bonus" button on main menu |
| Affiliate Board | Affiliate links | Premium property tiles branded with affiliate products |

## Conventions

- **Language:** TypeScript strict mode everywhere
- **Components:** Functional React components with hooks
- **Naming:** PascalCase for components, camelCase for functions/variables, kebab-case for files
- **State:** Immutable updates, no direct mutation
- **Styling:** Tailwind utility classes, no inline styles
- **Testing:** Vitest for unit tests, Playwright for E2E
- **Commits:** Conventional commits (feat:, fix:, docs:, etc.)


## Agent Usage

### Model Selection

**Default to Sonnet. Escalate to Opus only when reasoning depth genuinely matters.**

**Use Sonnet for:**
- File reads & searches, boilerplate edits, CSS tweaks, config updates
- Simple component changes, URL/route scaffolding, documentation
- Parallel subagent dispatch for independent tasks

**Escalate to Opus for:**
- Architecture decisions, complex debugging, game logic design
- Multi-file refactors, security reviews, WebSocket protocol design
- Multiplayer state synchronization, scoring/matching logic

### Skill Usage

| Skill | When to use |
|---|---|
| `superpowers:brainstorming` | Before any new feature, component, or module work |
| `superpowers:writing-plans` | Multi-step tasks spanning 3+ files |
| `superpowers:systematic-debugging` | Any bug, test failure, or unexpected behavior |
| `superpowers:test-driven-development` | Before implementing features or fixes |
| `superpowers:verification-before-completion` | Before claiming work is done |
| `superpowers:dispatching-parallel-agents` | 2+ independent tasks |
| `superpowers:executing-plans` | Running a written plan with review checkpoints |
| `superpowers:requesting-code-review` | After completing major features |
| `frontend-design:frontend-design` | Creating UI components, pages, game board |

## Known Constraints

- Vercel free tier: 100GB bandwidth/month, 10s serverless function timeout
- WebSocket on Vercel requires Partykit or external service (Vercel doesn't natively support persistent WebSocket connections)
- Starting with ~30 users, monetization optimized for low traffic
- Classic Mode only for initial release
