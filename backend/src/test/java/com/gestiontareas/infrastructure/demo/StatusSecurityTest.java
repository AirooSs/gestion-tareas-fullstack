package com.gestiontareas.infrastructure.demo;

import com.gestiontareas.domain.port.out.DemoRepository;
import com.gestiontareas.infrastructure.web.CorsConfig;
import com.gestiontareas.infrastructure.web.HealthController;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringJUnitConfig(StatusSecurityTest.Config.class)
@WebAppConfiguration
@TestPropertySource(properties = "app.cors.allowed-origins=https://demo.example")
class StatusSecurityTest {
    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({DemoSecurityConfig.class, HealthController.class, CorsConfig.class})
    static class Config {
        @Bean DemoRepository demoRepository() { return mock(DemoRepository.class); }
    }

    @Autowired WebApplicationContext context;
    @Autowired DemoRepository repository;

    @Test
    void statusIsPublicGetOnlyAndDoesNotTouchSessions() throws Exception {
        var mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(context.getBean("springSecurityFilterChain", Filter.class)).build();
        for (String path : new String[]{"/health", "/service-status"}) {
            mvc.perform(get(path).header("Origin", "https://demo.example"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "https://demo.example"))
                    .andExpect(jsonPath("$.status").value("UP"));
        }
        mvc.perform(get("/service-status").header("Origin", "https://other.example"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/service-status")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/proyectos")).andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }
}
