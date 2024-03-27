import { describe, expectTypeOf, it, expect, vi } from 'vitest'
import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
import { createProjectService } from '@shared/service/projectService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { testDatabase } from '@shared/database/testDatabase'
import { firstOf, lastOf } from '@shared/lib/utils/list'
import { noop } from '@shared/lib/utils/noop'

describe.sequential('projectService', () => {
  const projectService = createProjectService({
    projectPersistence: createProjectPersistence({
      database: testDatabase(),
    }),
  })

  const projects: Array<ProjectDto> = [
    { displayName: 'Taking over the world', color: 'blue', isBillable: true },
    { displayName: 'Eating some cheese', color: 'yellow', isBillable: true },
    { displayName: 'Break', color: 'green', isBillable: false },
  ]

  describe('createProject', () => {
    it.each(projects)('should create a project %o', async (project) => {
      const res = await projectService.createProject(project)

      expectTypeOf(res).toMatchTypeOf<ProjectEntityDto>()

      // TODO actually test the values
    })
  })

  describe('getProjects', () => {
    it('should get all projects', async () => {
      const res = await projectService.getProjects()

      expect(res).toHaveLength(projects.length)

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const res = await projectService.getProjects()

      const resNames = res.map((project) => project.displayName)
      const expected = projects.map((project) => project.displayName).sort()

      expect(resNames).toEqual(expected)
    })
  })

  describe('getProjectById', () => {
    it('should get a project by id', async (index) => {
      const resAll = await projectService.getProjects()

      const project = lastOf(resAll)

      const resById = await projectService.getProjectById(project.id)

      expect(resById).toEqual(project)
    })

    it('should return null if project with id is not found', async () => {
      const res = await projectService.getProjectById('non-existent-id')

      expect(res).toBeNull()
    })
  })

  describe('getProjectByTaskId', () => {
    it.todo('should get a project by task id')

    it.todo('should return null if project with task id is not found')
  })

  describe('patchProjectById', () => {
    it('should patch a project by id', async () => {
      const resAll = await projectService.getProjects()

      const project = firstOf(resAll)

      const resPatched = await projectService.patchProjectById(project.id, {
        displayName: 'Patched Project',
      })

      expect(resPatched.displayName).toBe('Patched Project')

      // TODO test other values
    })

    it('should throw if project with id is not found', () => {
      expect(
        projectService.patchProjectById('non-existent-id', {
          displayName: 'Patched Project',
        }),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const resAll = await projectService.getProjects()
      const project = firstOf(resAll)

      const subscriber = vi.fn(noop)

      projectService.subscribe(project.id, subscriber)

      await projectService.patchProjectById(project.id, {
        displayName: 'Patched Project',
      })

      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith({
        type: 'updated',
        data: expect.objectContaining({
          displayName: 'Patched Project',
        }),
        changedFields: ['displayName'],
      })

      projectService.unsubscribe(project.id, subscriber)
    })
  })

  describe('deleteProject', () => {
    it('should delete a project by id', async () => {
      const resAll = await projectService.getProjects()
      const project = firstOf(resAll)

      await projectService.deleteProject(project.id)

      const resAllAfterDelete = await projectService.getProjects()

      expect(resAllAfterDelete).not.toContain(project)
    })

    it('should throw if project with id is not found', () => {
      expect(
        projectService.deleteProject('non-existent-id'),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const resAll = await projectService.getProjects()
      const project = firstOf(resAll)

      const subscriber = vi.fn(noop)

      projectService.subscribe(project.id, subscriber)

      await projectService.deleteProject(project.id)

      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith({
        type: 'deleted',
        data: null,
        changedFields: [],
      })

      projectService.unsubscribe(project.id, subscriber)
    })
  })
})
