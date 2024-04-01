import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import {
  type EntityPublisher,
  EntityPublisherImpl,
} from '@shared/events/entityPublisher'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import { assertOnlyValidFieldsChanged } from '@shared/service/helpers/assertOnlyValidFieldsChanged'
import type { ProjectPersistence } from '@shared/persistence/projectPersistence'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
  projectPersistence: ProjectPersistence
}

export interface TaskService extends EntityPublisher<TaskEntityDto> {
  getTasks: () => Promise<ReadonlyArray<Readonly<TaskEntityDto>>>
  getTaskById: (id: string) => Promise<Nullable<Readonly<TaskEntityDto>>>
  getTasksByProjectId: (
    projectId: string,
  ) => Promise<ReadonlyArray<TaskEntityDto>>
  createTask: (task: Readonly<TaskDto>) => Promise<Readonly<TaskEntityDto>>
  patchTaskById: (
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ) => Promise<Readonly<TaskEntityDto>>
  changeProjectOnTaskById: (
    taskId: string,
    projectId: string,
  ) => Promise<Readonly<TaskEntityDto>>
  deleteTask: (id: string) => Promise<void>
}

class TaskServiceImpl
  extends EntityPublisherImpl<TaskEntityDto>
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
    const newTask = await this.taskPersistence.createTask(task)

    this.notify(
      { type: 'created', entityId: newTask.id },
      { type: 'created', data: newTask },
    )

    return newTask
  }

  private async uncheckedPatchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
    changedFields: ReadonlyArray<keyof TaskDto>,
  ): Promise<Readonly<TaskEntityDto>> {
    const patchedTask = await this.taskPersistence.patchTaskById(
      id,
      partialTask,
    )

    this.notify(
      {
        type: 'updated',
        entityId: id,
        field: [...changedFields, 'modifiedAt'],
      },
      {
        type: 'updated',
        data: patchedTask,
        changedFields,
      },
    )

    return patchedTask
  }

  async patchTaskById(
    id: string,
    partialTask: Partial<Readonly<TaskDto>>,
  ): Promise<Readonly<TaskEntityDto>> {
    const changedFields = keysOf(partialTask)

    assertOnlyValidFieldsChanged(changedFields, ['displayName', 'color'])

    return await this.uncheckedPatchTaskById(id, partialTask, changedFields)
  }

  async changeProjectOnTaskById(
    taskId: string,
    projectId: string,
  ): Promise<Readonly<TaskEntityDto>> {
    await this.getTaskById(taskId) // Ensure task exists
    const project = await this.projectPersistence.getProjectById(projectId) // Ensure project exists

    return await this.uncheckedPatchTaskById(
      taskId,
      { projectId: project.id },
      ['projectId'],
    )
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskPersistence.deleteTask(id)

    this.notify({ type: 'deleted', entityId: id }, { type: 'deleted', id })
  }
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}
