function BarraBusqueda({ valor, onCambiar, placeholder }) {
    return (
        <div className="barra-busqueda">
            <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={valor}
                onChange={(e) => onCambiar(e.target.value)}
            />
            {valor && (
                <button
                    className="barra-busqueda-limpiar"
                    onClick={() => onCambiar('')}
                    aria-label="Limpiar búsqueda"
                >
                    &times;
                </button>
            )}
        </div>
    );
}

export default BarraBusqueda;