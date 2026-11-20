package com.gestiontareas.domain.port.in;

import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.*;

public interface TaskOrderingUseCase {
    TaskBoard board(ProjectId project);
    TaskBoard move(ProjectId project, TaskId task, TaskStatus status, TaskId before, long expectedVersion);
    Task appendNew(ProjectId project, Task task);
    Task changeStatus(ProjectId project, TaskId task, TaskStatus status);
    void afterDelete(ProjectId project);
}
