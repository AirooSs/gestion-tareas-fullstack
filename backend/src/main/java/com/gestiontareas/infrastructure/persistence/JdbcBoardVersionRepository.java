package com.gestiontareas.infrastructure.persistence;

import com.gestiontareas.domain.model.project.ProjectId;
import com.gestiontareas.domain.port.out.BoardVersionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcBoardVersionRepository implements BoardVersionRepository {
    private final JdbcTemplate jdbc;
    public JdbcBoardVersionRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Override public long getVersion(ProjectId id) {
        return jdbc.queryForObject("SELECT board_version FROM proyectos WHERE id = ?", Long.class, id.value());
    }
    @Override public long incrementVersion(ProjectId id) {
        return jdbc.queryForObject("UPDATE proyectos SET board_version = board_version + 1 WHERE id = ? RETURNING board_version", Long.class, id.value());
    }
}
