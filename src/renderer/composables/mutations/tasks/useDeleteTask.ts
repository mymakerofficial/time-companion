import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

export function useDeleteTask(options?: MutationOptions<void, string>) {
  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onError: options?.onError ?? handleMutationError,
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
