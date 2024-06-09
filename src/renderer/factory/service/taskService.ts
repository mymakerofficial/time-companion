import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import type { TaskService } from '@shared/service/taskService'
import { createTaskService } from '@shared/service/taskService'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import type {
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import type { TaskDto } from '@shared/model/task'

export const taskService: TaskService = (() => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      TaskService,
      EntityPublisherTopics<TaskDto>,
      EntityPublisherEvent<TaskDto>
    >(window.electronAPI.service.task)
  }

  return createTaskService({
    taskPersistence: createTaskPersistence({
      database,
    }),
  })
})()
