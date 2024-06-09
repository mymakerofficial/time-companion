import type { ProjectDto, ProjectEntity } from '@shared/model/project'

export function toProjectDto(project: ProjectEntity): ProjectDto {
  return {
    id: project.id,
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    isBreak: project.isBreak,
    createdAt: project.createdAt.toISOString(),
    modifiedAt: project.modifiedAt?.toISOString() ?? null,
    deletedAt: project.deletedAt?.toISOString() ?? null,
  }
}
