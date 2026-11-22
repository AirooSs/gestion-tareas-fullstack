import { useState } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import Icono from './Icono';
import Dialogo from './Dialogo';
import SelectorEstado from './SelectorEstado';

function TareaItem({ tarea, onCambiarEstado, onEditar, onEliminar, estadoGuardado, onRevisarEstado, index = 0, bloqueado = false, arrastreDeshabilitado = false }) {
    const [editando, setEditando] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [titulo, setTitulo] = useState(tarea.titulo);
    const [descripcion, setDescripcion] = useState(tarea.descripcion || '');
    const bloqueada = bloqueado || ['saving', 'checking', 'unknown'].includes(estadoGuardado?.phase);
    const { ref, handleRef, isDragging } = useSortable({ id: tarea.id, index, group: tarea.status, disabled: bloqueada || arrastreDeshabilitado || editando || confirmando });
    const cancelarEdicion = () => { setTitulo(tarea.titulo); setDescripcion(tarea.descripcion || ''); setEditando(false); };
    if (editando) return (
        <form className="tarea-card tarea-card-editando formulario" onSubmit={(e) => { e.preventDefault(); onEditar(tarea.id, titulo, descripcion); setEditando(false); }}>
            <label htmlFor={`titulo-${tarea.id}`}>Título</label><input id={`titulo-${tarea.id}`} autoFocus value={titulo} onChange={e => setTitulo(e.target.value)} required />
            <label htmlFor={`descripcion-${tarea.id}`}>Descripción</label><textarea id={`descripcion-${tarea.id}`} value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="2" />
            <div className="form-acciones"><button type="button" className="boton-secundario" onClick={cancelarEdicion}>Cancelar</button><button className="boton-primario">Guardar</button></div>
        </form>
    );
    return (
        <article ref={ref} className={`tarea-card${isDragging ? ' arrastrando' : ''}`}>
            <div className="tarea-card-cabecera"><button ref={handleRef} type="button" data-drag-task-id={tarea.id} className="arrastre-tirador" disabled={bloqueada || arrastreDeshabilitado} aria-label={`Mover tarea ${tarea.titulo}`} aria-describedby="instrucciones-arrastre" title="Arrastrar tarea"><Icono nombre="grip" size={17}/></button><span className={`estado-punto ${tarea.status.toLowerCase()}`} aria-hidden="true"/><h3>{tarea.titulo}</h3><div className="tarea-acciones"><button type="button" className="boton-icono" disabled={bloqueada} title="Editar tarea" aria-label={`Editar tarea ${tarea.titulo}`} onClick={() => setEditando(true)}><Icono nombre="edit" size={17}/></button><button type="button" className="boton-icono peligro" disabled={bloqueada} title="Eliminar tarea" aria-label={`Eliminar tarea ${tarea.titulo}`} onClick={() => setConfirmando(true)}><Icono nombre="trash" size={17}/></button></div></div>
            <p className="tarea-descripcion">{tarea.descripcion || 'Sin descripción'}</p>
            <div className="tarea-pie"><span className="tarea-estado-label">Estado</span><SelectorEstado estado={tarea.status} titulo={tarea.titulo} disabled={bloqueada} onCambiar={valor => onCambiarEstado(tarea.id, valor)} /></div>
            {estadoGuardado?.phase === 'saving' && <p className="tarea-guardado" role="status">Guardando cambio…</p>}
            {estadoGuardado?.phase === 'checking' && <p className="tarea-guardado" role="status">Consultando el estado…</p>}
            {estadoGuardado?.message && <div className="tarea-error" role="alert"><p>{estadoGuardado.message}</p>{estadoGuardado.phase === 'unknown' && <button type="button" className="boton-secundario" onClick={() => onRevisarEstado(tarea.id)}>Comprobar estado</button>}</div>}
            {confirmando && <Dialogo titulo="Eliminar tarea" onCerrar={() => setConfirmando(false)}><p className="dialogo-intro">¿Quieres eliminar la tarea <strong>{tarea.titulo}</strong>? Esta acción no se puede deshacer.</p><div className="form-acciones"><button autoFocus className="boton-secundario" onClick={() => setConfirmando(false)}>Cancelar</button><button className="boton-peligro" onClick={() => { setConfirmando(false); onEliminar(tarea.id); }}>Eliminar tarea</button></div></Dialogo>}
        </article>
    );
}
export default TareaItem;
