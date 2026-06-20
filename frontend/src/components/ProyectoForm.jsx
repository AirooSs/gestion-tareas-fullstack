import { useState } from 'react';

function ProyectoForm({ onCrear }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    const manejarSubmit = (evento) => {
        evento.preventDefault();
        onCrear(name, description);
        setName('');
        setDescription('');
        setMostrarForm(false);
    };

    if (!mostrarForm) {
        return (
            <button
                className="btn-link"
                onClick={() => setMostrarForm(true)}
            >
                + Nuevo proyecto
            </button>
        );
    }

    return (
        <div className="proyecto-form">
            <h2>Nuevo proyecto</h2>
            <form onSubmit={manejarSubmit}>
                <input
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="proyecto-form-acciones">
                    <button type="submit" className="proyecto-form-crear">
                        Crear
                    </button>
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => setMostrarForm(false)}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProyectoForm;