function SelectorProyecto({ proyectos, proyectoSeleccionado, onCambiar }) {
    return (
        <div className="mb-4">
            <label className="form-label">Proyecto</label>
            <select
                className="form-select"
                value={proyectoSeleccionado}
                onChange={(e) => onCambiar(e.target.value)}
            >
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