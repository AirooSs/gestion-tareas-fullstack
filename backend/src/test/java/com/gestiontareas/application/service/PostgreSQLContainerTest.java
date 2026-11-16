
package com.gestiontareas.application.service;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PostgreSQLContainerTest {

    // PostgreSQL temporal gestionado por Docker
    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    
@Test
void deberiaConectarseABaseDeDatosTemporal() {

    // Obtener el nombre de la base de datos utilizada
    String nombreBaseDatos = jdbcTemplate.queryForObject(
        "SELECT current_database()",
        String.class
    );

    // Obtener la URL real del contenedor PostgreSQL
    String urlContenedor = postgres.getJdbcUrl();

    // Obtener la URL utilizada por Spring
    String urlSpring = jdbcTemplate.execute(
        (org.springframework.jdbc.core.ConnectionCallback<String>)
        connection -> connection.getMetaData().getURL()
    );

    // Verificar que la conexión está activa
    assertNotNull(nombreBaseDatos);
    assertNotNull(urlSpring);

    // Verificar que no utilizamos la BD de desarrollo
    assertNotEquals("gestiontareas", nombreBaseDatos);

    // Verificar que Spring utiliza el contenedor
    assertEquals(
        urlContenedor,
        urlSpring,
        "Spring debe conectarse al PostgreSQL de Testcontainers"
    );

    System.out.println("Base de datos: " + nombreBaseDatos);
    System.out.println("URL del contenedor: " + urlContenedor);
    System.out.println("URL utilizada por Spring: " + urlSpring);
}

}

