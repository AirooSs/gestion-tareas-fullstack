package com.gestiontareas.infrastructure.web;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record EditarTareaRequest(@NotBlank @Size(max=255) String titulo, @Size(max=255) String descripcion) {}
