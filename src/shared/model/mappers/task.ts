import type { TaskDto, TaskEntity } from '@shared/model/task'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    displayName: task.displayName,
    color: task.color,
    createdAt: PlainDateTime.from(task.createdAt),
    modifiedAt: task.modifiedAt ? PlainDateTime.from(task.modifiedAt) : null,
    deletedAt: task.deletedAt ? PlainDateTime.from(task.deletedAt) : null,
  }
}
