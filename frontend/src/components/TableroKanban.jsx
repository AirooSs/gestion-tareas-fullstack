import { agruparTareas, estadosTarea } from '../estadosTarea';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { destinoArrastre } from '../dragDrop';
import TareaItem from './TareaItem';

function Columna({ estado, etiqueta, tareas, busqueda, onCambiarEstado, onEditar, onEliminar, estadoDeTarea, onRevisarEstado, bloqueado, arrastreDeshabilitado }) {
  const { ref, isDropTarget } = useDroppable({ id: estado });
  return <section ref={ref} className={`kanban-columna ${estado.toLowerCase()}${isDropTarget ? ' destino-activo' : ''}`} aria-labelledby={`columna-${estado}`}>
    <div className="kanban-cabecera">
      <h3 id={`columna-${estado}`}><span className={`estado-punto ${estado.toLowerCase()}`} aria-hidden="true" />{etiqueta}</h3>
      <span className="kanban-contador" aria-label={`${tareas.length} ${tareas.length === 1 ? 'tarea' : 'tareas'}`}>{tareas.length}</span>
    </div>
    <div className="kanban-tareas">
      {tareas.length ? tareas.map((tarea, index) => <TareaItem key={tarea.id} tarea={tarea} index={index} bloqueado={bloqueado} arrastreDeshabilitado={arrastreDeshabilitado} onCambiarEstado={onCambiarEstado} onEditar={onEditar} onEliminar={onEliminar} estadoGuardado={estadoDeTarea(tarea.id)} onRevisarEstado={onRevisarEstado}/>) : <p className="kanban-vacio">{busqueda ? 'Sin resultados' : 'Sin tareas'}</p>}
    </div>
  </section>;
}

export default function TableroKanban({ tareas, busqueda, onCambiarEstado, onMover, onEditar, onEliminar, bloqueado = false, estadoDeTarea = () => undefined, onRevisarEstado = () => {} }) {
  const columnas = agruparTareas(tareas, busqueda);
  return (
    <DragDropProvider onDragEnd={event => { const destino = destinoArrastre(event, tareas); if (destino && !bloqueado && !busqueda) onMover(destino.id, destino.estado, destino.antesDeId); }}>
    <p id="instrucciones-arrastre" className="solo-lectores">Para mover una tarea, pulsa espacio o Intro, utiliza las flechas para desplazarla y pulsa espacio o Intro para soltarla. Pulsa Escape para cancelar. También puedes usar el selector de estado.</p>
    {busqueda && <p className="kanban-aviso">Borra la búsqueda para ordenar las tareas. Puedes seguir cambiando su estado.</p>}
    <div className="kanban-scroll" role="region" aria-label="Tablero de tareas" tabIndex="0">
      <div className="kanban-tablero">
        {estadosTarea.map(([estado, etiqueta]) => (
          <Columna key={estado} estado={estado} etiqueta={etiqueta} tareas={columnas[estado]} busqueda={busqueda} onCambiarEstado={onCambiarEstado} onEditar={onEditar} onEliminar={onEliminar} estadoDeTarea={estadoDeTarea} onRevisarEstado={onRevisarEstado} bloqueado={bloqueado} arrastreDeshabilitado={Boolean(busqueda)}/>
        ))}
      </div>
    </div>
    </DragDropProvider>
  );
}
