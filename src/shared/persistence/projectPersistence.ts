import { type ProjectEntityDto, projectsTable } from '@shared/model/project'
import type { Database } from '@shared/database/types/database'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@shared/database/types/errors'

export interface ProjectPersistenceDependencies {
  database: Database
}

export interface ProjectPersistence {
  getProjects(): Promise<Array<ProjectEntityDto>>
  getProjectById(id: string): Promise<ProjectEntityDto>
  getProjectByDisplayName(displayName: string): Promise<ProjectEntityDto>
  createProject(project: ProjectEntityDto): Promise<ProjectEntityDto>
  patchProjectById(
    id: string,
    partialProject: Partial<ProjectEntityDto>,
  ): Promise<ProjectEntityDto>
}

class ProjectPersistenceImpl implements ProjectPersistence {
  private readonly database: Database

  constructor(deps: ProjectPersistenceDependencies) {
    this.database = deps.database
  }

  protected resolveError(error: DatabaseError): never {
    if (errorIsUniqueViolation(error)) {
      throw new Error(
        `Project with ${error.columnName} "${error.value}" already exists.`,
      )
    }

    if (errorIsUndefinedColumn(error)) {
      throw new Error(
        `Tried to set value for undefined field "${error.columnName}" on project.`,
      )
    }

    throw error
  }

  async getProjects(): Promise<Array<ProjectEntityDto>> {
    return await this.database
      .table(projectsTable)
      .findMany({
        where: projectsTable.deletedAt.isNull(),
        orderBy: projectsTable.displayName.asc(),
      })
      .catch(this.resolveError)
  }

  async getProjectById(id: string): Promise<ProjectEntityDto> {
    const res = await this.database
      .table(projectsTable)
      .findFirst({
        range: projectsTable.id.range.only(id),
        where: projectsTable.deletedAt.isNull(),
      })
      .catch(this.resolveError)

    check(isNotNull(res), `Project with id "${id}" not found.`)

    return res
  }

  async getProjectByDisplayName(
    displayName: string,
  ): Promise<ProjectEntityDto> {
    const res = await this.database
      .table(projectsTable)
      .findFirst({
        where: projectsTable.displayName
          .equals(displayName)
          .and(projectsTable.deletedAt.isNull()),
      })
      .catch(this.resolveError)

    check(
      isNotNull(res),
      `Project with displayName "${displayName}" not found.`,
    )

    return res
  }

  async createProject(project: ProjectEntityDto): Promise<ProjectEntityDto> {
    return await this.database
      .table(projectsTable)
      .insert({
        data: project,
      })
      .catch(this.resolveError)
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<ProjectEntityDto>,
  ): Promise<ProjectEntityDto> {
    const res = await this.database
      .table(projectsTable)
      .update({
        range: projectsTable.id.range.only(id),
        where: projectsTable.deletedAt.isNull(),
        data: partialProject,
      })
      .catch(this.resolveError)

    check(isNotEmpty(res), `Project with id "${id}" not found.`)

    return firstOf(res)
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
