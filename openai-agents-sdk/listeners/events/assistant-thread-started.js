const SUGGESTED_PROMPTS = [
  { title: 'Write a Message', message: 'Help me draft a message to my team' },
  { title: 'Summarize', message: 'Can you help me summarize something?' },
  { title: 'Brainstorm', message: 'I need help brainstorming ideas' },
];

/**
 * Handle assistant_thread_started events by setting suggested prompts.
 * @param {import('@slack/bolt').AllMiddlewareArgs & import('@slack/bolt').SlackEventMiddlewareArgs<'assistant_thread_started'>} args
 * @returns {Promise<void>}
 */
export async function handleAssistantThreadStarted({ client, event, logger }) {
  const { channel_id: channelId, thread_ts: threadTs } = event.assistant_thread;

  try {
    await client.assistant.threads.setSuggestedPrompts({
      channel_id: channelId,
      thread_ts: threadTs,
      title: 'How can I help you today?',
      prompts: SUGGESTED_PROMPTS,
    });
  } catch (e) {
    logger.error(`Failed to handle assistant thread started: ${e}`);
  }
}
