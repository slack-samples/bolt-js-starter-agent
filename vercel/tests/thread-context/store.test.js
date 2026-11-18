import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';

import { ConversationStore } from '../../thread-context/store.js';

describe('ConversationStore', () => {
  let cache;
  let store;

  beforeEach(() => {
    const entries = new Map();
    cache = {
      get: mock.fn(async (key) => entries.get(key) ?? null),
      set: mock.fn(async (key, value) => {
        entries.set(key, value);
      }),
      delete: mock.fn(async (key) => {
        entries.delete(key);
      }),
      expireTag: mock.fn(async () => {}),
    };
    store = new ConversationStore(cache);
  });

  it('stores and retrieves history', async () => {
    const messages = [{ role: 'user', content: 'hello' }];
    await store.setHistory('C1', 'T1', 'U1', messages);
    assert.deepStrictEqual(await store.getHistory('C1', 'T1', 'U1'), messages);
  });

  it('returns null for missing key', async () => {
    assert.strictEqual(await store.getHistory('C1', 'T99', 'U1'), null);
  });

  it('keeps different threads independent', async () => {
    const m1 = [{ role: 'user', content: 'a' }];
    const m2 = [{ role: 'user', content: 'b' }];
    await store.setHistory('C1', 'T1', 'U1', m1);
    await store.setHistory('C1', 'T2', 'U1', m2);
    assert.deepStrictEqual(await store.getHistory('C1', 'T1', 'U1'), m1);
    assert.deepStrictEqual(await store.getHistory('C1', 'T2', 'U1'), m2);
  });

  it('keeps different users in the same thread independent', async () => {
    await store.setHistory('C1', 'T1', 'U1', [{ role: 'user', content: 'a' }]);
    assert.strictEqual(await store.getHistory('C1', 'T1', 'U2'), null);
    await store.setHistory('C1', 'T1', 'U2', [{ role: 'user', content: 'b' }]);
    assert.deepStrictEqual(await store.getHistory('C1', 'T1', 'U1'), [{ role: 'user', content: 'a' }]);
    assert.deepStrictEqual(await store.getHistory('C1', 'T1', 'U2'), [{ role: 'user', content: 'b' }]);
  });

  it('passes the ttl to the cache', async () => {
    const messages = [{ role: 'user', content: 'hi' }];
    await store.setHistory('C1', 'T1', 'U1', messages);
    assert.deepStrictEqual(cache.set.mock.calls[0].arguments, ['C1:T1:U1', messages, { ttl: 86400 }]);
  });

  it('overwrites existing key', async () => {
    await store.setHistory('C1', 'T1', 'U1', [{ role: 'user', content: 'old' }]);
    await store.setHistory('C1', 'T1', 'U1', [{ role: 'user', content: 'new' }]);
    assert.deepStrictEqual(await store.getHistory('C1', 'T1', 'U1'), [{ role: 'user', content: 'new' }]);
  });
});
