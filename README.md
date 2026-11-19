# Gestión de Tareas · Full Stack

Aplicación de gestión de proyectos y tareas con una interfaz React y una API REST en Java. El backend organiza el modelo, los casos de uso y los adaptadores siguiendo una arquitectura de puertos y adaptadores con elementos de DDD.

**Java 21 · Spring Boot 4.0.9 · PostgreSQL / Neon · React 19 · Vite 8**

![Arquitectura general](docs/diagrams/svg/full-stack.svg)

## Qué permite hacer

- Iniciar una sesión demo anónima vacía.
- Crear, listar y eliminar proyectos; gestionar las tareas de cada proyecto.
- Crear, consultar, editar, eliminar y cambiar el estado de tareas.
- Buscar tareas por título y consultar contadores del proyecto seleccionado en la interfaz.
- Consultar la documentación OpenAPI configurada en el backend.

La demo crea una sesión anónima temporal vacía por visitante; cada sesión solo puede acceder a sus proyectos y tareas. La asignación de tareas aparece en el modelo, pero no existe un caso de uso ni endpoint de asignación en el código actual. La API protege las operaciones de la demo mediante tokens y comprobaciones de propiedad.

## Capturas

**Panel del proyecto** · Navegación por proyectos, resumen y tareas.

![Panel del proyecto con la barra lateral, las estadísticas y las tareas](docs/screenshots/project-dashboard.png)

<details>
<summary>Ver creación y eliminación de proyectos</summary>

**Crear un proyecto**

<img src="docs/screenshots/project-creation.png" alt="Formulario de creación de proyecto en la barra lateral" width="260">

**Confirmar la eliminación**

![Diálogo que confirma la eliminación de un proyecto y sus tareas](docs/screenshots/project-delete-confirmation.png)

</details>

## Inicio rápido

Se necesitan Java 21, PostgreSQL local o una base Neon preparada, Node.js y npm. Docker es necesario para las pruebas que usan Testcontainers.

Para ejecutar con PostgreSQL local:

1. Crear una base local nueva `gestiontareas`, establecer `DB_PASSWORD` y habilitar `FLYWAY_ENABLED=true` para aplicar las migraciones en esa base aislada.
2. Desde `backend/`, ejecutar `./mvnw spring-boot:run` o, en Windows, `.\mvnw.cmd spring-boot:run`.
3. Desde `frontend/`, ejecutar `npm install` y después `npm run dev`.
4. Abrir `http://localhost:5173`. La API se configura en `http://localhost:8080`.

Flyway está desactivado por defecto y no debe habilitarse en una base existente sin revisar su esquema y su baseline. El perfil `dev` usa PostgreSQL local; el perfil `prod` utiliza `DATABASE_URL` de Neon con TLS y valida el esquema existente sin modificarlo. La configuración de Neon y los pasos de arranque están en [Puesta en marcha](docs/getting-started.md).

La validación del backend incluye pruebas de seguridad y de integración; consulta [Pruebas](docs/testing.md) para conocer el resultado y sus condiciones.

Consulta [Puesta en marcha](docs/getting-started.md) antes de utilizar el frontend: contiene información sobre sesiones, configuración y pruebas.

## Documentación técnica

- [Arquitectura y DDD](docs/architecture.md)
- [Modelo de datos](docs/data-model.md)
- [Casos de uso](docs/use-cases.md)
- [API REST](docs/rest-api.md)
- [Transacciones y rollback](docs/transactions.md)
- [Pruebas](docs/testing.md)
- [Frontend](docs/frontend.md)
- [Puesta en marcha](docs/getting-started.md)
- [Despliegue en Render y Vercel](docs/deployment.md)
- [Catálogo de diagramas](docs/diagrams/README.md)

## Evolución posible

Entre las mejoras pendientes están la autenticación de usuarios registrados, la configuración externa del usuario y de la URL de API, el tratamiento consistente de errores, la integridad referencial y la ampliación de pruebas. Son propuestas, no funcionalidades existentes.

## Autor

**Francisco José Soria Navarrete** · [Portfolio](https://fransoria-portfolio.vercel.app/) · [GitHub](https://github.com/AirooSs) · [LinkedIn](https://www.linkedin.com/in/fran-soria-nav/)

Proyecto relacionado: [Gestión de tareas Hexagonal](https://github.com/AirooSs/Gestion-tareas-hexagonal).
