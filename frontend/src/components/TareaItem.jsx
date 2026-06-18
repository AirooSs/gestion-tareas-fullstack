function colorEstado(estado) {
    switch (estado) {
        case 'PENDIENTE': return 'secondary';
        case 'EN_PROGRESO': return 'primary';
        case 'HECHO': return 'success';
        case 'CANCELADO': return 'danger';
        default: return 'secondary';
    }
}

function TareaItem({ tarea, onCambiarEstado }) {
    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{tarea.titulo}</h5>
                        <span className={`badge bg-${colorEstado(tarea.status)}`}>
                            {tarea.status}
                        </span>
                    </div>
                    <p className="card-text text-muted">{tarea.descripcion}</p>
                    <select
                        className="form-select form-select-sm"
                        value={tarea.status}
                        onChange={(e) => onCambiarEstado(tarea.id, e.target.value)}
                    >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROGRESO">En progreso</option>
                        <option value="HECHO">Hecho</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default TareaItem;