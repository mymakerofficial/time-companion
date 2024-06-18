import type { ProjectDto, ProjectEntity } from '@shared/model/project'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { acceptNull } from '@shared/lib/utils/acceptNull'

export function toProjectDto(project: ProjectEntity): ProjectDto {
  return {
    id: project.id,
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    isBreak: project.isBreak,
    createdAt: PlainDateTime.from(project.createdAt),
    modifiedAt: acceptNull(PlainDateTime.from)(project.modifiedAt),
    deletedAt: acceptNull(PlainDateTime.from)(project.deletedAt),
  }
}
