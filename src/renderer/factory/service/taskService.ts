import { createSingleton } from '@shared/lib/helpers/createSingleton'
import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createReceiverProxy } from '@shared/ipc/receiverProxy'
import type { TaskService } from '@shared/service/taskService'
import { createTaskService } from '@shared/service/taskService'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'

export const taskService = createSingleton((): TaskService => {
  if (isDefined(window.electronAPI)) {
    return createReceiverProxy<TaskService>(
      window.electronAPI.service.task.invoke,
    )
  }

  return createTaskService({
    taskPersistence: createTaskPersistence({
      database,
    }),
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()
