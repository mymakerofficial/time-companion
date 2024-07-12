import {
  createTaskService,
  type TaskService,
} from '@shared/business/task/taskService'
import { createTaskPersistence } from '@shared/business/task/taskPersistence'
import { createProjectPersistence } from '@shared/business/project/projectPersistence'
import {
  createProjectService,
  type ProjectService,
} from '@shared/business/project/projectService'
import { createFixtures } from '@test/helpers/createFixtures'
import { ProjectTestHelpers } from '@test/fixtures/service/projectTestHelpers'
import { ServiceTestHelpers } from '@test/fixtures/service/serviceTestHelpers'
import {
  createDayService,
  type DayService,
} from '@shared/business/day/dayService'
import { createDayPersistence } from '@shared/business/day/dayPersistence'
import {
  createTimeEntryService,
  type TimeEntryService,
} from '@shared/business/timeEntry/timeEntryService'
import { createTimeEntryPersistence } from '@shared/business/timeEntry/timeEntryPersistence'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { DayTestHelpers } from '@test/fixtures/service/dayTestHelpers'
import BetterSQLite3 from 'better-sqlite3'
import { TimeEntryTestHelpers } from '@test/fixtures/service/timeEntryTestHelpers'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/drizzle/schema'
import type { Database } from '@shared/drizzle/database'
import { fixTransactions } from '@shared/drizzle/lib/transaction'
import {
  createSettingsService,
  type SettingsService,
} from '@shared/business/settings/settingsService'
import { createSettingsPersistence } from '@shared/business/settings/settingsPersistence'
import type {
  SettingsConfig,
  SettingsTypeMap,
} from '@shared/business/settings/types'

interface ServiceFixturesOptions {
  settingsConfig: SettingsConfig
}

export interface ServiceFixtures<TOpt extends ServiceFixturesOptions> {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  dayService: DayService
  timeEntryService: TimeEntryService
  settingsService: SettingsService<SettingsTypeMap<TOpt['settingsConfig']>>
  serviceHelpers: ServiceTestHelpers
  projectHelpers: ProjectTestHelpers
  dayHelpers: DayTestHelpers
  timeEntryHelpers: TimeEntryTestHelpers
}

export function useServiceFixtures<TOpt extends ServiceFixturesOptions>(
  options?: Partial<TOpt>,
) {
  const { settingsConfig = {} } = options || {}

  return createFixtures<ServiceFixtures<TOpt>>({
    database: () => {
      const client = new BetterSQLite3(':memory:')
      return fixTransactions(drizzle(client, { schema }))
    },
    taskService: ({ database }) => {
      return createTaskService({
        taskPersistence: createTaskPersistence({
          database,
        }),
      })
    },
    projectService: ({ database }) => {
      return createProjectService({
        projectPersistence: createProjectPersistence({
          database,
        }),
      })
    },
    dayService: ({ database }) => {
      return createDayService({
        dayPersistence: createDayPersistence({
          database,
        }),
      })
    },
    timeEntryService: ({ database }) => {
      return createTimeEntryService({
        timeEntryPersistence: createTimeEntryPersistence({
          database,
        }),
      })
    },
    settingsService: ({ database }) => {
      return createSettingsService({
        settingsPersistence: createSettingsPersistence({
          database,
        }),
        config: settingsConfig,
      })
    },
    serviceHelpers: ({ database }) => {
      return new ServiceTestHelpers(database)
    },
    projectHelpers: ({ taskService, projectService }) => {
      return new ProjectTestHelpers(taskService, projectService)
    },
    dayHelpers: ({ dayService }) => {
      return new DayTestHelpers(dayService)
    },
    timeEntryHelpers: ({ timeEntryService, database }) => {
      return new TimeEntryTestHelpers(timeEntryService, database)
    },
  })()
}

export function useServiceTest<TOpt extends ServiceFixturesOptions>(
  options?: Partial<TOpt>,
) {
  const fixtures = useServiceFixtures(options)

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
