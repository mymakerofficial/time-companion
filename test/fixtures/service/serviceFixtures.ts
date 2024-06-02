import {
  createTaskService,
  type TaskService,
} from '@shared/service/taskService'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import type { Database } from '@shared/database/types/database'
import { createFixtures } from '@test/helpers/createFixtures'
import { ProjectTestHelpers } from '@test/fixtures/service/projectTestHelpers'
import { TaskTestHelpers } from '@test/fixtures/service/taskTestHelpers'
import { createDatabase } from '@shared/database/factory/database'
import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import fakeIndexedDB from 'fake-indexeddb'
import config from '@shared/database.config'
import { ServiceTestHelpers } from '@test/fixtures/service/serviceTestHelpers'

import 'fake-indexeddb/auto'

export interface ServiceFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  serviceHelpers: ServiceTestHelpers
  projectHelpers: ProjectTestHelpers
  taskHelpers: TaskTestHelpers
}

export const useServiceFixtures = createFixtures<ServiceFixtures>({
  database: () => {
    return createDatabase(
      indexedDBAdapter('services-test-db', fakeIndexedDB),
      config,
    )
  },
  taskService: ({ database }) => {
    return createTaskService({
      taskPersistence: createTaskPersistence({
        database: database,
      }),
      projectPersistence: createProjectPersistence({
        database: database,
      }),
    })
  },
  projectService: ({ database, taskService }) => {
    return createProjectService({
      projectPersistence: createProjectPersistence({
        database: database,
      }),
      taskService: taskService,
    })
  },
  serviceHelpers: ({ database }) => {
    return new ServiceTestHelpers(database)
  },
  projectHelpers: ({ taskService, projectService }) => {
    return new ProjectTestHelpers(taskService, projectService)
  },
  taskHelpers: ({ taskService, projectService }) => {
    return new TaskTestHelpers(taskService, projectService)
  },
})
