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
import { projectsTable } from '@shared/model/project'
import { tasksTable } from '@shared/model/task'
import { indexedDBAdapter } from '@shared/database/adapters/indexedDB/database'
import fakeIndexedDB from 'fake-indexeddb'

export interface ServiceFixtures {
  database: Database
  databaseHelpers: {
    setup: () => Promise<void>
    teardown: () => Promise<void>
  }
  taskService: TaskService
  projectService: ProjectService
  projectHelpers: ProjectTestHelpers
  taskHelpers: TaskTestHelpers
}

export const useServiceFixtures = createFixtures<ServiceFixtures>({
  database: () => {
    return createDatabase(indexedDBAdapter(fakeIndexedDB))
  },
  databaseHelpers: ({ database }) => ({
    setup: async () => {
      return await database.open('services-test-db', 1, async (transaction) => {
        await transaction.createTable(projectsTable)
        await transaction.createTable(tasksTable)
      })
    },
    teardown: async () => {
      await database.close()
      await database.delete('services-test-db')
    },
  }),
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
  projectHelpers: ({ taskService, projectService }) => {
    return new ProjectTestHelpers(taskService, projectService)
  },
  taskHelpers: ({ taskService, projectService }) => {
    return new TaskTestHelpers(taskService, projectService)
  },
})
