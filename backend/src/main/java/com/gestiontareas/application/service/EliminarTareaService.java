package com.gestiontareas.application.service;

import com.gestiontareas.domain.exception.RecursoNoEncontradoException;
import com.gestiontareas.domain.model.task.TaskId;
import com.gestiontareas.domain.port.in.EliminarTareaUseCase;
import com.gestiontareas.domain.port.out.TaskRepository;

/**
 * Implementación del caso de uso EliminarTareaUseCase.
 * Comprueba que la tarea existe antes de eliminarla.
 */

public class EliminarTareaService implements EliminarTareaUseCase {

    private final TaskRepository taskRepository;

    public EliminarTareaService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void ejecutar(TaskId id) {
        taskRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Tarea no encontrada con id: " + id.value()));

        taskRepository.deleteById(id);
    }
}
