import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest'
import type { TaskEntityDto } from '@shared/model/task'
import { useServiceFixtures } from '@test/fixtures/service/serviceFixtures'

// TODO make this test not flaky

describe.skip('taskService', () => {
  const {
    serviceHelpers,
    taskService,
    projectService,
    taskHelpers,
    projectHelpers,
  } = useServiceFixtures()

  const subscriber = vi.fn()

  beforeAll(async () => {
    await serviceHelpers.setup()
    await projectHelpers.createSampleProjects()
    taskService.subscribe({}, subscriber)
  })

  afterAll(async () => {
    await serviceHelpers.teardown()
    taskService.unsubscribe({}, subscriber)
  })

  afterEach(() => {
    subscriber.mockClear()
  })

  describe('createTask', () => {
    it('should create a task', async () => {
      const sampleTasks = await taskHelpers.getSampleTasks()

      for (const sampleTask of sampleTasks) {
        const resTask = await taskService.createTask(sampleTask)

        expectTypeOf(resTask).toMatchTypeOf<TaskEntityDto>()

        // TODO actually test the values
      }
    })

    it('should throw if project does not exist', async () => {
      await expect(() =>
        taskService.createTask({
          projectId: 'non-existing-id',
          displayName: 'Fake task',
          color: null,
        }),
      ).rejects.toThrowError('Project with id "non-existing-id" not found.')
    })

    it('should throw if task with displayName and same project already exists', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await expect(() =>
        taskService.createTask({
          projectId: randomTask.projectId,
          displayName: randomTask.displayName,
          color: null,
        }),
      ).rejects.toThrowError(
        `Task with displayName "${randomTask.displayName}" already exists in project "${randomTask.projectId}".`,
      )
    })
  })

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const resTasks = await taskService.getTasks()

      expect(resTasks).toHaveLength(taskHelpers.getExpectedTasksLength())

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const expectedTasks = await taskHelpers.getSortedSampleTasks()

      const resTasks = await taskService.getTasks()

      const expectedNames = expectedTasks.map((task) => task.displayName)
      const resNames = resTasks.map((task) => task.displayName)

      expect(resNames).toEqual(expectedNames)
    })
  })

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      const expectedTask = await taskHelpers.getRandomExistingTask({
        safetyOffset: 1, // exclude first and last elements
      })

      const resTask = await taskService.getTaskById(expectedTask.id)

      expect(resTask).toEqual(expectedTask)
    })

    it('should throw if task with id is not found', async () => {
      await expect(() =>
        taskService.getTaskById('non-existent-id'),
      ).rejects.toThrowError('Task with id "non-existent-id" not found.')
    })
  })

  describe('getTasksByProjectId', () => {
    it('should get tasks by project id', async () => {
      const randomProject =
        await projectHelpers.getRandomExistingProjectWithTasks({
          safetyOffset: 1, // exclude first and last elements
        })
      const expectedTasks = await taskHelpers.getExistingTasksForProject(
        randomProject.id,
      )

      const resTasks = await taskService.getTasksByProjectId(randomProject.id)

      expect(resTasks).toEqual(expectedTasks)
    })

    it('should throw if project does not exist', async () => {
      await expect(() =>
        taskService.getTasksByProjectId('non-existent-id'),
      ).rejects.toThrowError('Project with id "non-existent-id" not found.')
    })

    it('should return empty array if project has no tasks', async () => {
      const randomProject =
        await projectHelpers.getRandomExistingProjectWithoutTasks()

      const resTask = await taskService.getTasksByProjectId(randomProject.id)

      expect(resTask).toEqual([])
    })
  })

  describe('patchTaskById', () => {
    it('should patch a task by id', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      const resPatched = await taskService.patchTaskById(randomTask.id, {
        displayName: 'Patched Task',
      })

      expect(resPatched.displayName).toBe('Patched Task')
    })

    it('should throw if task with id is not found', async () => {
      await expect(() =>
        taskService.patchTaskById('non-existent-id', {
          displayName: 'Patched Task',
        }),
      ).rejects.toThrowError('Task with id "non-existent-id" not found.')
    })

    it('should throw if invalid fields are changed', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await expect(() =>
        taskService.patchTaskById(randomTask.id, {
          // @ts-expect-error
          id: 'invalid',
          createdAt: 'invalid',
        }),
      ).rejects.toThrowError(
        `Tried to patch entity using illegal fields: "id", "createdAt".`,
      )
    })

    it('should notify subscribers of the change', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await taskService.patchTaskById(randomTask.id, {
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
          entityId: randomTask.id,
          field: ['displayName', 'modifiedAt'],
        },
      )
    })
  })

  describe('changeProjectOnTaskById', () => {
    it('should throw if task with id is not found', async () => {
      const randomProject =
        await projectHelpers.getRandomExistingProjectWithoutTasks()

      await expect(() =>
        taskService.patchTaskById('non-existent-id', {
          projectId: randomProject.id,
        }),
      ).rejects.toThrowError('Task with id "non-existent-id" not found.')
    })

    it('should throw if project with id is not found', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await expect(() =>
        taskService.patchTaskById(randomTask.id, {
          projectId: 'non-existent-id',
        }),
      ).rejects.toThrowError(
        `Tried to set projectId on Task with id "${randomTask.id}" to "non-existent-id" which does not exist.`,
      )
    })

    it('should change the project', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()
      const randomProject =
        await projectHelpers.getRandomExistingProjectWithoutTasks()

      const resTask = await taskService.patchTaskById(randomTask.id, {
        projectId: randomProject.id,
      })

      expect(projectService.getProjectByTaskId(randomTask.id)).resolves.toBe(
        randomProject,
      )

      expect(resTask.projectId).toBe(randomProject.id)

      expect(subscriber).toHaveBeenCalledOnce()
    })
  })

  describe('softDeleteTask', () => {
    it('should delete a task by id', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await taskService.softDeleteTask(randomTask.id)

      await expect(() =>
        taskService.getTaskById(randomTask.id),
      ).rejects.toThrow(`Task with id "${randomTask.id}" not found.`)
    })

    it('should throw if task with id is not found', async () => {
      await expect(() =>
        taskService.softDeleteTask('non-existent-id'),
      ).rejects.toThrowError('Task with id "non-existent-id" not found.')
    })

    it('should notify subscribers of the change', async () => {
      const randomTask = await taskHelpers.getRandomExistingTask()

      await taskService.softDeleteTask(randomTask.id)

      expect(subscriber).toHaveBeenCalledWith(
        {
          type: 'deleted',
          id: randomTask.id,
        },
        {
          type: 'deleted',
          entityId: randomTask.id,
        },
      )
    })
  })
})
