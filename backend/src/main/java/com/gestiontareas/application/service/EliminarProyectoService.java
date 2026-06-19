package com.gestiontareas.application.service;

import com.gestiontareas.domain.exception.RecursoNoEncontradoException;
import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.Task;
import com.gestiontareas.domain.port.in.EliminarProyectoUseCase;
import com.gestiontareas.domain.port.out.ProjectRepository;
import com.gestiontareas.domain.port.out.TaskRepository;

import java.util.List;

/**
 * Implementación del caso de uso EliminarProyectoUseCase.
 * Borra primero todas las tareas del proyecto y después el proyecto en sí,
 * para mantener la integridad de los datos (borrado en cascada gestionado
 * desde la capa de aplicación, no desde la base de datos).
 */

public class EliminarProyectoService implements EliminarProyectoUseCase {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public EliminarProyectoService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void ejecutar(ProjectId id) {
        projectRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto no encontrado con id: " + id.value()));

        List<Task> tareasDelProyecto = taskRepository.findByProjectId(id);
        for (Task tarea : tareasDelProyecto) {
            taskRepository.deleteById(tarea.getId());
        }

        projectRepository.deleteById(id);
    }
}
