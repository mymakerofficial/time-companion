import { createSingleton } from '@shared/lib/helpers/createSingleton'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createReceiverProxy } from '@shared/ipc/receiverProxy'

export const projectService = createSingleton((): ProjectService => {
  if (isDefined(window.electronAPI)) {
    return createReceiverProxy<ProjectService>(
      window.electronAPI.service.project.invoke,
    )
  }

  return createProjectService({
    projectPersistence: createProjectPersistence({
      database: database(),
    }),
  })
})
