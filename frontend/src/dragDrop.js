import { estadosTarea } from './estadosTarea.js';

export function destinoArrastre(event, tareas) {
  if (event.canceled) return null;
  const { source, target } = event.operation;
  const tarea = tareas.find(item => item.id === source?.id);
  if (!tarea || !target) return null;
  const estados = estadosTarea.map(([estado]) => estado);
  const estado = estados.includes(target.id) ? target.id : (estados.includes(source.group) ? source.group : tareas.find(item => item.id === target.id)?.status);
  if (!estado) return null;
  const destino = tareas.filter(item => item.status === estado && item.id !== tarea.id).sort((a, b) => a.position - b.position);
  const indice = estados.includes(target.id) ? destino.length : source.index;
  if (!Number.isInteger(indice) || indice < 0 || indice > destino.length) return null;
  const antesDeId = destino[indice]?.id ?? null;
  const actual = tareas.filter(item => item.status === tarea.status).sort((a, b) => a.position - b.position);
  const siguiente = actual[actual.findIndex(item => item.id === tarea.id) + 1]?.id ?? null;
  if (estado === tarea.status && antesDeId === siguiente) return null;
  return { id: tarea.id, estado, antesDeId };
}
