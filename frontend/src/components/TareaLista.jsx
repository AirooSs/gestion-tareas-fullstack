import TareaItem from './TareaItem';

function TareaLista({ tareas, onCambiarEstado, onEditar, onEliminar }) {
    if (tareas.length === 0) {
        return (
            <div className="estado-vacio">
                <p className="estado-vacio-titulo">No hay tareas todavía</p>
                <p className="estado-vacio-texto">Crea la primera tarea de este proyecto usando el formulario de arriba</p>
            </div>
        );
    }

    return (
        <div className="tarea-lista">
            {tareas.map(tarea => (
                <TareaItem
                    key={tarea.id}
                    tarea={tarea}
                    onCambiarEstado={onCambiarEstado}
                    onEditar={onEditar}
                    onEliminar={onEliminar}
                />
            ))}
        </div>
    );
}

export default TareaLista;