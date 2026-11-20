package com.gestiontareas.infrastructure.demo;

import com.gestiontareas.domain.port.out.DemoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableScheduling
public class DemoSecurityConfig {
    @Bean SecurityFilterChain security(HttpSecurity http, DemoRepository repository,
            @Value("${demo.rate-per-minute:120}") int rate,
            @Value("${demo.session-rate-per-minute:5}") int sessionRate) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'")))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/health", "/service-status").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/demo/session").permitAll()
                .requestMatchers("/api/usuarios/**").denyAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request,response,error) -> response.setStatus(401)).accessDeniedHandler((request,response,error) -> response.setStatus(403)))
            .addFilterBefore(new DemoSecurityFilter(repository, rate, sessionRate), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
