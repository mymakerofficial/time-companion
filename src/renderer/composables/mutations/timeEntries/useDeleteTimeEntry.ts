import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

export function useDeleteTimeEntry(options?: MutationOptions<void, string>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => timeEntryService.deleteTimeEntry(id),
    onError: (error, variables, context) => {
      handleMutationError(error)

      if (options?.onError) {
        options.onError(error, variables, context)
      }

      queryClient.invalidateQueries({ queryKey: ['timeEntries'] }).then()
    },
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
