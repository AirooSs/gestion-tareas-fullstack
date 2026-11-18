CREATE TABLE usuarios (id uuid NOT NULL PRIMARY KEY, email varchar(255) NOT NULL UNIQUE, name varchar(255) NOT NULL);
CREATE TABLE proyectos (id uuid NOT NULL PRIMARY KEY, owner_id uuid NOT NULL, description varchar(255), name varchar(255) NOT NULL);
CREATE TABLE tareas (assigned_to uuid, id uuid NOT NULL PRIMARY KEY, project_id uuid NOT NULL, descripcion varchar(255), status varchar(255) NOT NULL, titulo varchar(255) NOT NULL);
CREATE INDEX proyectos_owner_idx ON proyectos(owner_id);
CREATE INDEX tareas_project_idx ON tareas(project_id);
