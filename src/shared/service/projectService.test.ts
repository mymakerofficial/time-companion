import { describe, expectTypeOf, test } from 'vitest'
import type { ProjectEntityDto } from '@shared/model/project'
import { createProjectService } from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { testDatabase } from '@shared/database/testDatabase'

describe('projectService', () => {
  const service = createProjectService({
    projectPersistence: createProjectPersistence({
      database: testDatabase(),
    }),
  })

  describe('createProject', () => {
    test('should create a project', async () => {
      const result = await service.createProject({
        displayName: 'Test Project',
        color: 'blue',
        isBillable: true,
      })

      expectTypeOf(result).toMatchTypeOf<ProjectEntityDto>()
    })
  })
})
