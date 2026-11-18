package com.gestiontareas.domain.exception;

public class DemoAccessException extends RuntimeException {
    public enum Reason { UNAUTHORIZED, NOT_FOUND, LIMIT }
    private final Reason reason;
    public DemoAccessException(Reason reason) { super(reason.name()); this.reason=reason; }
    public Reason reason() { return reason; }
}
