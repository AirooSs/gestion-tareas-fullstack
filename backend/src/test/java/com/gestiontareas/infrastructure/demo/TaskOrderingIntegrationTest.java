package com.gestiontareas.infrastructure.demo;

import com.jayway.jsonpath.JsonPath;
import java.net.URI;
import java.net.http.*;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"demo.max-tasks=25", "demo.rate-per-minute=1000", "demo.session-rate-per-minute=1000", "demo.cleanup-initial-delay-ms=3600000"})
@ActiveProfiles("test")
@Testcontainers
class TaskOrderingIntegrationTest {
    @Container @ServiceConnection static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");
    @LocalServerPort int port;
    @Autowired JdbcTemplate jdbc;
    final HttpClient client = HttpClient.newHttpClient();

    HttpResponse<String> request(String method, String path, String token, String body) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).header("Content-Type", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        return client.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }
    String session() throws Exception { var r=request("POST", "/api/demo/session", null, null); assertEquals(200,r.statusCode()); return JsonPath.read(r.body(),"$.token"); }
    String project(String token) throws Exception { var r=request("POST","/api/proyectos",token,"{\"name\":\"Project\"}"); assertEquals(201,r.statusCode()); return JsonPath.read(r.body(),"$.id"); }
    String task(String token, String project, String title) throws Exception { var r=request("POST","/api/tareas",token,"{\"titulo\":\""+title+"\",\"projectId\":\""+project+"\"}"); assertEquals(201,r.statusCode()); return JsonPath.read(r.body(),"$.id"); }
    HttpResponse<String> board(String token, String project) throws Exception { return request("GET","/api/proyectos/"+project+"/tablero",token,null); }
    int version(HttpResponse<String> board) { return JsonPath.read(board.body(),"$.version"); }
    List<String> ids(HttpResponse<String> board, String status) { return JsonPath.read(board.body(),"$.tareas[?(@.status == '"+status+"')].id"); }
    HttpResponse<String> move(String token, String id, String status, String before, int version) throws Exception {
        return request("PATCH","/api/tareas/"+id+"/posicion",token,"{\"estado\":\""+status+"\",\"antesDeId\":"+(before == null ? "null" : "\""+before+"\"")+",\"version\":"+version+"}");
    }

    @Test void ordersMovesDeletesAndPreservesOldEndpoints() throws Exception {
        String token=session(), project=project(token);
        String a=task(token,project,"Alpha"), b=task(token,project,"Beta"), c=task(token,project,"Gamma");
        var board=board(token,project);
        assertEquals(List.of(a,b,c),ids(board,"PENDIENTE"));
        assertEquals(List.of(0,1,2),JsonPath.read(board.body(),"$.tareas[?(@.status == 'PENDIENTE')].position"));
        int version=version(board);
        board=move(token,c,"PENDIENTE",a,version); assertEquals(200,board.statusCode()); assertEquals(List.of(c,a,b),ids(board,"PENDIENTE"));
        board=move(token,b,"PENDIENTE",a,version(board)); assertEquals(List.of(c,b,a),ids(board,"PENDIENTE"));
        board=move(token,c,"PENDIENTE",null,version(board)); assertEquals(List.of(b,a,c),ids(board,"PENDIENTE"));
        version=version(board); board=move(token,c,"PENDIENTE",null,version); assertEquals(version,version(board));
        board=move(token,a,"HECHO",null,version); assertEquals(List.of(a),ids(board,"HECHO")); assertEquals(List.of(b,c),ids(board,"PENDIENTE"));
        board=move(token,b,"HECHO",a,version(board)); assertEquals(List.of(b,a),ids(board,"HECHO"));
        var old=request("PATCH","/api/tareas/"+c+"/estado",token,"{\"estado\":\"HECHO\"}"); assertEquals(200,old.statusCode());
        board=board(token,project); assertEquals(List.of(b,a,c),ids(board,"HECHO"));
        assertEquals(204,request("DELETE","/api/tareas/"+a,token,null).statusCode());
        board=board(token,project); assertEquals(List.of(b,c),ids(board,"HECHO"));
        assertEquals(List.of(0,1),JsonPath.read(board.body(),"$.tareas[?(@.status == 'HECHO')].position"));
        assertEquals(200,request("GET","/api/tareas/proyecto/"+project,token,null).statusCode());
        assertEquals(200,request("PUT","/api/tareas/"+b,token,"{\"titulo\":\"Edited\",\"descripcion\":\"text\"}").statusCode());
        assertEquals(List.of(b,c),ids(board(token,project),"HECHO"));
    }

    @Test void checksOwnershipAndConcurrentVersions() throws Exception {
        String one=session(), two=session(), project=project(one), otherProject=project(one);
        String a=task(one,project,"A"), b=task(one,project,"B"), other=task(one,otherProject,"Other");
        assertEquals(401,board(null,project).statusCode());
        assertEquals(404,board(two,project).statusCode());
        int version=version(board(one,project));
        assertEquals(404,move(two,a,"HECHO",null,version).statusCode());
        assertEquals(404,move(one,a,"PENDIENTE",other,version).statusCode());
        assertEquals(400,move(one,a,"HECHO",b,version).statusCode());
        assertEquals(version,version(board(one,project)));
        var first=CompletableFuture.supplyAsync(() -> { try { return move(one,a,"HECHO",null,version).statusCode(); } catch (Exception e) { throw new RuntimeException(e); } });
        var second=CompletableFuture.supplyAsync(() -> { try { return move(one,b,"CANCELADO",null,version).statusCode(); } catch (Exception e) { throw new RuntimeException(e); } });
        assertEquals(List.of(200,409),java.util.stream.Stream.of(first.get(),second.get()).sorted().toList());
        assertEquals(version+1,version(board(one,project)));
        assertEquals(409,move(one,a,"HECHO",null,version).statusCode());
    }

    @Test void legacyNullAndDuplicatePositionsAreReadDeterministicallyAndRepairedOnMove() throws Exception {
        String token=session(), project=project(token);
        String a=task(token,project,"Alpha"), b=task(token,project,"Beta"), c=task(token,project,"Gamma");
        jdbc.update("UPDATE tareas SET position = CASE WHEN id = ?::uuid THEN NULL ELSE 0 END WHERE project_id = ?::uuid", c, project);
        var current=board(token,project);
        assertEquals(List.of(a,b,c), ids(current,"PENDIENTE"));
        assertEquals(List.of(0,1,2), JsonPath.read(current.body(),"$.tareas[?(@.status == 'PENDIENTE')].position"));
        assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM tareas WHERE project_id = ?::uuid AND position IS NULL",Integer.class,project));
        int version=version(current);
        var unchanged=move(token,b,"PENDIENTE",c,version);
        assertEquals(200,unchanged.statusCode()); assertEquals(version,version(unchanged));
        assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM tareas WHERE project_id = ?::uuid AND position IS NULL",Integer.class,project));
        var moved=move(token,c,"PENDIENTE",a,version);
        assertEquals(200,moved.statusCode()); assertEquals(List.of(c,a,b),ids(moved,"PENDIENTE"));
        assertEquals(List.of(0,1,2),jdbc.queryForList("SELECT position FROM tareas WHERE project_id = ?::uuid ORDER BY position",Integer.class,project));
    }
}
