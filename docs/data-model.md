# Modelo de datos

[Inicio](../README.md) · [Arquitectura](architecture.md) · [API](rest-api.md)

![Modelo de datos](diagrams/svg/data-model.svg)

| Tabla | Contenido |
|---|---|
| `demo_sessions` | UUID, hash SHA-256 único del token y fecha de caducidad. |
| `proyectos` | UUID, nombre, descripción y `owner_id` con el UUID de la sesión demo. |
| `tareas` | UUID, título, descripción, estado, `project_id` y asignación opcional. |
| `usuarios` | Tabla anterior conservada; su API está deshabilitada para la demo. |

Las referencias entre sesiones, proyectos y tareas son lógicas; las migraciones no añaden claves foráneas a las tablas existentes. El servicio comprueba propiedad antes de leer o modificar y elimina las tareas antes del proyecto. La limpieza borra únicamente los datos vinculados a sesiones demo caducadas.

Flyway contiene una migración inicial y otra para sesiones. Su ejecución automática está desactivada salvo `FLYWAY_ENABLED=true`. Para una base existente sin historial de Flyway no se debe activar `baseline-on-migrate`: requiere una revisión y una estrategia de baseline explícita antes de aplicar cambios. Nunca se han ejecutado estas migraciones en producción como parte de esta implementación.
