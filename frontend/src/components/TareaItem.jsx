import { useState } from 'react';

function claseEstado(estado) {
    return `badge-estado badge-${estado.toLowerCase()}`;
}

function formatearEstado(estado) {
    return estado.replace('_', ' ');
}

function TareaItem({ tarea, onCambiarEstado, onEditar, onEliminar }) {
    const [editando, setEditando] = useState(false);
    const [titulo, setTitulo] = useState(tarea.titulo);
    const [descripcion, setDescripcion] = useState(tarea.descripcion || '');

    const guardarEdicion = () => {
        onEditar(tarea.id, titulo, descripcion);
        setEditando(false);
    };

    const cancelarEdicion = () => {
        setTitulo(tarea.titulo);
        setDescripcion(tarea.descripcion || '');
        setEditando(false);
    };

    const confirmarEliminar = () => {
        if (window.confirm(`¿Eliminar la tarea "${tarea.titulo}"?`)) {
            onEliminar(tarea.id);
        }
    };

    if (editando) {
        return (
            <div className="tarea-card tarea-card-editando">
                <input
                    type="text"
                    className="form-control mb-2"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
                <input
                    type="text"
                    className="form-control mb-2"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
                <div className="tarea-card-acciones">
                    <button className="btn btn-primary btn-sm" onClick={guardarEdicion}>
                        Guardar
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={cancelarEdicion}>
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tarea-card">
            <div className="tarea-card-cabecera">
                <h3>{tarea.titulo}</h3>
                <span className={claseEstado(tarea.status)}>
                    {formatearEstado(tarea.status)}
                </span>
            </div>
            <p>{tarea.descripcion}</p>
            <select
                value={tarea.status}
                onChange={(e) => onCambiarEstado(tarea.id, e.target.value)}
            >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En progreso</option>
                <option value="HECHO">Hecho</option>
                <option value="CANCELADO">Cancelado</option>
            </select>
            <div className="tarea-card-acciones">
                <button className="btn btn-link btn-sm" onClick={() => setEditando(true)}>
                    Editar
                </button>
                <button className="btn btn-link btn-sm text-danger" onClick={confirmarEliminar}>
                    Eliminar
                </button>
            </div>
        </div>
    );
}

export default TareaItem;