import Icono from './Icono';
function BarraBusqueda({ valor, onCambiar, placeholder }) {
    return <div className="barra-busqueda"><Icono nombre="search" size={17}/><input type="search" aria-label="Buscar tareas" placeholder={placeholder} value={valor} onChange={e => onCambiar(e.target.value)}/>{valor && <button type="button" className="boton-icono" aria-label="Limpiar búsqueda" onClick={() => onCambiar('')}><Icono nombre="close" size={15}/></button>}</div>;
}
export default BarraBusqueda;
