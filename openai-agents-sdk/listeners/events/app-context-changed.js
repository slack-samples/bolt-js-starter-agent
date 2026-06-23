/**
 * Handle app_context_changed events by setting suggested prompts based on what the user is viewing.
 * @param {import('@slack/bolt').AllMiddlewareArgs & import('@slack/bolt').SlackEventMiddlewareArgs<'app_context_changed'>} args
 * @returns {Promise<void>}
 */
export async function handleAppContextChanged({ client, event, logger }) {
  /** @type {{ title: string; message: string }[]} */
  const prompts = [];

  for (const entity of event.context.entities) {
    if (entity.type === 'slack#/types/channel_id' && !/** @type {string} */ (entity.value).startsWith('D')) {
      prompts.push({ title: 'Summarize channel', message: `Summarize the recent activity in <#${entity.value}>` });
    } else if (entity.type === 'slack#/types/canvas_id') {
      prompts.push({ title: 'Summarize canvas', message: `Summarize the canvas ${entity.value}` });
    } else if (entity.type === 'slack#/types/list_id') {
      prompts.push({ title: 'Summarize list', message: `Summarize the list ${entity.value}` });
    } else if (entity.type === 'slack#/types/message_context') {
      const { channel_id } = /** @type {{ message_ts: string; channel_id?: string }} */ (entity.value);
      if (channel_id) {
        prompts.push({ title: 'Summarize thread', message: `Summarize the conversation in <#${channel_id}>` });
      }
    }
    if (prompts.length >= 3) break;
  }

  if (prompts.length === 0) return;

  try {
    // @ts-ignore — thread_ts not required for agent_view DMs
    await client.assistant.threads.setSuggestedPrompts({
      channel_id: event.channel,
      title: 'Based on what you\'re viewing:',
      prompts,
    });
  } catch (e) {
    logger.error(`Failed to set suggested prompts on app_context_changed: ${e}`);
  }
}
