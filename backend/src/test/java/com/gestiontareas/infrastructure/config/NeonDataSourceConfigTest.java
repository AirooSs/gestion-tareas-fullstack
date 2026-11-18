package com.gestiontareas.infrastructure.config;

import static org.junit.jupiter.api.Assertions.*;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;

class NeonDataSourceConfigTest {
    private final NeonDataSourceConfig config = new NeonDataSourceConfig();

    @Test
    void convertsNeonUrlAndRequiresVerifiedTls() {
        try (HikariDataSource source = (HikariDataSource) config.dataSource(
                "postgresql://user%40example:p%2Bss+word@example.neon.tech:5432/neondb?sslmode=require&channel_binding=require")) {
            assertEquals("user@example", source.getUsername());
            assertEquals("p+ss+word", source.getPassword());
            assertEquals("jdbc:postgresql://example.neon.tech:5432/neondb?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory", source.getJdbcUrl());
        }
    }

    @Test
    void rejectsIncompleteConnectionStrings() {
        assertThrows(IllegalArgumentException.class, () -> config.dataSource("postgresql://example.neon.tech/neondb"));
        assertThrows(IllegalArgumentException.class, () -> config.dataSource("https://user:pass@example.neon.tech/neondb"));
    }

    @Test
    void malformedUriDoesNotExposeTheConnectionString() {
        String url = "postgresql://user:secret value@example.neon.tech/neondb";
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> config.dataSource(url));
        assertFalse(error.getMessage().contains("secret"));
    }
}
