import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';

let vite, TableroKanban, dom, root, container, createRoot;
const tasks = [
  { id: '1', titulo: 'Zorro', descripcion: '', status: 'PENDIENTE' },
  { id: '2', titulo: 'Alfa', descripcion: 'Descripción', status: 'PENDIENTE' },
  { id: '3', titulo: 'Beta', descripcion: '', status: 'HECHO' },
];
let actions;

before(async () => {
  dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.sessionStorage = dom.window.sessionStorage;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  ({ createRoot } = await import('react-dom/client'));
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  ({ default: TableroKanban } = await vite.ssrLoadModule('/src/components/TableroKanban.jsx'));
  container = document.getElementById('root');
  root = createRoot(container);
});

after(async () => {
  await act(() => root.unmount());
  await vite.close();
  dom.window.close();
});

async function render(busqueda = '') {
  actions = [];
  await act(() => root.render(React.createElement(TableroKanban, {
    tareas: tasks, busqueda,
    onCambiarEstado: (...args) => actions.push(['estado', ...args]),
    onEditar: (...args) => actions.push(['editar', ...args]),
    onEliminar: (...args) => actions.push(['eliminar', ...args]),
  })));
}

test('renders four columns with sorted tasks, filtered counts and empty columns', async () => {
  await render();
  const columns = [...container.querySelectorAll('.kanban-columna')];
  assert.equal(columns.length, 4);
  assert.deepEqual(columns.map(c => c.querySelector('.kanban-contador').textContent), ['2', '0', '1', '0']);
  assert.deepEqual([...columns[0].querySelectorAll('.tarea-card h3')].map(h => h.textContent), ['Alfa', 'Zorro']);
  assert.match(columns[1].textContent, /Sin tareas/);
  await render('ALF');
  assert.deepEqual([...container.querySelectorAll('.kanban-contador')].map(c => c.textContent), ['1', '0', '0', '0']);
  assert.equal(container.querySelectorAll('.tarea-card').length, 1);
  assert.match(container.textContent, /Sin resultados/);
});

test('preserves status selector, editing and delete confirmation', async () => {
  await render('Alfa');
  const click = async element => act(() => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  await click(container.querySelector('[aria-label="Estado de Alfa: Pendiente"]'));
  await click([...container.querySelectorAll('[role="menuitemradio"]')].find(el => el.textContent.includes('En progreso')));
  assert.deepEqual(actions.pop(), ['estado', '2', 'EN_PROGRESO']);
  await click(container.querySelector('[aria-label="Editar tarea Alfa"]'));
  assert.ok(container.querySelector('input[value="Alfa"]'));
  await act(() => container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
  assert.deepEqual(actions.pop(), ['editar', '2', 'Alfa', 'Descripción']);
  await click(container.querySelector('[aria-label="Eliminar tarea Alfa"]'));
  assert.equal(actions.length, 0);
  assert.match(container.querySelector('dialog').textContent, /¿Quieres eliminar la tarea/);
  await click(container.querySelector('dialog .boton-peligro'));
  assert.deepEqual(actions.pop(), ['eliminar', '2']);
});

test('app keeps the selected project when an old task request finishes and can create a task', async () => {
  const originalFetch = globalThis.fetch;
  let resolveOld, created;
  const oldResponse = new Promise(resolve => { resolveOld = resolve; });
  sessionStorage.setItem('demo-session', JSON.stringify({ token: 'session-one', expiresAt: '2099-01-01T00:00:00Z' }));
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/service-status') return new Response('{}');
    if (path === '/api/proyectos') return new Response(JSON.stringify([{ id: 'a', name: 'Proyecto A' }, { id: 'b', name: 'Proyecto B' }]));
    if (path === '/api/tareas/proyecto/a') return oldResponse;
    if (path === '/api/tareas/proyecto/b') return new Response(JSON.stringify([{ id: 'b1', titulo: 'Tarea B', status: 'HECHO' }]));
    if (path === '/api/tareas' && options.method === 'POST') { created = JSON.parse(options.body); return new Response('{}'); }
    throw new Error(`Unexpected request ${path}`);
  };
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
    await act(async () => { root.render(React.createElement(App)); await new Promise(resolve => setTimeout(resolve, 30)); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    const projectB = [...container.querySelectorAll('.proyecto-nav-item')].find(el => el.textContent.includes('Proyecto B'));
    assert.ok(projectB);
    await act(async () => { projectB.click(); await new Promise(resolve => setTimeout(resolve, 10)); });
    assert.match(container.textContent, /Tarea B/);
    await act(async () => { resolveOld(new Response(JSON.stringify([{ id: 'a1', titulo: 'Tarea antigua', status: 'PENDIENTE' }]))); await new Promise(resolve => setTimeout(resolve, 10)); });
    assert.doesNotMatch(container.textContent, /Tarea antigua/);
    assert.match(container.textContent, /Tarea B/);
    await act(() => [...container.querySelectorAll('button')].find(el => el.textContent.includes('Nueva tarea')).click());
    const input = container.querySelector('dialog input');
    assert.ok(input);
    await act(() => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, 'Tarea nueva');
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await act(async () => { container.querySelector('dialog form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); await new Promise(resolve => setTimeout(resolve, 10)); });
    assert.deepEqual(created, { titulo: 'Tarea nueva', descripcion: '', projectId: 'b' });
    assert.equal(container.querySelector('dialog'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
