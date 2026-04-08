import assert from 'node:assert';
import { describe, it } from 'node:test';

import { buildAppHomeView } from '../../../listeners/views/app-home-builder.js';

describe('buildAppHomeView', () => {
  it('returns a home view', () => {
    const view = buildAppHomeView();
    assert.strictEqual(view.type, 'home');
  });

  it('has a blocks array with header and section', () => {
    const view = buildAppHomeView();
    assert.ok(Array.isArray(view.blocks));
    assert.ok(view.blocks.length >= 3);
    assert.strictEqual(view.blocks[0].type, 'header');
    assert.strictEqual(view.blocks[1].type, 'section');
  });

  it('does not show MCP status by default', () => {
    const view = buildAppHomeView();
    const mrkdwnTexts = view.blocks.filter((b) => b.type === 'section').map((b) => b.text.text);
    const hasMcp = mrkdwnTexts.some((t) => t.includes('MCP Server'));
    assert.strictEqual(hasMcp, false);
  });

  it('shows disconnected status when installUrl is provided', () => {
    const view = buildAppHomeView('https://example.com/slack/install');
    const mrkdwnTexts = view.blocks.filter((b) => b.type === 'section').map((b) => b.text.text);
    const hasDisconnected = mrkdwnTexts.some((t) => t.includes('disconnected'));
    assert.strictEqual(hasDisconnected, true);
  });

  it('shows connected status when isConnected is true', () => {
    const view = buildAppHomeView(null, true);
    const mrkdwnTexts = view.blocks.filter((b) => b.type === 'section').map((b) => b.text.text);
    const hasConnected = mrkdwnTexts.some((t) => t.includes('connected'));
    assert.strictEqual(hasConnected, true);
  });
});
