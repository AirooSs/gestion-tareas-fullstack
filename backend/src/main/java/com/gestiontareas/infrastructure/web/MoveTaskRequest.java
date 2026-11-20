package com.gestiontareas.infrastructure.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record MoveTaskRequest(
        @NotBlank @Pattern(regexp="PENDIENTE|EN_PROGRESO|HECHO|CANCELADO") String estado,
        UUID antesDeId,
        @NotNull @PositiveOrZero Long version) {}
