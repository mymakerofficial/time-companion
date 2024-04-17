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
import { createFixtures } from '@test/helpers/createFixtures'

export interface ServiceFixtures {
  database: Database
  taskService: TaskService
  projectService: ProjectService
  fixture: ProjectsAndTasksTestFixture
}

export const useServiceFixtures = createFixtures<ServiceFixtures>({
  database: () => {
    return createTestDatabase()
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
  fixture: ({ database, taskService, projectService }) => {
    return new ProjectsAndTasksTestFixture(
      database,
      taskService,
      projectService,
    )
  },
})
