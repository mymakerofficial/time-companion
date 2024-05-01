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
import type { Database } from '@shared/database/types/database'
import { createFixtures } from '@test/helpers/createFixtures'
import { ProjectTestHelpers } from '@test/fixtures/service/projectTestHelpers'
import { TaskTestHelpers } from '@test/fixtures/service/taskTestHelpers'

export interface ServiceFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  projectHelpers: ProjectTestHelpers
  taskHelpers: TaskTestHelpers
}

export const useServiceFixtures = createFixtures<ServiceFixtures>({
  database: createTestDatabase(),
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
