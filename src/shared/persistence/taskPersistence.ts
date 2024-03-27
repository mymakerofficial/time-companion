import type { Database, Table } from '@shared/database/database'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import { todo } from '@shared/lib/utils/todo'
import { asyncGetOrThrow } from '@shared/lib/utils/result'
import { uuid } from '@shared/lib/utils/uuid'
import type { ProjectEntityDto } from '@shared/model/project'
import { check, isDefined } from '@shared/lib/utils/checks'

export interface TaskPersistenceDependencies {
  database: Database
}

export interface TaskPersistence {
  getTasks: () => Promise<ReadonlyArray<TaskEntityDto>>
  getTaskById: (id: string) => Promise<Readonly<TaskEntityDto>>
  getTasksByProjectId: (
    projectId: string,
  ) => Promise<ReadonlyArray<TaskEntityDto>>
  createTask: (task: Readonly<TaskDto>) => Promise<Readonly<TaskEntityDto>>
  patchTaskById: (
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ) => Promise<Readonly<TaskEntityDto>>
  deleteTask: (id: string) => Promise<void>
}

export class TaskPersistenceImpl implements TaskPersistence {
  private readonly database: Database
  private readonly tasksTable: Table<TaskEntityDto>
  private readonly projectsTable: Table<ProjectEntityDto>

  constructor(deps: TaskPersistenceDependencies) {
    this.database = deps.database
    this.tasksTable = this.database.table('tasks')
    this.projectsTable = this.database.table('projects')
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.tasksTable.findMany({
      where: {
        deletedAt: { equals: null },
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async getTaskById(id: string): Promise<Readonly<TaskEntityDto>> {
    return await asyncGetOrThrow(
      this.tasksTable.findFirst({
        where: {
          AND: [{ id: { equals: id } }, { deletedAt: { equals: null } }],
        },
      }),
      `Task with id ${id} not found`,
    )
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    const project = await this.projectsTable.findFirst({
      where: {
        AND: [{ id: { equals: projectId } }, { deletedAt: { equals: null } }],
      },
    })

    check(isDefined(project), `Project with id ${projectId} not found`)

    return await this.tasksTable.findMany({
      where: {
        AND: [
          { projectId: { equals: projectId } },
          { deletedAt: { equals: null } },
        ],
      },
      orderBy: { displayName: 'asc' },
    })
  }

  async createTask(task: Readonly<TaskDto>): Promise<Readonly<TaskEntityDto>> {
    const project = await this.projectsTable.findFirst({
      where: {
        AND: [
          { id: { equals: task.projectId } },
          { deletedAt: { equals: null } },
        ],
      },
    })

    check(isDefined(project), `Project with id ${task.projectId} not found`)

    return await this.tasksTable.create({
      data: {
        id: uuid(),
        ...task,
        createdAt: new Date().toISOString(),
        modifiedAt: null,
        deletedAt: null,
      },
    })
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const originalProject = await this.getTaskById(id)

    const patchedTask: TaskEntityDto = {
      ...originalProject,
      ...partialTask,
      modifiedAt: new Date().toISOString(),
    }

    return await this.tasksTable.update({
      where: { id: { equals: id } },
      data: patchedTask,
    })
  }

  async deleteTask(id: string): Promise<void> {
    await this.getTaskById(id) // ensure task exists

    await this.tasksTable.update({
      where: { id: { equals: id } },
      data: { deletedAt: new Date().toISOString() },
    })
  }
}

export function createTaskPersistence(
  deps: TaskPersistenceDependencies,
): TaskPersistence {
  return new TaskPersistenceImpl(deps)
}
