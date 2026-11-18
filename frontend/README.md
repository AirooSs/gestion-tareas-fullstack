# Frontend · Gestión de Tareas

Interfaz React 19 con Vite 8 y Bootstrap 5 para gestionar proyectos y tareas mediante la API REST. El estado y las peticiones se coordinan en `src/App.jsx`.

Desde este directorio:

```bash
npm install
npm run dev
```

La dirección habitual es `http://localhost:5173`; la API usa `VITE_API_URL` o `http://localhost:8080` por defecto y cada pestaña usa una sesión demo temporal sin registro. Lee [Puesta en marcha](../docs/getting-started.md) para conocer esta limitación y [Frontend](../docs/frontend.md) para la descripción de componentes y comportamiento.

El backend puede usar PostgreSQL local (`dev`) o Neon (`prod`); la conexión y sus credenciales permanecen en el backend.

Otros comandos disponibles: `npm run build`, `npm run lint` y `npm run preview`. No hay un comando de pruebas de frontend declarado en `package.json`.
