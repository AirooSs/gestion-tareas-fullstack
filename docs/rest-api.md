# API REST

[Inicio](../README.md) · [Casos de uso](use-cases.md)

Base local habitual: `http://localhost:8080`. Los identificadores en rutas y cuerpos son UUID. La interfaz OpenAPI está configurada en `/swagger-ui/index.html`; su disponibilidad depende del arranque correcto.

## Operaciones

| Método y ruta | Cuerpo | Éxito |
|---|---|---|
| `POST /api/usuarios` | `name`, `email` | 201, usuario |
| `GET /api/usuarios/{id}` | — | 200, usuario |
| `POST /api/proyectos` | `name`, `description`, `ownerId` | 201, proyecto |
| `GET /api/proyectos/usuario/{ownerId}` | — | 200, lista de proyectos |
| `DELETE /api/proyectos/{id}` | — | 204, sin cuerpo |
| `POST /api/tareas` | `titulo`, `descripcion`, `projectId` | 201, tarea |
| `GET /api/tareas/{id}` | — | 200, tarea |
| `GET /api/tareas/proyecto/{projectId}` | — | 200, lista de tareas |
| `PUT /api/tareas/{id}` | `titulo`, `descripcion` | 200, tarea |
| `PATCH /api/tareas/{id}/estado` | `estado` | 200, tarea |
| `DELETE /api/tareas/{id}` | — | 204, sin cuerpo |

Los nombres y email de usuario, el nombre de proyecto y el título de tarea deben ser no vacíos; `ownerId` y `projectId` son obligatorios en sus creaciones. La descripción es opcional. `Email` comprueba que exista `@`, además de no estar vacío; no realiza una validación completa del formato. El PATCH convierte el texto con `TaskStatus.valueOf`: admite `PENDIENTE`, `EN_PROGRESO`, `HECHO` y `CANCELADO`, respetando mayúsculas.

Ejemplo de cuerpo de creación de tarea:

```json
{
  "titulo": "Preparar documentación",
  "descripcion": "Revisar los casos de uso",
  "projectId": "11111111-1111-4111-8111-111111111111"
}
```

Ejemplo de cambio de estado: `{"estado":"EN_PROGRESO"}`. Los UUID de ejemplo no garantizan que exista el recurso relacionado.

## Respuestas y errores

Un usuario contiene `id`, `name`, `email`; un proyecto, `id`, `name`, `description`, `ownerId`; y una tarea, `id`, `titulo`, `descripcion`, `status`, `projectId`, `assignedTo`.

`GlobalExceptionHandler` convierte `RecursoNoEncontradoException` en 404 y `IllegalArgumentException` en 400 con `timestamp`, `status`, `error` y `mensaje`. Los fallos de validación `@Valid` devuelven 400 con un mapa `errores` por campo. El servicio de cambio de estado usa una `RuntimeException` genérica para una tarea inexistente, por lo que no entra en el manejador específico de 404. El DTO de PATCH no lleva `@Valid` ni restricciones; no se debe asumir una respuesta uniforme para valores ausentes o nulos.

La creación de proyecto y tarea no comprueba la existencia del UUID relacionado. No se implementa autenticación ni autorización en los controladores y configuración revisados.
