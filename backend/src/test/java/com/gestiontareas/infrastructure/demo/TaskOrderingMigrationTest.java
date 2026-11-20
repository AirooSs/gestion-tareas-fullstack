package com.gestiontareas.infrastructure.demo;

import java.sql.DriverManager;
import java.util.ArrayList;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class TaskOrderingMigrationTest {
    @Container static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Test void expandsExistingDataAndAllowsOldWrites() throws Exception {
        Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .target(MigrationVersion.fromVersion("2")).load().migrate();
        try (var connection=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var sql=connection.createStatement()) {
            sql.executeUpdate("INSERT INTO usuarios(id,email,name) VALUES ('00000000-0000-0000-0000-000000000002','fixture@example.test','Fixture')");
            sql.executeUpdate("INSERT INTO demo_sessions(id,token_hash,expires_at) VALUES ('00000000-0000-0000-0000-000000000002',repeat('a',64),'2099-01-01T00:00:00Z')");
            sql.executeUpdate("INSERT INTO proyectos(id,owner_id,name) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Existing')");
            sql.executeUpdate("INSERT INTO proyectos(id,owner_id,name) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','Other')");
            sql.executeUpdate("INSERT INTO tareas(id,project_id,titulo,status,descripcion) VALUES ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','Zulu','PENDIENTE','keep'),('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000001','Alpha','PENDIENTE',NULL),('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000001','Alpha','PENDIENTE','same title'),('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000001','Done','HECHO','other status'),('00000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000003','Other','PENDIENTE','other project')");
        }
        List<List<Object>> before = originalRows();
        Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()).load().migrate();
        assertEquals(before, originalRows());
        try (var connection=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var sql=connection.createStatement()) {
            try (var rows=sql.executeQuery("SELECT titulo, position, id FROM tareas WHERE project_id='00000000-0000-0000-0000-000000000001' AND status='PENDIENTE' ORDER BY position")) {
                assertTrue(rows.next()); assertEquals("Alpha",rows.getString(1)); assertEquals(0,rows.getInt(2)); assertEquals("00000000-0000-0000-0000-000000000012",rows.getString(3));
                assertTrue(rows.next()); assertEquals("Alpha",rows.getString(1)); assertEquals(1,rows.getInt(2)); assertEquals("00000000-0000-0000-0000-000000000014",rows.getString(3));
                assertTrue(rows.next()); assertEquals("Zulu",rows.getString(1)); assertEquals(2,rows.getInt(2));
                assertFalse(rows.next());
            }
            try (var rows=sql.executeQuery("SELECT position FROM tareas WHERE id IN ('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016') ORDER BY id")) {
                assertTrue(rows.next()); assertEquals(0,rows.getInt(1)); assertTrue(rows.next()); assertEquals(0,rows.getInt(1));
            }
            sql.executeUpdate("INSERT INTO tareas(id,project_id,titulo,status) VALUES ('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000001','Legacy','PENDIENTE')");
            try (var rows=sql.executeQuery("SELECT position FROM tareas WHERE titulo = 'Legacy'")) {
                assertTrue(rows.next()); assertNull(rows.getObject(1));
            }
            try (var rows=sql.executeQuery("SELECT board_version FROM proyectos ORDER BY id")) {
                assertTrue(rows.next()); assertEquals(0,rows.getLong(1)); assertTrue(rows.next()); assertEquals(0,rows.getLong(1));
            }
            try (var rows=sql.executeQuery("SELECT name, owner_id FROM proyectos ORDER BY id")) {
                assertTrue(rows.next()); assertEquals("Existing",rows.getString(1)); assertEquals("00000000-0000-0000-0000-000000000002",rows.getString(2));
                assertTrue(rows.next()); assertEquals("Other",rows.getString(1)); assertEquals("00000000-0000-0000-0000-000000000002",rows.getString(2));
            }
            try (var rows=sql.executeQuery("SELECT u.name, u.email, s.token_hash, s.expires_at::date FROM usuarios u JOIN demo_sessions s ON s.id=u.id")) {
                assertTrue(rows.next()); assertEquals("Fixture",rows.getString(1)); assertEquals("fixture@example.test",rows.getString(2));
                assertEquals("a".repeat(64),rows.getString(3)); assertEquals("2099-01-01",rows.getString(4)); assertFalse(rows.next());
            }
        }
    }

    private List<List<Object>> originalRows() throws Exception {
        List<List<Object>> result = new ArrayList<>();
        try (var connection=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword());
             var sql=connection.createStatement();
             var rows=sql.executeQuery("SELECT id, project_id, titulo, status, descripcion, assigned_to FROM tareas ORDER BY id")) {
            while (rows.next()) result.add(java.util.Arrays.asList(rows.getObject(1), rows.getObject(2), rows.getObject(3), rows.getObject(4), rows.getObject(5), rows.getObject(6)));
        }
        return result;
    }
}
