package com.gestiontareas.infrastructure.demo;
import com.gestiontareas.application.demo.DemoService;
import com.jayway.jsonpath.JsonPath;
import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT, properties={"demo.max-projects=2","demo.max-tasks=2","demo.rate-per-minute=1000","demo.session-rate-per-minute=1000","demo.cleanup-initial-delay-ms=3600000"})
@ActiveProfiles("test") @Testcontainers
class DemoSecurityIntegrationTest {
 @Container @ServiceConnection static PostgreSQLContainer postgres=new PostgreSQLContainer("postgres:16-alpine");
 @LocalServerPort int port; @Autowired JdbcTemplate jdbc; @Autowired DemoService demo;
 final HttpClient client=HttpClient.newHttpClient();
 HttpResponse<String> req(String m,String p,String t,String j) throws Exception { var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+p)).header("Content-Type","application/json"); if(t!=null)b.header("Authorization","Bearer "+t); return client.send(b.method(m,j==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(j)).build(),HttpResponse.BodyHandlers.ofString()); }
 String session() throws Exception {var r=req("POST","/api/demo/session",null,null);assertEquals(200,r.statusCode(),r.body());return JsonPath.read(r.body(),"$.token");}
 String project(String t) throws Exception {var r=req("POST","/api/proyectos",t,"{\"name\":\"Project\"}");assertEquals(201,r.statusCode());return JsonPath.read(r.body(),"$.id");}
 String task(String t,String p) throws Exception {var r=req("POST","/api/tareas",t,"{\"titulo\":\"Task\",\"projectId\":\""+p+"\"}");assertEquals(201,r.statusCode());return JsonPath.read(r.body(),"$.id");}
 @Test void isolationAndAuthentication() throws Exception {
  assertEquals(401,req("GET","/api/proyectos",null,null).statusCode()); assertEquals(401,req("GET","/api/proyectos","invalid",null).statusCode());
  String a=session(),b=session();
  assertEquals("[]",req("GET","/api/proyectos",a,null).body());
  assertEquals("[]",req("GET","/api/proyectos",b,null).body());
  String p=project(a),t=task(a,p);
  assertEquals("[]",req("GET","/api/proyectos",b,null).body());
  assertEquals(403,req("POST","/api/usuarios",b,"{}").statusCode());
  var forged=req("POST","/api/proyectos",b,"{\"name\":\"Forged\",\"ownerId\":\""+p+"\"}");
  assertTrue(forged.statusCode()==201 || forged.statusCode()==400);
  if (forged.statusCode()==201) { String created=JsonPath.read(forged.body(),"$.id"); assertEquals(404,req("DELETE","/api/proyectos/"+created,a,null).statusCode()); }
  assertEquals(404,req("GET","/api/tareas/proyecto/"+p,b,null).statusCode()); assertEquals(404,req("GET","/api/tareas/"+t,b,null).statusCode());
  assertEquals(404,req("PUT","/api/tareas/"+t,b,"{\"titulo\":\"hack\"}").statusCode());
  assertEquals(404,req("PATCH","/api/tareas/"+t+"/estado",b,"{\"estado\":\"HECHO\"}").statusCode());
  assertEquals(404,req("DELETE","/api/tareas/"+t,b,null).statusCode()); assertEquals(404,req("DELETE","/api/proyectos/"+p,b,null).statusCode());
  assertEquals(404,req("POST","/api/tareas",b,"{\"titulo\":\"hack\",\"projectId\":\""+p+"\"}").statusCode()); assertEquals(200,req("GET","/api/tareas/"+t,a,null).statusCode());
 }
 @Test void expirationAndCleanup() throws Exception {
  String token=session(),p=project(token),t=task(token,p); String hash=DemoService.hash(token);
  assertEquals(1,jdbc.queryForObject("select count(*) from demo_sessions where token_hash=?",Integer.class,hash));
  assertEquals(0,jdbc.queryForObject("select count(*) from demo_sessions where token_hash=?",Integer.class,token));
  jdbc.update("update demo_sessions set expires_at=now()-interval '1 second' where token_hash=?",hash);
  assertEquals(401,req("GET","/api/proyectos",token,null).statusCode()); demo.cleanup();
  assertEquals(0,jdbc.queryForObject("select count(*) from proyectos where id=?::uuid",Integer.class,p));
  assertEquals(0,jdbc.queryForObject("select count(*) from tareas where id=?::uuid",Integer.class,t));
 }
 @Test void concurrentQuotaCannotBeBypassed() throws Exception {
  String token=session();
  var a=java.util.concurrent.CompletableFuture.supplyAsync(() -> { try { return req("POST","/api/proyectos",token,"{\"name\":\"A\"}").statusCode(); } catch (Exception e) { throw new RuntimeException(e); } });
  var b=java.util.concurrent.CompletableFuture.supplyAsync(() -> { try { return req("POST","/api/proyectos",token,"{\"name\":\"B\"}").statusCode(); } catch (Exception e) { throw new RuntimeException(e); } });
  assertEquals(201, a.get()); assertEquals(201, b.get());
  assertEquals(429, req("POST","/api/proyectos",token,"{\"name\":\"C\"}").statusCode());
 }
 @Test void quotas() throws Exception {
  String token=session(),p=project(token); task(token,p);
  assertEquals(201,req("POST","/api/proyectos",token,"{\"name\":\"Two\"}").statusCode()); assertEquals(429,req("POST","/api/proyectos",token,"{\"name\":\"Three\"}").statusCode());
  assertEquals(201,req("POST","/api/tareas",token,"{\"titulo\":\"Two\",\"projectId\":\""+p+"\"}").statusCode()); assertEquals(429,req("POST","/api/tareas",token,"{\"titulo\":\"Three\",\"projectId\":\""+p+"\"}").statusCode());
 }
}
