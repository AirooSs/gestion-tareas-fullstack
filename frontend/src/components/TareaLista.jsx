import TareaItem from './TareaItem';

function TareaLista({ tareas, onCambiarEstado }) {
    if (tareas.length === 0) {
        return <p className="text-muted text-center mt-4">No hay tareas en este proyecto todavía.</p>;
    }

    return (
        <div className="row g-3">
            {tareas.map(tarea => (
                <TareaItem key={tarea.id} tarea={tarea} onCambiarEstado={onCambiarEstado} />
            ))}
        </div>
    );
}

export default TareaLista;