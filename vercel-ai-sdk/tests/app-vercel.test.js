import assert from 'node:assert';
import { createHmac } from 'node:crypto';
import { before, describe, it } from 'node:test';

describe('app-vercel', () => {
  let handler;
  let receiver;

  before(async () => {
    process.env.SLACK_SIGNING_SECRET = 'test-secret';
    process.env.SLACK_CLIENT_ID = '123.456';
    process.env.SLACK_CLIENT_SECRET = 'test-client-secret';
    process.env.SLACK_BOT_TOKEN = 'xoxb-test';
    process.env.SLACK_STATE_SECRET = 'test-state-secret';
    ({ handler, receiver } = await import('../app-vercel.js'));
  });

  it('answers url_verification with the challenge', async () => {
    const body = JSON.stringify({ type: 'url_verification', challenge: 'abc' });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `v0=${createHmac('sha256', 'test-secret').update(`v0:${timestamp}:${body}`).digest('hex')}`;
    const response = await handler(
      new Request('https://x.vercel.app/slack/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-slack-request-timestamp': `${timestamp}`,
          'x-slack-signature': signature,
        },
        body,
      }),
    );
    assert.strictEqual(response.status, 200);
    assert.ok((await response.text()).includes('abc'));
  });

  it('rejects a request with a bad signature', async () => {
    const body = JSON.stringify({ type: 'url_verification', challenge: 'abc' });
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await handler(
      new Request('https://x.vercel.app/slack/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-slack-request-timestamp': `${timestamp}`,
          'x-slack-signature': 'v0=bad',
        },
        body,
      }),
    );
    assert.strictEqual(response.status, 401);
  });

  it('serves the install page', async () => {
    const response = await receiver.handleInstall(new Request('https://x.vercel.app/slack/install'));
    assert.ok([200, 302].includes(response.status));
  });
});
