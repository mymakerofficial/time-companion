import { createSingleton } from '@shared/lib/helpers/createSingleton'
import type { ProjectDto, ProjectEntityDto } from '@shared/model/projects'
import type { ProjectsPersistence } from '@shared/persistence/projectsPersistence'

export interface ProjectsControllerDependencies {
  projectsPersistence: Readonly<ProjectsPersistence>
}

export interface ProjectsController {
  getProjects(): Promise<Array<ProjectEntityDto>>
  getProjectById(id: string): Promise<ProjectEntityDto>
  createProject(project: Readonly<ProjectDto>): Promise<ProjectEntityDto>
  patchProjectById(
    id: string,
    partialProject: Readonly<Partial<ProjectDto>>,
  ): Promise<ProjectEntityDto>
  deleteProject(id: string): Promise<void>
}

export const projectsController = createSingleton(
  ({
    projectsPersistence,
  }: ProjectsControllerDependencies): ProjectsController => {
    async function getProjects(): Promise<Array<ProjectEntityDto>> {
      return await projectsPersistence.getProjects()
    }

    async function getProjectById(id: string): Promise<ProjectEntityDto> {
      return await projectsPersistence.getProjectById(id)
    }

    async function createProject(
      project: Readonly<ProjectDto>,
    ): Promise<ProjectEntityDto> {
      return await projectsPersistence.createProject(project)
    }

    async function patchProjectById(
      id: string,
      partialProject: Readonly<Partial<ProjectDto>>,
    ): Promise<ProjectEntityDto> {
      return await projectsPersistence.patchProjectById(id, partialProject)
    }

    async function deleteProject(id: string): Promise<void> {
      return await projectsPersistence.deleteProject(id)
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
