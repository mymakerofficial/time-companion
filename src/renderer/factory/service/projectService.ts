import { createSingleton } from '@shared/lib/helpers/createSingleton'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import type { EntityPublisherEvent } from '@shared/events/entityPublisher'
import type { ProjectEntityDto } from '@shared/model/project'

export const projectService = createSingleton((): ProjectService => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      ProjectService,
      EntityPublisherEvent<ProjectEntityDto>
    >(window.electronAPI.service.project)
  }

  return createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()
