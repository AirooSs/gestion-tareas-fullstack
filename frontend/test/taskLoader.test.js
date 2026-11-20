import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskLoader } from '../src/taskLoader.js';

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

test('ignores a late project response even if the request does not honor abort', async () => {
  const a = deferred(), b = deferred();
  const applied = [];
  let session = 'one';
  const loader = createTaskLoader({ getSession: () => session, fetchTasks: id => id === 'a' ? a.promise : b.promise, onTasks: (tasks, id) => applied.push([id, tasks]), onError: assert.fail });
  loader.select('a', session);
  const first = loader.load('a', session);
  loader.select('b', session);
  const second = loader.load('b', session);
  b.resolve({ json: async () => ['B'] });
  await second;
  a.resolve({ json: async () => ['A'] });
  await first;
  assert.deepEqual(applied, [['b', ['B']]]);
});

test('ignores an old session and an old refresh after selecting a new project', async () => {
  const body = deferred();
  let session = 'one', calls = 0;
  const applied = [];
  const loader = createTaskLoader({ getSession: () => session, fetchTasks: async () => { calls++; return { json: () => body.promise }; }, onTasks: tasks => applied.push(tasks), onError: assert.fail });
  loader.select('a', session);
  const pending = loader.load('a', session);
  await Promise.resolve();
  session = 'two';
  loader.select('b', session);
  await loader.load('a', 'one');
  body.resolve(['old']);
  await pending;
  assert.equal(calls, 1);
  assert.deepEqual(applied, []);
});

test('newer reload wins and cancellation aborts the pending request', async () => {
  const first = deferred(), second = deferred();
  const signals = [], applied = [];
  const loader = createTaskLoader({ getSession: () => 'one', fetchTasks: (_, signal) => { signals.push(signal); return signals.length === 1 ? first.promise : second.promise; }, onTasks: tasks => applied.push(tasks), onError: assert.fail });
  loader.select('a', 'one');
  const p1 = loader.load('a', 'one');
  const p2 = loader.load('a', 'one');
  assert.equal(signals[0].aborted, true);
  second.resolve({ json: async () => ['new'] });
  await p2;
  first.resolve({ json: async () => ['old'] });
  await p1;
  assert.deepEqual(applied, [['new']]);
  loader.cancel();
  assert.equal(signals[1].aborted, true);
});
