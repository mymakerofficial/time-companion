import {
  type CreateProject,
  type ProjectDto,
  projectsTable,
  type UpdateProject,
} from '@shared/model/project'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import { toProjectDto } from '@shared/model/mappers/project'
import { uuid } from '@shared/lib/utils/uuid'
import type { Database } from '@shared/drizzle/database'
import { and, asc, eq, isNull } from 'drizzle-orm'

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
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(isNull(projectsTable.deletedAt))
      .orderBy(asc(projectsTable.displayName))
    return res.map(toProjectDto)
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .limit(1)
    check(isNotEmpty(res), `Project with id "${id}" not found.`)
    return toProjectDto(firstOf(res))
  }

  async getProjectByDisplayName(displayName: string): Promise<ProjectDto> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.displayName, displayName),
          isNull(projectsTable.deletedAt),
        ),
      )
      .limit(1)
    check(
      isNotEmpty(res),
      `Project with displayName "${displayName}" not found.`,
    )
    return toProjectDto(firstOf(res))
  }

  async createProject(project: CreateProject): Promise<ProjectDto> {
    const res = await this.database
      .insert(projectsTable)
      .values({
        id: uuid(),
        ...project,
      })
      .returning()
    return toProjectDto(firstOf(res))
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<UpdateProject>,
  ): Promise<ProjectDto> {
    const res = await this.database
      .update(projectsTable)
      .set(partialProject)
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .returning()
    check(isNotEmpty(res), `Project with id "${id}" not found.`)
    return toProjectDto(firstOf(res))
  }

  async softDeleteProject(id: string): Promise<void> {
    const res = await this.database
      .update(projectsTable)
      .set({
        deletedAt: new Date(),
      })
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .returning()
    check(isNotEmpty(res), `Project with id "${id}" not found.`)
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
