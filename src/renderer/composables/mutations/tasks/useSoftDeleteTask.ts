import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

export function useSoftDeleteTask(options: MutationOptions<void, string>) {
  return useMutation({
    mutationFn: (id: string) => taskService.softDeleteTask(id),
    onError: options.onError ?? handleMutationError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
  })
}
