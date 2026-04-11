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
- **Multiplayer:** Direct multiplayer only (no bots/single-player). WebSocket via Socket.IO or Partykit
- **Styling:** Tailwind CSS + Framer Motion + Phaser.js (if needed for Canvas game visuals)
- **Visual Quality:** Must be visually beautiful and highly smooth — Framer Motion for UI animations, Phaser.js for complex game canvas (particles, board effects), CSS transitions for simple hover/micro-interactions
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
- **Players:** 2-4 players per game (direct multiplayer only, no bots)
- **Core rules:** Buy properties, build houses/hotels, collect rent, trade, auctions
- **Win condition:** Last player standing (others bankrupt)

## Visual Requirements

- **Framer Motion** for orchestrated UI animations (dice rolls, token movement, card reveals, modals, glitch text)
- **Phaser.js** available for Canvas-based game visuals if needed (particle systems, advanced board effects, complex sprite animations)
- **CSS transitions/keyframes** for simple hover states and micro-interactions
- Smooth 60fps gameplay with polished micro-interactions
- Beautiful, crafted UI — not generic or template-like

## Monetization Strategy

| Feature | Service | Placement |
| --- | --- | --- |
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

#### Core Workflow (Superpowers)

| Skill | When to Use |
| --- | --- |
| `superpowers:brainstorming` | Before any new feature, component, game mechanic, or module design |
| `superpowers:writing-plans` | Multi-step tasks spanning 3+ files |
| `superpowers:executing-plans` | Running a written plan with review checkpoints in a separate session |
| `superpowers:systematic-debugging` | Any bug, test failure, WebSocket issue, or unexpected behavior |
| `superpowers:test-driven-development` | Before implementing features or bug fixes |
| `superpowers:verification-before-completion` | Before claiming work is done or committing |
| `superpowers:requesting-code-review` | After completing major features or milestones |
| `superpowers:receiving-code-review` | When processing code review feedback — verify before blindly implementing |
| `superpowers:dispatching-parallel-agents` | 2+ independent tasks (e.g., fix CSS + add API endpoint + write tests) |
| `superpowers:subagent-driven-development` | Executing plans with independent tasks in current session |
| `superpowers:finishing-a-development-branch` | When implementation is complete, deciding merge/PR/cleanup |
| `superpowers:using-git-worktrees` | Feature work needing isolation from current workspace |
| `simplify` | Review changed code for reuse, quality, and efficiency |

#### Frontend & Design

| Skill | When to Use |
| --- | --- |
| `frontend-design:frontend-design` | Creating UI components, game board, lobby, end screens — any visual work |
| `react-dev` (agent-toolkit) | TypeScript React component patterns, hooks, performance |
| `design-system-starter` (agent-toolkit) | Design tokens, component library, accessibility standards |

#### Game Development

| Skill | When to Use |
| --- | --- |
| `game-developer` (fullstack-dev-skills) | Game logic, state machines, turn systems, multiplayer architecture |
| `websocket-engineer` (fullstack-dev-skills) | WebSocket protocol design, real-time multiplayer, room management |
| `typescript-pro` (fullstack-dev-skills) | Complex TypeScript generics, type safety for game state |
| `nextjs-developer` (fullstack-dev-skills) | Next.js App Router, API routes, SSR/SSG, middleware |
| `react-expert` (fullstack-dev-skills) | Advanced React patterns, memoization, render optimization |

#### Testing & Quality

| Skill | When to Use |
| --- | --- |
| `playwright-expert` (fullstack-dev-skills) | E2E testing — game flow, multiplayer scenarios |
| `test-master` (fullstack-dev-skills) | Test strategy, coverage targets, test architecture |
| `qa-test-planner` (agent-toolkit) | QA planning and test case design for game mechanics |
| `code-review:code-review` | Automated PR code review before merging |
| `security-reviewer` (fullstack-dev-skills) | Security audit — auth, WebSocket, user input, ad integrations |

#### Documentation & Planning

| Skill | When to Use |
| --- | --- |
| `mermaid-diagrams` (agent-toolkit) | Architecture diagrams, game state flow, WebSocket protocol diagrams |
| `c4-architecture` (agent-toolkit) | C4 model architecture documentation |
| `gepetto` (agent-toolkit) | Detailed implementation plans with research phase |
| `requirements-clarity` (agent-toolkit) | Clarifying ambiguous game mechanic or feature requirements |
| `session-handoff` (agent-toolkit) | Documenting session state for handoff between laptops |
| `naming-analyzer` (agent-toolkit) | Better naming for game entities, functions, components |

#### Memory & Context

| Skill | When to Use |
| --- | --- |
| `claude-mem:mem-search` | Search for work done in previous sessions |
| `claude-mem:make-plan` | Create phased implementation plans with doc discovery |
| `claude-mem:do` | Execute phased plans using subagents |
| `claude-mem:smart-explore` | Token-efficient code exploration via AST parsing |
| `context7` | Look up docs for Next.js, React, Socket.IO, Tailwind, Partykit, etc. |

#### Creative & Utility

| Skill | When to Use |
| --- | --- |
| `meme-factory` (agent-toolkit) | Meme/visual content creation for game assets and theming |
| `domain-name-brainstormer` (agent-toolkit) | Domain name suggestions for mogpoly |
| `loop` | Run recurring tasks on interval (e.g., monitor deploy status) |
| `schedule` | Create cron-scheduled remote agents for automated tasks |

**Full reference:** See [docs/skills-and-plugins.md](docs/skills-and-plugins.md) for complete catalog of all 200+ available plugins, skills, and MCP servers.

## Known Constraints

- Vercel free tier: 100GB bandwidth/month, 10s serverless function timeout
- WebSocket on Vercel requires Partykit or external service (Vercel doesn't natively support persistent WebSocket connections)
- Starting with ~30 users, monetization optimized for low traffic
- Classic Mode only for initial release
