package com.gestiontareas.infrastructure.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/** Configures production from the Neon-provided DATABASE_URL. */
@Configuration
@Profile("prod")
public class NeonDataSourceConfig {
    @Bean
    DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        URI uri;
        try {
            uri = URI.create(databaseUrl);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("DATABASE_URL must be a valid PostgreSQL URI");
        }
        if (!"postgresql".equals(uri.getScheme()) && !"postgres".equals(uri.getScheme())) {
            throw new IllegalArgumentException("DATABASE_URL must use the PostgreSQL scheme");
        }
        String userInfo = uri.getRawUserInfo();
        if (uri.getHost() == null || uri.getRawPath() == null || uri.getRawPath().length() < 2
                || userInfo == null || !userInfo.contains(":")) {
            throw new IllegalArgumentException("DATABASE_URL must contain a host, database, user and password");
        }
        String[] credentials = userInfo.split(":", 2);
        HikariDataSource source = new HikariDataSource();
        String port = uri.getPort() < 0 ? "" : ":" + uri.getPort();
        source.setJdbcUrl("jdbc:postgresql://" + uri.getHost() + port + uri.getRawPath()
                + "?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory");
        source.setUsername(decode(credentials[0]));
        source.setPassword(decode(credentials[1]));
        return source;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
    }
}
