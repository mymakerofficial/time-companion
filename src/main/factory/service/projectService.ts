import { createSingleton } from '@shared/lib/helpers/createSingleton'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@main/factory/database/database'

export const projectService = createSingleton((): ProjectService => {
  return createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()