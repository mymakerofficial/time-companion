import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { TaskDto } from '@shared/model/task'

export function usePatchTaskById() {
  return useMutation({
    mutationFn: ({ task, id }: { task: Partial<TaskDto>; id: string }) =>
      taskService.patchTaskById(id, task),
    onError: handleMutationError,
  })
}
