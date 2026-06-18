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
                className="btn btn-outline-secondary btn-sm mb-4"
                onClick={() => setMostrarForm(true)}
            >
                + Nuevo proyecto
            </button>
        );
    }

    return (
        <div className="card card-nuevo-proyecto mb-4">
            <div className="card-body">
                <h2 className="card-title mb-3">Nuevo proyecto</h2>
                <form onSubmit={manejarSubmit}>
                    <div className="tarea-form-fila d-flex gap-2 flex-wrap">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre del proyecto"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Crear
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setMostrarForm(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProyectoForm;