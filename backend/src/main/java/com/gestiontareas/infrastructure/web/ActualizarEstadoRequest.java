package com.gestiontareas.infrastructure.web;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
public record ActualizarEstadoRequest(@NotBlank @Pattern(regexp="PENDIENTE|EN_PROGRESO|HECHO|CANCELADO") String estado) {}
