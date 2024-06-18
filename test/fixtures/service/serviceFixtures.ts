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
import { createDayService, type DayService } from '@shared/service/dayService'
import { createDayPersistence } from '@shared/persistence/dayPersistence'
import {
  createTimeEntryService,
  type TimeEntryService,
} from '@shared/service/timeEntryService'
import { createTimeEntryPersistence } from '@shared/persistence/timeEntryPersistence'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { DayTestHelpers } from '@test/fixtures/service/dayTestHelpers'

import 'fake-indexeddb/auto'
import { TimeEntryTestHelpers } from '@test/fixtures/service/timeEntryTestHelpers'

export interface ServiceFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  dayService: DayService
  timeEntryService: TimeEntryService
  serviceHelpers: ServiceTestHelpers
  projectHelpers: ProjectTestHelpers
  taskHelpers: TaskTestHelpers
  dayHelpers: DayTestHelpers
  timeEntryHelpers: TimeEntryTestHelpers
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
    })
  },
  projectService: ({ database }) => {
    return createProjectService({
      projectPersistence: createProjectPersistence({
        database: database,
      }),
    })
  },
  dayService: ({ database }) => {
    return createDayService({
      dayPersistence: createDayPersistence({
        database: database,
      }),
    })
  },
  timeEntryService: ({ database }) => {
    return createTimeEntryService({
      timeEntryPersistence: createTimeEntryPersistence({
        database: database,
      }),
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
  dayHelpers: ({ dayService }) => {
    return new DayTestHelpers(dayService)
  },
  timeEntryHelpers: ({ timeEntryService }) => {
    return new TimeEntryTestHelpers(timeEntryService)
  },
})

export function useServiceTest() {
  const fixtures = useServiceFixtures()

  beforeAll(async () => {
    await fixtures.serviceHelpers.setup()
  })

  afterAll(async () => {
    await fixtures.serviceHelpers.teardown()
  })

  afterEach(async () => {
    await fixtures.serviceHelpers.cleanup()
  })

  return fixtures
}
