package com.gestiontareas.application.service;

import com.gestiontareas.domain.exception.BoardConflictException;
import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.*;
import com.gestiontareas.domain.port.out.BoardVersionRepository;
import com.gestiontareas.domain.port.out.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskOrderingServiceTest {
    @Test void noOpDoesNotWriteOrIncrementVersion() {
        var repository = mock(TaskRepository.class);
        var versions = mock(BoardVersionRepository.class);
        var project = ProjectId.of(UUID.randomUUID());
        var a = new Task(TaskId.generate(), "A", "", project);
        var b = new Task(TaskId.generate(), "B", "", project);
        a.cambiarPosicion(0); b.cambiarPosicion(1);
        when(repository.findByProjectId(project)).thenReturn(List.of(a, b));
        when(versions.getVersion(project)).thenReturn(2L);
        var service = new TaskOrderingService(repository, versions);
        var board = service.move(project, b.getId(), TaskStatus.PENDIENTE, null, 2);
        assertEquals(2, board.version());
        verify(repository, never()).save(any());
        verify(versions, never()).incrementVersion(any());
    }

    @Test void staleVersionDoesNotWrite() {
        var repository = mock(TaskRepository.class);
        var versions = mock(BoardVersionRepository.class);
        var project = ProjectId.of(UUID.randomUUID());
        when(versions.getVersion(project)).thenReturn(3L);
        var service = new TaskOrderingService(repository, versions);
        assertThrows(BoardConflictException.class, () -> service.move(project, TaskId.generate(), TaskStatus.HECHO, null, 2));
        verifyNoInteractions(repository);
        verify(versions, never()).incrementVersion(any());
    }
}
