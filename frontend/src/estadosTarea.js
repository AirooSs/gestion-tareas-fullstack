export const estadosTarea = [
  ['PENDIENTE', 'Pendiente'],
  ['EN_PROGRESO', 'En progreso'],
  ['HECHO', 'Hecho'],
  ['CANCELADO', 'Cancelado'],
];

export function agruparTareas(tareas, busqueda = '') {
  const columnas = Object.fromEntries(estadosTarea.map(([estado]) => [estado, []]));
  const filtro = busqueda.toLowerCase();
  for (const tarea of tareas) {
    if (columnas[tarea.status] && tarea.titulo.toLowerCase().includes(filtro)) columnas[tarea.status].push(tarea);
  }
  for (const lista of Object.values(columnas)) lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
  return columnas;
}
