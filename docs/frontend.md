# Frontend

[Inicio](../README.md) · [API](rest-api.md)

El frontend usa React 19, Vite 8, Bootstrap 5 y CSS. `main.jsx` monta `App` bajo `StrictMode`. `App.jsx` mantiene proyectos, selección, tareas, carga, búsqueda y visibilidad del formulario mediante hooks; realiza las peticiones con `fetch`.

| Componente | Función |
|---|---|
| `SelectorProyecto` | Selección y confirmación de eliminación de proyectos. |
| `ProyectoForm` | Formulario de creación de proyecto. |
| `TareaForm` | Formulario de creación dentro de un modal. |
| `TareaLista` y `TareaItem` | Lista, edición, eliminación y selección de estado. |
| `BarraBusqueda` | Entrada para el filtro por título. |
| `ProyectoLista` | Componente existente que no se importa en `App.jsx`. |

Al cargar, se consultan los proyectos de un UUID fijo y se selecciona el primero si existe. Las tareas se consultan al cambiar de proyecto. La búsqueda filtra por título sin distinguir mayúsculas y ordena por título; los contadores se calculan sobre las tareas cargadas del proyecto. Se muestran total, pendientes, en progreso y hechas; el estado cancelado está disponible en el selector.

La API está fijada a `http://localhost:8080` y el usuario a un UUID en `App.jsx`. No existe pantalla de autenticación ni de creación de usuarios. Las respuestas HTTP no se comprueban sistemáticamente con `response.ok`; algunos errores se registran en consola y las eliminaciones actualizan la vista al resolverse la petición aunque la respuesta indique error. Estas son limitaciones actuales, no garantías de funcionamiento.

El repositorio no declara un script de pruebas de frontend. [Puesta en marcha](getting-started.md) describe la configuración local.
