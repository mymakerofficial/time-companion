import type { TaskPersistence } from '@shared/persistence/taskPersistence'
import type { TaskDto, TaskEntityDto } from '@shared/model/task'
import type { Nullable } from '@shared/lib/utils/types'
import { keysOf } from '@shared/lib/utils/object'
import { assertOnlyValidFieldsChanged } from '@shared/service/helpers/assertOnlyValidFieldsChanged'
import type { ProjectPersistence } from '@shared/persistence/projectPersistence'
import { check, isAbsent } from '@shared/lib/utils/checks'
import { asyncGetOrNull } from '@shared/lib/utils/result'
import {
  type EntityService,
  EntityServiceImpl,
} from '@shared/service/helpers/entityService'

export interface TaskServiceDependencies {
  taskPersistence: TaskPersistence
  projectPersistence: ProjectPersistence
}

export interface TaskService extends EntityService<TaskEntityDto> {
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
    const existingTask = await asyncGetOrNull(
      this.taskPersistence.getTaskByDisplayNameAndProjectId(
        task.displayName,
        task.projectId,
      ),
    )

    check(
      isAbsent(existingTask),
      `Task with displayName ${task.displayName} already exists in project ${task.projectId}`,
    )

    const newTask = await this.taskPersistence.createTask(task)

    this.publishCreated(newTask)

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

    this.publishUpdated(patchedTask, changedFields)

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

    this.publishDeleted(id)
  }
}

export function createTaskService(deps: TaskServiceDependencies): TaskService {
  return new TaskServiceImpl(deps)
}
