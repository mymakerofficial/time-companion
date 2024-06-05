import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import { uuid } from '@shared/lib/utils/uuid'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService extends EntityService<ProjectEntityDto> {
  // get all non-deleted projects ordered by displayName
  getProjects(): Promise<Array<ProjectEntityDto>>
  // get a project by its id. returns null if the project does not exist
  getProjectById(id: string): Promise<Nullable<ProjectEntityDto>>
  // create a new project and return the created project
  createProject(project: ProjectDto): Promise<ProjectEntityDto>
  // patches a project by its id, updates the modifiedAt field and returns the updated project
  patchProjectById(
    id: string,
    partialProject: Partial<ProjectDto>,
  ): Promise<ProjectEntityDto>
  // soft deletes a project by its id,
  //  this does not delete the project from the database but sets the deletedAt field
  softDeleteProject(id: string): Promise<void>
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
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

  async getProjects(): Promise<Array<ProjectEntityDto>> {
    return await this.projectPersistence.getProjects()
  }

  async getProjectById(id: string): Promise<Nullable<ProjectEntityDto>> {
    return await this.projectPersistence.getProjectById(id)
  }

  async createProject(project: ProjectDto): Promise<ProjectEntityDto> {
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
    partialProject: Partial<ProjectDto>,
  ): Promise<ProjectEntityDto> {
    const changedFields = keysOf(partialProject)

    const patchedProject = await this.projectPersistence.patchProjectById(id, {
      ...partialProject,
      modifiedAt: new Date().toISOString(),
    })

    this.publishUpdated(patchedProject, changedFields)

    return patchedProject
  }

  async softDeleteProject(id: string): Promise<void> {
    await this.projectPersistence.patchProjectById(id, {
      deletedAt: new Date().toISOString(),
    })

    this.publishDeleted(id)
  }
}
