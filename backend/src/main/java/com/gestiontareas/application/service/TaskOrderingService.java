package com.gestiontareas.application.service;

import com.gestiontareas.domain.exception.BoardConflictException;
import com.gestiontareas.domain.exception.DemoAccessException;
import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.*;
import com.gestiontareas.domain.port.in.TaskOrderingUseCase;
import com.gestiontareas.domain.port.out.BoardVersionRepository;
import com.gestiontareas.domain.port.out.TaskRepository;
import java.util.*;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Called within the owning project's locked transaction by the demo service. */
@Transactional(propagation = Propagation.MANDATORY)
public class TaskOrderingService implements TaskOrderingUseCase {
    private final TaskRepository tasks;
    private final BoardVersionRepository versions;

    public TaskOrderingService(TaskRepository tasks, BoardVersionRepository versions) {
        this.tasks = tasks;
        this.versions = versions;
    }

    private record Original(TaskStatus status, Integer position) {}

    private List<Task> load(ProjectId project) {
        var list = new ArrayList<>(tasks.findByProjectId(project));
        list.sort(Comparator.comparing(Task::getStatus)
                .thenComparing(Task::getPosition, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Task::getTitle, String.CASE_INSENSITIVE_ORDER)
                .thenComparing(task -> task.getId().value()));
        return list;
    }

    private Map<TaskId, Original> originals(List<Task> list) {
        var result = new HashMap<TaskId, Original>();
        for (Task task : list) result.put(task.getId(), new Original(task.getStatus(), task.getPosition()));
        return result;
    }

    private void assignPositions(List<Task> list) {
        var counts = new EnumMap<TaskStatus, Integer>(TaskStatus.class);
        for (Task task : list) {
            int position = counts.getOrDefault(task.getStatus(), 0);
            task.cambiarPosicion(position);
            counts.put(task.getStatus(), position + 1);
        }
    }

    private void saveChanges(List<Task> list, Map<TaskId, Original> before) {
        for (Task task : list) {
            Original old = before.get(task.getId());
            if (old == null || old.status() != task.getStatus() || !Objects.equals(old.position(), task.getPosition())) tasks.save(task);
        }
    }

    private Task find(List<Task> list, TaskId id) {
        return list.stream().filter(task -> task.getId().equals(id)).findFirst()
                .orElseThrow(() -> new DemoAccessException(DemoAccessException.Reason.NOT_FOUND));
    }

    @Override public TaskBoard board(ProjectId project) {
        List<Task> list = load(project);
        assignPositions(list);
        return new TaskBoard(versions.getVersion(project), list);
    }

    @Override public Task appendNew(ProjectId project, Task task) {
        List<Task> list = load(project);
        Map<TaskId, Original> before = originals(list);
        list.removeIf(item -> item.getId().equals(task.getId()));
        list.add(task);
        assignPositions(list);
        saveChanges(list, before);
        versions.incrementVersion(project);
        return task;
    }

    @Override public Task changeStatus(ProjectId project, TaskId id, TaskStatus status) {
        List<Task> list = load(project);
        Task task = find(list, id);
        if (task.getStatus() == status) return task;
        Map<TaskId, Original> before = originals(list);
        list.remove(task);
        task.cambiarEstado(status);
        list.add(task);
        assignPositions(list);
        saveChanges(list, before);
        versions.incrementVersion(project);
        return task;
    }

    @Override public void afterDelete(ProjectId project) {
        List<Task> list = load(project);
        Map<TaskId, Original> before = originals(list);
        assignPositions(list);
        saveChanges(list, before);
        versions.incrementVersion(project);
    }

    @Override public TaskBoard move(ProjectId project, TaskId id, TaskStatus status, TaskId beforeId, long expectedVersion) {
        long version = versions.getVersion(project);
        if (version != expectedVersion) throw new BoardConflictException();
        List<Task> list = load(project);
        Task task = find(list, id);
        if (beforeId != null) {
            Task anchor = find(list, beforeId);
            if (anchor.getStatus() != status) throw new IllegalArgumentException("La tarea de referencia no pertenece a la columna de destino");
            if (anchor.getId().equals(id)) return board(project);
        }
        List<TaskId> oldOrder = list.stream().map(Task::getId).toList();
        TaskStatus oldStatus = task.getStatus();
        Map<TaskId, Original> before = originals(list);
        list.remove(task);
        task.cambiarEstado(status);
        int index = beforeId == null ? list.size() : list.indexOf(find(list, beforeId));
        list.add(index, task);
        // Inter-column ordering is irrelevant; compare each column after grouping.
        list.sort(Comparator.comparing(Task::getStatus));
        if (oldStatus == status && oldOrder.equals(list.stream().map(Task::getId).toList())) {
            assignPositions(list);
            return new TaskBoard(version, list);
        }
        assignPositions(list);
        saveChanges(list, before);
        return new TaskBoard(versions.incrementVersion(project), list);
    }
}
