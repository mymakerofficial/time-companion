import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import {
  type EntityPublisher,
  EntityPublisherImpl,
  getEntityChannel,
} from '@shared/events/entityPublisher'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import { asyncGetOrDefault, asyncGetOrNull } from '@shared/lib/utils/result'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
}

export interface TaskService extends EntityPublisher<TaskEntityDto> {
  getTasks: () => Promise<ReadonlyArray<TaskEntityDto>>
  getTaskById: (id: string) => Promise<Nullable<Readonly<TaskEntityDto>>>
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

class TaskServiceImpl
  extends EntityPublisherImpl<TaskEntityDto>
  implements TaskService
{
  private readonly taskPersistence: TaskPersistence

  constructor(deps: TaskServiceDependencies) {
    super()
    this.taskPersistence = deps.taskPersistence
  }

  async getTasks(): Promise<ReadonlyArray<TaskEntityDto>> {
    return await asyncGetOrDefault(this.taskPersistence.getTasks(), [])
  }

  async getTaskById(id: string): Promise<Nullable<Readonly<TaskEntityDto>>> {
    return await asyncGetOrNull(this.taskPersistence.getTaskById(id))
  }

  async getTasksByProjectId(
    projectId: string,
  ): Promise<ReadonlyArray<TaskEntityDto>> {
    return await this.taskPersistence.getTasksByProjectId(projectId)
  }

  async createTask(task: Readonly<TaskDto>): Promise<Readonly<TaskEntityDto>> {
    return await this.taskPersistence.createTask(task)
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const changedFields = keysOf(partialTask)

    const patchedTask = await this.taskPersistence.patchTaskById(
      id,
      partialTask,
    )

    this.notify(getEntityChannel(id), {
      type: 'updated',
      data: patchedTask,
      changedFields,
    })

    return patchedTask
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskPersistence.deleteTask(id)

    this.notify(getEntityChannel(id), { type: 'deleted', id })
  }
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}
