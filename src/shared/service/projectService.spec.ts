import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { useServiceFixtures } from '@test/fixtures/service/serviceFixtures'
import type { HasId } from '@shared/model/helpers/hasId'
import { uuid } from '@shared/lib/utils/uuid'

function byId(a: HasId, b: HasId) {
  return a.id.localeCompare(b.id)
}

function byDisplayName(a: { displayName: string }, b: { displayName: string }) {
  return a.displayName.localeCompare(b.displayName)
}

describe('projectService', () => {
  const { serviceHelpers, projectService, projectHelpers } =
    useServiceFixtures()

  const subscriber = vi.fn()

  beforeAll(async () => {
    await serviceHelpers.setup()
    projectService.subscribe({}, subscriber)
  })

  afterAll(async () => {
    await serviceHelpers.teardown()
    projectService.unsubscribe({}, subscriber)
  })

  afterEach(async () => {
    await serviceHelpers.cleanup()
    subscriber.mockClear()
  })

  describe('createProject', async () => {
    it('should create a project', async (project) => {
      const sampleProject = projectHelpers.sampleProject()

      await projectService.createProject(sampleProject)

      const projects = await projectHelpers.getAllProjects()

      expect(projects).toContainEqual(expect.objectContaining(sampleProject))
    })

    it.todo(
      'should throw if project with displayName already exists',
      async () => {
        await projectHelpers.createSampleProjects()

        const randomProject = await projectHelpers.getRandomExistingProject({
          safetyOffset: 1,
        })
        const sampleProject = projectHelpers.sampleProject({
          displayName: randomProject.displayName,
        })

        await expect(() =>
          projectService.createProject(sampleProject),
        ).rejects.toThrowError(
          `Project with displayName "${randomProject.displayName}" already exists.`,
        )
      },
    )
  })

  describe('getProjects', () => {
    it('should get all projects', async () => {
      const sampleProjects = await projectHelpers.createSampleProjects(6)

      const resProject = await projectService.getProjects()

      expect([...resProject].sort(byDisplayName)).toEqual(
        sampleProjects
          .sort(byDisplayName)
          .map((project) => expect.objectContaining(project)),
      )
    })

    it('should be ordered by displayName', async () => {
      const sampleProjects = await projectHelpers.createSampleProjects(6)

      const resProject = await projectService.getProjects()

      expect(resProject).toEqual(
        sampleProjects
          .sort(byDisplayName)
          .map((project) => expect.objectContaining(project)),
      )
    })
  })

  describe('getProjectById', () => {
    it('should get a project by id', async (index) => {
      await projectHelpers.createSampleProjects()
      const randomProject = await projectHelpers.getRandomExistingProject({
        safetyOffset: 1,
      })

      const resProject = await projectService.getProjectById(randomProject.id)

      expect(resProject).toEqual(randomProject)
    })

    it('should throw if project with id is not found', async () => {
      const nonExistentId = uuid()

      await expect(() =>
        projectService.getProjectById(nonExistentId),
      ).rejects.toThrowError(`Project with id "${nonExistentId}" not found.`)
    })
  })

  describe('patchProjectById', () => {
    it('should patch a project by id', async () => {
      await projectHelpers.createSampleProjects()
      const randomProject = await projectHelpers.getRandomExistingProject()

      const resPatched = await projectService.patchProjectById(
        randomProject.id,
        {
          displayName: 'Patched Project',
        },
      )

      expect(resPatched).toEqual({
        ...randomProject,
        displayName: 'Patched Project',
        modifiedAt: expect.any(String),
      })
    })

    it('should throw if project with id is not found', async () => {
      const nonExistentId = uuid()

      await expect(() =>
        projectService.patchProjectById(nonExistentId, {
          displayName: 'Patched Project',
        }),
      ).rejects.toThrowError(`Project with id "${nonExistentId}" not found.`)
    })

    it('should throw if invalid fields are changed', async () => {
      await projectHelpers.createSampleProjects()
      const randomProject = await projectHelpers.getRandomExistingProject()

      await expect(() =>
        projectService.patchProjectById(randomProject.id, {
          // @ts-expect-error
          id: 'invalid',
          createdAt: 'invalid',
          invalidField: 'invalid',
        }),
      ).rejects.toThrowError(
        `Tried to set value for undefined field "invalidField" on project.`,
      )
    })

    it('should notify subscribers of the change', async () => {
      await projectHelpers.createSampleProjects()
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
      await projectHelpers.createSampleProjects()
      const randomProject = await projectHelpers.getRandomExistingProject()

      await projectService.softDeleteProject(randomProject.id)

      const resProjects = await projectService.getProjects()

      expect(resProjects).not.toContain(randomProject)
    })

    it.todo('should delete tasks associated with the project')

    it('should throw if project with id is not found', async () => {
      const nonExistentId = uuid()

      await expect(() =>
        projectService.softDeleteProject(nonExistentId),
      ).rejects.toThrowError(`Project with id "${nonExistentId}" not found.`)
    })

    it('should notify subscribers of the change', async () => {
      await projectHelpers.createSampleProjects()
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
