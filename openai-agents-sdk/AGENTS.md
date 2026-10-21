# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What This Is

A **Starter Agent** for Slack built with Bolt for JavaScript and the **OpenAI Agents SDK**. This is a minimal starter template. It includes one example tool (emoji reactions) and optional Slack MCP Server integration.

## Slack Plugin

To install the Slack plugin for your coding agent, follow [Claude Code, Codex, Cursor, and Other Coding Agents](./README.md#claude-code-codex-cursor-and-other-coding-agents) in the README.

## Before you finish

Run `npm run lint`, `npm run check`, and `npm test`. CI runs the same on every PR.

## Architecture

Three-layer design: **app.js** -> **listeners/** -> **agent/**

**Entry point (`app.js`)** initializes Bolt with Socket Mode and calls `registerListeners(app)`.

**Listeners** are organized by Slack platform feature:
- `listeners/events/` -- `app-home-opened` (Home tab view + Messages-tab suggested prompts via `event.tab` branch), `app-mentioned`, `message`
- `listeners/actions/` -- `feedback-buttons`

Each sub-module has a `register(app)` function called from `listeners/index.js`.

**AgentDeps** carries `client`, `userId`, `channelId`, `threadTs`, `messageTs`, `userToken`. Constructed in each listener handler and passed to the agent at runtime.

**Handler flow** (DM, mention): get history from store -> run agent -> stream response in thread with feedback blocks -> store updated history.

## OpenAI Agents SDK Specifics

**Agent (`agent/agent.js`)** is an `Agent` with the model set directly (`model: 'gpt-4.1-mini'`). Tools use `tool()` from `@openai/agents` with Zod schemas and receive context via `context.deps`. Execution uses `run(agent, inputItems, { context: deps })`.

**Conversation history** is stored locally in `ConversationStore` (`thread-context/store.js`), an in-memory Map keyed by `channelId:threadTs` with TTL-based cleanup. The full array must be manually combined with new user input before passing to `run()`: `inputItems = [...history, { role: 'user', content: text }]`. After execution, `result.history` is stored back.

**Feedback blocks** use the `context_actions` block type with `feedback_buttons` elements. A single `feedback` action ID is registered.

## Code Style

- ES modules (`"type": "module"` in package.json)
- JSDoc + TypeScript validation (`npm run check`, which runs `tsc --checkJs`)
- Biome for linting and formatting (single quotes, 2-space indent, 120 line width)
- Node.js built-in test runner (`node --test`)
- Kebab-case filenames
