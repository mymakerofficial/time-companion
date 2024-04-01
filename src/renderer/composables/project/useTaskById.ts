import type { MaybeRefOrGetter } from 'vue'
import type { Maybe } from '@shared/lib/utils/types'
import { createEntityDao } from '@renderer/lib/reactify/reactifyEntity'
import type { TaskEntityDao, TaskEntityDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'

export function useTaskById(
  taskId: MaybeRefOrGetter<Maybe<string>>,
): TaskEntityDao {
  return createEntityDao<TaskEntityDto, TaskEntityDao>({
    entityId: taskId,
    publisher: taskService,
    getterFn: async (id: string) => {
      return await taskService.getTaskById(id)
    },
    patchFn: async (id: string, patch: Partial<TaskEntityDto>) => {
      return await taskService.patchTaskById(id, patch)
    },
    defaultValues: {
      id: null,
      projectId: null,
      displayName: '',
      color: null,
      createdAt: null,
      modifiedAt: null,
      deletedAt: null,
    },
  })
}
