import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoardSaver } from '../src/boardSaver.js';
import { destinoArrastre } from '../src/dragDrop.js';

const tasks = [
  { id: 'a', status: 'PENDIENTE', position: 0 },
  { id: 'b', status: 'PENDIENTE', position: 1 },
  { id: 'c', status: 'PENDIENTE', position: 2 },
  { id: 'd', status: 'HECHO', position: 0 },
];
const drag = (id, group, index, target) => ({ operation: { source: { id, group, index }, target: { id: target } } });
test('calculates before IDs for reordering and cross-column moves', () => {
  assert.deepEqual(destinoArrastre(drag('c', 'PENDIENTE', 0, 'a'), tasks), { id: 'c', estado: 'PENDIENTE', antesDeId: 'a' });
  assert.deepEqual(destinoArrastre(drag('a', 'PENDIENTE', 2, 'c'), tasks), { id: 'a', estado: 'PENDIENTE', antesDeId: null });
  assert.deepEqual(destinoArrastre(drag('a', 'HECHO', 0, 'd'), tasks), { id: 'a', estado: 'HECHO', antesDeId: 'd' });
  assert.deepEqual(destinoArrastre(drag('a', 'PENDIENTE', 0, 'EN_PROGRESO'), tasks), { id: 'a', estado: 'EN_PROGRESO', antesDeId: null });
  assert.equal(destinoArrastre(drag('a', 'PENDIENTE', 0, 'a'), tasks), null);
  assert.equal(destinoArrastre({ ...drag('a', 'HECHO', 0, 'd'), canceled: true }, tasks), null);
});
const context = { projectId: 'p', session: 's', taskId: 'a', version: 4 };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
test('serializes all moves on a board and confirms the server board', async () => {
  const request = deferred(), confirmed = [], states = [];
  let calls = 0;
  const saver = createBoardSaver({ isCurrent: () => true, save: () => { calls++; return request.promise; }, confirm: (_, b) => confirmed.push(b), reconcile: assert.fail, onState: (_, s) => states.push(s) });
  const first = saver.move(context, { estado: 'HECHO', antesDeId: null });
  await saver.move({ ...context, taskId: 'b' }, { estado: 'HECHO', antesDeId: null });
  assert.equal(calls, 1);
  request.resolve({ version: 5, tareas: tasks });
  await first;
  assert.equal(confirmed[0].version, 5);
  assert.equal(states.at(-1), null);
});
test('conflicts reload without retry and network failures remain locked until rechecked', async () => {
  let calls = 0, reads = 0, status = 409;
  const states = [];
  const saver = createBoardSaver({ isCurrent: () => true, save: async () => { calls++; throw Object.assign(new Error(), { status }); }, confirm: assert.fail, reconcile: async () => { reads++; return reads !== 2; }, onState: (_, s) => states.push(s) });
  await saver.move(context, {});
  assert.match(states.at(-1).message, /tablero ha cambiado/);
  status = 0;
  await saver.move(context, {});
  assert.equal(states.at(-1).phase, 'unknown');
  await saver.move(context, {});
  assert.equal(calls, 2);
  await saver.recheck(context);
  assert.equal(reads, 3);
  assert.equal(states.at(-1).phase, 'error');
});
test('old project response is never confirmed', async () => {
  const request = deferred(); let current = true, confirmed = false;
  const saver = createBoardSaver({ isCurrent: () => current, save: () => request.promise, confirm: () => { confirmed = true; }, reconcile: assert.fail, onState: () => {} });
  const pending = saver.move(context, {}); current = false; request.resolve({ version: 5 }); await pending;
  assert.equal(confirmed, false);
});
