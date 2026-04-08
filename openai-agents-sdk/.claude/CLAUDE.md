# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../.claude/CLAUDE.md` for monorepo-wide architecture, commands, and a comparison of all implementations.

## OpenAI Agents SDK Specifics

**Agent (`agent/agent.js`)** is an `Agent` with the model set directly (`model: 'gpt-4.1-mini'`). Tools use `tool()` from `@openai/agents` with Zod schemas and receive context via `context.deps`. Execution uses `run(agent, inputItems, { context: deps })`.

**Conversation history** is stored as a full array and must be manually combined with new user input before passing to `run()`: `inputItems = [...history, { role: 'user', content: text }]`. After execution, `result.history` is stored back.

**Feedback blocks** use the `context_actions` block type with `feedback_buttons` elements. A single `feedback` action ID is registered.
