package com.gestiontareas.infrastructure.web;

import com.gestiontareas.application.demo.DemoService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    private final DemoService demo;
    public DemoController(DemoService demo) { this.demo=demo; }
    @PostMapping("/session")
    public ResponseEntity<DemoService.Session> start() { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(demo.start()); }
}
