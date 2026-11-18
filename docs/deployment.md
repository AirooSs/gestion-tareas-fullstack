# Despliegue: Render, Vercel y Neon

[Inicio](../README.md) · [Configuración local](getting-started.md)

La aplicación se puede preparar con el backend en Render, el frontend en Vercel y PostgreSQL en Neon. Estos pasos no despliegan ni crean servicios por sí solos. La demo crea una sesión anónima temporal por pestaña. La API exige tokens Bearer y comprueba la propiedad de los recursos. No utiliza cuentas registradas.

## Base de datos para la demo

Se recomienda un proyecto Neon independiente con una base vacía y credenciales exclusivas para la demo. Así se separan los datos y los límites de uso del esquema existente. En la inspección de solo lectura del 18 de noviembre de 2026, la base Neon anterior contenía las tablas `usuarios`, `proyectos` y `tareas`, pero no `demo_sessions` ni `flyway_schema_history`. La migración `V1` crea las tablas originales y fallaría sobre ese esquema; no se debe resolver con baseline automático sin revisión.

La base Neon independiente para la demo se comprobó vacía y, con autorización expresa, se aplicaron y validaron las migraciones `V1` y `V2`. La base anterior no se modificó. Flyway sigue desactivado por defecto (`FLYWAY_ENABLED=false`). Para preparar otra base, comprueba primero su contenido, solicita autorización antes de migrarla y verifica después el historial de Flyway.

## Backend en Render

Crea un **Web Service Docker** con el directorio raíz `backend`, el archivo `Dockerfile` de ese directorio y el plan Free. Configura el health check en `/health` y estas variables de entorno en Render:

| Variable | Valor o función |
|---|---|
| `DATABASE_URL` | URI privada de Neon, incluida la contraseña. Configúrala como secreto en Render; no la incluyas en el repositorio ni en Vercel. |
| `SPRING_PROFILES_ACTIVE` | `prod`. Es también el valor predeterminado de la imagen. |
| `CORS_ALLOWED_ORIGINS` | Lista separada por comas de orígenes HTTPS exactos del frontend, por ejemplo `https://demo.example.com`; sin rutas ni barras finales. Si está vacía, `prod` no permite orígenes de navegador. |
| `PORT` | Render proporciona el puerto; el backend lo escucha en todas las interfaces. Fuera de Render se usa `8080` por defecto. |
| `JAVA_TOOL_OPTIONS` | Opcional: sustituye los parámetros de JVM de la imagen solo tras comprobar el consumo. |

El perfil `prod` verifica TLS y el esquema existente en Neon (`ddl-auto=validate`); no crea ni modifica tablas. El archivo `.dockerignore` excluye variables de entorno, compilaciones y archivos locales del contexto de imagen. La imagen usa Java 21, un usuario sin privilegios y limita la memoria del heap al 50 % del límite disponible, además de limitar metaspace y caché de código. Estas opciones dejan espacio para memoria nativa, aunque el consumo real depende de la carga y debe vigilarse.

`GET /health` devuelve `{"status":"UP"}` mientras la aplicación responde. No consulta la base de datos: una respuesta correcta no garantiza que Neon esté disponible.

## Frontend en Vercel

Importa el repositorio con `frontend` como directorio raíz y el preset Vite. El comando de compilación es `npm run build` y el directorio de salida es `dist`. Configura en Vercel la variable de compilación `VITE_API_URL` con el origen HTTPS público del backend de Render, sin `/api`, por ejemplo `https://backend.example.com`. Es pública en el código distribuido al navegador: nunca incluyas contraseñas ni otras credenciales. Tras cambiarla, vuelve a desplegar el frontend. En desarrollo, si no se define, se usa `http://localhost:8080`.

Incluye el origen concreto de Vercel en `CORS_ALLOWED_ORIGINS`; si utilizas previsualizaciones con dominios distintos, autoriza explícitamente cada origen que deba funcionar. CORS restringe lecturas desde navegadores y no es un mecanismo de autenticación.

## Protección de la demo

El token aleatorio se almacena como hash en PostgreSQL y en `sessionStorage` del navegador; no es una cuenta de usuario. La sesión caduca tras 24 horas por defecto y solo permite acceder a sus proyectos y tareas. Las rutas de usuarios y OpenAPI están deshabilitadas. La limpieza borra lotes de sesiones caducadas mientras el backend está activo; Render puede detenerlo, por lo que el borrado físico no tiene una hora garantizada. La caducidad de acceso se comprueba en cada petición.

El limitador en memoria restringe peticiones por dirección remota y sesión, y establece una cuota más estricta para crear sesiones; no es distribuido y se reinicia con la instancia. Detrás de proxies varios usuarios pueden compartir una dirección y sufrir limitaciones comunes. No confíes en cabeceras de IP del cliente sin configurar proxies de confianza. Los límites reducen el abuso, pero no evitan ataques distribuidos ni agotan el riesgo de costes o indisponibilidad. Usa datos ficticios, una base Neon aislada y monitoriza el uso.

La CSP del frontend está en `frontend/vercel.json`; su `connect-src https://*.onrender.com` permite subdominios de Render para facilitar la configuración, de modo que conviene sustituirlo por el origen exacto de la API antes de publicar. El token en `sessionStorage` puede ser robado si se ejecuta JavaScript malicioso en la página. CORS no protege contra llamadas directas.

Las migraciones Flyway están deshabilitadas por defecto (`FLYWAY_ENABLED=false`). En una base de datos nueva y aislada se puede habilitar `FLYWAY_ENABLED=true`; para una base existente sin historial de Flyway hay que revisar el esquema y preparar el baseline manualmente antes de habilitarlas. No ejecutar migraciones en producción sin autorización. La base aislada debe estar preparada antes de arrancar el perfil `prod`.

Variables opcionales del backend: `DEMO_SESSION_HOURS` (24), `DEMO_MAX_SESSIONS` (1000), `DEMO_MAX_PROJECTS` (5), `DEMO_MAX_TASKS` (25), `DEMO_RATE_PER_MINUTE` (120) y `DEMO_SESSION_RATE_PER_MINUTE` (5). La limpieza se configura con las propiedades `demo.cleanup-interval-ms` y `demo.cleanup-initial-delay-ms`.

Render Free puede suspender servicios inactivos y tardar en reanudarlos; consulta sus límites vigentes antes de publicar. No se requiere ni se configura ningún plan de pago en estos pasos.
