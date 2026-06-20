import { useState } from 'react';

function SelectorProyecto({ proyectos, proyectoSeleccionado, onCambiar, onEliminar }) {
    const [abierto, setAbierto] = useState(false);
    const [confirmandoId, setConfirmandoId] = useState(null);

    const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

    const seleccionar = (id) => {
        onCambiar(id);
        setAbierto(false);
    };

    const pedirConfirmacion = (evento, id) => {
        evento.stopPropagation();
        setConfirmandoId(id);
    };

    const confirmarEliminar = (evento, id) => {
        evento.stopPropagation();
        onEliminar(id);
        setConfirmandoId(null);
    };

    const cancelarEliminar = (evento) => {
        evento.stopPropagation();
        setConfirmandoId(null);
    };

    return (
        <div className="selector-dropdown">
            <button
                className="selector-dropdown-boton"
                onClick={() => setAbierto(!abierto)}
            >
                {proyectoActual ? proyectoActual.name : 'Seleccionar proyecto'}
                <span className="selector-dropdown-flecha">{abierto ? '▲' : '▼'}</span>
            </button>

            {abierto && (
                <div className="selector-dropdown-lista">
                    {proyectos.length === 0 && (
                        <p className="selector-dropdown-vacio">No hay proyectos todavía</p>
                    )}
                    {proyectos.map(proyecto => (
                        <div key={proyecto.id} className="selector-dropdown-item">
                            {confirmandoId === proyecto.id ? (
                                <div className="selector-dropdown-confirmacion">
                                    <span>¿Eliminar este proyecto?</span>
                                    <div className="selector-dropdown-confirmacion-botones">
                                        <button onClick={(e) => confirmarEliminar(e, proyecto.id)}>Sí</button>
                                        <button onClick={cancelarEliminar}>No</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span
                                        className={proyecto.id === proyectoSeleccionado ? 'activo' : ''}
                                        onClick={() => seleccionar(proyecto.id)}
                                    >
                                        {proyecto.name}
                                    </span>
                                    <button
                                        className="selector-dropdown-eliminar"
                                        onClick={(e) => pedirConfirmacion(e, proyecto.id)}
                                        aria-label={`Eliminar ${proyecto.name}`}
                                    >
                                        &times;
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SelectorProyecto;