# Pruebas

[Inicio](../README.md) · [Puesta en marcha](getting-started.md)

![Estrategia de pruebas](diagrams/svg/testing.svg)

## Pruebas presentes

- **Dominio:** `EmailTest` comprueba la creación y varios valores inválidos; `TaskTest` cubre estado inicial, cambio de estado y asignación.
- **Servicios:** JUnit y Mockito comprueban creación de usuario, proyecto y tarea; consulta y cambio de estado de tarea; y eliminación de proyecto, incluido el orden de eliminación.
- **Integración:** Spring Boot Test y Testcontainers usan PostgreSQL `16-alpine` para comprobar carga del contexto, conexión, proxy transaccional y rollback al fallar la eliminación.

La prueba de rollback usa una base de datos real en contenedor y un espía que introduce el fallo. No se ha encontrado una suite de controladores HTTP ni una suite de frontend en el árbol de pruebas. No se dispone aquí de una medición de cobertura.

El perfil `test` configura `ddl-auto=create-drop`, desactiva Open Session in View y el reinicio de DevTools. Las clases con Testcontainers requieren Docker operativo.

## Ejecución

Desde `backend/`:

```powershell
.\mvnw.cmd clean test
```

En Linux o macOS:

```bash
./mvnw clean test
```

En la validación del 18 de noviembre de 2026 se ejecutó `.\mvnw.cmd clean test` con Java 21 y Docker: **25 pruebas, 0 fallos, 0 errores y 0 omitidas**. Las pruebas de integración usaron PostgreSQL `16-alpine` mediante Testcontainers. Maven finalizó con `BUILD SUCCESS`. Mockito mostró un aviso sobre la carga dinámica de su agente en futuras versiones del JDK.

En la misma validación, `npm run build` en `frontend/` terminó correctamente con Vite. Estos comandos generan archivos locales de compilación; un resultado anterior no garantiza el de ejecuciones futuras.

Las fuentes editables y exportaciones están disponibles en el [catálogo de diagramas](diagrams/README.md).
