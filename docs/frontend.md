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

Al cargar, la interfaz crea o recupera una sesión anónima por pestaña y envía su token Bearer a la API. El token se guarda en `sessionStorage`; cuando caduca, la interfaz permite iniciar una demo nueva. Cada sesión nueva empieza sin proyectos; las sesiones existentes conservan sus datos hasta que caducan. Antes de iniciar o recuperar la sesión, el frontend comprueba `GET /health`: reintenta solo esta lectura con intervalos progresivos durante un máximo de 150 segundos. Tras cinco segundos explica la posible espera; al agotar el plazo permite reintentar manualmente. La solicitud de sesión tiene un límite de 20 segundos. Los errores de sesión se muestran por separado y las escrituras no se reintentan automáticamente. La URL base se configura con `VITE_API_URL` y usa `http://localhost:8080` por defecto.

La búsqueda filtra las tareas por título. La eliminación de proyectos solicita confirmación y comprueba la respuesta. La política CSP para Vercel está en `frontend/vercel.json`; `connect-src` permite exclusivamente el origen configurado del backend en Render.
