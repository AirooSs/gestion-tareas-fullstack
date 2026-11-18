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
```

Adapta el entorno local a estos valores. No incluyas contraseñas en el repositorio. El perfil de desarrollo usa `spring.jpa.hibernate.ddl-auto=update`.

## Backend

Desde `backend/`:

```powershell
.\mvnw.cmd spring-boot:run
```

En Linux o macOS:

```bash
./mvnw spring-boot:run
```

La configuración habitual expone la API en `http://localhost:8080` y Swagger UI en `http://localhost:8080/swagger-ui/index.html`. Su disponibilidad debe comprobarse al arrancar la aplicación.

## Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. CORS solo permite ese origen para `/api/**`. Si Vite escoge otro puerto, ese origen no coincide con la configuración.

`App.jsx` usa el UUID fijo `5c3a541c-5a22-45e8-92d7-600f3adfcbfb` como propietario y consulta sus proyectos. La API de creación de usuarios genera UUID y la interfaz no permite elegirlo. Las entidades JPA actuales no declaran una clave foránea para `owner_id`; por ello no se debe asumir que la creación de proyectos valide la existencia del usuario. Para un entorno coherente con usuarios reales será necesario adaptar esa configuración o preparar datos apropiados; esto no se realiza automáticamente.

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
