import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import { assertOnlyValidFieldsChanged } from '@shared/service/helpers/assertOnlyValidFieldsChanged'
import type { ProjectPersistence } from '@shared/persistence/projectPersistence'
import { isPresent } from '@shared/lib/utils/checks'
import { asyncGetOrThrow } from '@shared/lib/utils/result'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import { uuid } from '@shared/lib/utils/uuid'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
  projectPersistence: ProjectPersistence
}

export interface TaskService extends EntityService<TaskEntityDto> {
  // get all non-deleted tasks ordered by displayName
  getTasks: () => Promise<ReadonlyArray<Readonly<TaskEntityDto>>>
  // get a task by its id. returns null if the task does not exist
  getTaskById: (id: string) => Promise<Nullable<Readonly<TaskEntityDto>>>
  // get all tasks of a project by its id
  getTasksByProjectId: (
    projectId: string,
  ) => Promise<ReadonlyArray<TaskEntityDto>>
  // create a new task and return the created task
  createTask: (task: Readonly<TaskDto>) => Promise<Readonly<TaskEntityDto>>
  // patches a task by its id, updates the modifiedAt field and returns the updated task
  patchTaskById: (
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ) => Promise<Readonly<TaskEntityDto>>
  // soft deletes a task by its id,
  //  this does not delete the task from the database but sets the deletedAt field
  softDeleteTask: (id: string) => Promise<void>
  // soft deletes all tasks of a project by its id
  softDeleteTasksByProjectId: (projectId: string) => Promise<void>
}

class TaskServiceImpl
  extends EntityServiceImpl<TaskEntityDto>
  implements TaskService
{
  private readonly taskPersistence: TaskPersistence
  private readonly projectPersistence: ProjectPersistence

  constructor(deps: TaskServiceDependencies) {
    super()
    this.taskPersistence = deps.taskPersistence
    this.projectPersistence = deps.projectPersistence
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.taskPersistence.getTasks()
  }

  async getTaskById(id: string): Promise<Nullable<Readonly<TaskEntityDto>>> {
    return await this.taskPersistence.getTaskById(id)
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.taskPersistence.getTasksByProjectId(projectId)
  }

  async createTask(task: Readonly<TaskDto>): Promise<Readonly<TaskEntityDto>> {
    const newTask = await this.taskPersistence.createTask({
      id: uuid(),
      ...task,
      createdAt: new Date().toISOString(),
      modifiedAt: null,
      deletedAt: null,
    })

    this.publishCreated(newTask)

    return newTask
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const changedFields = keysOf(partialTask)

    assertOnlyValidFieldsChanged(changedFields, [
      'displayName',
      'color',
      'projectId',
    ])

    if (isPresent(partialTask.projectId)) {
      await asyncGetOrThrow(
        this.projectPersistence.getProjectById(partialTask.projectId),
        `Tried to set projectId on Task with id "${id}" to "${partialTask.projectId}" which does not exist.`,
      )
    }

    const patchedTask = await this.taskPersistence.patchTaskById(id, {
      ...partialTask,
      modifiedAt: new Date().toISOString(),
    })

    this.publishUpdated(patchedTask, changedFields)

    return patchedTask
  }

  async softDeleteTask(id: string): Promise<void> {
    await this.taskPersistence.patchTaskById(id, {
      deletedAt: new Date().toISOString(),
    })

    this.publishDeleted(id)
  }

  async softDeleteTasksByProjectId(projectId: string): Promise<void> {
    const tasks = await this.taskPersistence.getTasksByProjectId(projectId)

    for (const task of tasks) {
      await this.softDeleteTask(task.id)
    }
  }
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}
