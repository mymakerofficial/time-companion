import type { ProjectService } from '@shared/service/projectService'
import {
  randomElement,
  type RandomElementOptions,
} from '@shared/lib/utils/random'
import type { TaskService } from '@shared/service/taskService'
import type { ProjectDto } from '@shared/model/project'

export class ProjectTestHelpers {
  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
  ) {}

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

  async createSampleProjects() {
    const sampleProjects = await this.getSampleProjects()

    for (const project of sampleProjects) {
      await this.projectService.createProject(project)
    }
  }
}
