# Frontend

[Inicio](../README.md) · [API](rest-api.md)

El frontend usa React 19, Vite 8, Bootstrap 5 y CSS. `main.jsx` monta `App` bajo `StrictMode`. `App.jsx` mantiene proyectos, selección, tareas, carga, búsqueda y visibilidad del formulario mediante hooks; realiza las peticiones con `fetch`.

| Componente | Función |
|---|---|
| `App` | Navegación de proyectos en la barra lateral, cabecera y resumen del proyecto activo. |
| `ConfirmarEliminarProyecto` | Diálogo de confirmación y mensajes de error al eliminar un proyecto. |
| `ProyectoForm` | Formulario de creación de proyecto. |
| `TareaForm` | Formulario de creación dentro de un modal. |
| `TareaLista` y `TareaItem` | Lista, edición y eliminación de tareas. |
| `SelectorEstado` | Menú de los cuatro estados de tarea con navegación por teclado. |
| `Dialogo` e `Icono` | Diálogo reutilizable e iconos de la interfaz. |
| `BarraBusqueda` | Entrada para el filtro por título. |
| `SelectorProyecto` y `ProyectoLista` | Componentes anteriores que no se importan en `App.jsx`. |

La interfaz utiliza una paleta definida mediante variables CSS y adapta la navegación y las tarjetas a pantallas pequeñas. El botón de la cabecera permite eliminar el proyecto activo. El [README](../README.md#capturas) muestra el panel y los flujos de creación y eliminación de proyectos.

Al cargar, se consultan los proyectos de un UUID fijo y se selecciona el primero si existe. Las tareas se consultan al cambiar de proyecto. La búsqueda filtra por título sin distinguir mayúsculas y ordena por título; los contadores se calculan sobre las tareas cargadas del proyecto. Se muestran total, pendientes, en progreso y hechas; el estado cancelado está disponible en el selector.

La API está fijada a `http://localhost:8080` y el usuario a un UUID en `App.jsx`. No existe pantalla de autenticación ni de creación de usuarios. La eliminación de proyectos requiere confirmación, advierte de que se eliminarán las tareas asociadas y comprueba `response.ok`. Durante la petición se deshabilitan las acciones; si falla, se muestra un mensaje y se puede reintentar. En otras operaciones las respuestas HTTP no se comprueban sistemáticamente y algunos errores se registran en consola. Estas son limitaciones actuales, no garantías de funcionamiento.

El repositorio no declara un script de pruebas de frontend. [Puesta en marcha](getting-started.md) describe la configuración local.
