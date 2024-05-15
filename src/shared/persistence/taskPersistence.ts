import type { Database, Transaction } from '@shared/database/types/database'
import { type TaskEntityDto, tasksTable } from '@shared/model/task'
import { projectsTable } from '@shared/model/project'
import { check, isNotEmpty, isNotNull, isNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'

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
    return await transaction.table(tasksTable).findMany({
      where: tasksTable.deletedAt.isNull(),
      orderBy: tasksTable.displayName.asc(),
    })
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      return await this.getTasksQuery(transaction)
    })
  }

  private async getTaskByIdQuery(transaction: Transaction, id: string) {
    return await transaction.table(tasksTable).findFirst({
      where: tasksTable.id.equals(id).and(tasksTable.deletedAt.isNull()),
    })
  }

  async getTaskById(id: string): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.withTransaction(async (transaction) => {
      return await this.getTaskByIdQuery(transaction, id)
    })

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  private getTaskByDisplayNameAndProjectIdQuery(
    transaction: Transaction,
    displayName: string,
    projectId: string,
  ) {
    return transaction.table(tasksTable).findFirst({
      where: tasksTable.displayName
        .equals(displayName)
        .and(tasksTable.projectId.equals(projectId))
        .and(tasksTable.deletedAt.isNull()),
    })
  }

  async getTaskByDisplayNameAndProjectId(
    displayName: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.withTransaction(async (transaction) => {
      return await this.getTaskByDisplayNameAndProjectIdQuery(
        transaction,
        displayName,
        projectId,
      )
    })

    check(
      isNotNull(res),
      `Task with displayName "${displayName}" and projectId "${projectId}" not found.`,
    )

    return res
  }

  private async getProjectByIdQuery(
    transaction: Transaction,
    projectId: string,
  ) {
    return await transaction.table(projectsTable).findFirst({
      where: projectsTable.id
        .equals(projectId)
        .and(projectsTable.deletedAt.isNull()),
    })
  }

  private async getTasksByProjectIdQuery(
    transaction: Transaction,
    projectId: string,
  ) {
    return await transaction.table(tasksTable).findMany({
      where: tasksTable.projectId
        .equals(projectId)
        .and(tasksTable.deletedAt.isNull()),
      orderBy: tasksTable.displayName.asc(),
    })
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const project = await this.getProjectByIdQuery(transaction, projectId)

      check(isNotNull(project), `Project with id "${projectId}" not found.`)

      return await this.getTasksByProjectIdQuery(transaction, projectId)
    })
  }

  private async createTaskQuery(
    transaction: Transaction,
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await transaction.table(tasksTable).insert({
      data: task,
    })
  }

  async createTask(
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const existingTask = await this.getTaskByDisplayNameAndProjectIdQuery(
        transaction,
        task.displayName,
        task.projectId,
      )

      check(
        isNull(existingTask),
        `Task with displayName "${task.displayName}" already exists in project "${task.projectId}".`,
      )

      const project = await this.getProjectByIdQuery(
        transaction,
        task.projectId,
      )

      check(
        isNotNull(project),
        `Project with id "${task.projectId}" not found.`,
      )

      return await this.createTaskQuery(transaction, task)
    })
  }

  private async updateTaskQuery(
    transaction: Transaction,
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ) {
    return await transaction.table(tasksTable).update({
      where: tasksTable.id.equals(id),
      data: partialTask,
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.withTransaction(async (transaction) => {
      return await this.updateTaskQuery(transaction, id, partialTask)
    })

    check(isNotEmpty(res), `Task with id "${id}" not found.`)

    return firstOf(res)
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
