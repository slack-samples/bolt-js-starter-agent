# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What This Is

A **Starter Agent** for Slack built with Bolt for JavaScript and the **Claude Agent SDK**. This is a minimal starter template. It includes one example tool (emoji reactions) and optional Slack MCP Server integration.

## Slack Plugin

To install the Slack plugin for your coding agent, follow [Claude Code, Codex, Cursor, and Other Coding Agents](./README.md#claude-code-codex-cursor-and-other-coding-agents) in the README.

## Commands

```sh
# Run the app (requires .env with ANTHROPIC_API_KEY; Slack tokens optional with CLI)
slack run          # via Slack CLI
node app.js        # directly

# Lint and format (CI runs these on push to main and all PRs)
npm run lint

# Type check (JSDoc + TypeScript validation)
npm run check

# Run tests
npm test
```

## Architecture

Three-layer design: **app.js** -> **listeners/** -> **agent/**

**Entry point (`app.js`)** initializes Bolt with Socket Mode and calls `registerListeners(app)`.

**Listeners** are organized by Slack platform feature:
- `listeners/events/` -- `app-home-opened` (Home tab view + Messages-tab suggested prompts via `event.tab` branch), `app-mentioned`, `message`
- `listeners/actions/` -- `feedback-buttons`

Each sub-module has a `register(app)` function called from `listeners/index.js`.

**AgentDeps** carries `client`, `userId`, `channelId`, `threadTs`, `messageTs`, `userToken`. Constructed in each listener handler and passed to the agent at runtime.

**Handler flow** (DM, mention): get history from store -> run agent -> stream response in thread with feedback blocks -> store updated history.

## Claude Agent SDK Specifics

**Agent (`agent/agent.js`)** uses `query()` async generator from `@anthropic-ai/claude-agent-sdk`. Tools are registered via `createSdkMcpServer()` and passed as `mcpServers` in options. The `runAgent()` function is async and returns `{ responseText, sessionId }`.

**Tools** are defined with `tool()` from `@anthropic-ai/claude-agent-sdk` using Zod schemas. One example tool (emoji reaction) is included. Tools are created as closures inside `runAgent()` to capture `deps`.

**Conversation history** is managed server-side by the Claude Agent SDK via sessions. The local `SessionStore` (`thread-context/store.js`) only maps `channelId:threadTs` to session IDs, with TTL-based cleanup. Sessions are resumed via `{ resume: sessionId }`.

**Feedback blocks** use the `context_actions` block type with `feedback_buttons` elements. A single `feedback` action ID is registered.

## Code Style

- ES modules (`"type": "module"` in package.json)
- JSDoc + TypeScript validation (`npm run check`, which runs `tsc --checkJs`)
- Biome for linting and formatting (single quotes, 2-space indent, 120 line width)
- Node.js built-in test runner (`node --test`)
- Kebab-case filenames
- No comments. Code should explain itself: when a comment feels needed, use a well-named function or variable, a test, or a type instead. A change's "why" goes in the PR description.
