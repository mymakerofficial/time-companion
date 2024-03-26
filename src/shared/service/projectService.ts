import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { type ProjectPersistence } from '@shared/persistence/projectPersistence'

export interface ProjectServiceDependencies {
  projectPersistence: ProjectPersistence
}

export interface ProjectService {
  getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>>
  getProjectById(id: string): Promise<Readonly<ProjectEntityDto>>
  getProjectByTaskId(taskId: string): Promise<Readonly<ProjectEntityDto>>
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
  private readonly projectPersistence: ProjectPersistence

  constructor(deps: ProjectServiceDependencies) {
    this.projectPersistence = deps.projectPersistence
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.projectPersistence.getProjects()
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectPersistence.getProjectById(id)
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.projectPersistence.getProjectByTaskId(taskId)
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
    return await this.projectPersistence.patchProjectById(id, partialProject)
  }

  async deleteProject(id: string): Promise<void> {
    return await this.projectPersistence.deleteProject(id)
  }
}

export function createProjectService(
  deps: ProjectServiceDependencies,
): ProjectService {
  return new ProjectServiceImpl(deps)
}
