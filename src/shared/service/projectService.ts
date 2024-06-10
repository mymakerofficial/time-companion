import type {
  CreateProject,
  ProjectDto,
  UpdateProject,
} from '@shared/model/project'
import { projectSchema } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import type { UpdateTask } from '@shared/model/task'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService extends EntityService<ProjectDto> {
  // get all non-deleted projects ordered by displayName
  getProjects(): Promise<Array<ProjectDto>>
  // get a project by its id. returns null if the project does not exist
  getProjectById(id: string): Promise<Nullable<ProjectDto>>
  // create a new project and return the created project
  createProject(project: Partial<CreateProject>): Promise<ProjectDto>
  // patches a project by its id, updates the modifiedAt field and returns the updated project
  patchProjectById(
    id: string,
    partialProject: Partial<UpdateTask>,
  ): Promise<ProjectDto>
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
  extends EntityServiceImpl<ProjectDto>
  implements ProjectService
{
  private readonly projectPersistence: ProjectPersistence

  constructor(deps: ProjectServiceDependencies) {
    super()
    this.projectPersistence = deps.projectPersistence
  }

  async getProjects(): Promise<Array<ProjectDto>> {
    return await this.projectPersistence.getProjects()
  }

  async getProjectById(id: string): Promise<Nullable<ProjectDto>> {
    return await this.projectPersistence.getProjectById(id)
  }

  async createProject(project: Partial<CreateProject>): Promise<ProjectDto> {
    const newProject = await this.projectPersistence.createProject({
      ...getSchemaDefaults(projectSchema),
      ...project,
    })

    this.publishCreated(newProject)

    return newProject
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<UpdateProject>,
  ): Promise<ProjectDto> {
    const changedFields = keysOf(partialProject)

    const patchedProject = await this.projectPersistence.patchProjectById(
      id,
      partialProject,
    )

    this.publishUpdated(patchedProject, changedFields)

    return patchedProject
  }

  async softDeleteProject(id: string): Promise<void> {
    await this.projectPersistence.softDeleteProject(id)

    this.publishDeleted(id)
  }
}
