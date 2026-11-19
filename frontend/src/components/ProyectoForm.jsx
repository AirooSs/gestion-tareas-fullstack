import { useState } from 'react';
import Icono from './Icono';

function ProyectoForm({ onCrear, mostrarForm, setMostrarForm }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const manejarSubmit = (evento) => {
        evento.preventDefault();
        onCrear(name, description);
        setName(''); setDescription(''); setMostrarForm(false);
    };
    if (!mostrarForm) return <button type="button" className="nuevo-proyecto" onClick={() => setMostrarForm(true)}><Icono nombre="plus" size={17} /> Nuevo proyecto</button>;
    return (
        <form className="proyecto-form" onSubmit={manejarSubmit}>
            <label htmlFor="proyecto-nombre">Nombre del proyecto</label>
            <input id="proyecto-nombre" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Lanzamiento" required />
            <label htmlFor="proyecto-descripcion">Descripción</label>
            <input id="proyecto-descripcion" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional" />
            <div className="form-acciones"><button type="button" className="boton-secundario" onClick={() => setMostrarForm(false)}>Cancelar</button><button className="boton-primario" type="submit">Crear</button></div>
        </form>
    );
}
export default ProyectoForm;
