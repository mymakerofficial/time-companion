import type { ProjectService } from '@shared/service/projectService'
import type { TaskService } from '@shared/service/taskService'
import type { CreateProject, ProjectDto } from '@shared/model/project'
import { faker } from '@faker-js/faker'
import {
  randomElement,
  type RandomElementOptions,
} from '@shared/lib/utils/random'

export class ProjectTestHelpers {
  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
  ) {}

  sampleProject(override: Partial<CreateProject> = {}): CreateProject {
    return {
      displayName: faker.company.name(),
      color: faker.color.human(),
      isBillable: faker.datatype.boolean(),
      isBreak: faker.datatype.boolean(),
      ...override,
    }
  }

  sampleProjects(
    amount: number,
    override: Partial<CreateProject> = {},
  ): Array<CreateProject> {
    return Array.from({ length: amount }, () => this.sampleProject(override))
  }

  async createSampleProjects(
    amount = 6,
    override: Partial<CreateProject> = {},
  ): Promise<Array<CreateProject>> {
    const sampleProjects = this.sampleProjects(amount, override)

    for (const sampleProject of sampleProjects) {
      await this.projectService.createProject(sampleProject)
    }

    return sampleProjects
  }

  async getAllProjects(): Promise<ReadonlyArray<ProjectDto>> {
    return await this.projectService.getProjects()
  }

  async getRandomExistingProject(
    options?: RandomElementOptions,
  ): Promise<ProjectDto> {
    const projects = await this.getAllProjects()
    return randomElement(projects, options)
  }
}
