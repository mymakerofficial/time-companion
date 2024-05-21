import { type ProjectEntityDto, projectsTable } from '@shared/model/project'
import type { Database } from '@shared/database/types/database'
import { asyncGetOrThrow } from '@shared/lib/utils/result'
import { check, isNotEmpty, isNotNull } from '@shared/lib/utils/checks'
import { firstOf } from '@shared/lib/utils/list'
import { todo } from '@shared/lib/utils/todo'

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

  async getProjects(): Promise<ReadonlyArray<Readonly<ProjectEntityDto>>> {
    return await this.database.table(projectsTable).findMany({
      where: projectsTable.deletedAt.isNull(),
      orderBy: projectsTable.displayName.asc(),
    })
  }

  async getProjectById(id: string): Promise<Readonly<ProjectEntityDto>> {
    const res = await this.database.table(projectsTable).findFirst({
      where: projectsTable.id.equals(id).and(projectsTable.deletedAt.isNull()),
    })

    check(isNotNull(res), `Project with id "${id}" not found.`)

    return res
  }

  async getProjectByDisplayName(
    displayName: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    const res = await this.database.table(projectsTable).findFirst({
      where: projectsTable.displayName
        .equals(displayName)
        .and(projectsTable.deletedAt.isNull()),
    })

    check(
      isNotNull(res),
      `Project with displayName "${displayName}" not found.`,
    )

    return res
  }

  async getProjectByTaskId(
    taskId: string,
  ): Promise<Readonly<ProjectEntityDto>> {
    todo()
  }

  async createProject(
    project: Readonly<ProjectEntityDto>,
  ): Promise<Readonly<ProjectEntityDto>> {
    return await asyncGetOrThrow(
      this.database.table(projectsTable).insert({
        data: project,
      }),
      `Project with displayName "${project.displayName}" already exists.`,
    )
  }

  async patchProjectById(
    id: string,
    partialProject: Partial<Readonly<ProjectEntityDto>>,
  ): Promise<Readonly<ProjectEntityDto>> {
    const res = await this.database.table(projectsTable).update({
      where: projectsTable.id.equals(id),
      data: partialProject,
    })

    check(isNotEmpty(res), `Project with id "${id}" not found.`)

    return firstOf(res)
  }
}

export function createProjectPersistence(
  deps: ProjectPersistenceDependencies,
): ProjectPersistence {
  return new ProjectPersistenceImpl(deps)
}
