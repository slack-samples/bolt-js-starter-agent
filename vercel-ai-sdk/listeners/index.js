import * as actions from './actions/index.js';
import * as events from './events/index.js';

/**
 * Register all Slack event and action listeners.
 * @param {import('@slack/bolt').App} app
 * @returns {void}
 */
export function registerListeners(app) {
  actions.register(app);
  events.register(app);
}
