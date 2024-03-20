import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest'
import { ProjectServiceImpl } from '@shared/service/projectService'
import { ProjectPersistenceImpl } from '@shared/persistence/projectPersistence'
import { InMemoryDatabase } from '@shared/database/inMemoryDatabase'
import type { ProjectEntityDto } from '@shared/model/project'

describe('projectService', () => {
  const database = new InMemoryDatabase()

  const projectService = new ProjectServiceImpl({
    projectsPersistence: new ProjectPersistenceImpl({
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
