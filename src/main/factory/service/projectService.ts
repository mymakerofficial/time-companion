import {
  createProjectService,
  type ProjectService,
} from '@shared/business/project/projectService'
import { createProjectPersistence } from '@shared/business/project/projectPersistence'
import { database } from '@main/factory/database/database'

export const projectService: ProjectService = (() => {
  return createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()
