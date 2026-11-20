import { createMCPClient } from '@ai-sdk/mcp';
import { ToolLoopAgent } from 'ai';

import { addEmojiReaction } from './tools/index.js';

const SYSTEM_PROMPT = `\
You are a friendly Slack assistant. You help people by answering questions, \
having conversations, and being generally useful in Slack.

## PERSONALITY
- Friendly, helpful, and approachable
- Lightly witty — a touch of humor when appropriate, but never forced
- Concise and clear — respect people's time
- Confident but honest when you don't know something

## RESPONSE GUIDELINES
- Keep responses to 3 sentences max — be punchy, scannable, and actionable
- End with a clear next step on its own line so it's easy to spot
- Use a bullet list only for multi-step instructions
- Use casual, conversational language
- Use emoji sparingly — at most one per message, and only to set tone

## FORMATTING RULES
- Use standard Markdown syntax: **bold**, _italic_, \`code\`, \`\`\`code blocks\`\`\`, > blockquotes
- Use bullet points for multi-step instructions

## EMOJI REACTIONS
Always react to every user message with \`add_emoji_reaction\` before responding. \
Pick any Slack emoji that reflects the *topic* or *tone* of the message — be creative and specific \
(e.g. \`dog\` for dog topics, \`books\` for learning, \`wave\` for greetings). \
Vary your picks across a thread; don't repeat the same emoji.

## SLACK MCP SERVER
You may have access to the Slack MCP Server, which gives you powerful Slack tools \
beyond your built-in tools. Use them whenever they would help the user.

Available capabilities:
- **Search**: Search messages and files across public channels, search for channels by name
- **Read**: Read channel message history, read thread replies, read canvas documents
- **Write**: Send messages, create draft messages, schedule messages for later
- **Canvases**: Create, read, and update Slack canvas documents

Use these tools when they can help answer a question or complete a task — for example, \
searching for relevant messages, checking a channel for context, or creating a canvas. \
Also use them when the user explicitly asks you to perform a Slack action.`;

const SLACK_MCP_URL = 'https://mcp.slack.com/mcp';

export const MODEL = 'anthropic/claude-sonnet-5.5';

/**
 * Create the starter agent for one run, with the Slack MCP Server tools when connected.
 * @param {import('./deps.js').AgentDeps} deps
 * @param {import('ai').ToolSet} [mcpTools]
 */
export function createStarterAgent(deps, mcpTools = {}) {
  return new ToolLoopAgent({
    model: MODEL,
    instructions: SYSTEM_PROMPT,
    tools: { ...mcpTools, add_emoji_reaction: addEmojiReaction },
    toolsContext: { add_emoji_reaction: { deps } },
  });
}

/**
 * Run the agent, optionally connecting to the Slack MCP server.
 * @param {import('ai').ModelMessage[]} messages
 * @param {import('./deps.js').AgentDeps} deps
 * @returns {Promise<{ text: string, messages: import('ai').ModelMessage[] }>}
 */
export async function runAgent(messages, deps) {
  if (deps.userToken) {
    const mcp = await createMCPClient({
      transport: {
        type: 'http',
        url: SLACK_MCP_URL,
        headers: { Authorization: `Bearer ${deps.userToken}` },
      },
    });

    try {
      const agent = createStarterAgent(deps, await mcp.tools());
      const result = await agent.generate({ messages });
      return { text: result.text, messages: [...messages, ...result.responseMessages] };
    } finally {
      await mcp.close();
    }
  }

  const result = await createStarterAgent(deps).generate({ messages });
  return { text: result.text, messages: [...messages, ...result.responseMessages] };
}
