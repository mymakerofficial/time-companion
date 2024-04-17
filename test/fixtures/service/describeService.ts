import { test } from 'vitest'
import type { Database } from '@shared/database/database'
import {
  createTaskService,
  type TaskService,
} from '@shared/service/taskService'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import { createTestDatabase } from '@shared/database/testDatabase'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { ProjectsAndTasksTestFixture } from '@test/fixtures/service/projectsAndTasksTestFixture'

export interface ServiceTestFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  fixture: ProjectsAndTasksTestFixture
}

export const describeService = test.extend<ServiceTestFixtures>({
  database: async ({}, use) => {
    use(createTestDatabase())
  },
  taskService: async ({ database }, use) => {
    const taskService = createTaskService({
      taskPersistence: createTaskPersistence({
        database: database,
      }),
      projectPersistence: createProjectPersistence({
        database: database,
      }),
    })

    use(taskService)
  },
  projectService: async ({ database, taskService }, use) => {
    const projectService = createProjectService({
      projectPersistence: createProjectPersistence({
        database: database,
      }),
      taskService: taskService,
    })

    use(projectService)
  },
  fixture: async ({ database, taskService, projectService }, use) => {
    use(new ProjectsAndTasksTestFixture(database, taskService, projectService))
  },
})
