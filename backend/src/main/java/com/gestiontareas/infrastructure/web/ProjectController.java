package com.gestiontareas.infrastructure.web;

import com.gestiontareas.application.demo.DemoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proyectos")
public class ProjectController {
    private final DemoService demo;
    public ProjectController(DemoService demo) { this.demo=demo; }
    @PostMapping public ResponseEntity<ProyectoResponse> create(@AuthenticationPrincipal UUID session, @Valid @RequestBody CrearProyectoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ProyectoResponse.from(demo.createProject(session,request.name(),request.description())));
    }
    @GetMapping public List<ProyectoResponse> list(@AuthenticationPrincipal UUID session) { return demo.projects(session).stream().map(ProyectoResponse::from).toList(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal UUID session, @PathVariable UUID id) {
        demo.deleteProject(session,id); return ResponseEntity.noContent().build();
    }
}
