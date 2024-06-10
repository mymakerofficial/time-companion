import type { TaskDto, TaskEntity } from '@shared/model/task'
import { plainDateTimeFromDate } from '@shared/model/mappers/dateToPlainDateTime'

export function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    displayName: task.displayName,
    color: task.color,
    createdAt: plainDateTimeFromDate(task.createdAt),
    modifiedAt: task.modifiedAt ? plainDateTimeFromDate(task.modifiedAt) : null,
    deletedAt: task.deletedAt ? plainDateTimeFromDate(task.deletedAt) : null,
  }
}
