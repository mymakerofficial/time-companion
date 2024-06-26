import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TimeEntryDto, UpdateTimeEntry } from '@shared/model/timeEntry'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'
import { useDialog } from '@renderer/composables/dialog/useDialog'
import TimeEntryArbiterDialog from '@renderer/components/common/dialogs/timeEntry/arbiter/TimeEntryArbiterDialog.vue'

type UsePatchTimeEntryVariables = {
  timeEntry: Partial<UpdateTimeEntry>
  id: string
}

export function usePatchTimeEntry(
  options?: MutationOptions<TimeEntryDto, UsePatchTimeEntryVariables>,
) {
  const queryClient = useQueryClient()
  const { open: openArbiter } = useDialog(TimeEntryArbiterDialog)
  return useMutation({
    mutationFn: ({ timeEntry, id }: UsePatchTimeEntryVariables) =>
      timeEntryService.patchTimeEntry(id, timeEntry),
    onError: (error, variables, context) => {
      console.error(error)

      openArbiter({
        id: variables.id,
        userInput: variables.timeEntry,
        error,
      })

      if (options?.onError) {
        options.onError(error, variables, context)
      }

      queryClient.invalidateQueries({ queryKey: ['timeEntries'] }).then()
    },
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
