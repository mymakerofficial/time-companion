import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { CreateTimeEntry, TimeEntryDto } from '@shared/model/timeEntry'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

export function useCreateTimeEntry(
  options?: MutationOptions<TimeEntryDto, Partial<CreateTimeEntry>>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (timeEntry: Partial<CreateTimeEntry>) =>
      timeEntryService.createTimeEntry(timeEntry),
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
