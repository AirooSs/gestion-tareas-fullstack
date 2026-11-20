import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waitForBackend } from '../src/backendHealth.js';

const fast = { initialDelayMs: 1, maxDelayMs: 4, timeoutMs: 500 };

test('available backend returns immediately', async () => {
  let calls = 0;
  await waitForBackend('/service-status', { ...fast, fetchImpl: async () => { calls++; return { ok: true }; } });
  assert.equal(calls, 1);
});

test('a cold backend can recover after timeouts without overlapping requests', async () => {
  let calls = 0;
  let active = 0;
  await waitForBackend('/service-status', { ...fast, requestTimeoutMs: 5, fetchImpl: (_, { signal }) => {
    calls++;
    assert.equal(++active, 1);
    if (calls === 3) { active--; return Promise.resolve({ ok: true }); }
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => { active--; reject(new DOMException('Aborted', 'AbortError')); }));
  } });
  assert.equal(calls, 3);
});

test('quick network failures stop after three attempts', async () => {
  let calls = 0;
  await assert.rejects(waitForBackend('/service-status', { ...fast, fetchImpl: async () => { calls++; throw new TypeError('Failed to fetch'); } }), /connection/);
  assert.equal(calls, 3);
});

test('HTTP failures exhaust the attempt limit and remain distinguishable', async () => {
  let calls = 0;
  await assert.rejects(waitForBackend('/service-status', { ...fast, maxAttempts: 4, fetchImpl: async () => { calls++; return { ok: false, status: 503 }; } }), /server/);
  assert.equal(calls, 4);
});

test('retries wait progressively longer', async () => {
  const times = [];
  await waitForBackend('/service-status', { ...fast, initialDelayMs: 15, maxDelayMs: 30, fetchImpl: async () => {
    times.push(Date.now());
    return { ok: times.length === 3 };
  } });
  assert.ok(times[1] - times[0] >= 10);
  assert.ok(times[2] - times[1] >= 25);
});

test('deadline aborts a pending request', async () => {
  await assert.rejects(waitForBackend('/service-status', { ...fast, timeoutMs: 15, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) }), /timeout/);
});

test('unmount cancellation aborts an in-flight check', async () => {
  const controller = new AbortController();
  let requestAborted = false;
  const pending = waitForBackend('/service-status', { ...fast, signal: controller.signal, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => { requestAborted = true; reject(new DOMException('Aborted', 'AbortError')); })) });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(requestAborted, true);
});

test('unmount cancellation stops a scheduled retry', async () => {
  const controller = new AbortController();
  let calls = 0;
  const pending = waitForBackend('/service-status', { ...fast, initialDelayMs: 100, signal: controller.signal, fetchImpl: async () => { calls++; return { ok: false }; } });
  await new Promise(resolve => setTimeout(resolve, 10));
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  await new Promise(resolve => setTimeout(resolve, 110));
  assert.equal(calls, 1);
});
