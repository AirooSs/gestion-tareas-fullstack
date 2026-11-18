package com.gestiontareas.application.demo;

import com.gestiontareas.domain.port.out.DemoRepository;
import com.gestiontareas.domain.port.in.*;
import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.model.task.TaskId;
import com.gestiontareas.domain.model.task.TaskStatus;
import com.gestiontareas.domain.model.user.UserId;
import com.gestiontareas.domain.model.project.Project;
import com.gestiontareas.domain.model.task.Task;
import com.gestiontareas.domain.exception.DemoAccessException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoService {
    private final DemoRepository demo;
    private final CrearProyectoUseCase createProject;
    private final ListarProyectosPorUsuarioUseCase listProjects;
    private final EliminarProyectoUseCase deleteProject;
    private final CrearTareaUseCase createTask;
    private final ListarTareasPorProyectoUseCase listTasks;
    private final ObtenerTareaUseCase getTask;
    private final EditarTareaUseCase editTask;
    private final ActualizarEstadoTareaUseCase changeStatus;
    private final EliminarTareaUseCase deleteTask;
    private final int hours, maxSessions, maxProjects, maxTasks;
    private final SecureRandom random = new SecureRandom();
    public DemoService(DemoRepository demo, CrearProyectoUseCase createProject, ListarProyectosPorUsuarioUseCase listProjects, EliminarProyectoUseCase deleteProject, CrearTareaUseCase createTask, ListarTareasPorProyectoUseCase listTasks, ObtenerTareaUseCase getTask, EditarTareaUseCase editTask, ActualizarEstadoTareaUseCase changeStatus, EliminarTareaUseCase deleteTask, @Value("${demo.session-hours:24}") int hours, @Value("${demo.max-sessions:1000}") int maxSessions, @Value("${demo.max-projects:5}") int maxProjects, @Value("${demo.max-tasks:25}") int maxTasks) {
        this.demo=demo; this.createProject=createProject; this.listProjects=listProjects; this.deleteProject=deleteProject; this.createTask=createTask; this.listTasks=listTasks; this.getTask=getTask; this.editTask=editTask; this.changeStatus=changeStatus; this.deleteTask=deleteTask;
        if (hours < 1 || maxSessions < 1 || maxProjects < 1 || maxTasks < 1) throw new IllegalArgumentException("Demo limits must be positive");
        this.hours=hours; this.maxSessions=maxSessions; this.maxProjects=maxProjects; this.maxTasks=maxTasks;
    }
    public record Session(String token, Instant expiresAt) { @Override public String toString() { return "Session[token=REDACTED, expiresAt=" + expiresAt + "]"; } }
    public static String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    @Transactional public Session start() {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        UUID id = UUID.randomUUID(); Instant expiry = Instant.now().plus(hours, ChronoUnit.HOURS);
        demo.createSession(id, hash(token), expiry, maxSessions);
        var project = createProject.ejecutar("Proyecto de ejemplo", "Organiza tus tareas de demostración", UserId.of(id));
        createTask.ejecutar("Explorar la aplicación", "Edita esta tarea o cambia su estado", project.getId());
        return new Session(token, expiry);
    }
    private void active(UUID id) { demo.lockActiveSession(id); }
    @Transactional public List<Project> projects(UUID id) { active(id); return listProjects.ejecutar(UserId.of(id)); }
    @Transactional public Project createProject(UUID id, String name, String description) { active(id); if (demo.countProjects(id) >= maxProjects) throw new DemoAccessException(DemoAccessException.Reason.LIMIT); return createProject.ejecutar(name, description, UserId.of(id)); }
    @Transactional public void deleteProject(UUID id, UUID project) { active(id); demo.requireProject(id, project); deleteProject.ejecutar(ProjectId.of(project)); }
    @Transactional public Task createTask(UUID id, UUID project, String title, String description) { active(id); demo.requireProject(id, project); if (demo.countTasks(project) >= maxTasks) throw new DemoAccessException(DemoAccessException.Reason.LIMIT); return createTask.ejecutar(title, description, ProjectId.of(project)); }
    @Transactional public List<Task> tasks(UUID id, UUID project) { active(id); demo.requireProject(id, project); return listTasks.ejecutar(ProjectId.of(project)); }
    @Transactional public Task task(UUID id, UUID task) { active(id); demo.requireTask(id, task); return getTask.ejecutar(TaskId.of(task)); }
    @Transactional public Task edit(UUID id, UUID task, String title, String description) { active(id); demo.requireTask(id, task); return editTask.ejecutar(TaskId.of(task), title, description); }
    @Transactional public Task status(UUID id, UUID task, String status) { active(id); demo.requireTask(id, task); return changeStatus.ejecutar(TaskId.of(task), TaskStatus.valueOf(status)); }
    @Transactional public void deleteTask(UUID id, UUID task) { active(id); demo.requireTask(id, task); deleteTask.ejecutar(TaskId.of(task)); }
    @Scheduled(fixedDelayString="${demo.cleanup-interval-ms:3600000}", initialDelayString="${demo.cleanup-initial-delay-ms:30000}")
    @Transactional public void cleanup() { demo.cleanExpired(100); }
}
