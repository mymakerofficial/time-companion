import type { Database } from '@shared/database/types/database'
import { type TaskEntityDto, tasksTable } from '@shared/model/task'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@shared/database/types/errors'

export interface TaskPersistenceDependencies {
  database: Database
}

export interface TaskPersistence {
  getTasks: () => Promise<Array<TaskEntityDto>>
  getTaskById: (id: string) => Promise<TaskEntityDto>
  createTask: (task: TaskEntityDto) => Promise<TaskEntityDto>
  patchTaskById: (
    id: string,
    partialTask: Partial<TaskEntityDto>,
  ) => Promise<TaskEntityDto>
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

  async getTasks(): Promise<Array<TaskEntityDto>> {
    return await this.database
      .table(tasksTable)
      .findMany({
        where: tasksTable.deletedAt.isNull(),
        orderBy: tasksTable.displayName.asc(),
      })
      .catch(this.resolveError)
  }

  async getTaskById(id: string): Promise<TaskEntityDto> {
    const res = await this.database
      .table(tasksTable)
      .findFirst({
        range: tasksTable.id.range.only(id),
        where: tasksTable.deletedAt.isNull(),
      })
      .catch(this.resolveError)

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  async createTask(task: TaskEntityDto): Promise<TaskEntityDto> {
    return await this.database.table(tasksTable).insert({
      data: task,
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskEntityDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const res = await this.database
      .table(tasksTable)
      .update({
        range: tasksTable.id.range.only(id),
        where: tasksTable.deletedAt.isNull(),
        data: partialTask,
      })
      .catch(this.resolveError)

    check(isNotEmpty(res), `Task with id "${id}" not found.`)

    return firstOf(res)
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
