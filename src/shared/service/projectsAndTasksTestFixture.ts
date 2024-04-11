import { testDatabase } from '@shared/database/testDatabase'
import {
  createProjectService,
  type ProjectService,
} from '@shared/service/projectService'
import type { ProjectDto } from '@shared/model/project'
import { check, isDefined } from '@shared/lib/utils/checks'
import type { TaskDto } from '@shared/model/task'
import type { Database } from '@shared/database/database'
import {
  createTaskService,
  type TaskService,
} from '@shared/service/taskService'
import { createProjectPersistence } from '@shared/persistence/projectPersistence'
import { createTaskPersistence } from '@shared/persistence/taskPersistence'
import {
  randomElement,
  type RandomElementOptions,
} from '@shared/lib/utils/random'

export class ProjectsAndTasksTestFixture {
  public database: Database

  public projectService: ProjectService

  public taskService: TaskService

  constructor() {
    this.database = testDatabase()

    this.projectService = createProjectService({
      projectPersistence: createProjectPersistence({
        database: this.database,
      }),
    })

    this.taskService = createTaskService({
      taskPersistence: createTaskPersistence({
        database: this.database,
      }),
      projectPersistence: createProjectPersistence({
        database: this.database,
      }),
    })
  }

  async getExistingProjects() {
    return await this.projectService.getProjects()
  }

  async getRandomExistingProject(options?: RandomElementOptions) {
    return randomElement(await this.getExistingProjects(), options)
  }

  async getExistingProjectsWithTasks() {
    const projects = await this.projectService.getProjects()
    const tasks = await this.taskService.getTasks()

    return projects.filter((project) =>
      tasks.some((task) => task.projectId === project.id),
    )
  }

  async getRandomExistingProjectWithTasks(options?: RandomElementOptions) {
    return randomElement(await this.getExistingProjectsWithTasks(), options)
  }

  async getExistingProjectsWithoutTasks() {
    const projects = await this.projectService.getProjects()
    const tasks = await this.taskService.getTasks()

    return projects.filter(
      (project) => !tasks.some((task) => task.projectId === project.id),
    )
  }

  async getRandomExistingProjectWithoutTasks(options?: RandomElementOptions) {
    return randomElement(await this.getExistingProjectsWithoutTasks(), options)
  }

  async getExistingTasks() {
    return await this.taskService.getTasks()
  }

  async getRandomExistingTask(options?: RandomElementOptions) {
    return randomElement(await this.getExistingTasks(), options)
  }

  async getExistingTasksWithProject() {
    const tasks = await this.getExistingTasks()
    const projects = await this.getExistingProjects()

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

  async getSampleProjects() {
    const sampleProjects: ReadonlyArray<ProjectDto> = [
      { displayName: 'Taking over the world', color: 'blue', isBillable: true },
      { displayName: 'Eating some cheese', color: 'yellow', isBillable: true },
      { displayName: 'Break', color: 'green', isBillable: false },
    ]

    return sampleProjects
  }

  getExpectedProjectsLength() {
    return 3
  }

  async getSortedSampleProjects() {
    const sampleProjects = await this.getSampleProjects()

    return [...sampleProjects].sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    )
  }

  async getSampleTasks() {
    const projects = await this.getExistingProjects()

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

  async createSampleProjects() {
    const sampleProjects = await this.getSampleProjects()

    for (const project of sampleProjects) {
      await this.projectService.createProject(project)
    }
  }

  async createSampleTasks() {
    const sampleTasks = await this.getSampleTasks()

    for (const task of sampleTasks) {
      await this.taskService.createTask(task)
    }
  }
}
