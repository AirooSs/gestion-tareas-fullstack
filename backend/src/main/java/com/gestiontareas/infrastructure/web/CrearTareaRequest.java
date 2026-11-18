package com.gestiontareas.infrastructure.web;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
public record CrearTareaRequest(@NotBlank @Size(max=255) String titulo, @Size(max=255) String descripcion, @NotNull UUID projectId) {}
