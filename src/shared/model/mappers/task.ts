import type { TaskDto, TaskEntity } from '@shared/model/task'

export function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    displayName: task.displayName,
    color: task.color,
    createdAt: task.createdAt.toISOString(),
    modifiedAt: task.modifiedAt?.toISOString() ?? null,
    deletedAt: task.deletedAt?.toISOString() ?? null,
  }
}
