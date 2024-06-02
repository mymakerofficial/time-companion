import type { ProjectService } from '@shared/service/projectService'
import type { TaskService } from '@shared/service/taskService'
import type { ProjectDto, ProjectEntityDto } from '@shared/model/project'
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

  sampleProject(override: Partial<ProjectDto> = {}): ProjectDto {
    return {
      displayName: faker.company.name(),
      color: faker.color.human(),
      isBillable: faker.datatype.boolean(),
      ...override,
    }
  }

  sampleProjects(
    amount: number,
    override: Partial<ProjectDto> = {},
  ): Array<ProjectDto> {
    return Array.from({ length: amount }, () => this.sampleProject(override))
  }

  async createSampleProjects(
    amount = 6,
    override: Partial<ProjectDto> = {},
  ): Promise<Array<ProjectDto>> {
    const sampleProjects = this.sampleProjects(amount, override)

    for (const sampleProject of sampleProjects) {
      await this.projectService.createProject(sampleProject)
    }

    return sampleProjects
  }

  async getAllProjects(): Promise<ReadonlyArray<ProjectEntityDto>> {
    return await this.projectService.getProjects()
  }

  async getRandomExistingProject(
    options?: RandomElementOptions,
  ): Promise<ProjectEntityDto> {
    const projects = await this.getAllProjects()
    return randomElement(projects, options)
  }
}
