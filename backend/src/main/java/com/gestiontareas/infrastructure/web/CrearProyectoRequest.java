package com.gestiontareas.infrastructure.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record CrearProyectoRequest(@NotBlank @Size(max=255) String name, @Size(max=255) String description) {}
