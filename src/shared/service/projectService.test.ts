import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest'
import type { ProjectEntityDto } from '@shared/model/project'
import { createInMemoryDatabase } from '@shared/database/inMemoryDatabase'
import { createProjectService } from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'

describe('projectService', () => {
  const database = createInMemoryDatabase()

  const projectService = createProjectService({
    projectPersistence: createProjectPersistence({
      database,
    }),
  })

  beforeAll(async () => {
    await database.createTable('projects')
  })

  describe('createProject', () => {
    test('should create a project', async () => {
      const result = await projectService.createProject({
        displayName: 'Test Project',
        color: 'blue',
        isBillable: true,
      })

      expectTypeOf(result).toMatchTypeOf<ProjectEntityDto>()
      expect(result).toMatchObject({
        id: expect.any(String),
        displayName: 'Test Project',
        color: 'blue',
        isBillable: true,
        createdAt: expect.any(String),
        modifiedAt: null,
        deletedAt: null,
      })
    })
  })
})
