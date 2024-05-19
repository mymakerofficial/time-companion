import {
  afterAll,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest'
import type { ProjectEntityDto } from '@shared/model/project'
import { useServiceFixtures } from '@test/fixtures/service/serviceFixtures'

// TODO make this test not flaky

describe.skip('projectService', () => {
  const { databaseHelpers, projectService, projectHelpers, taskHelpers } =
    useServiceFixtures()

  const subscriber = vi.fn()

  beforeAll(async () => {
    await databaseHelpers.setup()
    projectService.subscribe({}, subscriber)
  })

  afterAll(async () => {
    await databaseHelpers.teardown()
    projectService.unsubscribe({}, subscriber)
  })

  describe('createProject', async () => {
    it.each(await projectHelpers.getSampleProjects())(
      'should create a project %o',
      async (project) => {
        const res = await projectService.createProject(project)

        expectTypeOf(res).toMatchTypeOf<ProjectEntityDto>()

        // TODO actually test the values
      },
    )

    it('should throw if project with displayName already exists', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      await expect(() =>
        projectService.createProject({
          displayName: randomProject.displayName,
          color: null,
          isBillable: false,
        }),
      ).rejects.toThrowError(
        `Project with displayName "${randomProject.displayName}" already exists.`,
      )
    })
  })

  describe('getProjects', () => {
    it('should get all projects', async () => {
      const resProject = await projectService.getProjects()

      expect(resProject).toHaveLength(
        projectHelpers.getExpectedProjectsLength(),
      )

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const expectedProjects = await projectHelpers.getSortedSampleProjects()

      const resProjects = await projectService.getProjects()

      const expectedNames = expectedProjects.map(
        (project) => project.displayName,
      )
      const resNames = resProjects.map((project) => project.displayName)

      expect(resNames).toEqual(expectedNames)
    })
  })

  describe('getProjectById', () => {
    it('should get a project by id', async (index) => {
      const randomProject = await projectHelpers.getRandomExistingProject({
        safetyOffset: 1, // exclude first and last elements
      })

      const resProject = await projectService.getProjectById(randomProject.id)

      expect(resProject).toEqual(randomProject)
    })

    it('should throw if project with id is not found', async () => {
      await expect(() =>
        projectService.getProjectById('non-existent-id'),
      ).rejects.toThrowError('Project with id "non-existent-id" not found.')
    })
  })

  describe('getProjectByTaskId', () => {
    it('should get a project by task id', async () => {
      await taskHelpers.createSampleTasks()

      const randomTask = await taskHelpers.getRandomExistingTaskWithProject({
        safetyOffset: 1, // exclude first and last elements
      })

      const resProject = await projectService.getProjectByTaskId(randomTask.id)

      expect(resProject).toMatchObject({
        id: randomTask.projectId,
      })
    })

    it('should throw if project with taskId is not found', async () => {
      await expect(() =>
        projectService.getProjectByTaskId('non-existent-id'),
      ).rejects.toThrowError('Project with taskId "non-existent-id" not found.')
    })
  })

  describe('patchProjectById', () => {
    it('should patch a project by id', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      const resPatched = await projectService.patchProjectById(
        randomProject.id,
        {
          displayName: 'Patched Project',
        },
      )

      expect(resPatched.displayName).toBe('Patched Project')

      // TODO test other values
    })

    it('should throw if project with id is not found', async () => {
      await expect(() =>
        projectService.patchProjectById('non-existent-id', {
          displayName: 'Patched Project',
        }),
      ).rejects.toThrowError('Project with id "non-existent-id" not found.')
    })

    it('should throw if invalid fields are changed', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      await expect(() =>
        projectService.patchProjectById(randomProject.id, {
          // @ts-expect-error
          id: 'invalid',
          createdAt: 'invalid',
          invalidField: 'invalid',
        }),
      ).rejects.toThrowError(
        `Tried to patch entity using illegal fields: "id", "createdAt", "invalidField".`,
      )
    })

    it('should notify subscribers of the change', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      await projectService.patchProjectById(randomProject.id, {
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
          entityId: randomProject.id,
          field: ['displayName', 'modifiedAt'],
        },
      )
    })
  })

  describe('softDeleteProject', () => {
    it('should delete a project by id', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      await projectService.softDeleteProject(randomProject.id)

      const resProjects = await projectService.getProjects()

      expect(resProjects).not.toContain(randomProject)
    })

    it('should delete tasks associated with the project', async () => {
      const randomProject =
        await projectHelpers.getRandomExistingProjectWithTasks()

      await projectService.softDeleteProject(randomProject.id)

      const tasks = await taskHelpers.getExistingTasksForProject(
        randomProject.id,
      )

      expect(tasks).toHaveLength(0)
    })

    it('should throw if project with id is not found', async () => {
      await expect(() =>
        projectService.softDeleteProject('non-existent-id'),
      ).rejects.toThrowError('Project with id "non-existent-id" not found.')
    })

    it('should notify subscribers of the change', async () => {
      const randomProject = await projectHelpers.getRandomExistingProject()

      await projectService.softDeleteProject(randomProject.id)

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'deleted',
          id: randomProject.id,
        },
        {
          type: 'deleted',
          entityId: randomProject.id,
        },
      )
    })
  })
})
