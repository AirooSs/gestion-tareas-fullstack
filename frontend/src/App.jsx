import { useState, useEffect } from 'react';
import './App.css';
import SelectorProyecto from './components/SelectorProyecto';
import TareaForm from './components/TareaForm';
import TareaLista from './components/TareaLista';
import ProyectoForm from './components/ProyectoForm';
import ProyectoLista from './components/ProyectoLista';
import BarraBusqueda from './components/BarraBusqueda';

const USER_ID = '5c3a541c-5a22-45e8-92d7-600f3adfcbfb';

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaProyecto, setBusquedaProyecto] = useState('');
  const [busquedaTarea, setBusquedaTarea] = useState('');
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);

  const cargarProyectos = () => {
    fetch(`http://localhost:8080/api/proyectos/usuario/${USER_ID}`)
      .then(response => response.json())
      .then(data => {
        setProyectos(data);
        if (data.length > 0) {
          setProyectoSeleccionado(data[0].id);
        }
        setCargando(false);
      })
      .catch(error => {
        console.error('Error al cargar proyectos:', error);
        setCargando(false);
      });
  };

  const cargarTareas = (projectId) => {
    if (!projectId) return;
    fetch(`http://localhost:8080/api/tareas/proyecto/${projectId}`)
      .then(response => response.json())
      .then(data => setTareas(data))
      .catch(error => console.error('Error al cargar tareas:', error));
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    cargarTareas(proyectoSeleccionado);
  }, [proyectoSeleccionado]);

  const crearTarea = (titulo, descripcion) => {
    fetch('http://localhost:8080/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: titulo,
        descripcion: descripcion,
        projectId: proyectoSeleccionado
      })
    })
      .then(response => response.json())
      .then(() => {
        cargarTareas(proyectoSeleccionado);
        setMostrarFormTarea(false);
      })
      .catch(error => console.error('Error al crear tarea:', error));
  };

  const crearProyecto = (name, description) => {
    fetch('http://localhost:8080/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        description: description,
        ownerId: USER_ID
      })
    })
      .then(response => response.json())
      .then((nuevoProyecto) => {
        setProyectos(prev => [...prev, nuevoProyecto]);
        setProyectoSeleccionado(nuevoProyecto.id);
      })
      .catch(error => console.error('Error al crear proyecto:', error));
  };

  const cambiarEstado = (id, nuevoEstado) => {
    fetch(`http://localhost:8080/api/tareas/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    })
      .then(response => response.json())
      .then(() => cargarTareas(proyectoSeleccionado))
      .catch(error => console.error('Error al cambiar estado:', error));
  };

  const editarTarea = (id, nuevoTitulo, nuevaDescripcion) => {
    fetch(`http://localhost:8080/api/tareas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: nuevoTitulo,
        descripcion: nuevaDescripcion
      })
    })
      .then(response => response.json())
      .then(() => cargarTareas(proyectoSeleccionado))
      .catch(error => console.error('Error al editar tarea:', error));
  };

  const eliminarTarea = (id) => {
    fetch(`http://localhost:8080/api/tareas/${id}`, {
      method: 'DELETE'
    })
      .then(() => cargarTareas(proyectoSeleccionado))
      .catch(error => console.error('Error al eliminar tarea:', error));
  };

  const eliminarProyecto = (id) => {
    fetch(`http://localhost:8080/api/proyectos/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        const proyectosActualizados = proyectos.filter(p => p.id !== id);
        setProyectos(proyectosActualizados);

        if (proyectoSeleccionado === id) {
          setProyectoSeleccionado(proyectosActualizados.length > 0 ? proyectosActualizados[0].id : '');
        }
      })
      .catch(error => console.error('Error al eliminar proyecto:', error));
  };

  const proyectosFiltrados = proyectos.filter(p =>
    p.name.toLowerCase().includes(busquedaProyecto.toLowerCase())
  );

  const tareasFiltradas = tareas.filter(t =>
    t.titulo.toLowerCase().includes(busquedaTarea.toLowerCase())
  );

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  const totalTareas = tareas.length;
  const tareasPendientes = tareas.filter(t => t.status === 'PENDIENTE').length;
  const tareasEnProgreso = tareas.filter(t => t.status === 'EN_PROGRESO').length;
  const tareasHechas = tareas.filter(t => t.status === 'HECHO').length;

  if (cargando) {
    return (
      <div className="loading-shell">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Gestión de Tareas</h1>
          <p>Mente productiva</p>
        </div>

        <nav>
          <a className="sidebar-link activo" href="#">Todas las tareas</a>
          <a className="sidebar-link" href="#">Mis proyectos</a>
        </nav>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">FS</div>
          <div>
            <p>Fran Soria</p>
            <span>Cuenta personal</span>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="topbar-selector">
            {proyectoActual ? proyectoActual.name : 'Selecciona un proyecto'}
          </button>
        </header>

        <div className="contenido">
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-label">Total tareas</p>
              <h3 className="stat-card-valor">{totalTareas}</h3>
              <p className="stat-card-sub activo">En este proyecto</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pendientes</p>
              <h3 className="stat-card-valor">{tareasPendientes}</h3>
              <p className="stat-card-sub">Por empezar</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">En progreso</p>
              <h3 className="stat-card-valor">{tareasEnProgreso}</h3>
              <p className="stat-card-sub">En curso</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Completadas</p>
              <h3 className="stat-card-valor">{tareasHechas}</h3>
              <p className="stat-card-sub">Finalizadas</p>
            </div>
          </div>

          <BarraBusqueda
            valor={busquedaProyecto}
            onCambiar={setBusquedaProyecto}
            placeholder="Buscar proyecto..."
          />

          <ProyectoLista
            proyectos={proyectosFiltrados}
            proyectoSeleccionado={proyectoSeleccionado}
            onSeleccionar={setProyectoSeleccionado}
            onEliminar={eliminarProyecto}
          />

          <ProyectoForm onCrear={crearProyecto} />

          {proyectoSeleccionado ? (
            <>
              <div className="seccion-cabecera">
                <div>
                  <h2>Tareas activas</h2>
                  <p>Gestiona tus prioridades del proyecto</p>
                </div>
              </div>

              <BarraBusqueda
                valor={busquedaTarea}
                onCambiar={setBusquedaTarea}
                placeholder="Buscar tarea..."
              />

              <TareaLista
                tareas={tareasFiltradas}
                onCambiarEstado={cambiarEstado}
                onEditar={editarTarea}
                onEliminar={eliminarTarea}
              />

              {mostrarFormTarea && (
                <div className="tarea-form-overlay" onClick={() => setMostrarFormTarea(false)}>
                  <div className="tarea-form-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Nueva tarea</h2>
                    <TareaForm onCrear={crearTarea} />
                  </div>
                </div>
              )}

              <button className="fab" onClick={() => setMostrarFormTarea(true)}>
                + Nueva tarea
              </button>
            </>
          ) : (
            <div className="estado-vacio">
              <p className="estado-vacio-titulo">No tienes ningún proyecto todavía</p>
              <p className="estado-vacio-texto">Crea tu primer proyecto arriba para empezar a añadir tareas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;