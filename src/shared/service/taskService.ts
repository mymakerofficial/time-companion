import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import {
  type CreateTask,
  type TaskDto,
  taskSchema,
  type UpdateTask,
} from '@shared/model/task'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
}

export interface TaskService extends EntityService<TaskDto> {
  // get all non-deleted tasks ordered by displayName
  getTasks: () => Promise<Array<TaskDto>>
  // get a task by its id. returns null if the task does not exist
  getTaskById: (id: string) => Promise<Nullable<TaskDto>>
  // create a new task and return the created task
  createTask: (task: Partial<CreateTask>) => Promise<TaskDto>
  // patches a task by its id, updates the modifiedAt field and returns the updated task
  patchTaskById: (
    id: string,
    partialTask: Partial<UpdateTask>,
  ) => Promise<TaskDto>
  // soft deletes a task by its id,
  //  this does not delete the task from the database but sets the deletedAt field
  softDeleteTask: (id: string) => Promise<void>
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}

class TaskServiceImpl
  extends EntityServiceImpl<TaskDto>
  implements TaskService
{
  private readonly taskPersistence: TaskPersistence

  constructor(deps: TaskServiceDependencies) {
    super()
    this.taskPersistence = deps.taskPersistence
  }

  async getTasks(): Promise<Array<TaskDto>> {
    return await this.taskPersistence.getTasks()
  }

  async getTaskById(id: string): Promise<Nullable<TaskDto>> {
    return await this.taskPersistence.getTaskById(id)
  }

  async createTask(task: Partial<CreateTask>): Promise<TaskDto> {
    const newTask = await this.taskPersistence.createTask({
      ...getSchemaDefaults(taskSchema),
      ...task,
    })

    this.publishCreated(newTask)

    return newTask
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<UpdateTask>,
  ): Promise<TaskDto> {
    const changedFields = keysOf(partialTask)

    const patchedTask = await this.taskPersistence.patchTaskById(
      id,
      partialTask,
    )

    this.publishUpdated(patchedTask, changedFields)

    return patchedTask
  }

  async softDeleteTask(id: string): Promise<void> {
    await this.taskPersistence.softDeleteTask(id)

    this.publishDeleted(id)
  }
}
