import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import type { Database } from '@shared/database/database'
import { createSingleton } from '@shared/lib/helpers/createSingleton'
import { uuid } from '@shared/lib/utils/uuid'

export interface ProjectPersistenceDependencies {
  database: Database
}

export interface ProjectPersistence {
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

class ProjectPersistenceImpl implements ProjectPersistence {
  private readonly database: Database

  constructor({ database }: ProjectPersistenceDependencies) {
    this.database = database
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.database.getAll<ProjectEntityDto>({
      table: 'projects',
    })
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    return await this.database.getFirst<ProjectEntityDto>({
      table: 'projects',
      where: { id: { equals: id } },
    })
  }

  async createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.database.insertOne<ProjectEntityDto>({
      table: 'projects',
      data: {
        id: uuid(),
        ...project,
        createdAt: new Date().toISOString(),
        modifiedAt: null,
        deletedAt: null,
      },
    })
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    const originalProject = await this.getProjectById(id)

    const patchedProject: ProjectEntityDto = {
      ...originalProject,
      ...partialProject,
      modifiedAt: new Date().toISOString(),
    }

    return await this.database.updateOne<ProjectEntityDto>({
      table: 'projects',
      where: { id: { equals: id } },
      data: patchedProject,
    })
  }

  async deleteProject(id: string): Promise<void> {
    await this.database.deleteOne<ProjectEntityDto>({
      table: 'projects',
      where: { id: { equals: id } },
    })
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}

export const projectsPersistence = createSingleton<
  [ProjectPersistenceDependencies],
  ProjectPersistence
>(createProjectPersistence)
