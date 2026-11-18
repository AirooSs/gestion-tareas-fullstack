# Diagramas

[Inicio](../../README.md)

Los SVG y PNG se han generado directamente desde las fuentes Mermaid con Mermaid CLI 11.12.0. Las fuentes incluyen el tema oscuro; los PNG se generaron con escala 6 y sus dimensiones dependen del contenido.

| Tema | Mermaid | SVG | PNG |
|---|---|---|---|
| Arquitectura general | [Fuente](sources/full-stack.mmd) | [SVG](svg/full-stack.svg) | [PNG](png/full-stack.png) |
| Arquitectura hexagonal | [Fuente](sources/hexagonal.mmd) | [SVG](svg/hexagonal.svg) | [PNG](png/hexagonal.png) |
| Dirección de dependencias | [Fuente](sources/dependencies.mmd) | [SVG](svg/dependencies.svg) | [PNG](png/dependencies.png) |
| Modelo entidad-relación | [Fuente](sources/data-model.mmd) | [SVG](svg/data-model.svg) | [PNG](png/data-model.png) |
| Casos de uso | [Fuente](sources/use-cases.mmd) | [SVG](svg/use-cases.svg) | [PNG](png/use-cases.png) |
| Creación de una tarea | [Fuente](sources/create-task.mmd) | [SVG](svg/create-task.svg) | [PNG](png/create-task.png) |
| Eliminación de un proyecto | [Fuente](sources/delete-project.mmd) | [SVG](svg/delete-project.svg) | [PNG](png/delete-project.png) |
| Transacciones y rollback | [Fuente](sources/rollback.mmd) | [SVG](svg/rollback.svg) | [PNG](png/rollback.png) |
| Estrategia de pruebas | [Fuente](sources/testing.mmd) | [SVG](svg/testing.svg) | [PNG](png/testing.png) |

Las asociaciones del modelo son lógicas y no afirman la existencia de claves foráneas físicas. Al modificar una fuente, regenera sus dos exportaciones con Mermaid CLI; usa fondo `#071426` y escala 6 para mantener el aspecto de las imágenes actuales.
