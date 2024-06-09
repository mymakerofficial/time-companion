import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import type {
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import type { ProjectDto } from '@shared/model/project'

export const projectService: ProjectService = (() => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      ProjectService,
      EntityPublisherTopics<ProjectDto>,
      EntityPublisherEvent<ProjectDto>
    >(window.electronAPI.service.project)
  }

  return createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
  })
})()
