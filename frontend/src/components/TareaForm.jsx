import { useState } from 'react';

function TareaForm({ onCrear, onCancelar }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const manejarSubmit = (evento) => { evento.preventDefault(); onCrear(titulo, descripcion); };
    return (
        <form className="formulario" onSubmit={manejarSubmit}>
            <p className="dialogo-intro">Añade los detalles para organizar tu trabajo.</p>
            <label htmlFor="tarea-titulo">Título</label>
            <input id="tarea-titulo" autoFocus placeholder="¿Qué hay que hacer?" value={titulo} onChange={e => setTitulo(e.target.value)} required />
            <label htmlFor="tarea-descripcion">Descripción <span>Opcional</span></label>
            <textarea id="tarea-descripcion" placeholder="Añade más detalles" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="3" />
            <div className="form-acciones"><button type="button" className="boton-secundario" onClick={onCancelar}>Cancelar</button><button type="submit" className="boton-primario">Crear tarea</button></div>
        </form>
    );
}
export default TareaForm;
