import { useEffect, useRef } from 'react';

function ConfirmarEliminarProyecto({ proyecto, eliminando, error, onCancelar, onConfirmar }) {
    const dialogRef = useRef(null);
    const cancelarRef = useRef(null);

    useEffect(() => {
        const dialogo = dialogRef.current;
        dialogo.showModal();
        cancelarRef.current.focus();
        return () => dialogo.close();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="confirmar-proyecto-modal"
            aria-labelledby="confirmar-proyecto-titulo"
            aria-describedby="confirmar-proyecto-descripcion"
            onCancel={(evento) => {
                evento.preventDefault();
                if (!eliminando) onCancelar();
            }}
        >
            <h2 id="confirmar-proyecto-titulo">Eliminar proyecto</h2>
            <p id="confirmar-proyecto-descripcion">
                ¿Quieres eliminar el proyecto <strong>{proyecto.name}</strong>? También se eliminarán todas sus tareas asociadas. Esta acción no se puede deshacer.
            </p>
            {error && <p className="confirmar-proyecto-error" role="alert">{error}</p>}
            <div className="confirmar-proyecto-acciones">
                <button ref={cancelarRef} type="button" className="confirmar-proyecto-cancelar" onClick={onCancelar} disabled={eliminando}>Cancelar</button>
                <button type="button" className="confirmar-proyecto-eliminar" onClick={onConfirmar} disabled={eliminando}>
                    {eliminando ? 'Eliminando…' : 'Eliminar proyecto'}
                </button>
            </div>
        </dialog>
    );
}

export default ConfirmarEliminarProyecto;
