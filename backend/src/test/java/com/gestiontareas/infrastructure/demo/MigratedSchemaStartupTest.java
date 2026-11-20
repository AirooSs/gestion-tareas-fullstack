package com.gestiontareas.infrastructure.demo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=validate", "demo.cleanup-initial-delay-ms=3600000"})
@ActiveProfiles("test")
@Testcontainers
class MigratedSchemaStartupTest {
    @Container @ServiceConnection static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");
    @LocalServerPort int port;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectProvider<Flyway> applicationFlyway;

    @DynamicPropertySource
    static void migrateBeforeApplicationStarts(DynamicPropertyRegistry registry) {
        Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()).load().migrate();
    }

    @Test void applicationStartsWithValidatedMigratedSchemaWithoutFlyway() throws Exception {
        assertNull(applicationFlyway.getIfAvailable());
        assertEquals(3, jdbc.queryForObject("SELECT count(*) FROM flyway_schema_history WHERE success AND version IN ('1','2','3')", Integer.class));
        var response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/health")).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("UP"));
    }
}
