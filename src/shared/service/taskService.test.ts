import {
  describe,
  expectTypeOf,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest'
import type { TaskEntityDto } from '@shared/model/task'
import { ProjectsAndTasksTestFixture } from '@shared/service/projectsAndTasksTestFixture'
import { randomElement } from '@shared/lib/utils/random'

describe.sequential('taskService', async () => {
  const fixture = new ProjectsAndTasksTestFixture()

  await fixture.createSampleProjects()

  const subscriber = vi.fn()

  beforeAll(() => {
    fixture.taskService.subscribe({}, subscriber)
  })

  afterAll(() => {
    fixture.taskService.unsubscribe({}, subscriber)
  })

  afterEach(() => {
    subscriber.mockClear()
  })

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

    it('should throw if task with displayName and same project already exists', async () => {
      const task = randomElement(await fixture.getTasks())

      expect(
        fixture.taskService.createTask({
          projectId: task.projectId,
          displayName: task.displayName,
          color: null,
        }),
      ).rejects.toThrowError(
        `Task with displayName ${task.displayName} already exists in project ${task.projectId}`,
      )
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

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.getTaskById('non-existent-id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
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

    it('should throw if invalid fields are changed', async () => {
      const task = randomElement(await fixture.getTasks())

      expect(
        fixture.taskService.patchTaskById(task.id, {
          // @ts-expect-error
          id: 'invalid',
          createdAt: 'invalid',
          projectId: 'invalid',
        }),
      ).rejects.toThrowError(
        'tried to patch with invalid fields: id, createdAt, projectId',
      )
    })

    it('should notify subscribers of the change', async () => {
      const task = randomElement(await fixture.getTasks())

      await fixture.taskService.patchTaskById(task.id, {
        displayName: 'Other Patched Task',
      })

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'updated',
          data: expect.objectContaining({
            displayName: 'Other Patched Task',
          }),
          changedFields: ['displayName'],
        },
        {
          type: 'updated',
          entityId: task.id,
          field: ['displayName', 'modifiedAt'],
        },
      )
    })
  })

  describe('changeProjectOnTaskById', () => {
    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.changeProjectOnTaskById('non-existent-id', 'id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it('should throw if project with id is not found', async () => {
      const task = randomElement(await fixture.getTasks())

      expect(
        fixture.taskService.changeProjectOnTaskById(task.id, 'non-existent-id'),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should change the project', async () => {
      const task = randomElement(await fixture.getTasks())
      const project = randomElement(await fixture.getProjectsWithoutTasks())

      const res = await fixture.taskService.changeProjectOnTaskById(
        task.id,
        project.id,
      )

      expect(fixture.projectService.getProjectByTaskId(task.id)).resolves.toBe(
        project,
      )

      expect(res.projectId).toBe(project.id)

      expect(subscriber).toHaveBeenCalledOnce()
    })
  })

  describe('deleteTask', () => {
    it('should delete a task by id', async () => {
      const task = randomElement(await fixture.getTasks())

      await fixture.taskService.deleteTask(task.id)

      expect(fixture.taskService.getTaskById(task.id)).rejects.toThrow(
        `Task with id ${task.id} not found`,
      )
    })

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.deleteTask('non-existent-id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const task = randomElement(await fixture.getTasks())

      await fixture.taskService.deleteTask(task.id)

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'deleted',
          id: task.id,
        },
        {
          type: 'deleted',
          entityId: task.id,
        },
      )
    })
  })
})
