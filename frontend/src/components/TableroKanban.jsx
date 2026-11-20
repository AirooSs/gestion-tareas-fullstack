import { agruparTareas, estadosTarea } from '../estadosTarea';
import TareaItem from './TareaItem';

export default function TableroKanban({ tareas, busqueda, onCambiarEstado, onEditar, onEliminar }) {
  const columnas = agruparTareas(tareas, busqueda);
  return (
    <div className="kanban-scroll" role="region" aria-label="Tablero de tareas" tabIndex="0">
      <div className="kanban-tablero">
        {estadosTarea.map(([estado, etiqueta]) => (
          <section key={estado} className={`kanban-columna ${estado.toLowerCase()}`} aria-labelledby={`columna-${estado}`}>
            <div className="kanban-cabecera">
              <h3 id={`columna-${estado}`}><span className={`estado-punto ${estado.toLowerCase()}`} aria-hidden="true" />{etiqueta}</h3>
              <span className="kanban-contador" aria-label={`${columnas[estado].length} ${columnas[estado].length === 1 ? 'tarea' : 'tareas'}`}>{columnas[estado].length}</span>
            </div>
            <div className="kanban-tareas">
              {columnas[estado].length ? columnas[estado].map(tarea => <TareaItem key={tarea.id} tarea={tarea} onCambiarEstado={onCambiarEstado} onEditar={onEditar} onEliminar={onEliminar}/>) : <p className="kanban-vacio">{busqueda ? 'Sin resultados' : 'Sin tareas'}</p>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
