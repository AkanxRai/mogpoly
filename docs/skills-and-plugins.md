# Mogpoly - Available Skills & Plugins Reference

## Currently Enabled Plugins

| Plugin | Source | Purpose |
|---|---|---|
| frontend-design | claude-plugins-official | Production-grade UI design with high visual quality |
| security-guidance | claude-plugins-official | Security reminders for command injection, XSS, unsafe patterns |
| ralph-loop | claude-plugins-official | Self-referential AI loops for iterative development |
| playwright | claude-plugins-official | Browser automation and E2E testing |
| code-review | claude-plugins-official | Automated PR code review with confidence scoring |
| superpowers | claude-plugins-official | Core workflow skills (TDD, debugging, planning, etc.) |
| skill-judge | agent-toolkit | Evaluate skill design quality |
| claude-mem | thedotmack | Cross-session persistent memory |

## Core Workflow Skills (Superpowers)

| Skill | When to Use |
|---|---|
| `superpowers:brainstorming` | Before any new feature, component, or game mechanic design |
| `superpowers:writing-plans` | Multi-step tasks spanning 3+ files |
| `superpowers:executing-plans` | Running a written plan with review checkpoints |
| `superpowers:systematic-debugging` | Any bug, test failure, or unexpected behavior |
| `superpowers:test-driven-development` | Before implementing features or fixes |
| `superpowers:verification-before-completion` | Before claiming work is done or committing |
| `superpowers:requesting-code-review` | After completing major features |
| `superpowers:receiving-code-review` | When processing code review feedback |
| `superpowers:dispatching-parallel-agents` | 2+ independent tasks that can run concurrently |
| `superpowers:subagent-driven-development` | Executing plans with independent tasks |
| `superpowers:finishing-a-development-branch` | When implementation is complete, deciding merge/PR/cleanup |
| `superpowers:using-git-worktrees` | Feature work needing isolation from current workspace |

## Frontend & Design Skills

| Skill | When to Use |
|---|---|
| `frontend-design:frontend-design` | Creating UI components, game board, lobby screens, any visual work |
| `react-dev` (agent-toolkit) | TypeScript React component patterns (React 18-19) |
| `design-system-starter` (agent-toolkit) | Design tokens, component library, accessibility |
| `mui` (agent-toolkit) | Material-UI patterns (if adopted) |

## Game Development Relevant Skills

| Skill | When to Use |
|---|---|
| `game-developer` (fullstack-dev-skills) | Game logic, state machines, multiplayer architecture |
| `websocket-engineer` (fullstack-dev-skills) | WebSocket multiplayer implementation |
| `typescript-pro` (fullstack-dev-skills) | Complex TypeScript patterns, generics, type safety |
| `nextjs-developer` (fullstack-dev-skills) | Next.js App Router, API routes, SSR/SSG |
| `react-expert` (fullstack-dev-skills) | Advanced React patterns, performance optimization |

## Testing & Quality Skills

| Skill | When to Use |
|---|---|
| `playwright-expert` (fullstack-dev-skills) | E2E testing with Playwright |
| `test-master` (fullstack-dev-skills) | Test strategy, coverage, test architecture |
| `qa-test-planner` (agent-toolkit) | QA planning and test case design |
| `code-review:code-review` | PR review before merging |
| `simplify` | Review changed code for reuse, quality, efficiency |

## Documentation & Planning Skills

| Skill | When to Use |
|---|---|
| `mermaid-diagrams` (agent-toolkit) | Architecture diagrams, flow charts, state machines |
| `c4-architecture` (agent-toolkit) | C4 model architecture documentation |
| `gepetto` (agent-toolkit) | Detailed implementation plans with research |
| `requirements-clarity` (agent-toolkit) | Clarifying ambiguous requirements |
| `session-handoff` (agent-toolkit) | Documenting session state for handoff between laptops |

## Infrastructure & DevOps Skills

| Skill | When to Use |
|---|---|
| `cloud-architect` (fullstack-dev-skills) | Vercel deployment, CDN, scaling decisions |
| `devops-engineer` (fullstack-dev-skills) | CI/CD, deployment pipelines |
| `security-reviewer` (fullstack-dev-skills) | Security audit of auth, WebSocket, user data |
| `database-optimizer` (fullstack-dev-skills) | Database query optimization |

## Utility Skills

| Skill | When to Use |
|---|---|
| `claude-mem:mem-search` | Search for work from previous sessions |
| `claude-mem:make-plan` | Create phased implementation plans |
| `claude-mem:do` | Execute phased plans using subagents |
| `claude-mem:smart-explore` | Token-efficient code exploration via AST parsing |
| `context7` | Look up docs for Next.js, React, Socket.IO, Tailwind, etc. |
| `domain-name-brainstormer` (agent-toolkit) | Domain name suggestions for mogpoly |
| `meme-factory` (agent-toolkit) | Meme/visual content creation for game assets |
| `naming-analyzer` (agent-toolkit) | Better naming for game entities, functions, components |

## Automation Skills

| Skill | When to Use |
|---|---|
| `loop` | Run recurring tasks on interval (e.g., monitor deploy) |
| `schedule` | Create cron-scheduled remote agents |
| `update-config` | Configure Claude Code settings.json |
| `keybindings-help` | Customize keyboard shortcuts |

## MCP Servers Available

| Server | Purpose |
|---|---|
| `chrome-devtools-mcp` | Live Chrome browser control for debugging |
| `playwright` | Browser automation testing |
| `claude-mem` | Persistent cross-session memory |
| `context7` | Documentation lookup for frameworks/libraries |
