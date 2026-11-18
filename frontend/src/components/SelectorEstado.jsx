import { useRef, useState } from 'react';

const estados = [
    ['PENDIENTE', 'Pendiente'],
    ['EN_PROGRESO', 'En progreso'],
    ['HECHO', 'Hecho'],
    ['CANCELADO', 'Cancelado'],
];

export default function SelectorEstado({ estado, titulo, onCambiar }) {
    const [abierto, setAbierto] = useState(false);
    const botonRef = useRef(null);
    const opcionesRef = useRef([]);
    const indiceActual = Math.max(0, estados.findIndex(([valor]) => valor === estado));
    const abrir = (indice = indiceActual) => {
        setAbierto(true);
        requestAnimationFrame(() => opcionesRef.current[indice]?.focus());
    };
    const cerrar = (devolverFoco = false) => {
        setAbierto(false);
        if (devolverFoco) botonRef.current?.focus();
    };
    const navegar = (evento, indice) => {
        let siguiente;
        if (evento.key === 'ArrowDown') siguiente = (indice + 1) % estados.length;
        else if (evento.key === 'ArrowUp') siguiente = (indice + estados.length - 1) % estados.length;
        else if (evento.key === 'Home') siguiente = 0;
        else if (evento.key === 'End') siguiente = estados.length - 1;
        else if (evento.key === 'Escape') { evento.preventDefault(); cerrar(true); return; }
        else return;
        evento.preventDefault();
        opcionesRef.current[siguiente]?.focus();
    };
    return (
        <div className="estado-selector" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) cerrar(); }}>
            <button ref={botonRef} type="button" className={`estado-selector-boton ${estado.toLowerCase()}`} aria-label={`Estado de ${titulo}: ${estados[indiceActual][1]}`} aria-haspopup="menu" aria-expanded={abierto} onClick={() => abierto ? cerrar() : abrir()} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); abrir(e.key === 'ArrowDown' ? 0 : estados.length - 1); } }}>
                <span className="estado-punto" aria-hidden="true" />{estados[indiceActual][1]}<span className="estado-flecha" aria-hidden="true" />
            </button>
            {abierto && <div className="estado-menu" role="menu" aria-label={`Cambiar estado de ${titulo}`}>
                {estados.map(([valor, etiqueta], indice) => <button key={valor} ref={elemento => { opcionesRef.current[indice] = elemento; }} type="button" role="menuitemradio" aria-checked={valor === estado} className={`estado-opcion ${valor.toLowerCase()}`} onKeyDown={e => navegar(e, indice)} onClick={() => { cerrar(true); if (valor !== estado) onCambiar(valor); }}><span className="estado-punto" aria-hidden="true"/><span>{etiqueta}</span>{valor === estado && <span aria-hidden="true">✓</span>}</button>)}
            </div>}
        </div>
    );
}
