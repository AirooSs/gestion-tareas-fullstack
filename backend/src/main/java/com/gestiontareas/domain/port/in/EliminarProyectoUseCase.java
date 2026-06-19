package com.gestiontareas.domain.port.in;

import com.gestiontareas.domain.model.project.ProjectId;

/**
 * Puerto de entrada para eliminar un proyecto.
 * Elimina también todas las tareas asociadas (borrado en cascada).
 */

public interface EliminarProyectoUseCase {

    void ejecutar(ProjectId id);
}
