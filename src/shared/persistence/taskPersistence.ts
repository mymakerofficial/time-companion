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

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.table(tasksTable).findMany({
      where: tasksTable.deletedAt.isNull(),
      orderBy: tasksTable.displayName.asc(),
    })
  }

  async getTaskById(id: string): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.table(tasksTable).findFirst({
      where: tasksTable.id.equals(id).and(tasksTable.deletedAt.isNull()),
    })

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  async getTaskByDisplayNameAndProjectId(
    displayName: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.table(tasksTable).findFirst({
      where: tasksTable.displayName
        .equals(displayName)
        .and(tasksTable.projectId.equals(projectId))
        .and(tasksTable.deletedAt.isNull()),
    })

    check(
      isNotNull(res),
      `Task with displayName "${displayName}" and projectId "${projectId}" not found.`,
    )

    return res
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const project = await transaction.table(projectsTable).findFirst({
        where: projectsTable.id
          .equals(projectId)
          .and(projectsTable.deletedAt.isNull()),
      })

      check(isNotNull(project), `Project with id "${projectId}" not found.`)

      return await transaction.table(tasksTable).findMany({
        where: tasksTable.projectId
          .equals(projectId)
          .and(tasksTable.deletedAt.isNull()),
        orderBy: tasksTable.displayName.asc(),
      })
    })
  }
  async createTask(
    task: Readonly<TaskEntityDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    return await this.database.withTransaction(async (transaction) => {
      const existingTask = await transaction.table(tasksTable).findFirst({
        where: tasksTable.displayName
          .equals(task.displayName)
          .and(tasksTable.projectId.equals(task.projectId))
          .and(tasksTable.deletedAt.isNull()),
      })

      check(
        isNull(existingTask),
        `Task with displayName "${task.displayName}" already exists in project "${task.projectId}".`,
      )

      const project = await transaction.table(projectsTable).findFirst({
        where: projectsTable.id
          .equals(task.projectId)
          .and(projectsTable.deletedAt.isNull()),
      })

      check(
        isNotNull(project),
        `Project with id "${task.projectId}" not found.`,
      )

      return await transaction.table(tasksTable).insert({
        data: task,
      })
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database.table(tasksTable).update({
      where: tasksTable.id.equals(id),
      data: partialTask,
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
