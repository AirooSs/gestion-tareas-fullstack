# Validación aislada de la migración V3

Esta guía prepara una comprobación futura. No crea ramas ni ejecuta migraciones. La V3 añade columnas y un índice y rellena `position`; modifica ese campo nuevo en las filas existentes, pero no borra filas ni cambia los valores previos. El frontend publicado sigue usando los endpoints anteriores.

## Antes de conectar

1. Solicitar una rama **aislada**, identificada por proyecto y branch ID, con un endpoint propio y un esquema de prueba V2. Usar únicamente datos ficticios. Una rama clonada con datos reales no cumple este requisito; una rama sin datos necesita preparar por separado el esquema y fixtures ficticios.
2. En la consola de Neon, comprobar el proyecto, el ID y nombre de la rama, y asociar su endpoint de lectura/escritura **directo** a esa rama. Comparar el hostname completo con el de la conexión que se va a utilizar. No basta con que el nombre de la base sea distinto ni con `current_database()`; ramas diferentes pueden tener el mismo nombre de base. Si no se puede verificar la correspondencia en el plano de control, detenerse.
3. Comprobar que el endpoint no es el de producción ni su variante pooled; no inferir el aislamiento solo a partir de que no aparezca `-pooler`. Usar TLS con verificación de certificado y un rol de prueba limitado. No registrar ni mostrar cadenas de conexión, contraseñas o tokens. Desactivar transcripciones, trazas y comandos con eco de variables sensibles.
4. Confirmar la versión compatible de Flyway CLI y su soporte PostgreSQL. El repositorio usa Flyway como dependencia Java; **no configura el plugin Maven ni incluye el ejecutable CLI**. Localizar los SQL en `backend/src/main/resources/db/migration`. Trabajar en una terminal efímera sin archivos de credenciales, sin pasar secretos por argumentos y sin activar `FLYWAY_ENABLED` en producción.

## Inspección y ejecución en la rama aislada

La CLI de Flyway puede recibir `FLYWAY_URL` (JDBC sin usuario ni contraseña en la URL), `FLYWAY_USER` y `FLYWAY_PASSWORD` mediante variables del proceso. Introducir los secretos con un mecanismo seguro y sin eco; no copiarlos al historial ni guardarlos en archivos. Verificar que no haya configuraciones heredadas de Flyway que cambien URL, ubicaciones, esquema o destino. No usar `-X`, transcripciones ni redirecciones a logs que puedan contener credenciales.

Desde la carpeta `backend`, con la CLI instalada y las variables de la rama aislada ya configuradas:

```powershell
flyway -locations=filesystem:src/main/resources/db/migration -target=3 info
```

Comprobar que el historial corresponde al esquema de prueba, que V1 y V2 están aplicadas correctamente y que V3 está pendiente. Si el historial no existe, hay diferencias de checksum, migraciones inesperadas, fallos o dudas sobre el endpoint, **parar**; no ejecutar baseline ni repair para forzar el resultado. `validate` puede considerar una migración pendiente como error según la configuración de Flyway: interpretar su resultado y no modificar reglas de validación para ocultarlo.

Solo con autorización expresa para escribir en esa rama y tras comprobar de nuevo el endpoint:

```powershell
flyway -locations=filesystem:src/main/resources/db/migration -target=3 migrate
flyway -locations=filesystem:src/main/resources/db/migration -target=3 info
flyway -locations=filesystem:src/main/resources/db/migration -target=3 validate
```

Al terminar, retirar las variables sensibles del proceso y cerrar la terminal. No guardar la salida sin revisarla y eliminar posibles datos sensibles antes de compartirla.

## Comprobaciones posteriores

- Comparar antes y después las filas y valores originales de `proyectos`, `tareas` y `demo_sessions` con los fixtures conocidos. V3 solo debe añadir valores en las columnas nuevas; los totales y campos originales deben conservarse.
- Comprobar que V3 aparece aplicada correctamente y que cada proyecto nuevo o existente tiene `board_version = 0` inicialmente. Antes de permitir escrituras antiguas, verificar posiciones no nulas y consecutivas por `(project_id, status)`, con `0` como primer valor. Comprobar títulos repetidos y empate resuelto por ID.
- Comprobar que una escritura con el esquema anterior todavía puede insertar una tarea sin `position`. No usar esa compatibilidad como prueba de unicidad: esa escritura puede dejar nulos o duplicados y no incrementa la versión.
- Con posiciones nulas o repetidas, la lectura del tablero ordena por posición (nulos al final), título sin distinguir mayúsculas e ID, y devuelve posiciones consecutivas calculadas en memoria. Esa lectura no corrige la base. Un movimiento efectivo, creación, eliminación o cambio de estado efectivo normaliza las posiciones del proyecto; un movimiento sin cambios no escribe ni las normaliza. La detección de versiones tampoco identifica escrituras realizadas por una instancia antigua.
- Probar el backend nuevo contra esta rama con Flyway desactivado y `ddl-auto=validate`, endpoints antiguos y nuevos, autenticación, aislamiento, conflicto 409 y dos movimientos concurrentes. Usar solo sesiones y tareas ficticias de la rama. Probar también el frontend publicado contra un backend aislado configurado para la rama, sin cambiar el frontend de producción.

En la rama de prueba, antes de permitir nuevas escrituras, estas consultas de solo lectura deben devolver cero. La primera verifica la asignación inicial exacta; no debe utilizarse después de reordenar tareas, pues entonces el orden manual puede diferir legítimamente:

```sql
WITH expected AS (
  SELECT id, row_number() OVER (
    PARTITION BY project_id, status ORDER BY lower(titulo), titulo, id
  ) - 1 AS expected_position
  FROM tareas
)
SELECT count(*) AS posiciones_iniciales_incorrectas
FROM tareas t JOIN expected e ON e.id = t.id
WHERE t.position IS DISTINCT FROM e.expected_position;

WITH groups AS (
  SELECT project_id, status, count(*) AS total,
         count(position) AS populated, count(DISTINCT position) AS distinct_positions,
         min(position) AS first_position, max(position) AS last_position
  FROM tareas GROUP BY project_id, status
)
SELECT count(*) AS grupos_inconsistentes
FROM groups
WHERE populated <> total OR distinct_positions <> total
   OR first_position <> 0 OR last_position <> total - 1;

SELECT count(*) AS versiones_iniciales_incorrectas
FROM proyectos WHERE board_version IS DISTINCT FROM 0;
```

## Si falla

Detener nuevas escrituras y no desplegar el backend nuevo. Confirmar nuevamente proyecto, rama y endpoint; examinar `flyway info`, `flyway_schema_history` y el esquema, sin incluir secretos en el diagnóstico. En PostgreSQL, Flyway suele ejecutar una migración transaccional en una transacción y revertirla si falla, pero hay que **comprobar** el historial y el esquema: un proceso interrumpido o una configuración distinta pueden requerir otro análisis.

No ejecutar `repair`, `baseline`, `clean`, borrar entradas del historial ni relanzar a ciegas. Investigar la causa y contrastar el estado con el respaldo o la rama de prueba. Cualquier limpieza, restauración, `repair` o nueva ejecución requiere un plan revisado y autorización explícita; `repair` no revierte los cambios del esquema.

## Secuencia futura de producción

Tras validar la rama aislada y obtener autorización independiente: comprobar respaldo y recuperación, verificar el destino de producción por canales seguros, aplicar V3 de forma controlada y comprobarla; después desplegar el backend compatible y verificar los endpoints antiguos con el frontend publicado. Para garantizar orden y versión durante el cambio hay que evitar escrituras de instancias antiguas durante el corte, o aceptar explícitamente la ventana de inconsistencias y normalizar una vez retiradas. Las restricciones estrictas y el frontend de orden manual son fases posteriores, con sus propias pruebas y autorización. Definir también un retroceso compatible antes del corte: no se debe asumir que revertir el backend después de restricciones futuras permitirá escrituras antiguas.
