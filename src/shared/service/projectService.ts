import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import { assertOnlyValidFieldsChanged } from '@shared/service/helpers/assertOnlyValidFieldsChanged'
import { asyncGetOrNull } from '@shared/lib/utils/result'
import { check, isAbsent } from '@shared/lib/utils/checks'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService extends EntityService<ProjectEntityDto> {
  // get all non-deleted projects ordered by displayName
  getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>>
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
  extends EntityServiceImpl<ProjectEntityDto>
  implements ProjectService
{
  private readonly projectPersistence: ProjectPersistence

  constructor(deps: ProjectServiceDependencies) {
    super()
    this.projectPersistence = deps.projectPersistence
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.projectPersistence.getProjects()
  }

  async getProjectById(
    id: string,
  ): Promise<Nullable<Readonly<ProjectEntityDto>>> {
    return await this.projectPersistence.getProjectById(id)
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Nullable<Readonly<ProjectEntityDto>>> {
    return await this.projectPersistence.getProjectByTaskId(taskId)
  }

  async createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    const existingProject = await asyncGetOrNull(
      this.projectPersistence.getProjectByDisplayName(project.displayName),
    )

    check(
      isAbsent(existingProject),
      `Project with displayName "${project.displayName}" already exists.`,
    )

    const newProject = await this.projectPersistence.createProject(project)

    this.publishCreated(newProject)

    return newProject
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    const changedFields = keysOf(partialProject)

    assertOnlyValidFieldsChanged(changedFields, [
      'displayName',
      'color',
      'isBillable',
    ])

    const patchedProject = await this.projectPersistence.patchProjectById(
      id,
      partialProject,
    )

    this.publishUpdated(patchedProject, changedFields)

    return patchedProject
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectPersistence.deleteProject(id)

    this.publishDeleted(id)
  }
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
}
