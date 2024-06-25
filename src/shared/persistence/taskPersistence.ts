import type { Database } from '@database/types/database'
import {
  type CreateTask,
  type TaskDto,
  tasksTable,
  type UpdateTask,
} from '@shared/model/task'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import { toTaskDto } from '@shared/model/mappers/task'
import { uuid } from '@shared/lib/utils/uuid'

export interface TaskPersistenceDependencies {
  database: Database
}

export interface TaskPersistence {
  getTasks: () => Promise<Array<TaskDto>>
  getTaskById: (id: string) => Promise<TaskDto>
  createTask: (task: CreateTask) => Promise<TaskDto>
  patchTaskById: (
    id: string,
    partialTask: Partial<UpdateTask>,
  ) => Promise<TaskDto>
  softDeleteTask: (id: string) => Promise<void>
}

export class TaskPersistenceImpl implements TaskPersistence {
  private readonly database: Database

  constructor(deps: TaskPersistenceDependencies) {
    this.database = deps.database
  }

  protected resolveError(error: DatabaseError): never {
    if (errorIsUniqueViolation(error)) {
      throw new Error(
        `Task with ${error.columnName} "${error.value}" already exists.`,
      )
    }

    if (errorIsUndefinedColumn(error)) {
      throw new Error(
        `Tried to set value for undefined field "${error.columnName}" on task.`,
      )
    }

    throw error
  }

  async getTasks(): Promise<Array<TaskDto>> {
    return await this.database
      .table(tasksTable)
      .findMany({
        where: tasksTable.deletedAt.isNull(),
        orderBy: tasksTable.displayName.asc(),
        map: toTaskDto,
      })
      .catch(this.resolveError)
  }

  async getTaskById(id: string): Promise<TaskDto> {
    const res = await this.database
      .table(tasksTable)
      .findFirst({
        range: tasksTable.id.range.only(id),
        where: tasksTable.deletedAt.isNull(),
        map: toTaskDto,
      })
      .catch(this.resolveError)

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  async createTask(task: CreateTask): Promise<TaskDto> {
    return await this.database.table(tasksTable).insert({
      data: {
        id: uuid(),
        ...task,
        createdAt: new Date(),
        modifiedAt: null,
        deletedAt: null,
      },
      map: toTaskDto,
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<UpdateTask>>,
  ): Promise<Readonly<TaskDto>> {
    const res = await this.database
      .table(tasksTable)
      .update({
        range: tasksTable.id.range.only(id),
        where: tasksTable.deletedAt.isNull(),
        data: {
          ...partialTask,
          modifiedAt: new Date(),
        },
        map: toTaskDto,
      })
      .catch(this.resolveError)

    check(isNotEmpty(res), `Task with id "${id}" not found.`)

    return firstOf(res)
  }

  async softDeleteTask(id: string): Promise<void> {
    const res = await this.database.table(tasksTable).update({
      range: tasksTable.id.range.only(id),
      data: {
        deletedAt: new Date(),
      },
    })

    check(isNotEmpty(res), `Task with id "${id}" not found.`)
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
