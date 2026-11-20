package com.gestiontareas.domain.exception;

public class BoardConflictException extends RuntimeException {
    public BoardConflictException() { super("El tablero ha cambiado. Actualízalo antes de mover la tarea."); }
}
