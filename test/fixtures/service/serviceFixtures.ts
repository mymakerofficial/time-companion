import { createTestDatabase } from '@shared/database/testDatabase'
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
import { ProjectsAndTasksTestFixture } from '@test/fixtures/service/projectsAndTasksTestFixture'
import type { Database } from '@shared/database/database'
import { todo } from '@shared/lib/utils/todo'

type FixtureFn<T, K extends keyof T> = (context: Omit<T, K>) => Promise<T[K]>

type Fixtures<T extends Record<string, any>> = {
  [K in keyof T]: FixtureFn<T, K>
}

function createFixtures<T extends Record<string, any> = {}>(
  fixtures: Fixtures<T>,
): () => T {
  todo()
}

export interface ServiceFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  fixture: ProjectsAndTasksTestFixture
}

export const useServiceFixtures = createFixtures<ServiceFixtures>({
  database: async () => {
    return createTestDatabase()
  },
  taskService: async ({ database }) => {
    return createTaskService({
      taskPersistence: createTaskPersistence({
        database: database,
      }),
      projectPersistence: createProjectPersistence({
        database: database,
      }),
    })
  },
  projectService: async ({ database, taskService }) => {
    return createProjectService({
      projectPersistence: createProjectPersistence({
        database: database,
      }),
      taskService: taskService,
    })
  },
  fixture: async ({ database, taskService, projectService }) => {
    return new ProjectsAndTasksTestFixture(
      database,
      taskService,
      projectService,
    )
  },
})
