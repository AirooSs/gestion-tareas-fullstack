function ProyectoLista({ proyectos, proyectoSeleccionado, onSeleccionar, onEliminar }) {
    if (proyectos.length === 0) {
        return null;
    }

    const confirmarEliminar = (proyecto) => {
        if (window.confirm(`¿Eliminar el proyecto "${proyecto.name}"? Se eliminarán también todas sus tareas.`)) {
            onEliminar(proyecto.id);
        }
    };

    return (
        <div className="proyecto-lista">
            {proyectos.map(proyecto => (
                <div
                    key={proyecto.id}
                    className={`proyecto-chip ${proyecto.id === proyectoSeleccionado ? 'proyecto-chip-activo' : ''}`}
                >
                    <span
                        className="proyecto-chip-nombre"
                        onClick={() => onSeleccionar(proyecto.id)}
                    >
                        {proyecto.name}
                    </span>
                    <button
                        className="proyecto-chip-eliminar"
                        onClick={() => confirmarEliminar(proyecto)}
                        aria-label={`Eliminar ${proyecto.name}`}
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ProyectoLista;