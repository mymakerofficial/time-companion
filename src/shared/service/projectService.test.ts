import {
  describe,
  expectTypeOf,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
} from 'vitest'
import type { ProjectEntityDto } from '@shared/model/project'
import { firstOf, lastOf } from '@shared/lib/utils/list'
import { ProjectsAndTasksTestFixture } from '@shared/service/projectsAndTasksTestFixture'
import { randomElement } from '@shared/lib/utils/random'

describe.sequential('projectService', async () => {
  const fixture = new ProjectsAndTasksTestFixture()

  const subscriber = vi.fn()

  beforeAll(() => {
    fixture.projectService.subscribe({}, subscriber)
  })

  afterAll(() => {
    fixture.projectService.unsubscribe({}, subscriber)
  })

  describe('createProject', async () => {
    it.each(await fixture.getSampleProjects())(
      'should create a project %o',
      async (project) => {
        const res = await fixture.projectService.createProject(project)

        expectTypeOf(res).toMatchTypeOf<ProjectEntityDto>()

        // TODO actually test the values
      },
    )
  })

  describe('getProjects', () => {
    it('should get all projects', async () => {
      const res = await fixture.projectService.getProjects()

      expect(res).toHaveLength(fixture.getExpectedProjectsLength())

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const expected = await fixture.getSortedSampleProjects()
      const expectedNames = expected.map((project) => project.displayName)

      const res = await fixture.projectService.getProjects()
      const resNames = res.map((project) => project.displayName)

      expect(resNames).toEqual(expectedNames)
    })
  })

  describe('getProjectById', () => {
    it('should get a project by id', async (index) => {
      const project = lastOf(await fixture.getProjects())

      const resById = await fixture.projectService.getProjectById(project.id)

      expect(resById).toEqual(project)
    })

    it('should return null if project with id is not found', async () => {
      const res = await fixture.projectService.getProjectById('non-existent-id')

      expect(res).toBeNull()
    })
  })

  describe('getProjectByTaskId', () => {
    it('should get a project by task id', async () => {
      await fixture.createSampleTasks()

      const task = firstOf(await fixture.getTasks())

      const res = await fixture.projectService.getProjectByTaskId(task.id)

      expect(res).toMatchObject({
        id: task.projectId,
      })
    })

    it('should return null if project with task id is not found', async () => {
      const res =
        await fixture.projectService.getProjectByTaskId('non-existent-id')

      expect(res).toBeNull()
    })
  })

  describe('patchProjectById', () => {
    it('should patch a project by id', async () => {
      const project = randomElement(await fixture.getProjects())

      const resPatched = await fixture.projectService.patchProjectById(
        project.id,
        {
          displayName: 'Patched Project',
        },
      )

      expect(resPatched.displayName).toBe('Patched Project')

      // TODO test other values
    })

    it('should throw if project with id is not found', () => {
      expect(
        fixture.projectService.patchProjectById('non-existent-id', {
          displayName: 'Patched Project',
        }),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const project = randomElement(await fixture.getProjects())

      await fixture.projectService.patchProjectById(project.id, {
        displayName: 'Other Patched Project',
      })

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'updated',
          data: expect.objectContaining({
            displayName: 'Other Patched Project',
          }),
          changedFields: ['displayName'],
        },
        {
          type: 'updated',
          entityId: project.id,
          field: ['displayName'],
        },
      )
    })
  })

  describe('deleteProject', () => {
    it('should delete a project by id', async () => {
      const project = randomElement(await fixture.getProjects())

      await fixture.projectService.deleteProject(project.id)

      const res = await fixture.projectService.getProjects()

      expect(res).not.toContain(project)
    })

    it('should throw if project with id is not found', () => {
      expect(
        fixture.projectService.deleteProject('non-existent-id'),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const project = randomElement(await fixture.getProjects())

      await fixture.projectService.deleteProject(project.id)

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'deleted',
          id: project.id,
        },
        {
          type: 'deleted',
          entityId: project.id,
        },
      )
    })
  })
})
