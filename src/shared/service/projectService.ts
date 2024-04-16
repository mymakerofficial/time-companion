import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import { assertOnlyValidFieldsChanged } from '@shared/service/helpers/assertOnlyValidFieldsChanged'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import type { TaskService } from '@shared/service/taskService'
import { uuid } from '@shared/lib/utils/uuid'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
  taskService: TaskService
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
  //  this does not delete the project from the database but sets the deletedAt field
  softDeleteProject(id: string): Promise<void>
}

class ProjectServiceImpl
  extends EntityServiceImpl<ProjectEntityDto>
  implements ProjectService
{
  private readonly projectPersistence: ProjectPersistence
  private readonly taskService: TaskService

  constructor(deps: ProjectServiceDependencies) {
    super()
    this.projectPersistence = deps.projectPersistence
    this.taskService = deps.taskService
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
    const newProject = await this.projectPersistence.createProject({
      id: uuid(),
      ...project,
      createdAt: new Date().toISOString(),
      modifiedAt: null,
      deletedAt: null,
    })

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

    const patchedProject = await this.projectPersistence.patchProjectById(id, {
      ...partialProject,
      modifiedAt: new Date().toISOString(),
    })

    this.publishUpdated(patchedProject, changedFields)

    return patchedProject
  }

  async softDeleteProject(id: string): Promise<void> {
    await this.taskService.softDeleteTasksByProjectId(id)

    await this.projectPersistence.patchProjectById(id, {
      deletedAt: new Date().toISOString(),
    })

    this.publishDeleted(id)
  }
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
}
