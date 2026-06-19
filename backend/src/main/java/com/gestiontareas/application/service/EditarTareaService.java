package com.gestiontareas.application.service;

import com.gestiontareas.domain.exception.RecursoNoEncontradoException;
import com.gestiontareas.domain.model.task.Task;
import com.gestiontareas.domain.model.task.TaskId;
import com.gestiontareas.domain.port.in.EditarTareaUseCase;
import com.gestiontareas.domain.port.out.TaskRepository;

/**
 * Implementación del caso de uso EditarTareaUseCase.
 * Recupera la tarea, delega la edición en la propia entidad
 * y la vuelve a persistir.
 */

public class EditarTareaService implements EditarTareaUseCase {

    private final TaskRepository taskRepository;

    public EditarTareaService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public Task ejecutar(TaskId id, String nuevoTitulo, String nuevaDescripcion) {
        Task tarea = taskRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Tarea no encontrada con id: " + id.value()));

        tarea.editar(nuevoTitulo, nuevaDescripcion);

        return taskRepository.save(tarea);
    }
}