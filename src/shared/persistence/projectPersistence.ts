import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import type { Database } from '@shared/database/database'
import { uuid } from '@shared/lib/utils/uuid'
import type { TaskEntityDto } from '@shared/model/task'
import { asyncGetOrThrow } from '@shared/lib/utils/result'

export interface ProjectPersistenceDependencies {
  database: Database
}

export interface ProjectPersistence {
  getProjects(): Promise<ReadonlyArray<ProjectEntityDto>>
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

class ProjectPersistenceImpl implements ProjectPersistence {
  private readonly database: Database

  constructor(deps: ProjectPersistenceDependencies) {
    this.database = deps.database
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.database.table<ProjectEntityDto>('projects').findMany({
      where: { deletedAt: { equals: null } },
      orderBy: { displayName: 'asc' },
    })
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database.table<ProjectEntityDto>('projects').findFirst({
        where: {
          AND: [{ id: { equals: id } }, { deletedAt: { equals: null } }],
        },
      }),
      `Project with id ${id} not found`,
    )
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database
        .join<ProjectEntityDto, TaskEntityDto>('projects', 'tasks')
        .left({
          on: { id: 'projectId' },
          where: { id: { equals: taskId } },
        })
        .findFirst({
          where: { deletedAt: { equals: null } },
        }),
      `Project with task id ${taskId} not found`,
    )
  }

  async createProject(
    project: Readonly<ProjectDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.database.table<ProjectEntityDto>('projects').create({
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

    return await this.database.table<ProjectEntityDto>('projects').update({
      where: { id: { equals: id } },
      data: patchedProject,
    })
  }

  async deleteProject(id: string): Promise<void> {
    await this.getProjectById(id) // ensure project exists

    await this.database.table<ProjectEntityDto>('projects').update({
      where: { id: { equals: id } },
      data: { deletedAt: new Date().toISOString() },
    })
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
