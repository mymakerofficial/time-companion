import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { UpdateProject } from '@shared/model/project'

export function usePatchTaskById() {
  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<UpdateProject> }) =>
      taskService.patchTaskById(id, task),
    onError: handleMutationError,
  })
}
