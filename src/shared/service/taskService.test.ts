import { describe, expectTypeOf, it, expect } from 'vitest'
import type { TaskEntityDto } from '@shared/model/task'
import { ProjectsAndTasksTestFixture } from '@shared/service/projectsAndTasksTestFixture'
import { randomElement } from '@shared/lib/utils/random'

describe.sequential('taskService', async () => {
  const fixture = new ProjectsAndTasksTestFixture()

  await fixture.createSampleProjects()

  describe('createTask', async () => {
    it.each(await fixture.getSampleTasks())(
      'should create a task %o',
      async (task) => {
        const res = await fixture.taskService.createTask(task)

        expectTypeOf(res).toMatchTypeOf<TaskEntityDto>()

        // TODO actually test the values
      },
    )

    it('should throw if project does not exist', () => {
      expect(
        fixture.taskService.createTask({
          projectId: 'non-existing-id',
          displayName: 'Fake task',
          color: null,
        }),
      ).rejects.toThrowError('Project with id non-existing-id not found')
    })
  })

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const res = await fixture.taskService.getTasks()

      expect(res).toHaveLength(fixture.getExpectedTasksLength())

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const expected = await fixture.getSortedSampleTasks()
      const expectedNames = expected.map((task) => task.displayName)

      const res = await fixture.taskService.getTasks()
      const resNames = res.map((task) => task.displayName)

      expect(resNames).toEqual(expectedNames)
    })
  })

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      const task = randomElement(await fixture.getTasks())

      const res = await fixture.taskService.getTaskById(task.id)

      expect(res).toEqual(task)
    })

    it('should return null if task with id is not found', async () => {
      const res = await fixture.taskService.getTaskById('non-existent-id')

      expect(res).toBeNull()
    })
  })

  describe('getTasksByProjectId', () => {
    it('should get tasks by project id', async () => {
      const project = randomElement(await fixture.getProjectsWithTasks())
      const expectedTasks = await fixture.getTasksForProject(project.id)

      const res = await fixture.taskService.getTasksByProjectId(project.id)

      expect(res).toEqual(expectedTasks)
    })

    it('should throw if project does not exist', async () => {
      expect(
        fixture.taskService.getTasksByProjectId('non-existent-id'),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should return empty array if project has no tasks', async () => {
      const randomProject = randomElement(
        await fixture.getProjectsWithoutTasks(),
      )

      const res = await fixture.taskService.getTasksByProjectId(
        randomProject.id,
      )

      expect(res).toEqual([])
    })
  })

  describe('patchTaskById', () => {
    it('should patch a task by id', async () => {
      const task = randomElement(await fixture.getTasks())

      const resPatched = await fixture.taskService.patchTaskById(task.id, {
        displayName: 'Patched Task',
      })

      expect(resPatched.displayName).toBe('Patched Task')
    })

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.patchTaskById('non-existent-id', {
          displayName: 'Patched Task',
        }),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it.todo('should notify subscribers of the change')
  })

  describe('deleteTask', () => {
    it('should delete a task by id', async () => {
      const task = randomElement(await fixture.getTasks())

      await fixture.taskService.deleteTask(task.id)

      const res = await fixture.taskService.getTaskById(task.id)

      expect(res).toBeNull()
    })

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.deleteTask('non-existent-id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it.todo('should notify subscribers of the change')
  })
})
