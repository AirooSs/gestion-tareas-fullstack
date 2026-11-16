
package com.gestiontareas.application.service;

import com.gestiontareas.domain.model.project.Project;
import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.Task;
import com.gestiontareas.domain.model.task.TaskId;
import com.gestiontareas.domain.port.out.ProjectRepository;
import com.gestiontareas.domain.port.out.TaskRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EliminarProyectoServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    private EliminarProyectoService service;

    @BeforeEach
    void setUp() {
        service = new EliminarProyectoService(
            projectRepository,
            taskRepository
        );
    }

    // TEST 1: Eliminar un proyecto sin tareas
    @Test
    void deberiaEliminarProyectoSinTareas() {

        // ARRANGE
        ProjectId id = ProjectId.of(UUID.randomUUID());
        Project proyecto = mock(Project.class);

        when(projectRepository.findById(id))
            .thenReturn(Optional.of(proyecto));

        when(taskRepository.findByProjectId(id))
            .thenReturn(List.of());

        // ACT
        service.ejecutar(id);

        // ASSERT
        InOrder orden = inOrder(
            projectRepository,
            taskRepository
        );

        orden.verify(projectRepository).findById(id);
        orden.verify(taskRepository).findByProjectId(id);
        orden.verify(projectRepository).deleteById(id);
    }

    // TEST 2: Eliminar un proyecto con tareas
    @Test
    void deberiaEliminarPrimeroLasTareasYDespuesElProyecto() {

        // ARRANGE
        ProjectId proyectoId = ProjectId.of(UUID.randomUUID());
        Project proyecto = mock(Project.class);

        Task tarea1 = new Task(
            TaskId.generate(),
            "Diseñar interfaz",
            "Crear componentes React",
            proyectoId
        );

        Task tarea2 = new Task(
            TaskId.generate(),
            "Desarrollar API",
            "Implementar endpoints REST",
            proyectoId
        );

        when(projectRepository.findById(proyectoId))
            .thenReturn(Optional.of(proyecto));

        when(taskRepository.findByProjectId(proyectoId))
            .thenReturn(List.of(tarea1, tarea2));

        // ACT
        service.ejecutar(proyectoId);

        // ASSERT
        InOrder orden = inOrder(
            projectRepository,
            taskRepository
        );

        orden.verify(projectRepository)
            .findById(proyectoId);

        orden.verify(taskRepository)
            .findByProjectId(proyectoId);

        orden.verify(taskRepository)
            .deleteById(tarea1.getId());

        orden.verify(taskRepository)
            .deleteById(tarea2.getId());

        orden.verify(projectRepository)
            .deleteById(proyectoId);
    }
}
