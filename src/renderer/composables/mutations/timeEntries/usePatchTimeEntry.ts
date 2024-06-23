import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { TimeEntryDto, UpdateTimeEntry } from '@shared/model/timeEntry'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

type UsePatchTimeEntryVariables = {
  timeEntry: Partial<UpdateTimeEntry>
  id: string
}

export function usePatchTimeEntry(
  options?: MutationOptions<TimeEntryDto, UsePatchTimeEntryVariables>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timeEntry, id }: UsePatchTimeEntryVariables) =>
      timeEntryService.patchTimeEntry(id, timeEntry),
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
