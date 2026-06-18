import { useState, useEffect } from 'react';
import './App.css';
import SelectorProyecto from './components/SelectorProyecto';
import TareaForm from './components/TareaForm';
import TareaLista from './components/TareaLista';

const USER_ID = '5c3a541c-5a22-45e8-92d7-600f3adfcbfb';

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

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
      .then(() => cargarTareas(proyectoSeleccionado))
      .catch(error => console.error('Error al crear tarea:', error));
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

  if (cargando) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Gestión de Tareas</h1>

      <SelectorProyecto
        proyectos={proyectos}
        proyectoSeleccionado={proyectoSeleccionado}
        onCambiar={setProyectoSeleccionado}
      />

      <TareaForm onCrear={crearTarea} />

      <TareaLista tareas={tareas} onCambiarEstado={cambiarEstado} />
    </div>
  );
}

export default App;