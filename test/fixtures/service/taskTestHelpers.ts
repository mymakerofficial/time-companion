import { TaskService } from '@shared/service/taskService'
import { randomElement, RandomElementOptions } from '@shared/lib/utils/random'
import { check, isDefined } from '@shared/lib/utils/checks'
import { TaskDto } from '@shared/model/task'
import { ProjectService } from '@shared/service/projectService'

export class TaskTestHelpers {
  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
  ) {}

  async getExistingTasks() {
    return await this.taskService.getTasks()
  }

  async getRandomExistingTask(options?: RandomElementOptions) {
    return randomElement(await this.getExistingTasks(), options)
  }

  async getExistingTasksWithProject() {
    const tasks = await this.getExistingTasks()
    const projects = await this.projectService.getProjects()

    return tasks.filter((task) =>
      projects.some((project) => project.id === task.projectId),
    )
  }

  async getRandomExistingTaskWithProject(options?: RandomElementOptions) {
    return randomElement(await this.getExistingTasksWithProject(), options)
  }

  async getExistingTasksForProject(projectId: string) {
    const tasks = await this.getExistingTasks()

    return tasks.filter((task) => task.projectId === projectId)
  }

  async getSampleTasks() {
    const projects = await this.projectService.getProjects()

    check(
      projects.length > 0,
      'Projects need to be created before requesting sample tasks',
    )

    const firstProject = projects.find(
      (project) => project.displayName === 'Taking over the world',
    )

    check(isDefined(firstProject), 'First project not found')

    const secondProject = projects.find(
      (project) => project.displayName === 'Eating some cheese',
    )

    check(isDefined(secondProject), 'Second project not found')

    const tasks: ReadonlyArray<TaskDto> = [
      { projectId: firstProject.id, displayName: 'Scheming', color: 'blue' },
      { projectId: firstProject.id, displayName: 'Pondering', color: null },
      { projectId: secondProject.id, displayName: 'Chewing', color: 'green' },
      { projectId: secondProject.id, displayName: 'Enjoying', color: 'green' },
    ]

    return tasks
  }

  getExpectedTasksLength() {
    return 4
  }

  async getSortedSampleTasks() {
    const sampleTasks = await this.getSampleTasks()

    return [...sampleTasks].sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    )
  }

  async createSampleTasks() {
    const sampleTasks = await this.getSampleTasks()

    for (const task of sampleTasks) {
      await this.taskService.createTask(task)
    }
  }
}
