import { useState } from 'react';

function TareaForm({ onCrear }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const manejarSubmit = (evento) => {
        evento.preventDefault();
        onCrear(titulo, descripcion);
        setTitulo('');
        setDescripcion('');
    };

    return (
        <form onSubmit={manejarSubmit}>
            <input
                type="text"
                placeholder="Título de la tarea"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
            />
            <div className="tarea-form-modal-acciones">
                <button type="submit" className="fab" style={{ position: 'static' }}>
                    Crear tarea
                </button>
            </div>
        </form>
    );
}

export default TareaForm;