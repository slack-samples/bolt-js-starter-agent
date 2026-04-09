import 'dotenv/config';

import { readFileSync } from 'node:fs';

import { App, LogLevel } from '@slack/bolt';
import pkg from '@slack/oauth';
const { FileInstallationStore } = pkg;

import { registerListeners } from './listeners/index.js';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
const botScopes = manifest.oauth_config.scopes.bot;
const userScopes = manifest.oauth_config.scopes.user;

const fallbackBotToken = process.env.SLACK_BOT_TOKEN;

const app = new App({
  logLevel: LogLevel.DEBUG,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  ignoreSelf: false,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'bolt-js-starter-agent',
  scopes: botScopes,
  userScopes,
  installationStore: new FileInstallationStore(),
  installerOptions: {
    stateVerification: true,
  },
  authorize: fallbackBotToken
    ? async ({ teamId, enterpriseId }) => {
        // Try the installation store first
        const installationStore = new FileInstallationStore();
        try {
          const installation = await installationStore.fetchInstallation({
            teamId,
            enterpriseId,
            isEnterpriseInstall: !!enterpriseId,
          });
          if (installation) {
            return {
              botToken: installation.bot?.token,
              botId: installation.bot?.id,
              botUserId: installation.bot?.userId,
              userToken: installation.user?.token,
            };
          }
        } catch {
          // Fall through to fallback
        }

        // Fall back to SLACK_BOT_TOKEN for pre-OAuth bootstrap
        return { botToken: fallbackBotToken };
      }
    : undefined,
});

registerListeners(app);

(async () => {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  await app.start(port);
  app.logger.info(`Starter Agent is running on port ${port}!`);
})();
