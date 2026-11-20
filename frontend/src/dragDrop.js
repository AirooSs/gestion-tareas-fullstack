import { estadosTarea } from './estadosTarea.js';

export function destinoArrastre(event, tareas) {
  if (event.canceled) return null;
  const { source, target } = event.operation;
  const tarea = tareas.find(item => item.id === source?.id);
  if (!tarea || !estadosTarea.some(([estado]) => estado === target?.id) || tarea.status === target.id) return null;
  return { id: tarea.id, estado: target.id };
}
