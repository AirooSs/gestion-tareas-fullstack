-- Expansion only: old application instances may continue inserting without position.
ALTER TABLE tareas ADD COLUMN position integer;
ALTER TABLE proyectos ADD COLUMN board_version bigint NOT NULL DEFAULT 0;

WITH ranked AS (
    SELECT id, (row_number() OVER (
        PARTITION BY project_id, status ORDER BY lower(titulo), titulo, id
    ) - 1)::integer AS position
    FROM tareas
)
UPDATE tareas AS task SET position = ranked.position FROM ranked WHERE task.id = ranked.id;

CREATE INDEX tareas_project_status_position_idx ON tareas(project_id, status, position);
