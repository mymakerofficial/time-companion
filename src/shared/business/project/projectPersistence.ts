import {
  type CreateProject,
  type ProjectDto,
  projectsTable,
  type UpdateProject,
} from '@shared/model/project'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf, firstOfOrNull } from '@shared/lib/utils/list'
import type { Database } from '@shared/drizzle/database'
import { asc, eq } from 'drizzle-orm'
import { handleSqliteError } from '@shared/drizzle/lib/error'

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
  deleteProject(id: string): Promise<void>
}

class ProjectPersistenceImpl implements ProjectPersistence {
  private readonly database: Database

  constructor(deps: ProjectPersistenceDependencies) {
    this.database = deps.database
  }

  async getProjects(): Promise<Array<ProjectDto>> {
    return await this.database
      .select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.displayName))
      .catch(handleSqliteError)
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1)
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Project with id "${id}" not found.`)

    return res
  }

  async getProjectByDisplayName(displayName: string): Promise<ProjectDto> {
    const res = await this.database
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.displayName, displayName))
      .limit(1)
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(
      isNotNull(res),
      `Project with displayName "${displayName}" not found.`,
    )

    return res
  }

  async createProject(project: CreateProject): Promise<ProjectDto> {
    return await this.database
      .insert(projectsTable)
      .values(project)
      .returning()
      .catch(handleSqliteError)
      .then(firstOf)
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<UpdateProject>,
  ): Promise<ProjectDto> {
    const res = await this.database
      .update(projectsTable)
      .set(partialProject)
      .where(eq(projectsTable.id, id))
      .returning()
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Project with id "${id}" not found.`)

    return res
  }

  async deleteProject(id: string): Promise<void> {
    const res = await this.database
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
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
