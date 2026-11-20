package com.gestiontareas.domain.model.task;

import java.util.List;

public record TaskBoard(long version, List<Task> tasks) {}
