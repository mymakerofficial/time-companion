import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import type { ProjectPersistence } from '@shared/persistence/projectPersistence'
import { createSingleton } from '@shared/lib/helpers/createSingleton'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService {
  getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>>
  getProjectById(id: string): Promise<Readonly<ProjectEntityDto>>
  createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>>
  patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>>
  deleteProject(id: string): Promise<void>
}

class ProjectServiceImpl implements ProjectService {
  private readonly projectsPersistence: ProjectPersistence

  constructor({ projectPersistence }: ProjectServiceDependencies) {
    this.projectsPersistence = projectPersistence
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.projectsPersistence.getProjects()
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectsPersistence.getProjectById(id)
  }

  async createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectsPersistence.createProject(project)
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectsPersistence.patchProjectById(id, partialProject)
  }

  async deleteProject(id: string): Promise<void> {
    return await this.projectsPersistence.deleteProject(id)
  }
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
}

export const projectsController = createSingleton<
  [ProjectServiceDependencies],
  ProjectService
>(createProjectService)
