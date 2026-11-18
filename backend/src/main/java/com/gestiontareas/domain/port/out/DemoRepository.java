package com.gestiontareas.domain.port.out;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface DemoRepository {
    Optional<UUID> authenticate(String tokenHash);
    void lockActiveSession(UUID sessionId);
    void createSession(UUID id, String tokenHash, Instant expiresAt, int maxSessions);
    void requireProject(UUID sessionId, UUID projectId);
    void requireTask(UUID sessionId, UUID taskId);
    long countProjects(UUID sessionId);
    long countTasks(UUID projectId);
    int cleanExpired(int batchSize);
}
