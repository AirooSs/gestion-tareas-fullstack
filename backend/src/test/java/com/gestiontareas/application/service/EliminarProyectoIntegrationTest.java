
package com.gestiontareas.application.service;

import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.TaskId;
import com.gestiontareas.domain.port.in.EliminarProyectoUseCase;
import com.gestiontareas.infrastructure.persistence.JpaTaskRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.annotation.DirtiesContext;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EliminarProyectoIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EliminarProyectoUseCase eliminarProyectoUseCase;

    @MockitoSpyBean
    private JpaTaskRepository taskRepository;

    private UUID proyectoId;
    private UUID tarea1Id;
    private UUID tarea2Id;

    @BeforeEach
    void prepararDatos() {

        proyectoId = UUID.randomUUID();
        tarea1Id = UUID.randomUUID();
        tarea2Id = UUID.randomUUID();

        UUID usuarioId = UUID.randomUUID();

        // Crear un proyecto de prueba
        jdbcTemplate.update(
            """
            INSERT INTO proyectos
            (id, name, description, owner_id)
            VALUES (?, ?, ?, ?)
            """,
            proyectoId,
            "Proyecto de prueba",
            "Prueba de rollback",
            usuarioId
        );

        // Crear dos tareas asociadas al proyecto
        jdbcTemplate.update(
            """
            INSERT INTO tareas
            (id, titulo, descripcion, status, project_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            tarea1Id,
            "Primera tarea",
            "Tarea de prueba 1",
            "PENDIENTE",
            proyectoId
        );

        jdbcTemplate.update(
            """
            INSERT INTO tareas
            (id, titulo, descripcion, status, project_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            tarea2Id,
            "Segunda tarea",
            "Tarea de prueba 2",
            "PENDIENTE",
            proyectoId
        );
    }

    @Test
    void deberiaRestaurarTodoSiFallaLaEliminacion() {

        AtomicInteger eliminaciones = new AtomicInteger();

        // Interceptar la eliminación de tareas.
        // La primera se ejecuta realmente.
        // La segunda provoca una excepción.
        doAnswer(invocation -> {

            int numero = eliminaciones.incrementAndGet();

            if (numero == 2) {
                throw new RuntimeException(
                    "Error simulado al eliminar la segunda tarea"
                );
            }

            return invocation.callRealMethod();

        }).when(taskRepository).deleteById(any(TaskId.class));

        // El caso de uso debe propagar la excepción
        RuntimeException error = assertThrows(
            RuntimeException.class,
            () -> eliminarProyectoUseCase.ejecutar(
                ProjectId.of(proyectoId)
            )
        );

        assertEquals(
            "Error simulado al eliminar la segunda tarea",
            error.getMessage()
        );

        assertEquals(2, eliminaciones.get());

        // Consultar directamente PostgreSQL
        Integer proyectosRestantes = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM proyectos WHERE id = ?",
            Integer.class,
            proyectoId
        );

        Integer tareasRestantes = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tareas WHERE project_id = ?",
            Integer.class,
            proyectoId
        );

        // El rollback debe conservar todos los registros
        assertEquals(1, proyectosRestantes);
        assertEquals(2, tareasRestantes);

        System.out.println(
            "ROLLBACK CORRECTO: proyecto y tareas conservados"
        );
    }

    @AfterEach
    void limpiarDatos() {

        jdbcTemplate.update(
            "DELETE FROM tareas WHERE project_id = ?",
            proyectoId
        );

        jdbcTemplate.update(
            "DELETE FROM proyectos WHERE id = ?",
            proyectoId
        );
    }
}
