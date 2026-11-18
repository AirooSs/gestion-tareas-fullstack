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
@RequestMapping("/api/tareas")
public class TaskController {
    private final DemoService demo;
    public TaskController(DemoService demo) { this.demo=demo; }
    @PostMapping public ResponseEntity<TareaResponse> create(@AuthenticationPrincipal UUID session, @Valid @RequestBody CrearTareaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(TareaResponse.from(demo.createTask(session,request.projectId(),request.titulo(),request.descripcion())));
    }
    @GetMapping("/{id}") public TareaResponse get(@AuthenticationPrincipal UUID session, @PathVariable UUID id) { return TareaResponse.from(demo.task(session,id)); }
    @GetMapping("/proyecto/{id}") public List<TareaResponse> list(@AuthenticationPrincipal UUID session, @PathVariable UUID id) { return demo.tasks(session,id).stream().map(TareaResponse::from).toList(); }
    @PutMapping("/{id}") public TareaResponse edit(@AuthenticationPrincipal UUID session, @PathVariable UUID id, @Valid @RequestBody EditarTareaRequest request) { return TareaResponse.from(demo.edit(session,id,request.titulo(),request.descripcion())); }
    @PatchMapping("/{id}/estado") public TareaResponse status(@AuthenticationPrincipal UUID session, @PathVariable UUID id, @Valid @RequestBody ActualizarEstadoRequest request) { return TareaResponse.from(demo.status(session,id,request.estado())); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal UUID session, @PathVariable UUID id) { demo.deleteTask(session,id); return ResponseEntity.noContent().build(); }
}
