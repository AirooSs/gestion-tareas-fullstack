
package com.gestiontareas.application.service;

import com.gestiontareas.domain.port.in.EliminarProyectoUseCase;

import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EliminarProyectoTransaccionTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private EliminarProyectoUseCase eliminarProyectoUseCase;

    @Test
    void deberiaEstarGestionadoPorUnProxyDeSpring() {

        assertTrue(
            AopUtils.isAopProxy(eliminarProyectoUseCase),
            "El servicio debería tener un proxy de Spring"
        );
    }
}
