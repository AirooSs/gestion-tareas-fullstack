import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waitForBackend } from '../src/backendHealth.js';

test('available backend returns immediately', async () => {
  let calls = 0;
  await waitForBackend('/health', { fetchImpl: async () => { calls++; return { ok: true }; } });
  assert.equal(calls, 1);
});

test('retries a slow backend without overlapping requests', async () => {
  let calls = 0;
  await waitForBackend('/health', { timeoutMs: 3000, fetchImpl: async () => ({ ok: ++calls === 2 }) });
  assert.equal(calls, 2);
});

test('reports an unavailable backend after the deadline', async () => {
  await assert.rejects(waitForBackend('/health', { timeoutMs: 20, fetchImpl: async () => { throw new TypeError('network'); } }), /connection/);
});

test('cancels an in-flight check', async () => {
  const controller = new AbortController();
  const pending = waitForBackend('/health', { signal: controller.signal, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
