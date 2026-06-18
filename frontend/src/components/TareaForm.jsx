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
       <div className="card card-nueva-tarea mb-4">
            <div className="card-body">
                <h5 className="card-title mb-3">Nueva tarea</h5>
                <form onSubmit={manejarSubmit}>
                    <div className="row g-2">
                        <div className="col-12 col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Título de la tarea"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-5">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-3">
                            <button type="submit" className="btn btn-primary w-100">
                                Crear tarea
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TareaForm;