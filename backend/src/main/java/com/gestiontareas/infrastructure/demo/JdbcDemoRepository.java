package com.gestiontareas.infrastructure.demo;

import com.gestiontareas.domain.port.out.DemoRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.gestiontareas.domain.exception.DemoAccessException;

@Repository
public class JdbcDemoRepository implements DemoRepository {
    private final JdbcTemplate jdbc;
    public JdbcDemoRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Override public Optional<UUID> authenticate(String hash) {
        return jdbc.query("SELECT id FROM demo_sessions WHERE token_hash = ? AND expires_at > now()", (rs, row) -> rs.getObject(1, UUID.class), hash).stream().findFirst();
    }
    @Override public void lockActiveSession(UUID id) {
        if (jdbc.query("SELECT id FROM demo_sessions WHERE id = ? AND expires_at > now() FOR UPDATE", (rs, row) -> rs.getObject(1, UUID.class), id).isEmpty())
            throw new DemoAccessException(DemoAccessException.Reason.UNAUTHORIZED);
    }
    @Override public void createSession(UUID id, String hash, Instant expiresAt, int maxSessions) {
        jdbc.queryForObject("SELECT pg_advisory_xact_lock(81230745)", Object.class);
        Integer count = jdbc.queryForObject("SELECT count(*) FROM demo_sessions WHERE expires_at > now()", Integer.class);
        if (count == null || count >= maxSessions) throw new DemoAccessException(DemoAccessException.Reason.LIMIT);
        jdbc.update("INSERT INTO demo_sessions(id, token_hash, expires_at) VALUES (?, ?, ?)", id, hash, Timestamp.from(expiresAt));
    }
    @Override public void requireProject(UUID sessionId, UUID projectId) {
        if (jdbc.query("SELECT id FROM proyectos WHERE id = ? AND owner_id = ? FOR UPDATE", (rs, row) -> rs.getObject(1, UUID.class), projectId, sessionId).isEmpty())
            throw new DemoAccessException(DemoAccessException.Reason.NOT_FOUND);
    }
    @Override public void requireTask(UUID sessionId, UUID taskId) {
        if (jdbc.query("SELECT t.id FROM tareas t JOIN proyectos p ON p.id = t.project_id WHERE t.id = ? AND p.owner_id = ? FOR UPDATE OF p, t", (rs, row) -> rs.getObject(1, UUID.class), taskId, sessionId).isEmpty())
            throw new DemoAccessException(DemoAccessException.Reason.NOT_FOUND);
    }
    @Override public long countProjects(UUID id) { return jdbc.queryForObject("SELECT count(*) FROM proyectos WHERE owner_id = ?", Long.class, id); }
    @Override public long countTasks(UUID id) { return jdbc.queryForObject("SELECT count(*) FROM tareas WHERE project_id = ?", Long.class, id); }
    @Override public int cleanExpired(int batchSize) {
        var ids = jdbc.query("SELECT id FROM demo_sessions WHERE expires_at <= now() ORDER BY expires_at LIMIT ? FOR UPDATE SKIP LOCKED", (rs, row) -> rs.getObject(1, UUID.class), batchSize);
        for (UUID id : ids) {
            jdbc.update("DELETE FROM tareas WHERE project_id IN (SELECT id FROM proyectos WHERE owner_id = ?)", id);
            jdbc.update("DELETE FROM proyectos WHERE owner_id = ?", id);
            jdbc.update("DELETE FROM demo_sessions WHERE id = ? AND expires_at <= now()", id);
        }
        return ids.size();
    }
}
