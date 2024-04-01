import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'
import {
  type EntityPublisher,
  EntityPublisherImpl,
} from '@shared/events/entityPublisher'
import { asyncGetOrDefault, asyncGetOrNull } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService extends EntityPublisher<ProjectEntityDto> {
  // get all non-deleted projects ordered by displayName
  getProjects(): Promise<ReadonlyArray<ProjectEntityDto>>
  // get a project by its id. returns null if the project does not exist
  getProjectById(id: string): Promise<Nullable<Readonly<ProjectEntityDto>>>
  // get a project by a task id. returns null if the project does not exist
  getProjectByTaskId(
    taskId: string,
  ): Promise<Nullable<Readonly<ProjectEntityDto>>>
  // create a new project and return the created project
  createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>>
  // patches a project by its id, updates the modifiedAt field and returns the updated project
  patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>>
  // soft deletes a project by its id,
  // this does not delete the project from the database but sets the deletedAt field
  deleteProject(id: string): Promise<void>
}

class ProjectServiceImpl
  extends EntityPublisherImpl<ProjectEntityDto>
  implements ProjectService
{
  private readonly projectPersistence: ProjectPersistence

  constructor(deps: ProjectServiceDependencies) {
    super()
    this.projectPersistence = deps.projectPersistence
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await asyncGetOrDefault(this.projectPersistence.getProjects(), [])
  }

  async getProjectById(
    id: string,
  ): Promise<Nullable<Readonly<ProjectEntityDto>>> {
    return await asyncGetOrNull(this.projectPersistence.getProjectById(id))
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Nullable<Readonly<ProjectEntityDto>>> {
    return await asyncGetOrNull(
      this.projectPersistence.getProjectByTaskId(taskId),
    )
  }

  async createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectPersistence.createProject(project)
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    const changedFields = keysOf(partialProject)

    const patchedProject = await this.projectPersistence.patchProjectById(
      id,
      partialProject,
    )

    this.notify(
      { type: 'updated', entityId: id, field: changedFields },
      {
        type: 'updated',
        data: patchedProject,
        changedFields,
      },
    )

    return patchedProject
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectPersistence.deleteProject(id)

    this.notify({ type: 'deleted', entityId: id }, { type: 'deleted', id })
  }
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
}
