# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A monorepo containing two parallel implementations of a **Starter Agent** for Slack built with Bolt for JavaScript. Both implementations are functionally identical from the Slack user's perspective but use different AI agent frameworks:

- `claude-agent-sdk/` -- Built with **Claude Agent SDK**
- `openai-agents-sdk/` -- Built with **OpenAI Agents SDK**

This is a minimal starter template. It includes one example tool (emoji reactions) and optional Slack MCP Server integration.

## Commands

All commands must be run from within the respective project directory (`claude-agent-sdk/` or `openai-agents-sdk/`).

```sh
# Run the app (requires .env with OPENAI_API_KEY or ANTHROPIC_API_KEY; Slack tokens optional with CLI)
slack run          # via Slack CLI
node app.js        # directly

# Lint and format (CI runs these on push to main and all PRs)
npm run lint

# Type check (JSDoc + TypeScript validation)
npm run check

# Run tests
npm test
```

## Monorepo Structure

```
.github/              # Shared CI workflows and dependabot config
claude-agent-sdk/     # Claude Agent SDK implementation
openai-agents-sdk/    # OpenAI Agents SDK implementation
vendor/               # Vendored @slack/bolt tarball from bolt-js main
```

CI runs biome lint and TypeScript checks against all directories via a matrix strategy in `.github/workflows/lint.yml`. Dependabot monitors `package.json` in all directories independently.

## Architecture (shared across all implementations)

Three-layer design: **app.js** -> **listeners/** -> **agent/**

**Entry point (`app.js`)** initializes Bolt with Socket Mode and calls `registerListeners(app)`.

**Listeners** are organized by Slack platform feature:
- `listeners/events/` -- `app-home-opened`, `app-mentioned`, `message`, `assistant-thread-started`
- `listeners/actions/` -- `feedback-buttons`

Each sub-module has a `register(app)` function called from `listeners/index.js`.

**AgentDeps** carries `client`, `userId`, `channelId`, `threadTs`, `messageTs`, `userToken`. Constructed in each listener handler and passed to the agent at runtime.

**Conversation history** (`thread-context/store.js`) is an in-memory Map keyed by `channelId:threadTs` with TTL-based cleanup. This enables multi-turn context.

**Handler flow** (DM, mention): get history from store -> run agent -> stream response in thread with feedback blocks -> store updated history.

## Key Differences Between Implementations

| Aspect | Claude Agent SDK | OpenAI Agents SDK |
|--------|-----------------|-------------------|
| Agent file | `agent/agent.js` | `agent/agent.js` |
| Agent definition | `query()` async generator with `createSdkMcpServer()` | `Agent` class with `run()` |
| Model config | Managed by SDK (Claude models) | Set directly on agent (`model: 'gpt-4.1-mini'`) |
| Tool definition | `tool()` from `@anthropic-ai/claude-agent-sdk` with Zod schema | `tool()` from `@openai/agents` with Zod schema |
| Tool context | Closure-based (tools capture `deps`) | `context.deps` parameter |
| Execution | `runAgent(text, sessionId, deps)` | `runAgent(inputItems, deps)` |
| Result output | `{ responseText, sessionId }` | `result.finalOutput` and `result.history` |
| Conversation history | Session-based via `resume` (server-side) — `SessionStore` | Full history stored locally — `ConversationStore` |
| API key env var | `ANTHROPIC_API_KEY` | `OPENAI_API_KEY` |

## Code Style

- ES modules (`"type": "module"` in package.json)
- JSDoc + TypeScript validation (`npm run check` — `tsc --checkJs`)
- Biome for linting and formatting (single quotes, 2-space indent, 120 line width)
- Node.js built-in test runner (`node --test`)
- Kebab-case filenames
