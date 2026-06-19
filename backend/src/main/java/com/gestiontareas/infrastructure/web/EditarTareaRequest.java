package com.gestiontareas.infrastructure.web;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada para editar una tarea.
 */

public record EditarTareaRequest(
    @NotBlank(message = "El título no puede estar vacío") String titulo,
    String descripcion
) {}