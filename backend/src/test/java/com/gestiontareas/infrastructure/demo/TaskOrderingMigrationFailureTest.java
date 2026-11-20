package com.gestiontareas.infrastructure.demo;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TaskOrderingMigrationFailureTest {
    @Container static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Test void failureRollsBackAndCanBeRecoveredAfterResolvingTheCause() throws Exception {
        Flyway.configure().dataSource(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword())
                .target(MigrationVersion.fromVersion("2")).load().migrate();
        try (var connection=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var sql=connection.createStatement()) {
            sql.execute("ALTER TABLE proyectos ADD COLUMN board_version bigint NOT NULL DEFAULT 0");
        }
        var flyway=Flyway.configure().dataSource(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()).load();
        assertThrows(FlywayException.class, flyway::migrate);
        try (var connection=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var sql=connection.createStatement()) {
            try (var rows=sql.executeQuery("SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='tareas' AND column_name='position'")) {
                assertTrue(rows.next()); assertEquals(0,rows.getInt(1));
            }
            try (var rows=sql.executeQuery("SELECT count(*) FROM flyway_schema_history WHERE version='3'")) {
                assertTrue(rows.next()); assertEquals(0,rows.getInt(1));
            }
            // The test itself created this conflicting column; no production cleanup is implied.
            sql.execute("ALTER TABLE proyectos DROP COLUMN board_version");
        }
        flyway.migrate();
        assertEquals("3",flyway.info().current().getVersion().getVersion());
    }
}
