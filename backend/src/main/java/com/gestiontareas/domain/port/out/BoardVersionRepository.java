package com.gestiontareas.domain.port.out;

import com.gestiontareas.domain.model.project.ProjectId;

public interface BoardVersionRepository {
    long getVersion(ProjectId projectId);
    long incrementVersion(ProjectId projectId);
}
