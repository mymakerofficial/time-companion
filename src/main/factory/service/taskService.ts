import { createSingleton } from '@shared/lib/helpers/createSingleton'
import {
  createTaskService,
  type TaskService,
} from '@shared/service/taskService'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { database } from '@main/factory/database/database'
import { createProjectPersistence } from '../../../shared/persistence/projectPersistence'

export const taskService = createSingleton((): TaskService => {
  return createTaskService({
    taskPersistence: createTaskPersistence({
      database,
    }),
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()
