import { useState, useEffect, useRef } from 'react';
import './App.css';
import Icono from './components/Icono';
import Dialogo from './components/Dialogo';
import ConfirmarEliminarProyecto from './components/ConfirmarEliminarProyecto';
import TareaForm from './components/TareaForm';
import TareaLista from './components/TareaLista';
import ProyectoForm from './components/ProyectoForm';
import BarraBusqueda from './components/BarraBusqueda';

const USER_ID = '5c3a541c-5a22-45e8-92d7-600f3adfcbfb';

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaTarea, setBusquedaTarea] = useState('');
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
  const [eliminandoProyecto, setEliminandoProyecto] = useState(false);
  const [errorEliminarProyecto, setErrorEliminarProyecto] = useState('');
  const eliminacionEnCurso = useRef(false);
  const botonEliminarRef = useRef(null);
  const selectorRef = useRef(null);
  const sidebarRef = useRef(null);

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

  const pedirEliminarProyecto = (proyecto, boton) => {
    botonEliminarRef.current = boton;
    setErrorEliminarProyecto('');
    setProyectoAEliminar(proyecto);
  };

  const cerrarConfirmacion = (eliminado = false) => {
    setProyectoAEliminar(null);
    setErrorEliminarProyecto('');
    requestAnimationFrame(() => {
      const destino = !eliminado && botonEliminarRef.current?.isConnected
        ? botonEliminarRef.current : (selectorRef.current || sidebarRef.current);
      destino?.focus();
    });
  };

  const eliminarProyecto = async () => {
    if (eliminacionEnCurso.current || !proyectoAEliminar) return;
    eliminacionEnCurso.current = true;
    setEliminandoProyecto(true);
    setErrorEliminarProyecto('');
    const id = proyectoAEliminar.id;
    try {
      const response = await fetch(`http://localhost:8080/api/proyectos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const proyectosActualizados = proyectos.filter(p => p.id !== id);
      setProyectos(proyectosActualizados);
      if (proyectoSeleccionado === id) {
        setTareas([]);
        setProyectoSeleccionado(proyectosActualizados.length > 0 ? proyectosActualizados[0].id : '');
      }
      cerrarConfirmacion(true);
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      setErrorEliminarProyecto('No se ha podido eliminar el proyecto. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      eliminacionEnCurso.current = false;
      setEliminandoProyecto(false);
    }
  };

  const tareasFiltradas = tareas
    .filter(t => t.titulo.toLowerCase().includes(busquedaTarea.toLowerCase()))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  const totalTareas = tareas.length;
  const tareasPendientes = tareas.filter(t => t.status === 'PENDIENTE').length;
  const tareasEnProgreso = tareas.filter(t => t.status === 'EN_PROGRESO').length;
  const tareasHechas = tareas.filter(t => t.status === 'HECHO').length;

  if (cargando) {
    return (
      <div className="loading-shell" role="status" aria-label="Cargando proyectos">
        <div className="spinner" aria-hidden="true"></div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside ref={sidebarRef} tabIndex="-1" className="sidebar" aria-label="Proyectos">
        <div className="sidebar-brand"><div className="marca-icono"><Icono nombre="grid" size={19}/></div><div><strong>Gestión de Tareas</strong><span>Tu espacio de trabajo</span></div></div>
        <div className="sidebar-nav-title">ESPACIO DE TRABAJO</div>
        <div className="sidebar-overview"><Icono nombre="grid" size={17}/> Mis proyectos</div>
        <div className="sidebar-section"><span>PROYECTOS</span><span className="proyectos-cuenta">{proyectos.length}</span></div>
        <nav className="proyectos-nav" aria-label="Lista de proyectos">
          {proyectos.map(proyecto => <button key={proyecto.id} type="button" className={`proyecto-nav-item${proyecto.id === proyectoSeleccionado ? ' activo' : ''}`} aria-current={proyecto.id === proyectoSeleccionado ? 'page' : undefined} onClick={() => setProyectoSeleccionado(proyecto.id)}><span className="proyecto-nav-icono"><Icono nombre="folder" size={16}/></span><span className="proyecto-nav-nombre">{proyecto.name}</span>{proyecto.id === proyectoSeleccionado && <span className="proyecto-nav-indicador"/>}</button>)}
          {proyectos.length === 0 && <p className="sidebar-vacio">Aún no hay proyectos.</p>}
        </nav>
        <ProyectoForm onCrear={crearProyecto}/>
        <div className="sidebar-footer"><div className="avatar">GT</div><div><strong>Mi espacio</strong><span>Organiza tu día</span></div></div>
      </aside>
      <main className="main-area">
        <div className="topbar"><div className="breadcrumb"><Icono nombre="grid" size={15}/><span>Mis proyectos</span><span className="breadcrumb-separador">/</span><strong>{proyectoActual?.name || 'Resumen'}</strong></div><span className="topbar-label">ESPACIO DE TRABAJO</span></div>
        <div className="contenido">
          <div className="pagina-intro"><div><div className="eyebrow"><span className="eyebrow-punto"/> TU ESPACIO DE TRABAJO</div><h1>{proyectoActual?.name || 'Tus proyectos'}</h1><p>{proyectoActual?.description || (proyectoActual ? 'Un espacio para organizar tus ideas y avanzar cada día.' : 'Todo tu trabajo, en un solo lugar.')}</p></div>{proyectoActual && <div className="cabecera-acciones"><button ref={selectorRef} type="button" className="boton-icono peligro proyecto-eliminar" title="Eliminar proyecto" aria-label={`Eliminar proyecto ${proyectoActual.name}`} onClick={e => pedirEliminarProyecto(proyectoActual, e.currentTarget)}><Icono nombre="trash" size={18}/></button><button type="button" className="boton-primario" onClick={() => setMostrarFormTarea(true)}><Icono nombre="plus" size={18}/> Nueva tarea</button></div>}</div>
          {proyectoActual ? <>
            <div className="resumen-cabecera"><div><h2>Resumen</h2><p>Tu progreso de un vistazo</p></div><span>VISTA GENERAL</span></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-top"><span>Total tareas</span><span className="stat-icono azul"><Icono nombre="list"/></span></div><strong>{totalTareas}</strong><small>En este proyecto</small></div>
              <div className="stat-card"><div className="stat-top"><span>Pendientes</span><span className="stat-icono gris"><Icono nombre="clock"/></span></div><strong>{tareasPendientes}</strong><small>Por empezar</small></div>
              <div className="stat-card"><div className="stat-top"><span>En progreso</span><span className="stat-icono ambar"><Icono nombre="progress"/></span></div><strong>{tareasEnProgreso}</strong><small>En curso</small></div>
              <div className="stat-card"><div className="stat-top"><span>Completadas</span><span className="stat-icono verde"><Icono nombre="check"/></span></div><strong>{tareasHechas}</strong><small>Finalizadas</small></div>
            </div>
            <section className="seccion-tareas" aria-labelledby="titulo-tareas"><div className="seccion-cabecera"><div><h2 id="titulo-tareas">Tareas <span className="contador-tareas">{totalTareas}</span></h2><p>Gestiona y organiza el trabajo de tu proyecto</p></div><BarraBusqueda valor={busquedaTarea} onCambiar={setBusquedaTarea} placeholder="Buscar tareas..."/></div>
              <TareaLista tareas={tareasFiltradas} busqueda={busquedaTarea} onCambiarEstado={cambiarEstado} onEditar={editarTarea} onEliminar={eliminarTarea} onNueva={() => setMostrarFormTarea(true)}/>
            </section>
          </> : <div className="estado-vacio estado-sin-proyecto"><div className="vacio-icono"><Icono nombre="folder" size={24}/></div><p className="estado-vacio-titulo">Tu espacio está listo</p><p className="estado-vacio-texto">Crea un proyecto en la barra lateral para empezar a organizar tus tareas.</p></div>}
        </div>
      </main>
      {mostrarFormTarea && <Dialogo titulo="Nueva tarea" onCerrar={() => setMostrarFormTarea(false)}><TareaForm onCrear={crearTarea} onCancelar={() => setMostrarFormTarea(false)}/></Dialogo>}
      {proyectoAEliminar && <ConfirmarEliminarProyecto proyecto={proyectoAEliminar} eliminando={eliminandoProyecto} error={errorEliminarProyecto} onCancelar={() => cerrarConfirmacion()} onConfirmar={eliminarProyecto}/>}
    </div>
  );
}

export default App;
