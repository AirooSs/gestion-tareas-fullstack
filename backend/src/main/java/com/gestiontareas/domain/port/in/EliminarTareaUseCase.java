package com.gestiontareas.domain.port.in;

import com.gestiontareas.domain.model.task.TaskId;

/**
 * Puerto de entrada para eliminar una tarea por su ID.
 */

public interface EliminarTareaUseCase {

    void ejecutar(TaskId id);
}