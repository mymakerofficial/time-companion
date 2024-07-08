import type { ProjectDto, ProjectEntity } from '@shared/model/project'

export function toProjectDto(project: ProjectEntity): ProjectDto {
  return project
}
