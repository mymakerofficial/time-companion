import {
  type CreateProject,
  type ProjectDto,
  projectsTable,
  type UpdateProject,
} from '@shared/model/project'
import type { Database } from '@database/types/database'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import { toProjectDto } from '@shared/model/mappers/project'
import { uuid } from '@shared/lib/utils/uuid'

export interface ProjectPersistenceDependencies {
  database: Database
}

export interface ProjectPersistence {
  getProjects(): Promise<Array<ProjectDto>>
  getProjectById(id: string): Promise<ProjectDto>
  getProjectByDisplayName(displayName: string): Promise<ProjectDto>
  createProject(project: CreateProject): Promise<ProjectDto>
  patchProjectById(
    id: string,
    partialProject: Partial<UpdateProject>,
  ): Promise<ProjectDto>
  softDeleteProject(id: string): Promise<void>
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

  async getProjects(): Promise<Array<ProjectDto>> {
    return await this.database
      .table(projectsTable)
      .findMany({
        where: projectsTable.deletedAt.isNull(),
        orderBy: projectsTable.displayName.asc(),
        map: toProjectDto,
      })
      .catch(this.resolveError)
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    const res = await this.database
      .table(projectsTable)
      .findFirst({
        range: projectsTable.id.range.only(id),
        where: projectsTable.deletedAt.isNull(),
        map: toProjectDto,
      })
      .catch(this.resolveError)

    check(isNotNull(res), `Project with id "${id}" not found.`)

    return res
  }

  async getProjectByDisplayName(displayName: string): Promise<ProjectDto> {
    const res = await this.database
      .table(projectsTable)
      .findFirst({
        where: projectsTable.displayName
          .equals(displayName)
          .and(projectsTable.deletedAt.isNull()),
        map: toProjectDto,
      })
      .catch(this.resolveError)

    check(
      isNotNull(res),
      `Project with displayName "${displayName}" not found.`,
    )

    return res
  }

  async createProject(project: CreateProject): Promise<ProjectDto> {
    return await this.database
      .table(projectsTable)
      .insert({
        data: {
          id: uuid(),
          ...project,
          createdAt: new Date(),
          modifiedAt: null,
          deletedAt: null,
        },
        map: toProjectDto,
      })
      .catch(this.resolveError)
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<UpdateProject>,
  ): Promise<ProjectDto> {
    const res = await this.database
      .table(projectsTable)
      .update({
        range: projectsTable.id.range.only(id),
        where: projectsTable.deletedAt.isNull(),
        data: {
          ...partialProject,
          modifiedAt: new Date(),
        },
        map: toProjectDto,
      })
      .catch(this.resolveError)

    check(isNotEmpty(res), `Project with id "${id}" not found.`)

    return firstOf(res)
  }

  async softDeleteProject(id: string): Promise<void> {
    const res = await this.database
      .table(projectsTable)
      .update({
        range: projectsTable.id.range.only(id),
        data: {
          deletedAt: new Date(),
        },
      })
      .catch(this.resolveError)

    check(isNotEmpty(res), `Project with id "${id}" not found.`)
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
