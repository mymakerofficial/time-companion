import type { TaskDto, TaskEntity } from '@shared/model/task'

export function toTaskDto(task: TaskEntity): TaskDto {
  return task
}
