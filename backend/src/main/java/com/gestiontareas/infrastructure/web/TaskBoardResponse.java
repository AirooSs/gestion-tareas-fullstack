package com.gestiontareas.infrastructure.web;

import com.gestiontareas.domain.model.task.TaskBoard;
import java.util.List;

public record TaskBoardResponse(long version, List<TareaResponse> tareas) {
    public static TaskBoardResponse from(TaskBoard board) {
        return new TaskBoardResponse(board.version(), board.tasks().stream().map(TareaResponse::from).toList());
    }
}
