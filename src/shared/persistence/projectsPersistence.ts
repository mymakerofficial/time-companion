import type { ProjectDto, ProjectEntityDto } from '@shared/model/projects'
import type { Database } from '@shared/database/databaseFacade'
import { createSingleton } from '@shared/lib/helpers/createSingleton'
import * as crypto from 'crypto'

export interface ProjectsPersistenceDependencies {
  database: Readonly<Database>
}

export interface ProjectsPersistence {
  getProjects(): Promise<Array<ProjectEntityDto>>
  getProjectById(id: string): Promise<ProjectEntityDto>
  createProject(project: Readonly<ProjectDto>): Promise<ProjectEntityDto>
  patchProjectById(
    id: string,
    partialProject: Readonly<Partial<ProjectDto>>,
  ): Promise<ProjectEntityDto>
  deleteProject(id: string): Promise<void>
}

export const projectsPersistence = createSingleton(
  ({ database }: ProjectsPersistenceDependencies): ProjectsPersistence => {
    async function getProjects(): Promise<Array<ProjectEntityDto>> {
      return await database.getAll<ProjectEntityDto>({
        table: 'projects',
      })
    }

    async function getProjectById(id: string): Promise<ProjectEntityDto> {
      return await database.getFirst<ProjectEntityDto>({
        table: 'projects',
        where: { id: { eq: id } },
      })
    }

    async function createProject(
      project: Readonly<ProjectDto>,
    ): Promise<ProjectEntityDto> {
      return await database.insertOne<ProjectEntityDto>({
        table: 'projects',
        data: {
          id: crypto.randomUUID(),
          ...project,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      })
    }

    async function patchProjectById(
      id: string,
      partialProject: Readonly<Partial<ProjectDto>>,
    ): Promise<ProjectEntityDto> {
      const originalProject = await getProjectById(id)

      const patchedProject = {
        ...originalProject,
        ...partialProject,
        updatedAt: new Date().toISOString(),
      }

      return await database.updateOne<ProjectEntityDto>({
        table: 'projects',
        where: { id: { eq: id } },
        data: patchedProject,
      })
    }

    async function deleteProject(id: string): Promise<void> {
      await database.deleteOne<ProjectEntityDto>({
        table: 'projects',
        where: { id: { eq: id } },
      })
    }

    return {
      getProjects,
      getProjectById,
      createProject,
      patchProjectById,
      deleteProject,
    }
  },
)
