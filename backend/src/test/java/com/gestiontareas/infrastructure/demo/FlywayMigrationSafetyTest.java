package com.gestiontareas.infrastructure.demo;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import java.sql.DriverManager;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class FlywayMigrationSafetyTest {
 @Container static PostgreSQLContainer postgres=new PostgreSQLContainer("postgres:16-alpine");
 @Test void refusesExistingSchemaWithoutHistory() throws Exception {
  try (var c=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var stmt=c.createStatement()) {
   stmt.execute("CREATE TABLE public.existing_data (id integer primary key)");
   stmt.execute("INSERT INTO public.existing_data VALUES (1)");
  }
  var flyway=Flyway.configure().dataSource(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()).baselineOnMigrate(false).load();
  assertThrows(FlywayException.class, flyway::migrate);
  try (var c=DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword()); var stmt=c.createStatement(); var rs=stmt.executeQuery("SELECT count(*) FROM public.existing_data")) {
   assertTrue(rs.next()); assertEquals(1,rs.getInt(1));
  }
 }
}
