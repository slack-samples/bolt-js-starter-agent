# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What This Is

A **Starter Agent** for Slack built with Bolt for JavaScript and the **OpenAI Agents SDK**. This is a minimal starter template. It includes one example tool (emoji reactions) and optional Slack MCP Server integration.

## Slack Plugin

To install the Slack plugin for your coding agent, follow [Claude Code, Codex, Cursor, and Other Coding Agents](./README.md#claude-code-codex-cursor-and-other-coding-agents) in the README.

## Before you finish

Run `npm run lint`, `npm run check`, and `npm test`. CI runs the same on every PR.

## Code Style

- ES modules (`"type": "module"` in package.json)
- JSDoc + TypeScript validation (`npm run check`, which runs `tsc --checkJs`)
- Biome for linting and formatting (single quotes, 2-space indent, 120 line width)
- Node.js built-in test runner (`node --test`)
- Kebab-case filenames
