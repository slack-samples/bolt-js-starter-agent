# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../.claude/CLAUDE.md` for monorepo-wide architecture, commands, and a comparison of all implementations.

## Claude Agent SDK Specifics

**Agent (`agent/agent.js`)** uses `query()` async generator from `@anthropic-ai/claude-agent-sdk`. Tools are registered via `createSdkMcpServer()` and passed as `mcpServers` in options. The `runAgent()` function is async and returns `{ responseText, sessionId }`.

**Tools** are defined with `tool()` from `@anthropic-ai/claude-agent-sdk` using Zod schemas. One example tool (emoji reaction) is included. Tools are created as closures inside `runAgent()` to capture `deps`.

**Conversation history** is managed server-side by the Claude Agent SDK via sessions. The local `SessionStore` (`thread-context/store.js`) only maps `channelId:threadTs` to session IDs. Sessions are resumed via `{ resume: sessionId }`.

**Feedback blocks** use the `context_actions` block type with `feedback_buttons` elements. A single `feedback` action ID is registered.
