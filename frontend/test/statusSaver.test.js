import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStatusSaver } from '../src/statusSaver.js';

const task = { id: '1', status: 'PENDIENTE' };
const context = () => ({ projectId: 'a', session: 'one', taskId: '1', status: 'PENDIENTE' });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

test('saves once and prevents concurrent writes to the same task', async () => {
  const request = deferred(), states = [], confirmations = [];
  let calls = 0;
  const saver = createStatusSaver({ isCurrent: () => true, save: () => { calls++; return request.promise; }, confirm: async (_, value) => confirmations.push(value), reconcile: async () => true, onState: (_, state) => states.push(state) });
  await saver.change(context(), 'PENDIENTE');
  assert.equal(calls, 0);
  const first = saver.change(context(), 'HECHO');
  await saver.change(context(), 'CANCELADO');
  assert.equal(calls, 1);
  assert.equal(states[0].phase, 'saving');
  request.resolve({ ...task, status: 'HECHO' });
  await first;
  assert.equal(confirmations[0].status, 'HECHO');
  assert.equal(states.at(-1), null);
});

test('a network failure reconciles using a read and never repeats the write', async () => {
  let calls = 0, reads = 0;
  const states = [];
  const saver = createStatusSaver({ isCurrent: () => true, save: async () => { calls++; throw new TypeError('network'); }, confirm: assert.fail, reconcile: async () => { reads++; return reads > 1; }, onState: (_, state) => states.push(state) });
  await saver.change(context(), 'HECHO');
  assert.equal(states.at(-1).phase, 'unknown');
  await saver.change(context(), 'CANCELADO');
  assert.equal(calls, 1);
  await saver.recheck(context());
  assert.equal(states.at(-1).phase, 'error');
  assert.equal(reads, 2);
});

test('an old response never confirms a task in another project or session', async () => {
  const request = deferred();
  let current = true, confirmed = 0, reads = 0;
  const saver = createStatusSaver({ isCurrent: () => current, save: () => request.promise, confirm: () => { confirmed++; }, reconcile: () => { reads++; }, onState: () => {} });
  const pending = saver.change(context(), 'HECHO');
  current = false;
  request.resolve({ ...task, status: 'HECHO' });
  await pending;
  assert.equal(confirmed, 0);
  assert.equal(reads, 0);
});
