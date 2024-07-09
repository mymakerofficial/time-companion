import {
  type CreateTask,
  type TaskDto,
  tasksTable,
  type UpdateTask,
} from '@shared/model/task'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf, firstOfOrNull } from '@shared/lib/utils/list'
import type { Database } from '@shared/drizzle/database'
import { asc, eq } from 'drizzle-orm'
import { handleSqliteError } from '@shared/drizzle/lib/error'

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
  deleteTask: (id: string) => Promise<void>
}

export class TaskPersistenceImpl implements TaskPersistence {
  private readonly database: Database

  constructor(deps: TaskPersistenceDependencies) {
    this.database = deps.database
  }

  async getTasks(): Promise<Array<TaskDto>> {
    return await this.database
      .select()
      .from(tasksTable)
      .orderBy(asc(tasksTable.displayName))
      .catch(handleSqliteError)
  }

  async getTaskById(id: string): Promise<TaskDto> {
    const res = await this.database
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .limit(1)
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  async createTask(task: CreateTask): Promise<TaskDto> {
    return await this.database
      .insert(tasksTable)
      .values(task)
      .returning()
      .catch(handleSqliteError)
      .then(firstOf)
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<UpdateTask>>,
  ): Promise<Readonly<TaskDto>> {
    const res = await this.database
      .update(tasksTable)
      .set(partialTask)
      .where(eq(tasksTable.id, id))
      .returning()
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Task with id "${id}" not found.`)

    return res
  }

  async deleteTask(id: string): Promise<void> {
    const res = await this.database
      .delete(tasksTable)
      .where(eq(tasksTable.id, id))
      .returning()
      .catch(handleSqliteError)

    check(isNotEmpty(res), `Task with id "${id}" not found.`)
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
