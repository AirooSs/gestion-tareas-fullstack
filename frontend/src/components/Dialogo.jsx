import { useEffect, useRef } from 'react';

export default function Dialogo({ titulo, onCerrar, children }) {
    const ref = useRef(null);
    useEffect(() => {
        const dialogo = ref.current;
        dialogo.showModal();
        return () => dialogo.close();
    }, []);
    return (
        <dialog ref={ref} className="dialogo" aria-labelledby="dialogo-titulo" onCancel={(e) => { e.preventDefault(); onCerrar(); }}>
            <h2 id="dialogo-titulo">{titulo}</h2>
            {children}
        </dialog>
    );
}
