import { describe, expectTypeOf, test } from 'vitest'
import type { ProjectEntityDto } from '@shared/model/project'
import {
  createProjectService,
  projectService,
} from '@shared/service/projectService'

describe('projectService', () => {
  describe('createProject', () => {
    test('should create a project', async () => {
      const result = await projectService().createProject({
        displayName: 'Test Project',
        color: 'blue',
        isBillable: true,
      })

      expectTypeOf(result).toMatchTypeOf<ProjectEntityDto>()
    })
  })
})
