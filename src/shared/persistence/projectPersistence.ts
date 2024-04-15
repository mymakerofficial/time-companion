import type { ProjectEntityDto } from '@shared/model/project'
import type { Database, Transaction } from '@shared/database/database'
import type { TaskEntityDto } from '@shared/model/task'
import { asyncGetOrThrow } from '@shared/lib/utils/result'
import { check, isDefined } from '@shared/lib/utils/checks'

export interface ProjectPersistenceDependencies {
  database: Database
}

export interface ProjectPersistence {
  getProjects(): Promise<ReadonlyArray<ProjectEntityDto>>
  getProjectById(id: string): Promise<Readonly<ProjectEntityDto>>
  getProjectByDisplayName(
    displayName: string,
  ): Promise<Readonly<ProjectEntityDto>>
  getProjectByTaskId(taskId: string): Promise<Readonly<ProjectEntityDto>>
  createProject(
    project: Readonly<ProjectEntityDto>,
  ): Promise<Readonly<ProjectEntityDto>>
  patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectEntityDto>>,
  ): Promise<Readonly<ProjectEntityDto>>
}

class ProjectPersistenceImpl implements ProjectPersistence {
  private readonly database: Database

  constructor(deps: ProjectPersistenceDependencies) {
    this.database = deps.database
  }

  private async getProjectsQuery(transaction: Transaction) {
    return await transaction.table<ProjectEntityDto>('projects').findMany({
      where: { deletedAt: { equals: null } },
      orderBy: { displayName: 'asc' },
    })
  }

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.database.createTransaction(async (transaction) => {
      return await this.getProjectsQuery(transaction)
    })
  }

  private async getProjectByIdQuery(transaction: Transaction, id: string) {
    return await transaction.table<ProjectEntityDto>('projects').findFirst({
      where: {
        AND: [{ id: { equals: id } }, { deletedAt: { equals: null } }],
      },
    })
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database.createTransaction(async (transaction) => {
        return await this.getProjectByIdQuery(transaction, id)
      }),
      `Project with id "${id}" not found.`,
    )
  }

  private async getProjectByDisplayNameQuery(
    transaction: Transaction,
    displayName: string,
  ) {
    return await transaction.table<ProjectEntityDto>('projects').findFirst({
      where: {
        AND: [
          { displayName: { equals: displayName } },
          { deletedAt: { equals: null } },
        ],
      },
    })
  }

  async getProjectByDisplayName(
    displayName: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database.createTransaction(async (transaction) => {
        return await this.getProjectByDisplayNameQuery(transaction, displayName)
      }),
      `Project with displayName "${displayName}" not found.`,
    )
  }

  private async getProjectByTaskIdQuery(
    transaction: Transaction,
    taskId: string,
  ) {
    return await transaction
      .join<ProjectEntityDto, TaskEntityDto>('projects', 'tasks')
      .left({
        on: { id: 'projectId' },
        where: { id: { equals: taskId } },
      })
      .findFirst({
        where: { deletedAt: { equals: null } },
      })
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database.createTransaction(async (transaction) => {
        return await this.getProjectByTaskIdQuery(transaction, taskId)
      }),
      `Project with taskId "${taskId}" not found.`,
    )
  }

  private async createProjectQuery(
    transaction: Transaction,
    project: Readonly<ProjectEntityDto>,
  ) {
    return await transaction.table<ProjectEntityDto>('projects').create({
      data: project,
    })
  }

  async createProject(
    project: Readonly<ProjectEntityDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.database.createTransaction(async (transaction) => {
      return await this.createProjectQuery(transaction, project)
    })
  }

  private async updateProjectQuery(
    transaction: Transaction,
    id: string,
    project: Readonly<ProjectEntityDto>,
  ) {
    return await transaction.table<ProjectEntityDto>('projects').update({
      where: { id: { equals: id } },
      data: project,
    })
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectEntityDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await this.database.createTransaction(async (transaction) => {
      const originalProject = await this.getProjectByIdQuery(transaction, id)

      check(isDefined(originalProject), `Project with id "${id}" not found.`)

      const patchedProject: ProjectEntityDto = {
        ...originalProject,
        ...partialProject,
      }

      return await this.updateProjectQuery(transaction, id, patchedProject)
    })
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
