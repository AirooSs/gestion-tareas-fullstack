# API REST

[Inicio](../README.md) · [Modelo de datos](data-model.md)

`POST /api/demo/session` crea una sesión anónima y devuelve `token` y `expiresAt`. El token se entrega una sola vez y debe enviarse en `Authorization: Bearer <token>` para las rutas de proyectos y tareas. No se aceptan cookies como credenciales. `GET /health` es público. Las rutas de usuarios y la interfaz OpenAPI no están disponibles en el modo demo.

| Método y ruta | Cuerpo | Resultado |
|---|---|---|
| `POST /api/demo/session` | — | 200, sesión y datos ficticios iniciales |
| `GET /api/proyectos` | — | Lista de proyectos de la sesión |
| `POST /api/proyectos` | `name`, `description` | 201, proyecto propio |
| `DELETE /api/proyectos/{id}` | — | 204, elimina el proyecto propio y sus tareas |
| `POST /api/tareas` | `titulo`, `descripcion`, `projectId` | 201, tarea en un proyecto propio |
| `GET /api/tareas/{id}` | — | Tarea propia |
| `GET /api/tareas/proyecto/{id}` | — | Tareas de un proyecto propio |
| `PUT /api/tareas/{id}` | `titulo`, `descripcion` | Tarea propia editada |
| `PATCH /api/tareas/{id}/estado` | `estado` | Tarea propia actualizada |
| `DELETE /api/tareas/{id}` | — | 204, tarea propia eliminada |

Los estados son `PENDIENTE`, `EN_PROGRESO`, `HECHO` y `CANCELADO`. Los títulos y nombres son obligatorios y se limitan a 255 caracteres; las descripciones son opcionales y tienen el mismo límite. El servidor determina el propietario: no debe enviarse `ownerId`.

Un token ausente, inválido o caducado recibe 401. Los recursos ajenos o inexistentes reciben 404. Las rutas de usuarios están denegadas. Los límites de peticiones y cuotas responden 429. CORS no sustituye la autenticación. No incluyas tokens en URL ni registros.
