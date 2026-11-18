import { useState } from 'react';

function SelectorProyecto({ proyectos, proyectoSeleccionado, onCambiar, onEliminar, selectorRef }) {
    const [abierto, setAbierto] = useState(false);
    const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

    const seleccionar = (id) => {
        onCambiar(id);
        setAbierto(false);
    };

    return (
        <div className="selector-dropdown">
            <button
                ref={selectorRef}
                type="button"
                className="selector-dropdown-boton"
                aria-expanded={abierto}
                aria-controls="lista-proyectos"
                onClick={() => setAbierto(!abierto)}
            >
                {proyectoActual ? proyectoActual.name : 'Seleccionar proyecto'}
                <span className="selector-dropdown-flecha" aria-hidden="true">{abierto ? '▲' : '▼'}</span>
            </button>

            {abierto && (
                <div id="lista-proyectos" className="selector-dropdown-lista">
                    {proyectos.length === 0 && (
                        <p className="selector-dropdown-vacio">No hay proyectos todavía</p>
                    )}
                    {proyectos.map(proyecto => (
                        <div key={proyecto.id} className="selector-dropdown-item">
                            <button
                                type="button"
                                className={`selector-dropdown-nombre${proyecto.id === proyectoSeleccionado ? ' activo' : ''}`}
                                aria-pressed={proyecto.id === proyectoSeleccionado}
                                onClick={() => seleccionar(proyecto.id)}
                            >
                                {proyecto.name}
                            </button>
                            <button
                                type="button"
                                className="selector-dropdown-eliminar"
                                onClick={(evento) => onEliminar(proyecto, evento.currentTarget)}
                                aria-label={`Eliminar proyecto ${proyecto.name}`}
                                title="Eliminar proyecto"
                            >
                                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SelectorProyecto;
