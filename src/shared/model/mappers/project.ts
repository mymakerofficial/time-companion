import type { ProjectDto, ProjectEntity } from '@shared/model/project'
import { plainDateTimeFromDate } from '@shared/model/mappers/dateToPlainDateTime'

export function toProjectDto(project: ProjectEntity): ProjectDto {
  return {
    id: project.id,
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    isBreak: project.isBreak,
    createdAt: plainDateTimeFromDate(project.createdAt),
    modifiedAt: project.modifiedAt
      ? plainDateTimeFromDate(project.modifiedAt)
      : null,
    deletedAt: project.deletedAt
      ? plainDateTimeFromDate(project.deletedAt)
      : null,
  }
}
