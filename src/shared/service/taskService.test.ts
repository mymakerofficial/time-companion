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
import { ProjectsAndTasksTestFixture } from '@shared/service/projectsAndTasksTestFixture'

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
        const resTask = await fixture.taskService.createTask(task)

        expectTypeOf(resTask).toMatchTypeOf<TaskEntityDto>()

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
      const randomTask = await fixture.getRandomExistingTask()

      expect(
        fixture.taskService.createTask({
          projectId: randomTask.projectId,
          displayName: randomTask.displayName,
          color: null,
        }),
      ).rejects.toThrowError(
        `Task with displayName ${randomTask.displayName} already exists in project ${randomTask.projectId}`,
      )
    })
  })

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const resTasks = await fixture.taskService.getTasks()

      expect(resTasks).toHaveLength(fixture.getExpectedTasksLength())

      // TODO actually test the values
    })

    it('should be ordered by displayName', async () => {
      const expectedTasks = await fixture.getSortedSampleTasks()

      const resTasks = await fixture.taskService.getTasks()

      const expectedNames = expectedTasks.map((task) => task.displayName)
      const resNames = resTasks.map((task) => task.displayName)

      expect(resNames).toEqual(expectedNames)
    })
  })

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      const expectedTask = await fixture.getRandomExistingTask({
        safetyOffset: 1, // exclude first and last elements
      })

      const resTask = await fixture.taskService.getTaskById(expectedTask.id)

      expect(resTask).toEqual(expectedTask)
    })

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.getTaskById('non-existent-id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })
  })

  describe('getTasksByProjectId', () => {
    it('should get tasks by project id', async () => {
      const randomProject = await fixture.getRandomExistingProjectWithTasks({
        safetyOffset: 1, // exclude first and last elements
      })
      const expectedTasks = await fixture.getExistingTasksForProject(
        randomProject.id,
      )

      const resTasks = await fixture.taskService.getTasksByProjectId(
        randomProject.id,
      )

      expect(resTasks).toEqual(expectedTasks)
    })

    it('should throw if project does not exist', async () => {
      expect(
        fixture.taskService.getTasksByProjectId('non-existent-id'),
      ).rejects.toThrowError('Project with id non-existent-id not found')
    })

    it('should return empty array if project has no tasks', async () => {
      const randomProject = await fixture.getRandomExistingProjectWithoutTasks()

      const resTask = await fixture.taskService.getTasksByProjectId(
        randomProject.id,
      )

      expect(resTask).toEqual([])
    })
  })

  describe('patchTaskById', () => {
    it('should patch a task by id', async () => {
      const randomTask = await fixture.getRandomExistingTask()

      const resPatched = await fixture.taskService.patchTaskById(
        randomTask.id,
        {
          displayName: 'Patched Task',
        },
      )

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
      const randomTask = await fixture.getRandomExistingTask()

      expect(
        fixture.taskService.patchTaskById(randomTask.id, {
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
      const randomTask = await fixture.getRandomExistingTask()

      await fixture.taskService.patchTaskById(randomTask.id, {
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
      const randomProject = await fixture.getRandomExistingProjectWithoutTasks()

      expect(
        fixture.taskService.patchTaskById('non-existent-id', {
          projectId: randomProject.id,
        }),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it('should throw if project with id is not found', async () => {
      const randomTask = await fixture.getRandomExistingTask()

      expect(
        fixture.taskService.patchTaskById(randomTask.id, {
          projectId: 'non-existent-id',
        }),
      ).rejects.toThrowError(
        `Tried to set projectId on Task with id ${randomTask.id} to non-existent-id which does not exist`,
      )
    })

    it('should change the project', async () => {
      const randomTask = await fixture.getRandomExistingTask()
      const randomProject = await fixture.getRandomExistingProjectWithoutTasks()

      const resTask = await fixture.taskService.patchTaskById(randomTask.id, {
        projectId: randomProject.id,
      })

      expect(
        fixture.projectService.getProjectByTaskId(randomTask.id),
      ).resolves.toBe(randomProject)

      expect(resTask.projectId).toBe(randomProject.id)

      expect(subscriber).toHaveBeenCalledOnce()
    })
  })

  describe('deleteTask', () => {
    it('should delete a task by id', async () => {
      const randomTask = await fixture.getRandomExistingTask()

      await fixture.taskService.deleteTask(randomTask.id)

      expect(fixture.taskService.getTaskById(randomTask.id)).rejects.toThrow(
        `Task with id ${randomTask.id} not found`,
      )
    })

    it('should throw if task with id is not found', async () => {
      expect(
        fixture.taskService.deleteTask('non-existent-id'),
      ).rejects.toThrowError('Task with id non-existent-id not found')
    })

    it('should notify subscribers of the change', async () => {
      const randomTask = await fixture.getRandomExistingTask()

      await fixture.taskService.deleteTask(randomTask.id)

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
