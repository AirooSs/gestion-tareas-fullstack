# Puesta en marcha local

[Inicio](../README.md) · [Pruebas](testing.md)

## Requisitos y configuración

- Java 21 y PostgreSQL.
- Node.js y npm para el frontend.
- Docker en funcionamiento solo para las pruebas que utilizan Testcontainers.
- El wrapper de Maven incluido en `backend/`.

En PostgreSQL crea una base de datos llamada `gestiontareas`:

```sql
CREATE DATABASE gestiontareas;
```

El perfil predeterminado es `dev`. La configuración apunta a `jdbc:postgresql://localhost:5432/gestiontareas`, con usuario `postgres` y contraseña tomada de `DB_PASSWORD`. En PowerShell:

```powershell
$env:DB_PASSWORD = "tu_contraseña"
# Solo para una base nueva y aislada:
$env:FLYWAY_ENABLED = "true"
```

Para ejecutar la demo, usa una base local nueva y aislada y habilita Flyway como se muestra. El esquema existente sin historial Flyway necesita una revisión y un baseline explícito; no habilites automáticamente las migraciones sobre una base con datos. Adapta el entorno local a estos valores. No incluyas contraseñas en el repositorio. El perfil de desarrollo usa `spring.jpa.hibernate.ddl-auto=update`.

## Backend

Desde `backend/`:

```powershell
.\mvnw.cmd spring-boot:run
```

En Linux o macOS:

```bash
./mvnw spring-boot:run
```

La configuración habitual expone la API en `http://localhost:8080`. La documentación OpenAPI está deshabilitada por la política de seguridad de la demo.

## Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Por defecto, CORS permite ese origen para `/api/**`. Si Vite usa otro puerto, configura `CORS_ALLOWED_ORIGINS` en el backend. El frontend usa `VITE_API_URL` si está definida o `http://localhost:8080` en caso contrario.

La interfaz solicita una sesión demo y conserva su token en `sessionStorage`. Flyway está desactivado por defecto: para una base nueva y aislada, establece `FLYWAY_ENABLED=true` y usa `ddl-auto=validate`. No actives migraciones en una base existente sin revisar previamente el esquema y preparar un baseline explícito.

## Pruebas

Consulta [Pruebas](testing.md). Docker es necesario para las pruebas con PostgreSQL en contenedor. La instalación de dependencias y ejecución de pruebas modifican archivos locales y requieren conectividad o componentes disponibles.

## Neon PostgreSQL (perfil de producción)

Neon CLI enlaza este directorio con el proyecto y la rama seleccionados y guarda la conexión en `.env.local`, que no se debe publicar. `neon deploy` actualiza las variables locales; `DATABASE_URL` contiene datos confidenciales. El backend transforma esa URI en una conexión JDBC, usa el almacén de certificados de Java y verifica el certificado y el nombre del servidor (`sslmode=verify-full`). El navegador y el frontend no reciben estas credenciales.

El perfil `prod` valida el esquema existente y no crea ni actualiza tablas automáticamente. La base de datos debe contar previamente con las tablas compatibles `proyectos`, `tareas` y `usuarios`; una base sin ese esquema no arrancará. El perfil predeterminado `dev` sigue utilizando PostgreSQL local.

Para cargar únicamente `DATABASE_URL` en la sesión actual de PowerShell y arrancar el backend desde la raíz del repositorio:

```powershell
$linea = Get-Content -LiteralPath .env.local | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $linea) { throw 'Falta DATABASE_URL en .env.local' }
$env:DATABASE_URL = $linea.Substring('DATABASE_URL='.Length).Trim().Trim('"').Trim("'")
$env:SPRING_PROFILES_ACTIVE = 'prod'
Set-Location backend
.\mvnw.cmd spring-boot:run
```

En otros entornos, proporciona `DATABASE_URL` directamente mediante el gestor de secretos del despliegue y activa `SPRING_PROFILES_ACTIVE=prod`. Evita mostrar, compartir o guardar la URI en archivos versionados. El archivo `.neon` también permanece local y está ignorado por Git.

Para preparar Render y Vercel, consulta [Despliegue](deployment.md).
