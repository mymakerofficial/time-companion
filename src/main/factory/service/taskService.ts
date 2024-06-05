import {
  createTaskService,
  type TaskService,
} from '@shared/service/taskService'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { database } from '@main/factory/database/database'

export const taskService: TaskService = (() => {
  return createTaskService({
    taskPersistence: createTaskPersistence({
      database,
    }),
  })
})()
