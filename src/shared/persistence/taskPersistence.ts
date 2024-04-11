import type { Database } from '@shared/database/database'
import type { TaskEntityDto } from '@shared/model/task'
import { asyncGetOrThrow } from '@shared/lib/utils/result'
import type { ProjectEntityDto } from '@shared/model/project'
import { check, isDefined } from '@shared/lib/utils/checks'

export interface TaskPersistenceDependencies {
  database: Database
}

export interface TaskPersistence {
  getTasks: () => Promise<ReadonlyArray<TaskEntityDto>>
  getTaskById: (id: string) => Promise<Readonly<TaskEntityDto>>
  getTaskByDisplayNameAndProjectId: (
    displayName: string,
    projectId: string,
  ) => Promise<Readonly<TaskEntityDto>>
  getTasksByProjectId: (
    projectId: string,
  ) => Promise<ReadonlyArray<TaskEntityDto>>
  createTask: (
    task: Readonly<TaskEntityDto>,
  ) => Promise<Readonly<TaskEntityDto>>
  patchTaskById: (
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ) => Promise<Readonly<TaskEntityDto>>
}

export class TaskPersistenceImpl implements TaskPersistence {
  private readonly database: Database

  constructor(deps: TaskPersistenceDependencies) {
    this.database = deps.database
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.table<TaskEntityDto>('tasks').findMany({
      where: {
        deletedAt: { equals: null },
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async getTaskById(id: string): Promise<Readonly<TaskEntityDto>> {
    return await asyncGetOrThrow(
      this.database.table<TaskEntityDto>('tasks').findFirst({
        where: {
          AND: [{ id: { equals: id } }, { deletedAt: { equals: null } }],
        },
      }),
      `Task with id "${id}" not found.`,
    )
  }

  async getTaskByDisplayNameAndProjectId(
    displayName: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    return await asyncGetOrThrow(
      this.database.table<TaskEntityDto>('tasks').findFirst({
        where: {
          AND: [
            { displayName: { equals: displayName } },
            { projectId: { equals: projectId } },
            { deletedAt: { equals: null } },
          ],
        },
      }),
      `Task with displayName "${displayName}" and projectId "${projectId}" not found.`,
    )
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    const project = await this.database
      .table<ProjectEntityDto>('projects')
      .findFirst({
        where: {
          AND: [{ id: { equals: projectId } }, { deletedAt: { equals: null } }],
        },
      })

    check(isDefined(project), `Project with id "${projectId}" not found.`)

    return await this.database.table<TaskEntityDto>('tasks').findMany({
      where: {
        AND: [
          { projectId: { equals: projectId } },
          { deletedAt: { equals: null } },
        ],
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async createTask(
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    const project = await this.database
      .table<ProjectEntityDto>('projects')
      .findFirst({
        where: {
          AND: [
            { id: { equals: task.projectId } },
            { deletedAt: { equals: null } },
          ],
        },
      })

    check(isDefined(project), `Project with id "${task.projectId}" not found.`)

    return await this.database.table<TaskEntityDto>('tasks').create({
      data: task,
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const originalProject = await this.getTaskById(id)

    const patchedTask: TaskEntityDto = {
      ...originalProject,
      ...partialTask,
    }

    return await this.database.table<TaskEntityDto>('tasks').update({
      where: { id: { equals: id } },
      data: patchedTask,
    })
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
