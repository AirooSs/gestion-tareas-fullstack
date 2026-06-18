function SelectorProyecto({ proyectos, proyectoSeleccionado, onCambiar }) {
    return (
        <div className="card card-proyecto mb-4">
            <label className="form-label">Proyecto</label>
            <select
                className="form-select"
                value={proyectoSeleccionado}
                onChange={(e) => onCambiar(e.target.value)}
            >
                {!proyectoSeleccionado && (
                    <option value="" disabled>
                        Seleccione un proyecto
                    </option>
                )}
                {proyectos.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectorProyecto;