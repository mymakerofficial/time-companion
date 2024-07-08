import {
  type CreateProject,
  type ProjectDto,
  projectsTable,
  type UpdateProject,
} from '@shared/model/project'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import { toProjectDto } from '@shared/model/mappers/project'
import type { Database } from '@shared/drizzle/database'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { handleSqliteError } from '@shared/drizzle/error'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

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

  async getProjects(): Promise<Array<ProjectDto>> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(isNull(projectsTable.deletedAt))
      .orderBy(asc(projectsTable.displayName))
      .catch(handleSqliteError)

    return res.map(toProjectDto)
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .limit(1)
      .catch(handleSqliteError)

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
      .catch(handleSqliteError)

    check(
      isNotEmpty(res),
      `Project with displayName "${displayName}" not found.`,
    )
    return toProjectDto(firstOf(res))
  }

  async createProject(project: CreateProject): Promise<ProjectDto> {
    const res = await this.database
      .insert(projectsTable)
      .values(project)
      .returning()
      .catch(handleSqliteError)

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
      .catch(handleSqliteError)

    check(isNotEmpty(res), `Project with id "${id}" not found.`)
    return toProjectDto(firstOf(res))
  }

  async softDeleteProject(id: string): Promise<void> {
    const res = await this.database
      .update(projectsTable)
      .set({
        deletedAt: PlainDateTime.now(),
      })
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .returning()
      .catch(handleSqliteError)

    check(isNotEmpty(res), `Project with id "${id}" not found.`)
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
