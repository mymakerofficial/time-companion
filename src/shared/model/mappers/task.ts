import type { TaskDto, TaskEntity } from '@shared/model/task'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { acceptNull } from '@shared/lib/utils/acceptNull'

export function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    displayName: task.displayName,
    color: task.color,
    createdAt: PlainDateTime.from(task.createdAt),
    modifiedAt: acceptNull(PlainDateTime.from)(task.modifiedAt),
    deletedAt: acceptNull(PlainDateTime.from)(task.deletedAt),
  }
}
