import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@main/factory/database/database'
import { taskService } from '@main/factory/service/taskService'

export const projectService: ProjectService = (() => {
  return createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
    taskService,
  })
})()
