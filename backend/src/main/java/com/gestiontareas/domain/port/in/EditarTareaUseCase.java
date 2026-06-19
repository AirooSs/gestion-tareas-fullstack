package com.gestiontareas.domain.port.in;

import com.gestiontareas.domain.model.task.Task;
import com.gestiontareas.domain.model.task.TaskId;

/**
 * Puerto de entrada para editar el título y descripción de una tarea.
 */

public interface EditarTareaUseCase {

    Task ejecutar(TaskId id, String nuevoTitulo, String nuevaDescripcion);
}