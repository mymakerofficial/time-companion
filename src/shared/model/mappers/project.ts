import type { ProjectDto, ProjectEntity } from '@shared/model/project'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export function toProjectDto(project: ProjectEntity): ProjectDto {
  return {
    id: project.id,
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    isBreak: project.isBreak,
    createdAt: PlainDateTime.from(project.createdAt),
    modifiedAt: project.modifiedAt
      ? PlainDateTime.from(project.modifiedAt)
      : null,
    deletedAt: project.deletedAt ? PlainDateTime.from(project.deletedAt) : null,
  }
}
