import type { MaybeRefOrGetter } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'
import type { Maybe } from '@shared/lib/utils/types'
import type { ProjectEntityDao, ProjectEntityDto } from '@shared/model/project'
import { createEntityDao } from '@renderer/lib/reactify/reactifyEntity'

export function useProjectById(
  projectId: MaybeRefOrGetter<Maybe<string>>,
): ProjectEntityDao {
  return createEntityDao<ProjectEntityDto, ProjectEntityDao>({
    entityId: projectId,
    publisher: projectService,
    getterFn: async (id: string) => {
      return await projectService.getProjectById(id)
    },
    patchFn: async (id: string, patch: Partial<ProjectEntityDto>) => {
      return await projectService.patchProjectById(id, patch)
    },
    defaultValues: {
      id: null,
      displayName: '',
      color: null,
      isBillable: false,
      createdAt: null,
      modifiedAt: null,
      deletedAt: null,
    },
  })
}
