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
    getterFn: projectService.getProjectById,
    patchFn: projectService.patchProjectById,
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
