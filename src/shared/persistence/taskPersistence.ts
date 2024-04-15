import type { Database, Transaction } from '@shared/database/database'
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

  private async getTasksQuery(transaction: Transaction) {
    return await transaction.table<TaskEntityDto>('tasks').findMany({
      where: {
        deletedAt: { equals: null },
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      return await this.getTasksQuery(transaction)
    })
  }

  private async getTaskByIdQuery(
    transaction: Transaction,
    id: string,
  ): Promise<Readonly<TaskEntityDto>> {
    return await transaction.table<TaskEntityDto>('tasks').findFirst({
      where: {
        AND: [{ id: { equals: id } }, { deletedAt: { equals: null } }],
      },
    })
  }

  async getTaskById(id: string): Promise<Readonly<TaskEntityDto>> {
    return await asyncGetOrThrow(
      this.database.withTransaction(async (transaction) => {
        return await this.getTaskByIdQuery(transaction, id)
      }),
      `Task with id "${id}" not found.`,
    )
  }

  private getTaskByDisplayNameAndProjectIdQuery(
    transaction: Transaction,
    displayName: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    return transaction.table<TaskEntityDto>('tasks').findFirst({
      where: {
        AND: [
          { displayName: { equals: displayName } },
          { projectId: { equals: projectId } },
          { deletedAt: { equals: null } },
        ],
      },
    })
  }

  async getTaskByDisplayNameAndProjectId(
    displayName: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    return await asyncGetOrThrow(
      this.database.withTransaction(async (transaction) => {
        return await this.getTaskByDisplayNameAndProjectIdQuery(
          transaction,
          displayName,
          projectId,
        )
      }),
      `Task with displayName "${displayName}" and projectId "${projectId}" not found.`,
    )
  }

  private async getProjectByIdQuery(
    transaction: Transaction,
    projectId: string,
  ) {
    return await transaction.table<ProjectEntityDto>('projects').findFirst({
      where: {
        AND: [{ id: { equals: projectId } }, { deletedAt: { equals: null } }],
      },
    })
  }

  private async getTasksByProjectIdQuery(
    transaction: Transaction,
    projectId: string,
  ) {
    return await transaction.table<TaskEntityDto>('tasks').findMany({
      where: {
        AND: [
          { projectId: { equals: projectId } },
          { deletedAt: { equals: null } },
        ],
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const project = await this.getProjectByIdQuery(transaction, projectId)

      check(isDefined(project), `Project with id "${projectId}" not found.`)

      return await this.getTasksByProjectIdQuery(transaction, projectId)
    })
  }

  private async createTaskQuery(
    transaction: Transaction,
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await transaction.table<TaskEntityDto>('tasks').create({
      data: task,
    })
  }

  async createTask(
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const project = await this.getProjectByIdQuery(
        transaction,
        task.projectId,
      )

      check(
        isDefined(project),
        `Project with id "${task.projectId}" not found.`,
      )

      return await this.createTaskQuery(transaction, task)
    })
  }

  private async updateTaskQuery(
    transaction: Transaction,
    id: string,
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await transaction.table<TaskEntityDto>('tasks').update({
      where: { id: { equals: id } },
      data: task,
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const originalTask = await this.getTaskByIdQuery(transaction, id)

      check(isDefined(originalTask), `Task with id "${id}" not found.`)

      const patchedTask: TaskEntityDto = {
        ...originalTask,
        ...partialTask,
      }

      return await this.updateTaskQuery(transaction, id, patchedTask)
    })
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
