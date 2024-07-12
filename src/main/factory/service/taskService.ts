import {
  createTaskService,
  type TaskService,
} from '@shared/business/task/taskService'
import { createTaskPersistence } from '@shared/business/task/taskPersistence'
import { database } from '@main/factory/database/database'

export const taskService: TaskService = (() => {
  return createTaskService({
    taskPersistence: createTaskPersistence({
      database,
    }),
  })
})()
