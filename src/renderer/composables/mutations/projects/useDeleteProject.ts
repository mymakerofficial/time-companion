import { useMutation } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

export function useDeleteProject(options?: MutationOptions<void, string>) {
  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onError: options?.onError ?? handleMutationError,
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
