import { createSingleton } from '@shared/lib/helpers/createSingleton'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@renderer/facade/database/database'
import { isDefined } from '@shared/lib/utils/checks'

export const projectService = createSingleton((): ProjectService => {
  if (isDefined(window.electronAPI)) {
    return window.electronAPI.service.project as ProjectService
  }

  return createProjectService({
    projectPersistence: createProjectPersistence({
      database: database(),
    }),
  })
})
