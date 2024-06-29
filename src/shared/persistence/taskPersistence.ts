import {
  type CreateTask,
  type TaskDto,
  tasksTable,
  type UpdateTask,
} from '@shared/model/task'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import { toTaskDto } from '@shared/model/mappers/task'
import { uuid } from '@shared/lib/utils/uuid'
import type { Database } from '@shared/drizzle/database'
import { and, asc, eq, isNull } from 'drizzle-orm'

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
    const res = await this.database
      .select()
      .from(tasksTable)
      .where(isNull(tasksTable.deletedAt))
      .orderBy(asc(tasksTable.displayName))
    return res.map(toTaskDto)
  }

  async getTaskById(id: string): Promise<TaskDto> {
    const res = await this.database
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), isNull(tasksTable.deletedAt)))
      .limit(1)
    check(isNotEmpty(res), `Task with id "${id}" not found.`)
    return toTaskDto(firstOf(res))
  }

  async createTask(task: CreateTask): Promise<TaskDto> {
    const res = await this.database
      .insert(tasksTable)
      .values({
        id: uuid(),
        ...task,
      })
      .returning()
    return toTaskDto(firstOf(res))
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<UpdateTask>>,
  ): Promise<Readonly<TaskDto>> {
    const res = await this.database
      .update(tasksTable)
      .set(partialTask)
      .where(and(eq(tasksTable.id, id), isNull(tasksTable.deletedAt)))
      .returning()
    check(isNotEmpty(res), `Task with id "${id}" not found.`)
    return toTaskDto(firstOf(res))
  }

  async softDeleteTask(id: string): Promise<void> {
    const res = await this.database
      .update(tasksTable)
      .set({ deletedAt: new Date() })
      .where(and(eq(tasksTable.id, id), isNull(tasksTable.deletedAt)))
      .returning()
    check(isNotEmpty(res), `Task with id "${id}" not found.`)
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
