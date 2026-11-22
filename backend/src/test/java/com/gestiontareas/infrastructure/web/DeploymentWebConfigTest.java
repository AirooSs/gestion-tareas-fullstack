package com.gestiontareas.infrastructure.web;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

class DeploymentWebConfigTest {
    private static class TestRegistry extends CorsRegistry {
        Map<String, CorsConfiguration> configurations() { return getCorsConfigurations(); }
    }

    @Test
    void allowsOnlyConfiguredOriginsAndMethods() {
        TestRegistry registry = new TestRegistry();
        new CorsConfig("https://demo.example, https://preview.example", "").addCorsMappings(registry);
        CorsConfiguration cors = registry.configurations().get("/api/**");
        assertEquals("https://demo.example", cors.checkOrigin("https://demo.example"));
        assertEquals("https://preview.example", cors.checkOrigin("https://preview.example"));
        assertNull(cors.checkOrigin("https://other.example"));
        assertNotNull(cors.checkHttpMethod(HttpMethod.DELETE));
        assertNull(cors.checkHttpMethod(HttpMethod.TRACE));
        for (String path : new String[]{"/health", "/service-status"}) {
            CorsConfiguration health = registry.configurations().get(path);
            assertEquals("https://demo.example", health.checkOrigin("https://demo.example"));
            assertNull(health.checkOrigin("https://other.example"));
            assertNotNull(health.checkHttpMethod(HttpMethod.GET));
            assertNull(health.checkHttpMethod(HttpMethod.POST));
        }
    }

    @Test
    void emptyOriginsDenyBrowserOrigins() {
        TestRegistry registry = new TestRegistry();
        new CorsConfig("", "").addCorsMappings(registry);
        assertNull(registry.configurations().get("/api/**").checkOrigin("https://demo.example"));
    }

    @Test
    void allowsExactOriginsAndRestrictedDeploymentPatternAcrossAllMappings() {
        TestRegistry registry = new TestRegistry();
        new CorsConfig("http://localhost:5173,https://gestion-tareas-fullstack.vercel.app",
                "https://gestion-tareas-fullstack-*-francisco-soria.vercel.app").addCorsMappings(registry);
        String visit = "https://gestion-tareas-fullstack-mu3mussyx-francisco-soria.vercel.app";
        for (String path : new String[]{"/health", "/service-status", "/api/**"}) {
            CorsConfiguration cors = registry.configurations().get(path);
            assertEquals("http://localhost:5173", cors.checkOrigin("http://localhost:5173"));
            assertEquals("https://gestion-tareas-fullstack.vercel.app", cors.checkOrigin("https://gestion-tareas-fullstack.vercel.app"));
            assertEquals(visit, cors.checkOrigin(visit));
            assertNull(cors.checkOrigin("https://other-project-francisco-soria.vercel.app"));
            assertNull(cors.checkOrigin("https://gestion-tareas-fullstack-mu3mussyx-other.vercel.app"));
            assertNull(cors.checkOrigin("https://gestion-tareas-fullstack-mu3mussyx-francisco-soria.vercel.app.evil.example"));
        }
    }

    @Test
    void healthEndpointReturnsMinimalStatus() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new HealthController()).build();
        for (String path : new String[]{"/health", "/service-status"}) {
            mvc.perform(get(path))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        }
    }
}
