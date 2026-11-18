import TareaItem from './TareaItem';
import Icono from './Icono';
function TareaLista({ tareas, busqueda, onCambiarEstado, onEditar, onEliminar, onNueva }) {
    if (tareas.length === 0) return <div className="estado-vacio"><div className="vacio-icono"><Icono nombre={busqueda ? 'search' : 'check'} size={24}/></div><p className="estado-vacio-titulo">{busqueda ? 'No encontramos tareas' : 'Todo empieza con una tarea'}</p><p className="estado-vacio-texto">{busqueda ? 'Prueba con otra búsqueda.' : 'Añade tu primera tarea y empieza a organizar tus ideas.'}</p>{!busqueda && <button className="boton-secundario" onClick={onNueva}><Icono nombre="plus" size={16}/> Crear tarea</button>}</div>;
    return <div className="tarea-lista">{tareas.map(tarea => <TareaItem key={tarea.id} tarea={tarea} onCambiarEstado={onCambiarEstado} onEditar={onEditar} onEliminar={onEliminar}/>)}</div>;
}
export default TareaLista;
