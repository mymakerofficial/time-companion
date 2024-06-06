import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'

export function useSoftDeleteTask() {
  return useMutation({
    mutationFn: (id: string) => taskService.softDeleteTask(id),
    onError: handleMutationError,
  })
}
