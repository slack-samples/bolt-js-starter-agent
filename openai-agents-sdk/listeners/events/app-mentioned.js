import { AgentDeps, runAgent } from '../../agent/index.js';
import { conversationStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

/**
 * Handle app_mention events and run the agent.
 * @param {import('@slack/bolt').AllMiddlewareArgs & import('@slack/bolt').SlackEventMiddlewareArgs<'app_mention'>} args
 * @returns {Promise<void>}
 */
export async function handleAppMentioned({ client, context, event, logger, say, sayStream, setStatus }) {
  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;
    const userId = /** @type {string} */ (context.userId);

    // Strip the bot mention from the text
    const cleanedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!cleanedText) {
      await say({
        text: "Hey there! How can I help you? Ask me anything and I'll do my best.",
        thread_ts: threadTs,
      });
      return;
    }

    // Set assistant thread status with loading messages
    await setStatus({
      status: 'Thinking\u2026',
      loading_messages: [
        'Teaching the hamsters to type faster\u2026',
        'Untangling the internet cables\u2026',
        'Consulting the office goldfish\u2026',
        'Polishing up the response just for you\u2026',
        'Convincing the AI to stop overthinking\u2026',
      ],
    });

    // Get conversation history
    const history = conversationStore.getHistory(channelId, threadTs);
    /** @type {string | import('@openai/agents').AgentInputItem[]} */
    const inputItems = history ? [...history, { role: 'user', content: cleanedText }] : cleanedText;

    // Run the agent
    const deps = new AgentDeps(client, userId, channelId, threadTs, event.ts, context.userToken);
    const result = await runAgent(inputItems, deps);

    // Stream response in thread with feedback buttons
    const streamer = sayStream();
    await streamer.append({ markdown_text: result.finalOutput });
    const feedbackBlocks = buildFeedbackBlocks();
    await streamer.stop({ blocks: feedbackBlocks });

    // Store conversation history
    conversationStore.setHistory(channelId, threadTs, result.history);
  } catch (e) {
    logger.error(`Failed to handle app mention: ${e}`);
    await say({
      text: `:warning: Something went wrong! (${e})`,
      thread_ts: event.thread_ts || event.ts,
    });
  }
}
