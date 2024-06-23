import { type MaybeRef, toValue, watchEffect } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isDefined } from '@shared/lib/utils/checks'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

export function useGetRunningTimeEntry(dayId: MaybeRef<string>) {
  const queryClient = useQueryClient()
  const queryKey = ['timeEntries', 'getRunningTimeEntry', { dayId }]

  watchEffect(() => {
    if (isDefined(queryClient.getQueryData(queryKey))) {
      return
    }

    timeEntryService.subscribe({}, () => {
      queryClient
        .invalidateQueries({
          queryKey: ['timeEntries', 'getRunningTimeEntry', { dayId }],
        })
        .then()
    })
  })

  return useQuery({
    queryKey,
    queryFn: () => timeEntryService.getRunningTimeEntryByDayId(toValue(dayId)),
    initialData: null,
  })
}
