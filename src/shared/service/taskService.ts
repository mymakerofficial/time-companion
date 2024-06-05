import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import { uuid } from '@shared/lib/utils/uuid'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
}

export interface TaskService extends EntityService<TaskEntityDto> {
  // get all non-deleted tasks ordered by displayName
  getTasks: () => Promise<Array<TaskEntityDto>>
  // get a task by its id. returns null if the task does not exist
  getTaskById: (id: string) => Promise<Nullable<TaskEntityDto>>
  // create a new task and return the created task
  createTask: (task: TaskDto) => Promise<TaskEntityDto>
  // patches a task by its id, updates the modifiedAt field and returns the updated task
  patchTaskById: (
    id: string,
    partialTask: Partial<TaskDto>,
  ) => Promise<TaskEntityDto>
  // soft deletes a task by its id,
  //  this does not delete the task from the database but sets the deletedAt field
  softDeleteTask: (id: string) => Promise<void>
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}

class TaskServiceImpl
  extends EntityServiceImpl<TaskEntityDto>
  implements TaskService
{
  private readonly taskPersistence: TaskPersistence

  constructor(deps: TaskServiceDependencies) {
    super()
    this.taskPersistence = deps.taskPersistence
  }

  async getTasks(): Promise<Array<TaskEntityDto>> {
    return await this.taskPersistence.getTasks()
  }

  async getTaskById(id: string): Promise<Nullable<TaskEntityDto>> {
    return await this.taskPersistence.getTaskById(id)
  }

  async createTask(task: TaskDto): Promise<TaskEntityDto> {
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
    partialTask: Partial<TaskDto>,
  ): Promise<TaskEntityDto> {
    const changedFields = keysOf(partialTask)

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
}
